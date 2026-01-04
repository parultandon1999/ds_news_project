from datetime import datetime, timedelta
from typing import Optional, Dict
from .loader import load_sources, load_articles
from .parser import parse_feed

def fetch_all_articles(max_sources: Optional[int] = None, days: int = 1, check_cancelled=None) -> Dict:
    sources = load_sources()
    
    if max_sources:
        sources = sources[:max_sources]
        print(f"Limited to first {max_sources} sources for testing")
    
    # Load existing articles to check for duplicates
    existing_data = load_articles()
    existing_articles = existing_data.get('articles', []) if existing_data else []
    existing_ids = {article.get('id') for article in existing_articles if article.get('id')}
    
    print(f"Found {len(existing_ids)} existing articles")
    
    # Calculate cutoff time based on days parameter
    cutoff_time = datetime.now() - timedelta(days=days)
    print(f"Fetching articles from last {days} day(s)")
    
    all_articles = []
    new_articles = []
    skipped_old = 0
    skipped_duplicate = 0
    successful_sources = 0
    failed_sources = 0
    
    for feed_url in sources:
        # Check for cancellation before processing each source
        if check_cancelled and check_cancelled():
            print("Fetch cancelled during processing", flush=True)
            break
            
        articles = parse_feed(feed_url)
        if articles:
            for article in articles:
                # Check for cancellation during article processing
                if check_cancelled and check_cancelled():
                    print("Fetch cancelled during article processing", flush=True)
                    break
                    
                # Skip duplicates
                if article.get('id') in existing_ids:
                    skipped_duplicate += 1
                    continue
                
                # Check if article is from last 24 hours
                published = article.get('published', '')
                if published:
                    try:
                        # Parse various date formats
                        from dateutil import parser as date_parser
                        article_date = date_parser.parse(published)
                        
                        # Make timezone-naive for comparison
                        if article_date.tzinfo:
                            article_date = article_date.replace(tzinfo=None)
                        
                        if article_date < cutoff_time:
                            skipped_old += 1
                            continue
                    except:
                        # If date parsing fails, include the article
                        pass
                
                new_articles.append(article)
            
            successful_sources += 1
        else:
            failed_sources += 1
        
        # Break out of outer loop if cancelled during article processing
        if check_cancelled and check_cancelled():
            break
    
    # Merge new articles with existing ones - PRESERVE ALL DATA
    all_articles = []
    
    # Add existing articles first (preserve their categories and summaries)
    for existing_article in existing_articles:
        all_articles.append(existing_article)
    
    # Add new articles
    for new_article in new_articles:
        all_articles.append(new_article)
    
    # Sort by published date (newest first)
    try:
        from dateutil import parser as date_parser
        def get_date(article):
            try:
                return date_parser.parse(article.get('published', ''))
            except:
                return datetime.min
        
        all_articles.sort(key=get_date, reverse=True)
    except:
        pass  # If sorting fails, keep original order
    
    result = {
        "articles": all_articles,
        "metadata": {
            "total_articles": len(all_articles),
            "new_articles": len(new_articles),
            "existing_articles": len(existing_articles),
            "skipped_old": skipped_old,
            "skipped_duplicate": skipped_duplicate,
            "total_sources": len(sources),
            "successful_sources": successful_sources,
            "failed_sources": failed_sources,
            "fetched_at": datetime.now().isoformat()
        }
    }
    
    print(f"Fetch Summary:")
    print(f"New articles: {len(new_articles)}")
    print(f"Existing articles: {len(existing_articles)}")
    print(f"Skipped (old): {skipped_old}")
    print(f"Skipped (duplicate): {skipped_duplicate}")
    print(f"Total articles: {len(all_articles)}")
    print(f"Successful sources: {successful_sources}/{len(sources)}")
    print(f"Failed sources: {failed_sources}/{len(sources)}")
    
    return result