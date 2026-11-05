"""
SQLite Database Access Layer for Meme and Humor Idea Generator.
Provides parameterized queries, connection pooling, and automatic table creation.
"""

import sqlite3
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


def get_db_connection(db_path: str = "database/meme_humor.db") -> sqlite3.Connection:
    """Create and return a database connection with dictionary-like row access."""
    if db_path != ":memory:":
        db_file = Path(db_path)
        db_file.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str = "database/meme_humor.db") -> None:
    """
    Initializes database schema with favorites and history tables.
    Runs automatically on application startup.
    """
    try:
        conn = get_db_connection(db_path)
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS favorites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic TEXT NOT NULL,
                    category TEXT,
                    language TEXT,
                    content_json TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic TEXT NOT NULL,
                    mode TEXT,
                    settings_json TEXT,
                    result_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Indexes for fast lookup
            conn.execute("CREATE INDEX IF NOT EXISTS idx_favorites_created ON favorites (created_at DESC);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_history_created ON history (created_at DESC);")
        conn.close()
        logger.info(f"Database initialized successfully at {db_path}")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


def save_favorite(
    topic: str,
    category: Optional[str],
    language: Optional[str],
    content: Dict[str, Any],
    db_path: str = "database/meme_humor.db"
) -> int:
    """Save an idea to the favorites table."""
    conn = get_db_connection(db_path)
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO favorites (topic, category, language, content_json, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    topic.strip(),
                    category or "General",
                    language or "English",
                    json.dumps(content, ensure_ascii=False),
                    datetime.utcnow().isoformat()
                )
            )
            return cursor.lastrowid
    finally:
        conn.close()


def get_favorites(db_path: str = "database/meme_humor.db", search_query: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve all saved favorites, optionally filtered by search text."""
    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()
        if search_query and search_query.strip():
            query = f"%{search_query.strip()}%"
            cursor.execute(
                """
                SELECT id, topic, category, language, content_json, created_at
                FROM favorites
                WHERE topic LIKE ? OR category LIKE ? OR content_json LIKE ?
                ORDER BY id DESC
                """,
                (query, query, query)
            )
        else:
            cursor.execute(
                """
                SELECT id, topic, category, language, content_json, created_at
                FROM favorites
                ORDER BY id DESC
                """
            )
        
        rows = cursor.fetchall()
        results = []
        for row in rows:
            try:
                content = json.loads(row["content_json"])
            except Exception:
                content = {"raw": row["content_json"]}

            results.append({
                "id": row["id"],
                "topic": row["topic"],
                "category": row["category"],
                "language": row["language"],
                "content": content,
                "created_at": row["created_at"]
            })
        return results
    finally:
        conn.close()


def delete_favorite(favorite_id: int, db_path: str = "database/meme_humor.db") -> bool:
    """Delete a favorite by its ID."""
    conn = get_db_connection(db_path)
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM favorites WHERE id = ?", (favorite_id,))
            return cursor.rowcount > 0
    finally:
        conn.close()


def add_history(
    topic: str,
    mode: str,
    settings: Dict[str, Any],
    result: Any,
    db_path: str = "database/meme_humor.db",
    max_items: int = 50
) -> int:
    """Add a generation request to the history table and purge older items beyond limit."""
    conn = get_db_connection(db_path)
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO history (topic, mode, settings_json, result_json, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    topic.strip(),
                    mode,
                    json.dumps(settings, ensure_ascii=False),
                    json.dumps(result, ensure_ascii=False),
                    datetime.utcnow().isoformat()
                )
            )
            new_id = cursor.lastrowid
            
            # Prune old history
            cursor.execute(
                """
                DELETE FROM history WHERE id NOT IN (
                    SELECT id FROM history ORDER BY id DESC LIMIT ?
                )
                """,
                (max_items,)
            )
            return new_id
    finally:
        conn.close()


def get_history(db_path: str = "database/meme_humor.db", limit: int = 30) -> List[Dict[str, Any]]:
    """Retrieve recent generation history."""
    conn = get_db_connection(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, topic, mode, settings_json, result_json, created_at
            FROM history
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,)
        )
        rows = cursor.fetchall()
        results = []
        for row in rows:
            try:
                settings = json.loads(row["settings_json"]) if row["settings_json"] else {}
            except Exception:
                settings = {}
            
            try:
                result = json.loads(row["result_json"]) if row["result_json"] else {}
            except Exception:
                result = {}

            results.append({
                "id": row["id"],
                "topic": row["topic"],
                "mode": row["mode"],
                "settings": settings,
                "result": result,
                "created_at": row["created_at"]
            })
        return results
    finally:
        conn.close()


def clear_history(db_path: str = "database/meme_humor.db") -> bool:
    """Clear all records from generation history."""
    conn = get_db_connection(db_path)
    try:
        with conn:
            conn.execute("DELETE FROM history")
            return True
    finally:
        conn.close()
