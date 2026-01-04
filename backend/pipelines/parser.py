import feedparser
from datetime import datetime
from typing import List, Dict
import re
from html import unescape


def clean_html(text: str) -> str:
    if not text:
        return ""
    
    # Unescape HTML entities
    text = unescape(text)
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


def parse_feed(feed_url: str, timeout: int = 50) -> List[Dict]:
    articles = []

    try:
        print(f"Fetching: {feed_url}")
        feed = feedparser.parse(feed_url, request_headers={'User-Agent': 'Mozilla/5.0'})
        
        if feed.bozo:
            print(f"Failed to parse: {feed_url}")
            return articles
        
        source_name = feed.feed.get("title", feed_url.split('/')[2] if '/' in feed_url else "Unknown")
        
        for entry in feed.entries:
            author = entry.get("author", "")
            if not author and "authors" in entry:
                author = ", ".join([a.get("name", "") for a in entry.authors if a.get("name")])
            
            tags = []
            if "tags" in entry:
                tags = [tag.get("term", "") for tag in entry.tags if tag.get("term")]
            
            # Extract image URL
            image_url = ""
            
            # Try media_thumbnail
            if "media_thumbnail" in entry and entry.media_thumbnail:
                image_url = entry.media_thumbnail[0].get("url", "")
            
            # Try media_content
            elif "media_content" in entry and entry.media_content:
                for media in entry.media_content:
                    if media.get("medium") == "image" or media.get("type", "").startswith("image/"):
                        image_url = media.get("url", "")
                        break
            
            # Try enclosures
            elif "enclosures" in entry:
                for enclosure in entry.enclosures:
                    if enclosure.get("type", "").startswith("image/"):
                        image_url = enclosure.get("href", "")
                        break
            
            # Try links
            elif "links" in entry:
                for link in entry.links:
                    if link.get("type", "").startswith("image/"):
                        image_url = link.get("href", "")
                        break
            
            # Extract and clean summary/content
            summary = entry.get("summary", entry.get("description", ""))
            content = entry.get("content", [{}])[0].get("value", "") if entry.get("content") else ""
            
            # Clean HTML from summary and content
            summary_clean = clean_html(summary)[:500]
            content_clean = clean_html(content)[:1000]
            
            article = {
                "id": entry.get("id", entry.get("link", "")),
                "title": clean_html(entry.get("title", "No Title")),
                "link": entry.get("link", ""),
                "published": entry.get("published", entry.get("updated", "")),
                "summary": summary_clean,
                "content": content_clean,
                "author": author,
                "tags": tags,
                "image_url": image_url,
                "source": source_name,
                "feed_url": feed_url,
                "fetched_at": datetime.now().isoformat()
            }
            
            if article["title"] and article["link"]:
                articles.append(article)
        
        print(f"Fetched {len(articles)} articles from {source_name}")
        
    except Exception as e:
        print(f"Error parsing feed {feed_url}: {e}")
    
    return articles
