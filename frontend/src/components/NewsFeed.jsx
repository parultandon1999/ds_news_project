import { useState } from 'react';
import NewsCard from './NewsCard';

const NewsFeed = ({ filteredNews, loading, onArticleClick }) => {
  const [displayCount, setDisplayCount] = useState(20);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#4a5f7f] border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b6558] text-sm sm:text-base font-bold uppercase tracking-wide">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (filteredNews.length === 0) {
    return (
      <div className="text-center py-12 sm:py-20 panel-inset p-6 sm:p-8 border-classic">
        <p className="text-[#6b6558] text-sm sm:text-base font-bold uppercase tracking-wide">No articles found for the selected filters.</p>
      </div>
    );
  }

  const displayedNews = filteredNews.slice(0, displayCount);
  const hasMore = filteredNews.length > displayCount;

  return (
    <>
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        {displayedNews.map((news) => (
          <NewsCard key={news.id} news={news} onArticleClick={onArticleClick} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center pb-4 sm:pb-6">
          <button 
            onClick={() => setDisplayCount(prev => prev + 20)}
            className="btn-classic px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
          >
            Load More Articles ({filteredNews.length - displayCount} remaining)
          </button>
        </div>
      )}
    </>
  );
};

export default NewsFeed;
