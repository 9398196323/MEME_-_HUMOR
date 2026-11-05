"""
Google Gemini AI Integration Service.
Uses the modern Google GenAI SDK to generate structured meme ideas,
humorous captions, and jokes with safety, language, and style control.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Check if google-genai SDK is available
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-genai SDK not installed in Python environment. Using fallback mode.")


class GeminiHumorGenerator:
    """Manages Gemini API requests for humor and meme generation."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model = model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.client = None
        
        if GENAI_AVAILABLE and self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Error initializing GenAI Client: {e}")

    def is_configured(self) -> bool:
        """Check whether Gemini is ready to make live requests."""
        return bool(GENAI_AVAILABLE and self.api_key and self.client)

    def generate_meme_ideas(
        self,
        topic: str,
        category: str = "Relatable Humor",
        style: str = "Witty",
        intensity: str = "Medium",
        language: str = "English",
        count: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Generates structured meme concepts using Gemini API.
        Enforces JSON schema and safety boundaries.
        """
        if not self.is_configured():
            raise RuntimeError("Gemini API is not configured or API key is missing.")

        prompt = f"""
You are a master meme creator and comedy writer. Generate exactly {count} creative meme concepts based on:
- Topic: "{topic}"
- Humor Category: "{category}"
- Humor Style: "{style}"
- Humor Intensity: "{intensity}"
- Language: "{language}"

Language instructions:
- If language is "Tamil", write the content naturally in Tamil script.
- If language is "Tanglish", write conversational Tamil using English alphabets (e.g. "Machi", "Semma", "Idhu enna prachana").
- If language is "English", write in witty, modern conversational internet culture English.

Content Guidelines:
- Must be funny, punchy, and original.
- Avoid offensive slurs, hate speech, threats, or harassment.
- Output MUST be valid JSON conforming to the schema below.

JSON Schema:
{{
  "ideas": [
    {{
      "title": "Short catchy meme title",
      "concept": "Core meme concept / scenario",
      "visual_scene": "Description of the visual scene or meme template",
      "top_text": "Top meme text",
      "bottom_text": "Bottom meme text",
      "caption": "Punchy social media caption",
      "hashtags": ["#tag1", "#tag2", "#tag3"]
    }}
  ]
}}
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=1.0,
                )
            )

            text_content = response.text.strip()
            data = json.loads(text_content)
            if isinstance(data, dict) and "ideas" in data and isinstance(data["ideas"], list):
                return data["ideas"]
            elif isinstance(data, list):
                return data
            else:
                raise ValueError("Unexpected JSON format from Gemini API")
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            raise

    def refine_idea(self, original_idea: Dict[str, Any], instruction: str, language: str = "English") -> Dict[str, Any]:
        """Refines a single meme idea based on a specific instruction (funnier, shorter, etc.)."""
        if not self.is_configured():
            raise RuntimeError("Gemini API is not configured.")

        prompt = f"""
Take this existing meme idea:
{json.dumps(original_idea, ensure_ascii=False)}

Apply this refinement instruction: "{instruction}"
Preserve the language ({language}).
Return the revised idea as a single JSON object matching:
{{
  "title": "Revised title",
  "concept": "Revised concept",
  "visual_scene": "Revised visual scene",
  "top_text": "Revised top text",
  "bottom_text": "Revised bottom text",
  "caption": "Revised caption",
  "hashtags": ["#tag1", "#tag2"]
}}
"""
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text.strip())

    def generate_captions(self, topic: str, tone: str = "Witty", language: str = "English", count: int = 5) -> List[Dict[str, str]]:
        """Generates alternative punchy social media captions."""
        if not self.is_configured():
            raise RuntimeError("Gemini API is not configured.")

        prompt = f"""
Generate {count} funny, punchy social media captions about: "{topic}".
- Tone: {tone}
- Language: {language} (if Tanglish, use colloquial conversational Tamil in English alphabet).

Return JSON format:
{{
  "captions": [
    {{
      "caption": "Text of the caption with emojis and hashtags",
      "tone": "{tone}",
      "platform": "Suggested platform"
    }}
  ]
}}
"""
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        data = json.loads(response.text.strip())
        return data.get("captions", [])

    def generate_jokes(self, category: str, style: str, language: str = "English", count: int = 5) -> List[Dict[str, Any]]:
        """Generates standalone jokes (one-liners, Q&A, puns)."""
        if not self.is_configured():
            raise RuntimeError("Gemini API is not configured.")

        prompt = f"""
Generate {count} hilarious jokes for category: "{category}", style: "{style}", language: "{language}".
Include a variety of One-liners, Q&A, and situational jokes.
Return JSON format:
{{
  "jokes": [
    {{
      "type": "One-liner or Q&A or Situational",
      "setup": "The setup or premise",
      "punchline": "The punchline",
      "tags": ["Tag1", "Tag2"]
    }}
  ]
}}
"""
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        data = json.loads(response.text.strip())
        return data.get("jokes", [])
