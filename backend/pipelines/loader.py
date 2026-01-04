import json
from typing import List, Dict, Optional
from .config import SOURCES_FILE, FETCHED_DATA_DIR


def load_sources() -> List[str]:
    try:
        with open(SOURCES_FILE, encoding="utf-8") as f:
            urls = [line.strip().strip('"').strip("'") 
            for line in f 
            if line.strip() and not line.strip().startswith('#')
        ]
        print(f"Loaded {len(urls)} sources")
        return urls
    except FileNotFoundError:
        print(f"Sources file not found: {SOURCES_FILE}")
        return []
    except Exception as e:
        print(f"Error loading sources: {e}")
        return []


def load_articles(filename: str = "articles.json") -> Optional[Dict]:
    try:
        file_path = FETCHED_DATA_DIR / filename
        
        if not file_path.exists():
            print(f"No saved articles found at {file_path}")
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"Loaded {data['metadata']['total_articles']} articles from {file_path}")
        return data
        
    except Exception as e:
        print(f"Error loading articles: {e}")
        return None
