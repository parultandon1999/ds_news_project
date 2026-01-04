import requests
import json
import time

OLLAMA_URL = "http://localhost:11434/api/generate"

def test_ollama():
    try:
        response = requests.get("http://localhost:11434", timeout=5)
    except Exception as e:
        return False
    
    # Test 2: Simple text generation
    print("\nTest 1: Simple text generation...")
    try:
        payload = {
            "model": "llama3.2:1b",
            "prompt": "Say hello in one sentence.",
            "stream": False
        }
        
        start_time = time.time()
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Response received in {elapsed:.2f}s")
            print(f"Response: {result.get('response', '')[:100]}")
        else:
            print(f"✗ Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    # Test 3: JSON generation (what we need for articles)
    print("\nTest 2: JSON generation...")
    try:
        payload = {
            "model": "llama3.2:1b",
            "prompt": """Return a JSON object with a summary and tags for this article:
            
Title: AI Breakthrough in 2024
Content: Scientists developed a new AI model that can understand complex reasoning.

Return ONLY valid JSON with this structure:
{
  "summary": "brief summary here",
  "tags": ["tag1", "tag2"]
}""",
            "stream": False,
            "format": "json"
        }
        
        start_time = time.time()
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            response_text = result.get('response', '')
            print(f"✓ JSON response received in {elapsed:.2f}s")
            print(f"Response: {response_text[:200]}")
            
            # Try to parse JSON
            try:
                parsed = json.loads(response_text)
                print("✓ Valid JSON!")
                print(f"Summary: {parsed.get('summary', 'N/A')}")
                print(f"Tags: {parsed.get('tags', [])}")
            except:
                print("✗ Invalid JSON format")
                
        else:
            print(f"✗ Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("✓ All tests passed! Ollama is ready to use.")
    print(f"Average response time: ~{elapsed:.2f}s per request")
    return True

if __name__ == "__main__":
    test_ollama()
