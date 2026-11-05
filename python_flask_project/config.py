"""
Configuration settings for the Meme and Humor Idea Generator.
Supports environment variables with sensible defaults for college demonstrations.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the Python project
BASE_DIR = Path(__file__).resolve().parent

# Load .env file if present
load_dotenv(BASE_DIR / ".env")


class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "meme-humor-secret-key-college-demo")
    DATABASE_PATH = os.getenv(
        "DATABASE_PATH",
        str(BASE_DIR / "database" / "meme_humor.db")
    )
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    MAX_HISTORY_ITEMS = int(os.getenv("MAX_HISTORY_ITEMS", 50))
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    DATABASE_PATH = ":memory:"  # In-memory database for unit testing
    GEMINI_API_KEY = "test-mock-key"


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
