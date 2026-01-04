from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
SOURCES_FILE = BASE_DIR / "sources" / "sources.txt"
FETCHED_DATA_DIR = BASE_DIR / "fetched_data"
OLLAMA_URL = "http://localhost:11434/api/generate"


# Create user data directory
USER_DATA_DIR = Path(__file__).parent.parent / "user_data"
USER_DATA_DIR.mkdir(exist_ok=True)

# File paths
SAVED_ARTICLES_FILE = USER_DATA_DIR / "saved_articles.json"
USER_SETTINGS_FILE = USER_DATA_DIR / "user_settings.json"
NEWS_ALERTS_FILE = USER_DATA_DIR / "news_alerts.json"