from flask import Blueprint, request, jsonify
from pipelines.loader import load_articles

articles_bp = Blueprint('articles', __name__)


@articles_bp.route('/articles', methods=['GET'])
def get_articles():
    try:
        # Load articles from file
        data = load_articles()
        
        if not data:
            return jsonify({
                "articles": [],
                "message": "No articles found. Try fetching first using POST /api/fetch"
            }), 404
        
        articles = data.get("articles", [])
        
        # Apply filters
        category = request.args.get('category')
        limit = request.args.get('limit', type=int)
        
        if category:
            articles = [a for a in articles if category.lower() in a.get('source', '').lower()]
        
        if limit:
            articles = articles[:limit]
        
        return jsonify({
            "articles": articles,
            "count": len(articles),
            "metadata": data.get("metadata", {})
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@articles_bp.route('/stats', methods=['GET'])
def get_stats():
    try:
        data = load_articles()
        
        if not data:
            return jsonify({
                "message": "No articles found"
            }), 404
        
        articles = data.get("articles", [])
        
        # Calculate stats
        sources = {}
        for article in articles:
            source = article.get("source", "Unknown")
            sources[source] = sources.get(source, 0) + 1
        
        return jsonify({
            "total_articles": len(articles),
            "total_sources": len(sources),
            "top_sources": sorted(sources.items(), key=lambda x: x[1], reverse=True)[:10],
            "metadata": data.get("metadata", {})
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@articles_bp.route('/articles/count', methods=['GET'])
def get_article_count():
    try:
        data = load_articles()
        
        if not data:
            return jsonify({
                "count": 0,
                "last_updated": None
            })
        
        articles = data.get("articles", [])
        metadata = data.get("metadata", {})
        
        return jsonify({
            "count": len(articles),
            "last_updated": metadata.get("fetched_at"),
            "new_articles": metadata.get("new_articles", 0)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500