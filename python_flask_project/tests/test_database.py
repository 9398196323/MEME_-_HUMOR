"""
Unit tests for SQLite database operations.
Tests table creation, inserting favorites, searching, deleting, and history retention.
"""

import unittest
import sqlite3
import os
import tempfile
from pathlib import Path
import sys

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database.db import (
    init_db,
    save_favorite,
    get_favorites,
    delete_favorite,
    add_history,
    get_history,
    clear_history
)


class TestDatabase(unittest.TestCase):

    def setUp(self):
        # Create a temporary database file
        self.temp_db_fd, self.temp_db_path = tempfile.mkstemp(suffix=".db")
        init_db(self.temp_db_path)

    def tearDown(self):
        os.close(self.temp_db_fd)
        if os.path.exists(self.temp_db_path):
            os.remove(self.temp_db_path)

    def test_database_initialization(self):
        """Verify that tables exist after initialization."""
        conn = sqlite3.connect(self.temp_db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()

        self.assertIn("favorites", tables)
        self.assertIn("history", tables)

    def test_save_and_retrieve_favorite(self):
        """Test saving an idea to favorites and reading it back."""
        content = {
            "title": "Exam Prep Panic",
            "top_text": "Me at 11 PM",
            "bottom_text": "Me at 3 AM"
        }
        fav_id = save_favorite(
            topic="College Exams",
            category="College and Student Humor",
            language="English",
            content=content,
            db_path=self.temp_db_path
        )
        self.assertIsInstance(fav_id, int)
        self.assertGreater(fav_id, 0)

        favs = get_favorites(db_path=self.temp_db_path)
        self.assertEqual(len(favs), 1)
        self.assertEqual(favs[0]["topic"], "College Exams")
        self.assertEqual(favs[0]["content"]["title"], "Exam Prep Panic")

    def test_search_and_delete_favorite(self):
        """Test searching favorites and deleting by id."""
        save_favorite(
            topic="Python Coding",
            category="Programming",
            language="English",
            content={"title": "Indentation Error"},
            db_path=self.temp_db_path
        )
        save_favorite(
            topic="Hostel Life",
            category="College",
            language="Tanglish",
            content={"title": "Mess Food Mystery"},
            db_path=self.temp_db_path
        )

        results = get_favorites(db_path=self.temp_db_path, search_query="Python")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["topic"], "Python Coding")

        # Delete the item
        fav_id = results[0]["id"]
        deleted = delete_favorite(fav_id, db_path=self.temp_db_path)
        self.assertTrue(deleted)

        remaining = get_favorites(db_path=self.temp_db_path)
        self.assertEqual(len(remaining), 1)
        self.assertEqual(remaining[0]["topic"], "Hostel Life")

    def test_history_logging_and_clearing(self):
        """Test history logging and clearing."""
        add_history(
            topic="Morning Alarm",
            mode="meme_generator",
            settings={"category": "Relatable"},
            result={"ideas": [{"title": "Snooze Button"}]},
            db_path=self.temp_db_path,
            max_items=5
        )

        history = get_history(db_path=self.temp_db_path)
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0]["topic"], "Morning Alarm")

        # Clear history
        clear_history(db_path=self.temp_db_path)
        history_after = get_history(db_path=self.temp_db_path)
        self.assertEqual(len(history_after), 0)


if __name__ == "__main__":
    unittest.main()
