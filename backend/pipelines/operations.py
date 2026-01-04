import json
from typing import Dict
from .config import FETCHED_DATA_DIR


def save_articles(articles_data: Dict, filename: str = "articles.json") -> bool:
    try:
        FETCHED_DATA_DIR.mkdir(exist_ok=True)
        
        output_path = FETCHED_DATA_DIR / filename
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(articles_data, f, indent=2, ensure_ascii=False)
        
        print(f"Articles saved to {output_path}")
        return True
        
    except Exception as e:
        print(f"Error saving articles: {e}")
        return False
