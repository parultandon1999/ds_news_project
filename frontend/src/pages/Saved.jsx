import { useState, useEffect } from 'react';
import { Bookmark, Trash2, ExternalLink, Search, Filter } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getSavedArticles, removeSavedArticle, clearAllSavedArticles } from '../services/api';

const Saved = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    loadSavedArticles();
  }, []);

  const loadSavedArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSavedArticles({
        search: searchTerm,
        category: filterCategory
      });
      setSavedArticles(data.articles || []);
    } catch (err) {
      console.error('Error loading saved articles:', err);
      setError('Failed to load saved articles');
      setSavedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromSaved = async (articleId) => {
    try {
      await removeSavedArticle(articleId);
      // Reload the articles after removal
      loadSavedArticles();
    } catch (err) {
      console.error('Error removing article:', err);
      setError('Failed to remove article');
    }
  };

  const clearAllSaved = async () => {
    try {
      await clearAllSavedArticles();
      setSavedArticles([]);
    } catch (err) {
      console.error('Error clearing articles:', err);
      setError('Failed to clear articles');
    }
  };

  // Reload when search term or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSavedArticles();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterCategory]);

  const filteredArticles = savedArticles; // Filtering is now done on the backend

  const categories = ['all', ...new Set(savedArticles.map(a => a.category))];

  return (
    <div className="flex h-screen bg-[#e8e4d9] overflow-hidden relative">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage="saved"
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
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">
            
            {/* Header */}
            <div className="mb-4 panel-outset p-3 border-classic">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#4a5f7f]" />
                  <h1 className="text-xl font-bold text-[#2c2416] uppercase tracking-wide">Saved Articles</h1>
                </div>
                {savedArticles.length > 0 && (
                  <button
                    onClick={clearAllSaved}
                    className="btn-classic px-4 py-2 text-xs flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>
              
              <p className="text-[#6b6558] text-sm">
                {savedArticles.length} saved articles
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-4 panel-outset p-3 border-classic">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search saved articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-classic w-full pl-10 pr-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#6b6558]" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="input-classic px-3 py-2 text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Articles List */}
            {loading ? (
              <div className="text-center py-12 panel-inset p-8 border-classic">
                <div className="animate-spin w-8 h-8 border-2 border-[#4a5f7f] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[#6b6558]">Loading saved articles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 panel-inset p-8 border-classic">
                <p className="text-red-600 mb-2">{error}</p>
                <button 
                  onClick={loadSavedArticles}
                  className="btn-classic px-4 py-2 text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12 panel-inset p-8 border-classic">
                <Bookmark className="w-12 h-12 text-[#6b6558] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#2c2416] mb-2 uppercase tracking-wide">
                  {savedArticles.length === 0 ? 'No Saved Articles' : 'No Articles Found'}
                </h3>
                <p className="text-[#6b6558]">
                  {savedArticles.length === 0 
                    ? 'Save articles from the dashboard to read them later.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map((article) => (
                  <article key={article.id} className="panel-outset p-4 border-classic">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-[#1a4d8f] bg-[#c8d9f0] px-2 py-1 border border-[#8ba5d0] uppercase tracking-wide">
                            {article.category}
                          </span>
                          <span className="text-xs text-[#6b6558]">{article.timeAgo}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-[#2c2416] mb-2 leading-tight">
                          {article.title}
                        </h3>
                        
                        <p className="text-[#4a4234] text-sm mb-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-[#6b6558]">
                          <span className="font-bold uppercase tracking-wide">{article.source}</span>
                          {article.author && <span>by {article.author}</span>}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => window.open(article.link, '_blank')}
                          className="btn-classic p-2"
                          title="Open Article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromSaved(article.id)}
                          className="btn-classic p-2"
                          title="Remove from Saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Saved;