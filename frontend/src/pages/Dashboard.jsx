import { useState, useEffect } from 'react';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsBar from '../components/StatsBar';
import FetchControls from '../components/FetchControls';
import CategoryFilter from '../components/CategoryFilter';
import NewsFeed from '../components/NewsFeed';
import ArticleModal from '../components/ArticleModal';

import { fetchArticles, triggerFetch, categorizeArticles, categorizeArticlesFallback, checkFetchStatus, cancelFetch } from '../services/api';
import { mapArticleToFrontend, extractCategories } from '../utils/dataMapper';
import { filterByTime } from '../utils/dateFilters';
import { notificationManager } from '../utils/notifications';
import { backgroundFetcher } from '../utils/backgroundFetcher';

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchAbortController, setFetchAbortController] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadExistingArticles();
    checkInitialFetchStatus(); // Check if fetch is already running
    initializeNotifications();
    startBackgroundFetcher();
    
    // Listen for new articles from background fetcher
    const handleNewArticles = (event) => {
      console.log('New articles detected:', event.detail);
      loadExistingArticles(); // Refresh the article list
    };
    
    window.addEventListener('newArticlesAvailable', handleNewArticles);
    
    return () => {
      window.removeEventListener('newArticlesAvailable', handleNewArticles);
      backgroundFetcher.stop();
      
      // Cancel any ongoing fetch when component unmounts
      if (fetchAbortController) {
        fetchAbortController.abort();
      }
    };
  }, [fetchAbortController]);

  const initializeNotifications = async () => {
    if (notificationManager.isSupported()) {
      const granted = await notificationManager.requestPermission();
      if (granted) {
        console.log('Notifications enabled');
      } else {
        console.log('Notifications permission denied');
      }
    }
  };

  const startBackgroundFetcher = () => {
    // Load settings and start background fetcher
    const settings = JSON.parse(localStorage.getItem('newsSettings') || '{}');
    backgroundFetcher.updateSettings(settings);
    
    if (settings.autoRefresh !== false) {
      backgroundFetcher.start();
    }
  };

  const checkInitialFetchStatus = async () => {
    try {
      const status = await checkFetchStatus();
      if (status.running) {
        console.log('🔄 Fetch already in progress, resuming polling...');
        setLoading(true);
        resumePolling();
      }
    } catch (err) {
      console.log('No ongoing fetch found');
    }
  };

  const resumePolling = () => {
    const checkStatus = async () => {
      const status = await checkFetchStatus();
      
      if (!status.running && status.last_result) {
        console.log('✅ Fetch completed! Starting categorization...');
        await handleCategorize();
        console.log('✅ Auto-summarizing recent articles...');
        await handleAutoSummarize();
        console.log('✅ Loading articles...');
        await loadExistingArticles();
        setLoading(false);
      } else if (status.running) {
        console.log('⏳ Still fetching... checking again in 2s');
        setTimeout(checkStatus, 2000);
      } else {
        setLoading(false);
      }
    };
    
    setTimeout(checkStatus, 1000);
  };

  const loadExistingArticles = async () => {
    try {
      const data = await fetchArticles();
      
      if (data.articles && data.articles.length > 0) {
        const mappedArticles = data.articles.map(mapArticleToFrontend);
        setArticles(mappedArticles);
        setCategories(extractCategories(mappedArticles));
      }
    } catch (err) {
      console.log('No existing articles found');
    }
  };

  const handleFetchNews = async (period) => {
    try {
      setLoading(true);
      setError(null);
      setTimeFilter(period);
      
      // Create AbortController for this fetch operation
      const abortController = new AbortController();
      setFetchAbortController(abortController);
      
      // Convert period to days
      const daysMap = {
        'today': 1,
        '7days': 7,
        '30days': 30
      };
      const days = daysMap[period] || 1;
      
      console.log(`Triggering fetch for ${days} day(s)...`);
      const fetchResult = await triggerFetch(110, days, abortController.signal);
      console.log('Fetch result:', fetchResult);
      
      if (fetchResult.success) {
        console.log('Fetch started, waiting for completion...');
        
        const checkStatus = async () => {
          // Check if operation was cancelled
          if (abortController.signal.aborted) {
            console.log('Fetch operation was cancelled');
            return;
          }
          
          const status = await checkFetchStatus();
          
          if (!status.running && status.last_result) {
            console.log('✅ Fetch completed! Starting quick categorization...');
            const categorizeResult = await handleCategorize();
            
            console.log('✅ Auto-summarizing recent articles...');
            await handleAutoSummarize();
            console.log('✅ Loading articles...');
            await loadExistingArticles();
            setLoading(false);
            setFetchAbortController(null);
          } else if (status.running) {
            console.log('⏳ Still fetching... checking again in 2s');
            setTimeout(checkStatus, 2000);
          } else {
            setLoading(false);
            setFetchAbortController(null);
          }
        };
        
        setTimeout(checkStatus, 2000);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch was cancelled');
        setError('Fetch cancelled by user');
      } else {
        setError('Failed to fetch news. Please try again.');
      }
      setLoading(false);
      setFetchAbortController(null);
    }
  };

  const handleAutoSummarize = async () => {
    try {
      console.log('🤖 Auto-summarizing recent articles...');
      const response = await fetch('http://127.0.0.1:5001/api/auto-summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Auto-summarization complete:', result);
      }
    } catch (err) {
      console.error('❌ Auto-summarization error:', err);
    }
  };

  const handleCancelFetch = async () => {
    try {
      console.log('🛑 Cancelling fetch...');
      
      // Cancel the frontend request if it exists
      if (fetchAbortController) {
        fetchAbortController.abort();
        setFetchAbortController(null);
      }
      
      // Cancel the backend operation
      const result = await cancelFetch();
      console.log('✅ Fetch cancelled:', result);
      
      setLoading(false);
      setError('Fetch cancelled by user');
    } catch (err) {
      console.error('❌ Cancel error:', err);
      // Even if the backend cancel fails, we should stop the frontend loading state
      if (fetchAbortController) {
        fetchAbortController.abort();
        setFetchAbortController(null);
      }
      setLoading(false);
      setError('Fetch cancelled');
    }
  };

  const handleCategorize = async () => {
    try {
      setCategorizing(true);
      console.log('🤖 Calling categorize API...');
      const result = await categorizeArticles();
      console.log('🤖 Categorization API response:', result);
      
      if (result.success) {
        console.log('✅ Articles categorized successfully!');
        console.log('Categories:', result.categories);
        if (result.pending_articles) {
          console.log(`📋 ${result.pending_articles} articles marked for background processing`);
        }
        // Reload articles to get updated categories
        await loadExistingArticles();
        return result;
      } else {
        console.error('❌ Categorization failed:', result);
        // Try fallback categorization
        console.log('🔄 Trying fallback categorization...');
        const fallbackResult = await categorizeArticlesFallback();
        if (fallbackResult.success) {
          console.log('✅ Fallback categorization successful!');
          await loadExistingArticles();
          return fallbackResult;
        }
        return null;
      }
    } catch (err) {
      console.error('❌ Categorization error:', err);
      // Try fallback categorization
      try {
        console.log('🔄 Trying fallback categorization...');
        const fallbackResult = await categorizeArticlesFallback();
        if (fallbackResult.success) {
          console.log('✅ Fallback categorization successful!');
          await loadExistingArticles();
          return fallbackResult;
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback categorization also failed:', fallbackErr);
      }
      return null;
    } finally {
      setCategorizing(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
  };

  const filteredNews = articles
    .filter(news => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          news.title.toLowerCase().includes(searchLower) ||
          news.excerpt.toLowerCase().includes(searchLower) ||
          news.source.toLowerCase().includes(searchLower) ||
          (news.author && news.author.toLowerCase().includes(searchLower)) ||
          (news.tags && news.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }
      return true;
    })
    .filter(news => filterByTime(news, timeFilter))
    .filter(item => activeFilter === 'all' || item.category === activeFilter);

  return (
    <div className="flex h-screen bg-[#e8e4d9] overflow-hidden relative">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div 
        className="flex-1 flex flex-col min-w-0 relative z-10"
        onClick={() => {
          if (sidebarOpen && window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
      >
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onSearch={handleSearch}
          searchTerm={searchTerm}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">
            {error && (
              <div className="mb-4 p-4 bg-[#f8d7da] border-2 border-[#8b2e2e] text-[#8b2e2e] font-bold">
                {error}
              </div>
            )}

            {/* Search Results Info */}
            {searchTerm && (
              <div className="mb-3 panel-inset p-3 border-classic">
                <p className="text-sm text-[#4a4234]">
                  <span className="font-bold">Search results for:</span> "{searchTerm}" 
                  <span className="ml-2 text-[#6b6558]">({filteredNews.length} articles found)</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-3 text-xs btn-classic px-2 py-1"
                  >
                    Clear Search
                  </button>
                </p>
              </div>
            )}

            <StatsBar 
              filteredNews={filteredNews}
              categories={categories}
              timeFilter={timeFilter}
            />

            <FetchControls 
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              handleFetchNews={handleFetchNews}
              handleCancelFetch={handleCancelFetch}
              handleCategorize={handleCategorize}
              loading={loading}
              categorizing={categorizing}
            />

            <CategoryFilter 
              categories={categories}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />

            <NewsFeed 
              filteredNews={filteredNews}
              loading={loading}
              onArticleClick={handleArticleClick}
            />
          </div>
        </main>
      </div>

      {selectedArticle && (
        <ArticleModal 
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
