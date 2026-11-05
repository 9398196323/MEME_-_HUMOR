"""
Meme and Humor Idea Generator - Main Flask Application.
Provides REST API endpoints, SQLite persistence, and UI routing.
Suitable for college engineering demonstrations and production deployment.
"""

import os
import json
import logging
from flask import Flask, request, jsonify, render_template, send_from_directory
from config import Config, config_by_name
from database.db import (
    init_db,
    save_favorite,
    get_favorites,
    delete_favorite,
    add_history,
    get_history,
    clear_history
)
from services.humor_service import HumorService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


def create_app(config_class=Config):
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )
    app.config.from_object(config_class)

    # Initialize SQLite database on startup
    db_path = app.config.get("DATABASE_PATH", "database/meme_humor.db")
    init_db(db_path)

    # Initialize humor service
    humor_service = HumorService(
        api_key=app.config.get("GEMINI_API_KEY"),
        model=app.config.get("GEMINI_MODEL", "gemini-2.5-flash")
    )

    # -------------------------------------------------------------
    # Frontend Routes
    # -------------------------------------------------------------
    @app.route("/")
    def index():
        return render_template("index.html")

    # -------------------------------------------------------------
    # REST API Routes
    # -------------------------------------------------------------
    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Returns application health status and AI provider readiness without exposing secrets."""
        is_ai_ready = humor_service.is_ai_available()
        return jsonify({
            "status": "healthy",
            "service": "Meme and Humor Idea Generator",
            "ai_configured": is_ai_ready,
            "provider": "Google Gemini" if is_ai_ready else "Offline Template Fallback Engine",
            "database": "SQLite (Connected)"
        }), 200

    @app.route("/api/generate", methods=["POST"])
    def generate():
        """
        Generates meme concepts based on topic, category, style, intensity, and language.
        Returns 5 ideas by default.
        """
        data = request.get_json(silent=True) or {}
        topic = data.get("topic", "").strip()
        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        if len(topic) > 300:
            return jsonify({"error": "Topic exceeds maximum length of 300 characters"}), 400

        category = data.get("category", "Relatable Humor")
        style = data.get("style", "Witty")
        intensity = data.get("intensity", "Medium")
        language = data.get("language", "English")
        count = int(data.get("count", 5))
        count = max(1, min(10, count))

        result = humor_service.generate_ideas(
            topic=topic,
            category=category,
            style=style,
            intensity=intensity,
            language=language,
            count=count
        )

        # Record to history in SQLite
        try:
            add_history(
                topic=topic,
                mode="meme_generator",
                settings={
                    "category": category,
                    "style": style,
                    "intensity": intensity,
                    "language": language,
                    "count": count
                },
                result=result,
                db_path=app.config["DATABASE_PATH"]
            )
        except Exception as e:
            logger.error(f"Failed to record generation history: {e}")

        return jsonify(result), 200

    @app.route("/api/refine", methods=["POST"])
    def refine():
        """Refines an existing idea based on an instruction (make funnier, shorter, etc.)."""
        data = request.get_json(silent=True) or {}
        idea = data.get("idea")
        instruction = data.get("instruction", "make it funnier").strip()
        language = data.get("language", "English")

        if not idea or not isinstance(idea, dict):
            return jsonify({"error": "Valid idea object is required"}), 400

        refined_result = humor_service.refine_idea(
            original_idea=idea,
            instruction=instruction,
            language=language
        )
        return jsonify(refined_result), 200

    @app.route("/api/captions", methods=["POST"])
    def captions():
        """Generates punchy social media captions."""
        data = request.get_json(silent=True) or {}
        topic = data.get("topic", "").strip()
        if not topic:
            return jsonify({"error": "Topic or situation description is required"}), 400

        tone = data.get("tone", "Witty")
        language = data.get("language", "English")
        count = int(data.get("count", 5))

        res = humor_service.generate_captions(
            topic=topic,
            tone=tone,
            language=language,
            count=count
        )
        return jsonify(res), 200

    @app.route("/api/jokes", methods=["POST"])
    def jokes():
        """Generates jokes (one-liners, Q&A, puns)."""
        data = request.get_json(silent=True) or {}
        category = data.get("category", "College and Student Humor")
        style = data.get("style", "Witty")
        language = data.get("language", "English")
        count = int(data.get("count", 5))
        count = max(1, min(10, count))

        res = humor_service.generate_jokes(
            category=category,
            style=style,
            language=language,
            count=count
        )
        return jsonify(res), 200

    @app.route("/api/favorites", methods=["GET"])
    def list_favorites():
        """Returns saved favorite ideas."""
        search_query = request.args.get("search", "")
        favs = get_favorites(
            db_path=app.config["DATABASE_PATH"],
            search_query=search_query
        )
        return jsonify({"favorites": favs}), 200

    @app.route("/api/favorites", methods=["POST"])
    def add_favorite():
        """Saves an idea to the database."""
        data = request.get_json(silent=True) or {}
        topic = data.get("topic", "Meme Idea")
        category = data.get("category", "General")
        language = data.get("language", "English")
        content = data.get("content")

        if not content:
            return jsonify({"error": "Content is required to save favorite"}), 400

        fav_id = save_favorite(
            topic=topic,
            category=category,
            language=language,
            content=content,
            db_path=app.config["DATABASE_PATH"]
        )
        return jsonify({"message": "Saved to favorites successfully", "id": fav_id}), 201

    @app.route("/api/favorites/<int:fav_id>", methods=["DELETE"])
    def remove_favorite(fav_id):
        """Deletes a favorite by its ID."""
        success = delete_favorite(fav_id, db_path=app.config["DATABASE_PATH"])
        if success:
            return jsonify({"message": "Favorite deleted successfully"}), 200
        return jsonify({"error": "Favorite not found"}), 404

    @app.route("/api/history", methods=["GET"])
    def list_history():
        """Returns recent generation history."""
        hist = get_history(db_path=app.config["DATABASE_PATH"], limit=30)
        return jsonify({"history": hist}), 200

    @app.route("/api/history", methods=["DELETE"])
    def empty_history():
        """Clears all generation history."""
        clear_history(db_path=app.config["DATABASE_PATH"])
        return jsonify({"message": "Generation history cleared"}), 200

    return app


# Application entry point
app = create_app(Config)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
