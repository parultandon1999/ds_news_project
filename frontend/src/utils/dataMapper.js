export const mapArticleToFrontend = (article) => {
  // Fallback category extraction if ai_category is not available
  let category = 'General';
  
  if (article.ai_category && article.ai_category !== 'Pending') {
    category = article.ai_category;
  } else if (article.ai_category === 'Pending') {
    category = 'Processing...';
  } else {
    // Fallback: extract category from source or title
    category = extractCategoryFromContent(article);
  }

  return {
    id: article.id,
    title: article.title,
    link: article.link,
    source: article.source,
    category: category,
    date: article.published,
    timeAgo: formatTimeAgo(article.published),
    excerpt: article.summary || article.content || 'No description available',
    tags: article.tags || [],
    trending: false,
    author: article.author,
    image: article.image_url,
    fetched_at: article.fetched_at,
    isPending: article.ai_category === 'Pending'
  };
};

const extractCategoryFromContent = (article) => {
  const title = (article.title || '').toLowerCase();
  const source = (article.source || '').toLowerCase();
  const summary = (article.summary || '').toLowerCase();
  const content = `${title} ${source} ${summary}`;

  // Enhanced category mapping
  const categoryMap = {
    'Machine Learning': ['machine learning', 'ml', 'neural network', 'deep learning', 'tensorflow', 'pytorch', 'scikit', 'model training', 'algorithm'],
    'AI Research': ['artificial intelligence', 'ai research', 'research paper', 'arxiv', 'academic', 'study', 'experiment'],
    'Generative AI': ['gpt', 'llm', 'large language model', 'chatgpt', 'openai', 'anthropic', 'claude', 'gemini', 'generative', 'transformer'],
    'Data Science': ['data science', 'data analysis', 'analytics', 'statistics', 'pandas', 'numpy', 'jupyter', 'visualization', 'dataset'],
    'MLOps': ['mlops', 'deployment', 'production', 'kubernetes', 'docker', 'devops', 'pipeline', 'monitoring', 'infrastructure'],
    'Tools & Frameworks': ['python', 'framework', 'library', 'tool', 'software', 'development', 'programming', 'code'],
    'Business & Industry': ['business', 'industry', 'company', 'startup', 'investment', 'market', 'enterprise', 'commercial'],
    'Ethics & Society': ['ethics', 'bias', 'fairness', 'society', 'regulation', 'policy', 'governance', 'responsible ai']
  };
  
  // Check each category for matches
  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Fallback based on source
  if (source.includes('hacker news')) return 'Tech News';
  if (source.includes('arxiv')) return 'AI Research';
  if (source.includes('github')) return 'Tools & Frameworks';
  
  return 'General';
};

const extractCategory = (source) => {
  const categoryMap = {
    'machine learning': 'Machine Learning',
    'ml': 'Machine Learning',
    'ai': 'AI Models',
    'artificial intelligence': 'AI Models',
    'python': 'Tools',
    'tensorflow': 'Tools',
    'pytorch': 'Tools',
    'research': 'Research',
    'ethics': 'Ethics',
    'data': 'Data Science'
  };
  
  const sourceLower = source.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (sourceLower.includes(key)) {
      return value;
    }
  }
  
  return 'General';
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    return 'Unknown';
  }
};

export const extractCategories = (articles) => {
  const categories = new Set(['all']);
  articles.forEach(article => {
    if (article.category) {
      categories.add(article.category);
    }
  });
  return Array.from(categories).sort();
};
