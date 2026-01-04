from flask import Flask, jsonify
from flask_cors import CORS
from routes import articles_bp, fetch_bp, ai_bp
from routes.user_data import user_data_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(articles_bp, url_prefix='/api')
app.register_blueprint(fetch_bp, url_prefix='/api')
app.register_blueprint(ai_bp, url_prefix='/api')
app.register_blueprint(user_data_bp, url_prefix='/api')


@app.route('/')
def index():
    return jsonify({
        "message": "Data Science News API",
        "version": "1.0",
        "endpoints": {
            "GET /api/articles": "Get all fetched articles with optional filters",
            "POST /api/fetch": "Trigger fetching news from all sources",
            "GET /api/fetch/status": "Check fetch status",
            "GET /api/stats": "Get statistics about fetched articles",
            "POST /api/categorize": "Categorize articles using AI",
            "POST /api/summarize": "Get AI summary for specific article (body: {article_id: string})",
            "GET /api/saved-articles": "Get saved articles",
            "POST /api/saved-articles": "Save an article",
            "DELETE /api/saved-articles/{id}": "Remove saved article",
            "DELETE /api/saved-articles": "Clear all saved articles",
            "GET /api/settings": "Get user settings",
            "POST /api/settings": "Update user settings",
            "GET /api/alerts": "Get news alerts",
            "POST /api/alerts": "Create news alert",
            "PUT /api/alerts/{id}": "Update news alert",
            "DELETE /api/alerts/{id}": "Delete news alert",
            "POST /api/alerts/{id}/toggle": "Toggle news alert"
        }
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True,
        use_reloader=False
    )
