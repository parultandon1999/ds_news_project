from flask import Blueprint, request, jsonify
from datetime import datetime
from pipelines.user_data import (
    load_saved_articles,
    add_saved_article,
    remove_saved_article,
    clear_saved_articles,
    load_user_settings,
    save_user_settings,
    load_news_alerts,
    add_news_alert,
    update_news_alert,
    remove_news_alert,
    toggle_news_alert
)

user_data_bp = Blueprint('user_data', __name__)


# Saved Articles Routes
@user_data_bp.route('/saved-articles', methods=['GET'])
def get_saved_articles():
    try:
        data = load_saved_articles()
        
        # Apply filters if provided
        search_term = request.args.get('search', '').lower()
        category = request.args.get('category', 'all')
        
        articles = data.get('articles', [])
        
        if search_term:
            articles = [
                a for a in articles 
                if search_term in a.get('title', '').lower() or 
                   search_term in a.get('excerpt', '').lower()
            ]
        
        if category and category != 'all':
            articles = [a for a in articles if a.get('category') == category]
        
        return jsonify({
            "articles": articles,
            "count": len(articles),
            "metadata": data.get('metadata', {})
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_data_bp.route('/saved-articles', methods=['POST'])
def save_article():
    try:
        article_data = request.get_json()
        
        if not article_data or not article_data.get('id'):
            return jsonify({"error": "Article data and ID required"}), 400
        
        # Add timestamp
        article_data['saved_at'] = datetime.now().isoformat()
        
        success = add_saved_article(article_data)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Article saved successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Article already saved or error occurred"
            }), 409
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_data_bp.route('/saved-articles/<article_id>', methods=['DELETE'])
def delete_saved_article(article_id):
    try:
        success = remove_saved_article(article_id)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Article removed successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Article not found"
            }), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_data_bp.route('/saved-articles', methods=['DELETE'])
def clear_all_saved_articles():
    try:
        success = clear_saved_articles()
        
        if success:
            return jsonify({
                "success": True,
                "message": "All saved articles cleared"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Error clearing saved articles"
            }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# User Settings Routes
@user_data_bp.route('/settings', methods=['GET'])
def get_user_settings():
    try:
        settings = load_user_settings()
        return jsonify(settings)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_data_bp.route('/settings', methods=['POST'])
def update_user_settings():
    try:
        settings_data = request.get_json()
        
        if not settings_data:
            return jsonify({"error": "Settings data required"}), 400
        
        success = save_user_settings(settings_data)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Settings updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Error updating settings"
            }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# News Alerts Routes
@user_data_bp.route('/alerts', methods=['GET'])
def get_news_alerts():
    try:
        data = load_news_alerts()
        return jsonify({
            "alerts": data.get('alerts', []),
            "metadata": data.get('metadata', {})
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_data_bp.route('/alerts', methods=['POST'])
def create_news_alert():
    try:
        alert_data = request.get_json()
        
        if not alert_data or not alert_data.get('name'):
            return jsonify({"error": "Alert name required"}), 400
        
        # Add timestamps
        alert_data['createdAt'] = datetime.now().isoformat()
        alert_data['lastTriggered'] = None
        alert_data['triggerCount'] = 0
        
        # Set default enabled status
        if 'enabled' not in alert_data:
            alert_data['enabled'] = True
        
        success = add_news_alert(alert_data)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Alert created successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Error creating alert"
            }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_data_bp.route('/alerts/<int:alert_id>', methods=['PUT'])
def update_alert(alert_id):
    try:
        alert_data = request.get_json()
        
        if not alert_data:
            return jsonify({"error": "Alert data required"}), 400
        
        success = update_news_alert(alert_id, alert_data)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Alert updated successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Alert not found"
            }), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_data_bp.route('/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    try:
        success = remove_news_alert(alert_id)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Alert deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Alert not found"
            }), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_data_bp.route('/alerts/<int:alert_id>/toggle', methods=['POST'])
def toggle_alert(alert_id):
    try:
        success = toggle_news_alert(alert_id)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Alert toggled successfully"
            })
        else:
            return jsonify({
                "success": False,
                "message": "Alert not found"
            }), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500