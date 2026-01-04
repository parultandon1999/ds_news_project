from flask import Blueprint, request, jsonify
import threading
from pipelines.fetcher import fetch_all_articles
from pipelines.operations import save_articles

fetch_bp = Blueprint('fetch', __name__)

fetch_status = {"running": False, "last_result": None, "cancelled": False}
fetch_thread = None


def fetch_in_background(max_sources, days=1):
    global fetch_status, fetch_thread

    try:
        fetch_status["running"] = True
        fetch_status["cancelled"] = False
        print(f"Background fetch started (max_sources: {max_sources or 'all'}, days: {days})", flush=True)
        
        # Check for cancellation before starting
        if fetch_status["cancelled"]:
            print("Fetch cancelled before starting", flush=True)
            fetch_status["running"] = False
            return
        
        result = fetch_all_articles(max_sources=max_sources, days=days, check_cancelled=lambda: fetch_status["cancelled"])
        
        # Check for cancellation after fetch
        if fetch_status["cancelled"]:
            print("Fetch cancelled after completion", flush=True)
            fetch_status["running"] = False
            fetch_status["last_result"] = {"cancelled": True, "message": "Fetch cancelled by user"}
            return
        
        save_articles(result)
        
        fetch_status["last_result"] = result
        
        print("Background fetch completed successfully", flush=True)
        print(f"Total articles: {result['metadata']['total_articles']}", flush=True)
        print(f"New articles: {result['metadata']['new_articles']}", flush=True)
        
        # Set running to False LAST to ensure everything is saved
        fetch_status["running"] = False
        print(f"[FETCH COMPLETE] Status updated: running=False, result set", flush=True)
        
    except Exception as e:
        print(f"Background fetch failed: {e}", flush=True)
        import traceback
        traceback.print_exc()
        fetch_status["running"] = False
        fetch_status["last_result"] = {"error": str(e)}
    finally:
        fetch_thread = None


@fetch_bp.route('/fetch', methods=['POST'])
def fetch_news():
    global fetch_thread
    
    try:
        if fetch_status["running"]:
            return jsonify({
                "success": False,
                "message": "Fetch already in progress"
            }), 409
        
        data = request.get_json() or {}
        max_sources = data.get('max_sources')
        days = data.get('days', 1)  # Default to 1 day if not specified
        
        print(f"Starting fetch request (max_sources: {max_sources or 'all'}, days: {days})")
        
        fetch_thread = threading.Thread(target=fetch_in_background, args=(max_sources, days))
        fetch_thread.daemon = True
        fetch_thread.start()
        
        return jsonify({
            "success": True,
            "message": "Fetch started in background",
            "status": "processing"
        })
        
    except Exception as e:
        print(f"Fetch failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@fetch_bp.route('/fetch/status', methods=['GET'])
def fetch_status_check():
    print(f"[STATUS CHECK] running={fetch_status['running']}, has_result={fetch_status['last_result'] is not None}", flush=True)
    return jsonify({
        "running": fetch_status["running"],
        "last_result": fetch_status["last_result"]
    })

@fetch_bp.route('/fetch/cancel', methods=['POST'])
def cancel_fetch():
    global fetch_status, fetch_thread
    try:
        if not fetch_status["running"]:
            return jsonify({
                "success": False,
                "message": "No fetch in progress"
            }), 400
        
        # Set cancellation flag
        fetch_status["cancelled"] = True
        fetch_status["running"] = False
        fetch_status["last_result"] = {"cancelled": True, "message": "Fetch cancelled by user"}
        
        print("Fetch cancellation requested by user", flush=True)
        
        # Note: The thread will check the cancelled flag and stop gracefully
        # We don't forcefully terminate the thread as it's not safe
        
        return jsonify({
            "success": True,
            "message": "Fetch cancellation requested - operation will stop gracefully"
        })
        
    except Exception as e:
        print(f"Cancel failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500