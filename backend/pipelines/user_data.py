import json
import os
from typing import Dict, List, Optional, Any
from pathlib import Path
from .config import FETCHED_DATA_DIR, SAVED_ARTICLES_FILE, USER_SETTINGS_FILE, NEWS_ALERTS_FILE


def load_json_file(file_path: Path, default_data: Dict) -> Dict:
    try:
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return default_data
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return default_data


def save_json_file(file_path: Path, data: Dict) -> bool:
    try:
        file_path.parent.mkdir(exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving {file_path}: {e}")
        return False


# Saved Articles Management
def load_saved_articles() -> Dict:
    default_data = {
        "articles": [],
        "metadata": {
            "total_saved": 0,
            "last_updated": None,
            "version": "1.0"
        }
    }
    return load_json_file(SAVED_ARTICLES_FILE, default_data)


def save_saved_articles(data: Dict) -> bool:
    return save_json_file(SAVED_ARTICLES_FILE, data)


def add_saved_article(article: Dict) -> bool:
    try:
        data = load_saved_articles()
        
        # Check if article already exists
        existing_ids = [a.get('id') for a in data['articles']]
        if article.get('id') in existing_ids:
            return False  # Already saved
        
        # Add article
        data['articles'].append(article)
        data['metadata']['total_saved'] = len(data['articles'])
        data['metadata']['last_updated'] = article.get('saved_at')
        
        return save_saved_articles(data)
    except Exception as e:
        print(f"Error adding saved article: {e}")
        return False


def remove_saved_article(article_id: str) -> bool:
    try:
        data = load_saved_articles()
        original_count = len(data['articles'])
        
        data['articles'] = [a for a in data['articles'] if a.get('id') != article_id]
        
        if len(data['articles']) < original_count:
            data['metadata']['total_saved'] = len(data['articles'])
            from datetime import datetime
            data['metadata']['last_updated'] = datetime.now().isoformat()
            return save_saved_articles(data)
        
        return False  # Article not found
    except Exception as e:
        print(f"Error removing saved article: {e}")
        return False


def clear_saved_articles() -> bool:
    try:
        from datetime import datetime
        data = {
            "articles": [],
            "metadata": {
                "total_saved": 0,
                "last_updated": datetime.now().isoformat(),
                "version": "1.0"
            }
        }
        return save_saved_articles(data)
    except Exception as e:
        print(f"Error clearing saved articles: {e}")
        return False


# User Settings Management
def load_user_settings() -> Dict:
    default_settings = {
        "autoRefresh": True,
        "refreshInterval": 300,
        "articlesPerPage": 20,
        "defaultTimeFilter": "today",
        "autoSummarize": True,
        "autoCategorize": True,
        "summaryLength": "medium",
        "enableNotifications": True,
        "notificationSound": True,
        "emailAlerts": False,
        "compactView": False,
        "showImages": True,
        "darkMode": False,
        "maxArticles": 1000,
        "autoCleanup": True,
        "cleanupDays": 30,
        "last_updated": None
    }
    return load_json_file(USER_SETTINGS_FILE, default_settings)


def save_user_settings(settings: Dict) -> bool:
    try:
        from datetime import datetime
        settings['last_updated'] = datetime.now().isoformat()
        return save_json_file(USER_SETTINGS_FILE, settings)
    except Exception as e:
        print(f"Error saving user settings: {e}")
        return False


# News Alerts Management
def load_news_alerts() -> Dict:
    default_data = {
        "alerts": [],
        "metadata": {
            "total_alerts": 0,
            "last_updated": None,
            "version": "1.0"
        }
    }
    return load_json_file(NEWS_ALERTS_FILE, default_data)


def save_news_alerts(data: Dict) -> bool:
    return save_json_file(NEWS_ALERTS_FILE, data)


def add_news_alert(alert: Dict) -> bool:
    try:
        data = load_news_alerts()
        
        # Generate ID if not provided
        if 'id' not in alert:
            from datetime import datetime
            alert['id'] = int(datetime.now().timestamp() * 1000)
        
        data['alerts'].append(alert)
        data['metadata']['total_alerts'] = len(data['alerts'])
        from datetime import datetime
        data['metadata']['last_updated'] = datetime.now().isoformat()
        
        return save_news_alerts(data)
    except Exception as e:
        print(f"Error adding news alert: {e}")
        return False


def update_news_alert(alert_id: int, updated_alert: Dict) -> bool:
    try:
        data = load_news_alerts()
        
        for i, alert in enumerate(data['alerts']):
            if alert.get('id') == alert_id:
                updated_alert['id'] = alert_id
                data['alerts'][i] = updated_alert
                from datetime import datetime
                data['metadata']['last_updated'] = datetime.now().isoformat()
                return save_news_alerts(data)
        
        return False  # Alert not found
    except Exception as e:
        print(f"Error updating news alert: {e}")
        return False


def remove_news_alert(alert_id: int) -> bool:
    try:
        data = load_news_alerts()
        original_count = len(data['alerts'])
        
        data['alerts'] = [a for a in data['alerts'] if a.get('id') != alert_id]
        
        if len(data['alerts']) < original_count:
            data['metadata']['total_alerts'] = len(data['alerts'])
            from datetime import datetime
            data['metadata']['last_updated'] = datetime.now().isoformat()
            return save_news_alerts(data)
        
        return False  # Alert not found
    except Exception as e:
        print(f"Error removing news alert: {e}")
        return False


def toggle_news_alert(alert_id: int) -> bool:
    try:
        data = load_news_alerts()
        
        for alert in data['alerts']:
            if alert.get('id') == alert_id:
                alert['enabled'] = not alert.get('enabled', True)
                from datetime import datetime
                data['metadata']['last_updated'] = datetime.now().isoformat()
                return save_news_alerts(data)
        
        return False  # Alert not found
    except Exception as e:
        print(f"Error toggling news alert: {e}")
        return False