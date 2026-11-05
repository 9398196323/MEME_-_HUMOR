"""
API and Integration Tests for Flask Meme & Humor Generator.
Verifies all REST API routes, input validations, fallback mechanisms, and status codes.
"""

import unittest
import json
import os
import tempfile
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from config import TestingConfig


class TestAPI(unittest.TestCase):

    def setUp(self):
        self.temp_db_fd, self.temp_db_path = tempfile.mkstemp(suffix=".db")
        TestingConfig.DATABASE_PATH = self.temp_db_path
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()

    def tearDown(self):
        os.close(self.temp_db_fd)
        if os.path.exists(self.temp_db_path):
            os.remove(self.temp_db_path)

    def test_health_endpoint(self):
        """GET /api/health returns 200 with service status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("ai_configured", data)
        self.assertNotIn("api_key", json.dumps(data).lower())

    def test_generate_meme_ideas_fallback(self):
        """POST /api/generate produces 5 valid ideas even without live API key."""
        payload = {
            "topic": "College Exams",
            "category": "College and Student Humor",
            "style": "Witty",
            "intensity": "Medium",
            "language": "English",
            "count": 5
        }
        response = self.client.post("/api/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("ideas", data)
        self.assertEqual(len(data["ideas"]), 5)
        first_idea = data["ideas"][0]
        self.assertIn("title", first_idea)
        self.assertIn("top_text", first_idea)
        self.assertIn("bottom_text", first_idea)
        self.assertIn("caption", first_idea)

    def test_generate_meme_ideas_validation(self):
        """POST /api/generate with empty topic returns 400."""
        response = self.client.post("/api/generate", json={"topic": ""})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn("error", data)

    def test_tanglish_generation(self):
        """POST /api/generate with Tanglish language generates Tanglish content."""
        payload = {
            "topic": "Hostel Life",
            "language": "Tanglish",
            "count": 3
        }
        response = self.client.post("/api/generate", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["language"], "Tanglish")
        self.assertTrue(len(data["ideas"]) >= 1)

    def test_captions_endpoint(self):
        """POST /api/captions generates social media captions."""
        payload = {
            "topic": "Monday Morning Coffee",
            "tone": "Sarcastic",
            "language": "English",
            "count": 5
        }
        response = self.client.post("/api/captions", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("captions", data)
        self.assertEqual(len(data["captions"]), 5)

    def test_jokes_endpoint(self):
        """POST /api/jokes generates jokes."""
        payload = {
            "category": "Programming and Developer Humor",
            "style": "Witty",
            "language": "English",
            "count": 5
        }
        response = self.client.post("/api/jokes", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("jokes", data)
        self.assertEqual(len(data["jokes"]), 5)

    def test_favorites_crud(self):
        """Test adding, retrieving, and deleting favorites via API."""
        # Add favorite
        fav_payload = {
            "topic": "Bug in Production",
            "category": "Programming",
            "language": "English",
            "content": {
                "title": "Friday Deployment",
                "top_text": "Me merging PR on Friday 5 PM",
                "bottom_text": "Slack notifications explode"
            }
        }
        add_res = self.client.post("/api/favorites", json=fav_payload)
        self.assertEqual(add_res.status_code, 201)
        fav_id = add_res.get_json()["id"]

        # List favorites
        list_res = self.client.get("/api/favorites")
        self.assertEqual(list_res.status_code, 200)
        favs = list_res.get_json()["favorites"]
        self.assertEqual(len(favs), 1)

        # Delete favorite
        del_res = self.client.delete(f"/api/favorites/{fav_id}")
        self.assertEqual(del_res.status_code, 200)

        # Verify deletion
        list_res2 = self.client.get("/api/favorites")
        self.assertEqual(len(list_res2.get_json()["favorites"]), 0)


if __name__ == "__main__":
    unittest.main()
