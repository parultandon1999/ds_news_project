import json
import requests
import time
from pipelines.config import OLLAMA_URL


def call_ai(prompt, max_retries=5):
    for attempt in range(max_retries):
        try:
            payload = {
                "model": "llama3.2:1b",
                "prompt": prompt,
                "stream": False,
                "format": "json"
            }
            
            response = requests.post(
                OLLAMA_URL,
                json=payload,
                timeout=120
            )
            
            if response.status_code != 200:
                print(f"API Error: {response.status_code} - {response.text}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                return None
            
            result = response.json()
            text = result.get('response', '')
            return text.strip()
            
        except Exception as e:
            print(f"Error calling Ollama API: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
            else:
                return None
    
    return None


def fallback_categorize_articles(articles):
    """
    Fallback categorization that doesn't require AI service
    """
    categories = [
        'Machine Learning',
        'AI Research', 
        'Generative AI',
        'Data Science',
        'MLOps',
        'Tools & Frameworks',
        'Tech News',
        'General'
    ]
    
    for article in articles:
        if 'ai_category' in article and article['ai_category']:
            continue  # Skip if already categorized
            
        title = (article.get('title', '') or '').lower()
        source = (article.get('source', '') or '').lower()
        summary = (article.get('summary', '') or '').lower()
        content = f"{title} {source} {summary}"
        
        # Rule-based categorization
        category = 'General'  # default
        
        if any(keyword in content for keyword in ['machine learning', 'ml', 'neural network', 'deep learning', 'tensorflow', 'pytorch']):
            category = 'Machine Learning'
        elif any(keyword in content for keyword in ['gpt', 'llm', 'large language model', 'chatgpt', 'openai', 'anthropic', 'generative']):
            category = 'Generative AI'
        elif any(keyword in content for keyword in ['ai research', 'research paper', 'arxiv', 'academic', 'study']):
            category = 'AI Research'
        elif any(keyword in content for keyword in ['data science', 'data analysis', 'analytics', 'pandas', 'numpy', 'visualization']):
            category = 'Data Science'
        elif any(keyword in content for keyword in ['mlops', 'deployment', 'production', 'kubernetes', 'docker', 'pipeline']):
            category = 'MLOps'
        elif any(keyword in content for keyword in ['python', 'framework', 'library', 'tool', 'github', 'software']):
            category = 'Tools & Frameworks'
        elif 'hacker news' in source or 'show hn' in title:
            category = 'Tech News'
        
        article['ai_category'] = category
    
    return articles, categories


def categorize_articles(articles, result=None, quick_mode=False):
    if not articles or len(articles) == 0:
        return articles, ['General']
    
    try:
        # First try AI categorization
        return ai_categorize_articles(articles, result, quick_mode)
    except Exception as e:
        print(f"AI categorization failed: {e}")
        print("Falling back to rule-based categorization...")
        return fallback_categorize_articles(articles)


def ai_categorize_articles(articles, result=None, quick_mode=False):
    if not articles or len(articles) == 0:
        return articles, ['General']
    
    try:
        # Determine how many articles to process
        if quick_mode:
            articles_to_process = articles[:50]  # Only first 50 for quick display
            print(f"QUICK MODE: Processing first {len(articles_to_process)} articles for immediate display")
        else:
            articles_to_process = articles
            print(f"FULL MODE: Processing all {len(articles_to_process)} articles")
        
        # STEP 1: Generate 6 categories from article titles
        print(f"Step 1: Generating categories from {len(articles_to_process)} articles...")
        
        all_titles = "\n".join([
            f"{i+1}. {article.get('title', '')}"
            for i, article in enumerate(articles_to_process[:30])  # Use first 30 for category generation
        ])
        
        category_prompt = f"""Analyze these data science and AI news article titles and create exactly 6 broad categories that cover all topics.

Article Titles:
{all_titles}

Return ONLY a JSON object with this structure:
{{
  "categories": ["Category1", "Category2", "Category3", "Category4", "Category5", "Category6"]
}}

Requirements:
- Exactly 6 categories
- Categories should be broad enough to cover multiple articles
- Use clear, descriptive names
- Return only valid JSON, no other text

Example categories: "Machine Learning", "AI Research", "Data Engineering", "MLOps", "Generative AI", "AI Ethics"
"""
        
        response_text = call_ai(category_prompt)
        if not response_text:
            raise Exception("Failed to generate categories")
        
        response_text = response_text.replace('```json', '').replace('```', '').strip()
        category_result = json.loads(response_text)
        categories = category_result.get('categories', ['General'])
        
        print(f"Generated categories: {categories}")
        
        # STEP 2: Categorize articles in batches using the generated categories
        print(f"Step 2: Categorizing {len(articles_to_process)} articles in batches of 10...")
        
        batch_size = 10
        for batch_start in range(0, len(articles_to_process), batch_size):
            batch_end = min(batch_start + batch_size, len(articles_to_process))
            batch_articles = articles_to_process[batch_start:batch_end]
            
            print(f"Processing batch {batch_start//batch_size + 1}: articles {batch_start+1}-{batch_end}")
            
            articles_text = "\n\n".join([
                f"Article {i}:\nTitle: {article.get('title', '')}\nSummary: {article.get('summary', '')[:200]}"
                for i, article in enumerate(batch_articles)
            ])
            
            categorize_prompt = f"""Assign each article to ONE of these categories:

ALLOWED CATEGORIES:
{', '.join(categories)}

RULES:
- Use ONLY the categories listed above
- Each article gets exactly ONE category
- Multiple articles can have the same category
- Return valid JSON only

Articles:
{articles_text}

Return ONLY a JSON object:
{{
  "article_categories": {{
    "0": "Category Name",
    "1": "Category Name",
    ...
  }}
}}
"""
            
            response_text = call_ai(categorize_prompt)
            if response_text:
                response_text = response_text.replace('```json', '').replace('```', '').strip()
                result = json.loads(response_text)
                
                for i, article in enumerate(batch_articles):
                    category = result['article_categories'].get(str(i), 'General')
                    article['ai_category'] = category
                    print(f"  Article {batch_start+i+1}: {category}")
            else:
                # Fallback to General if batch fails - DON'T REMOVE ARTICLES
                for article in batch_articles:
                    if 'ai_category' not in article:  # Only set if not already set
                        article['ai_category'] = 'General'
            
            time.sleep(1)  # Small delay between batches
        
        # If quick mode, mark remaining articles as uncategorized for background processing
        if quick_mode and len(articles) > 50:
            remaining_articles = articles[50:]
            for article in remaining_articles:
                if 'ai_category' not in article or not article['ai_category']:
                    article['ai_category'] = 'Pending'  # Mark for background processing
            print(f"Marked {len(remaining_articles)} articles for background categorization")
        
        # Ensure ALL articles have a category (preserve old articles)
        for article in articles:
            if 'ai_category' not in article or not article['ai_category']:
                article['ai_category'] = 'General'
        
        print(f"Categorized {len(articles_to_process)} articles into categories: {categories}")
        return articles, categories
        
    except Exception as e:
        print(f"Error categorizing articles: {e}")
        import traceback
        traceback.print_exc()
        # DON'T REMOVE ARTICLES - just ensure they have categories
        for article in articles:
            if 'ai_category' not in article or not article['ai_category']:
                article['ai_category'] = 'General'
        return articles, ['General']


def summarize_article(article):
    try:
        title = article.get('title', '')
        content = article.get('summary', '') or article.get('content', '')
        
        if not content:
            return {
                'summary': 'No content available to summarize.',
                'key_points': [],
                'tags': []
            }
        
        prompt = f"""Analyze this article and provide a concise summary.

Title: {title}
Content: {content[:2000]}

Return ONLY a JSON object with this structure:
{{
  "summary": "2-3 sentence summary",
  "key_points": ["point 1", "point 2", "point 3"],
  "tags": ["tag1", "tag2", "tag3"]
}}

Return only valid JSON, no other text."""

        response_text = call_ai(prompt)
        print(response_text)
        
        if not response_text:
            raise Exception("No response from Ollama API")
        
        response_text = response_text.replace('```json', '').replace('```', '').strip()
        result = json.loads(response_text)
        
        return result
        
    except Exception as e:
        print(f"Error summarizing article: {e}")
        return {
            'summary': article.get('summary', 'Summary not available')[:300],
            'key_points': [],
            'tags': article.get('tags', [])
        }


def batch_summarize_articles(articles, limit=10):
    summarized = []
    
    for i, article in enumerate(articles[:limit]):
        print(f"Summarizing article {i+1}/{min(limit, len(articles))}")
        summary_data = summarize_article(article)
        
        article['ai_summary'] = summary_data['summary']
        article['ai_key_points'] = summary_data['key_points']
        article['ai_tags'] = summary_data['tags']
        
        summarized.append(article)
        
        # Small delay between requests
        if i < limit - 1:
            time.sleep(0.5)
    
    return summarized
