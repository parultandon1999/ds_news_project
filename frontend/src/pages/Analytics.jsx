import { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Calendar, Users, Globe, Clock } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { fetchArticles, getStats } from '../services/api';

const Analytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

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
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsData, articlesData] = await Promise.all([
        getStats(),
        fetchArticles()
      ]);
      
      setStats(statsData);
      setArticles(articlesData.articles || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryStats = () => {
    const categoryCount = {};
    articles.forEach(article => {
      const category = article.ai_category || 'General';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);
  };

  const calculateTimeStats = () => {
    const now = new Date();
    const timeRanges = {
      'Last 24h': 0,
      'Last 7d': 0,
      'Last 30d': 0,
      'Older': 0
    };

    articles.forEach(article => {
      try {
        const articleDate = new Date(article.published);
        const diffHours = (now - articleDate) / (1000 * 60 * 60);
        
        if (diffHours <= 24) timeRanges['Last 24h']++;
        else if (diffHours <= 168) timeRanges['Last 7d']++;
        else if (diffHours <= 720) timeRanges['Last 30d']++;
        else timeRanges['Older']++;
      } catch (e) {
        timeRanges['Older']++;
      }
    });

    return Object.entries(timeRanges);
  };

  const getTopSources = () => {
    const sourceCount = {};
    articles.forEach(article => {
      const source = article.source || 'Unknown';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    return Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#e8e4d9] overflow-hidden relative">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="analytics" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#4a5f7f] border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-[#6b6558] font-bold uppercase tracking-wide">Loading Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const categoryStats = calculateCategoryStats();
  const timeStats = calculateTimeStats();
  const topSources = getTopSources();

  return (
    <div className="flex h-screen bg-[#e8e4d9] overflow-hidden relative">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage="analytics"
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
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="w-5 h-5 text-[#4a5f7f]" />
                <h1 className="text-xl font-bold text-[#2c2416] uppercase tracking-wide">Analytics Dashboard</h1>
              </div>
              <p className="text-[#6b6558] text-sm">
                Insights and statistics about your news data
              </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
              <div className="panel-inset p-3 border-classic">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[#4a5f7f]" />
                  <span className="text-xs font-bold text-[#6b6558] uppercase tracking-wide">Total Articles</span>
                </div>
                <div className="text-2xl font-bold text-[#2c2416]">{articles.length}</div>
              </div>
              
              <div className="panel-inset p-3 border-classic">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-[#4a5f7f]" />
                  <span className="text-xs font-bold text-[#6b6558] uppercase tracking-wide">Sources</span>
                </div>
                <div className="text-2xl font-bold text-[#2c2416]">{topSources.length}</div>
              </div>
              
              <div className="panel-inset p-3 border-classic">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#4a5f7f]" />
                  <span className="text-xs font-bold text-[#6b6558] uppercase tracking-wide">Categories</span>
                </div>
                <div className="text-2xl font-bold text-[#2c2416]">{categoryStats.length}</div>
              </div>
              
              <div className="panel-inset p-3 border-classic">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#4a5f7f]" />
                  <span className="text-xs font-bold text-[#6b6558] uppercase tracking-wide">Last 24h</span>
                </div>
                <div className="text-2xl font-bold text-[#2c2416]">{timeStats.find(([key]) => key === 'Last 24h')?.[1] || 0}</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              {/* Category Distribution */}
              <div className="panel-outset p-4 border-classic">
                <h3 className="text-lg font-bold text-[#2c2416] mb-3 uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Category Distribution
                </h3>
                <div className="space-y-3">
                  {categoryStats.map(([category, count]) => {
                    const percentage = ((count / articles.length) * 100).toFixed(1);
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-[#2c2416]">{category}</span>
                            <span className="text-xs text-[#6b6558]">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-[#d4cfc0] border border-[#8b8577] h-2">
                            <div 
                              className="h-full bg-[#4a5f7f]" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Distribution */}
              <div className="panel-outset p-4 border-classic">
                <h3 className="text-lg font-bold text-[#2c2416] mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Time Distribution
                </h3>
                <div className="space-y-3">
                  {timeStats.map(([timeRange, count]) => {
                    const percentage = articles.length > 0 ? ((count / articles.length) * 100).toFixed(1) : 0;
                    return (
                      <div key={timeRange} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-[#2c2416]">{timeRange}</span>
                            <span className="text-xs text-[#6b6558]">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-[#d4cfc0] border border-[#8b8577] h-2">
                            <div 
                              className="h-full bg-[#8b4513]" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Sources */}
            <div className="panel-outset p-4 border-classic">
              <h3 className="text-lg font-bold text-[#2c2416] mb-3 uppercase tracking-wide flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Top Sources
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topSources.map(([source, count]) => (
                  <div key={source} className="panel-inset p-3 border-classic">
                    <div className="text-sm font-bold text-[#2c2416] mb-1 truncate" title={source}>
                      {source}
                    </div>
                    <div className="text-xs text-[#6b6558]">{count} articles</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;