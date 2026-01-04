from flask import Blueprint, request, jsonify
from pipelines.loader import load_articles
from pipelines.operations import save_articles
from services.ai_service import categorize_articles, summarize_article

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/categorize', methods=['POST'])
def categorize():
    try:
        data = load_articles()

        if not data or not data.get('articles'):
            return jsonify({
                'success': False,
                'message': 'No articles found to categorize'
            }), 404
        
        articles = data['articles']
        
        # Try AI categorization first, fall back to rule-based if it fails
        print(f"Categorizing {len(articles)} articles...")
        categorized_articles, categories = categorize_articles(articles, quick_mode=True)
        
        data['articles'] = categorized_articles
        data['ai_categories'] = categories
        
        save_articles(data)
        
        # Count pending articles for background processing
        pending_count = sum(1 for a in articles if a.get('ai_category') == 'Pending')
        
        return jsonify({
            'success': True,
            'message': f'Categorized articles successfully',
            'categories': categories,
            'pending_articles': pending_count,
            'total_articles': len(articles)
        })
        
    except Exception as e:
        print(f"Categorization failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ai_bp.route('/categorize/fallback', methods=['POST'])
def categorize_fallback():
    """
    Force fallback categorization without AI
    """
    try:
        data = load_articles()

        if not data or not data.get('articles'):
            return jsonify({
                'success': False,
                'message': 'No articles found to categorize'
            }), 404
        
        articles = data['articles']
        
        print(f"Using fallback categorization for {len(articles)} articles...")
        from services.ai_service import fallback_categorize_articles
        categorized_articles, categories = fallback_categorize_articles(articles)
        
        data['articles'] = categorized_articles
        data['ai_categories'] = categories
        
        save_articles(data)
        
        return jsonify({
            'success': True,
            'message': f'Fallback categorized {len(articles)} articles',
            'categories': categories,
            'total_articles': len(articles),
            'method': 'fallback'
        })
        
    except Exception as e:
        print(f"Fallback categorization failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ai_bp.route('/summarize', methods=['POST'])
def summarize():
    try:
        request_data = request.get_json()
        article_id = request_data.get('article_id')
        
        if not article_id:
            return jsonify({
                'success': False,
                'message': 'article_id is required'
            }), 400
        
        data = load_articles()
        
        if not data or not data.get('articles'):
            return jsonify({
                'success': False,
                'message': 'No articles found'
            }), 404
        
        article = next((a for a in data['articles'] if a.get('id') == article_id), None)
        print(f"article = {article}")
        
        if not article:
            return jsonify({
                'success': False,
                'message': 'Article not found'
            }), 404
        
        if 'ai_summary' in article:
            return jsonify({
                'success': True,
                'summary': article['ai_summary'],
                'key_points': article.get('ai_key_points', []),
                'tags': article.get('ai_tags', [])
            })
        
        print(f"Generating AI summary for article: {article.get('title', '')[:50]}")
        summary_data = summarize_article(article)
        
        article['ai_summary'] = summary_data['summary']
        article['ai_key_points'] = summary_data['key_points']
        article['ai_tags'] = summary_data['tags']
        
        save_articles(data)
        
        return jsonify({
            'success': True,
            'summary': summary_data['summary'],
            'key_points': summary_data['key_points'],
            'tags': summary_data['tags']
        })
        
    except Exception as e:
        print(f"Summarization failed: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@ai_bp.route('/auto-summarize', methods=['POST'])
def auto_summarize():
    try:
        from datetime import datetime, timedelta
        from services.ai_service import batch_summarize_articles
        
        data = load_articles()
        
        if not data or not data.get('articles'):
            return jsonify({
                'success': False,
                'message': 'No articles found'
            }), 404
        
        articles = data['articles']
        
        # Filter articles from last 24 hours that don't have ai_summary
        cutoff_time = datetime.now() - timedelta(hours=24)
        recent_articles = []
        
        for article in articles:
            # Check if article is recent
            try:
                from dateutil import parser as date_parser
                article_date = date_parser.parse(article.get('published', ''))
                if article_date.tzinfo:
                    article_date = article_date.replace(tzinfo=None)
                
                # Only summarize if recent and not already summarized
                if article_date >= cutoff_time and 'ai_summary' not in article:
                    recent_articles.append(article)
            except:
                continue
        
        if not recent_articles:
            return jsonify({
                'success': True,
                'message': 'No recent articles to summarize',
                'summarized_count': 0
            })
        
        print(f"Auto-summarizing {len(recent_articles)} recent articles...")
        summarized = batch_summarize_articles(recent_articles, limit=len(recent_articles))
        
        # Update articles in data
        article_ids = {a['id'] for a in summarized}
        for i, article in enumerate(data['articles']):
            if article['id'] in article_ids:
                summarized_article = next(a for a in summarized if a['id'] == article['id'])
                data['articles'][i] = summarized_article
        
        save_articles(data)
        
        return jsonify({
            'success': True,
            'message': f'Summarized {len(summarized)} recent articles',
            'summarized_count': len(summarized)
        })
        
    except Exception as e:
        print(f"Auto-summarization failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
