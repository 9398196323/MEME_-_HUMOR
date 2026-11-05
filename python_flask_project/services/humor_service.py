"""
Humor Service Orchestrator.
Combines Gemini AI generation with fallback template generation.
Ensures zero-downtime reliability and clean status tracking.
"""

import logging
from typing import Dict, Any, List, Optional
from .gemini_service import GeminiHumorGenerator
from .fallback_service import generate_fallback_ideas, generate_fallback_captions, generate_fallback_jokes

logger = logging.getLogger(__name__)


class HumorService:
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.gemini = GeminiHumorGenerator(api_key=api_key, model=model)

    def is_ai_available(self) -> bool:
        return self.gemini.is_configured()

    def generate_ideas(
        self,
        topic: str,
        category: str = "Relatable Humor",
        style: str = "Witty",
        intensity: str = "Medium",
        language: str = "English",
        count: int = 5
    ) -> Dict[str, Any]:
        """Generate meme ideas with automatic AI-to-fallback transition."""
        clean_topic = topic.strip() if topic else "Daily Life"
        
        # Try AI generation first if configured
        if self.gemini.is_configured():
            try:
                ideas = self.gemini.generate_meme_ideas(
                    topic=clean_topic,
                    category=category,
                    style=style,
                    intensity=intensity,
                    language=language,
                    count=count
                )
                return {
                    "source": "ai",
                    "model": self.gemini.model,
                    "topic": clean_topic,
                    "category": category,
                    "style": style,
                    "intensity": intensity,
                    "language": language,
                    "ideas": ideas
                }
            except Exception as e:
                logger.warning(f"AI generation failed ({e}). Falling back to template generator.")

        # Fallback generation
        fallback_ideas = generate_fallback_ideas(
            topic=clean_topic,
            category=category,
            style=style,
            intensity=intensity,
            language=language,
            count=count
        )
        return {
            "source": "fallback",
            "model": "offline-template-engine",
            "topic": clean_topic,
            "category": category,
            "style": style,
            "intensity": intensity,
            "language": language,
            "ideas": fallback_ideas
        }

    def refine_idea(self, original_idea: Dict[str, Any], instruction: str, language: str = "English") -> Dict[str, Any]:
        """Refine an individual idea card."""
        if self.gemini.is_configured():
            try:
                revised = self.gemini.refine_idea(original_idea, instruction, language)
                return {
                    "source": "ai",
                    "refined_idea": revised,
                    "instruction": instruction
                }
            except Exception as e:
                logger.warning(f"AI refinement failed ({e}). Using local refinement logic.")

        # Local refinement logic
        revised = dict(original_idea)
        inst_lower = instruction.lower()
        if "shorter" in inst_lower:
            revised["top_text"] = revised.get("top_text", "").split(",")[0]
            revised["bottom_text"] = revised.get("bottom_text", "").split(",")[0]
            revised["caption"] = revised.get("caption", "")[:60] + "..."
        elif "funnier" in inst_lower or "extra" in inst_lower:
            revised["caption"] = revised.get("caption", "") + " #Relatable #Humor"
        elif "relatable" in inst_lower:
            revised["top_text"] = "Nobody: Absolutely Nobody:"
            revised["bottom_text"] = f"Me dealing with {original_idea.get('title', 'life')} at 3 AM"

        return {
            "source": "fallback",
            "refined_idea": revised,
            "instruction": instruction
        }

    def generate_captions(self, topic: str, tone: str = "Witty", language: str = "English", count: int = 5) -> Dict[str, Any]:
        """Generate captions with AI or fallback."""
        clean_topic = topic.strip() if topic else "Life"
        if self.gemini.is_configured():
            try:
                captions = self.gemini.generate_captions(topic=clean_topic, tone=tone, language=language, count=count)
                return {
                    "source": "ai",
                    "captions": captions
                }
            except Exception as e:
                logger.warning(f"AI caption failed ({e}). Falling back.")

        captions = generate_fallback_captions(topic=clean_topic, tone=tone, language=language, count=count)
        return {
            "source": "fallback",
            "captions": captions
        }

    def generate_jokes(self, category: str, style: str, language: str = "English", count: int = 5) -> Dict[str, Any]:
        """Generate jokes with AI or fallback."""
        if self.gemini.is_configured():
            try:
                jokes = self.gemini.generate_jokes(category=category, style=style, language=language, count=count)
                return {
                    "source": "ai",
                    "jokes": jokes
                }
            except Exception as e:
                logger.warning(f"AI jokes failed ({e}). Falling back.")

        jokes = generate_fallback_jokes(category=category, style=style, language=language, count=count)
        return {
            "source": "fallback",
            "jokes": jokes
        }
