# Database package initialization
from .db import init_db, get_db_connection, save_favorite, get_favorites, delete_favorite, add_history, get_history, clear_history

__all__ = [
    "init_db",
    "get_db_connection",
    "save_favorite",
    "get_favorites",
    "delete_favorite",
    "add_history",
    "get_history",
    "clear_history",
]
