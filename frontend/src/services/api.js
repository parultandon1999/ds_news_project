const API_BASE_URL = 'http://127.0.0.1:5001/api';

export const fetchArticles = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.limit) params.append('limit', filters.limit);
    
    const url = `${API_BASE_URL}/articles${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

export const triggerFetch = async (maxSources = null, days = 1, signal = null) => {
  try {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        max_sources: maxSources,
        days: days 
      }),
    };
    
    if (signal) {
      fetchOptions.signal = signal;
    }
    
    const response = await fetch(`${API_BASE_URL}/fetch`, fetchOptions);
    
    if (!response.ok) {
      throw new Error('Failed to trigger fetch');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error triggering fetch:', error);
    throw error;
  }
};

export const cancelFetch = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/fetch/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel fetch');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error canceling fetch:', error);
    throw error;
  }
};

export const checkFetchStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/fetch/status`);
    
    if (!response.ok) {
      throw new Error('Failed to check fetch status');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking fetch status:', error);
    throw error;
  }
};

export const getStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const categorizeArticles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to categorize articles');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error categorizing articles:', error);
    throw error;
  }
};

export const categorizeArticlesFallback = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categorize/fallback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to categorize articles with fallback');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error categorizing articles with fallback:', error);
    throw error;
  }
};

export const summarizeArticle = async (articleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article_id: articleId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to summarize article');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error summarizing article:', error);
    throw error;
  }
};

export const getArticleCount = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/count`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch article count');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching article count:', error);
    throw error;
  }
};

// Saved Articles API
export const getSavedArticles = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    
    const url = `${API_BASE_URL}/saved-articles${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch saved articles');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    throw error;
  }
};

export const saveArticle = async (article, signal = null) => {
  try {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(article),
    };
    
    if (signal) {
      fetchOptions.signal = signal;
    }
    
    const response = await fetch(`${API_BASE_URL}/saved-articles`, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save article');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  }
};

export const removeSavedArticle = async (articleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/saved-articles/${articleId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove saved article');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing saved article:', error);
    throw error;
  }
};

export const clearAllSavedArticles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/saved-articles`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear saved articles');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error clearing saved articles:', error);
    throw error;
  }
};

// User Settings API
export const getUserSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user settings');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (settings, signal = null) => {
  try {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    };
    
    if (signal) {
      fetchOptions.signal = signal;
    }
    
    const response = await fetch(`${API_BASE_URL}/settings`, fetchOptions);
    
    if (!response.ok) {
      throw new Error('Failed to update user settings');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// News Alerts API
export const getNewsAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch news alerts');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news alerts:', error);
    throw error;
  }
};

export const createNewsAlert = async (alert, signal = null) => {
  try {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    };
    
    if (signal) {
      fetchOptions.signal = signal;
    }
    
    const response = await fetch(`${API_BASE_URL}/alerts`, fetchOptions);
    
    if (!response.ok) {
      throw new Error('Failed to create news alert');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating news alert:', error);
    throw error;
  }
};

export const updateNewsAlert = async (alertId, alert) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update news alert');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating news alert:', error);
    throw error;
  }
};

export const deleteNewsAlert = async (alertId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete news alert');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting news alert:', error);
    throw error;
  }
};

export const toggleNewsAlert = async (alertId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/toggle`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle news alert');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling news alert:', error);
    throw error;
  }
};