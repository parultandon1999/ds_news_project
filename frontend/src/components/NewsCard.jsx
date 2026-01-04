import { TrendingUp, BookmarkPlus, ExternalLink, Clock } from 'lucide-react';
import { saveArticle } from '../services/api';

const NewsCard = ({ news, onArticleClick }) => {
  const handleSaveArticle = async (e) => {
    e.stopPropagation();
    
    try {
      await saveArticle(news);
      console.log('Article saved successfully!');
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to save article:', error);
      // You could show an error message here
    }
  };

  const handleOpenLink = (e) => {
    e.stopPropagation();
    if (news.link) {
      window.open(news.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article 
      onClick={() => onArticleClick && onArticleClick(news)}
      className={`panel-outset p-3 sm:p-4 lg:p-5 border-classic hover:shadow-lg transition-shadow cursor-pointer ${news.isPending ? 'opacity-75' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        {news.image && (
          <div className="w-full sm:w-32 h-32 flex-shrink-0">
            <img 
              src={news.image} 
              alt={news.title}
              className="w-full h-full object-cover border-2 border-[#8b8577]"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2 sm:mb-3">
            {news.trending && (
              <span className="flex items-center text-xs font-bold text-[#8b4513] bg-[#ffd7a8] px-2 py-1 border border-[#d4a574] uppercase tracking-wide">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </span>
            )}
            <span className={`text-xs font-bold px-2 py-1 border uppercase tracking-wide ${
              news.isPending 
                ? 'text-[#8b6914] bg-[#fff3cd] border-[#d4a574] animate-pulse' 
                : 'text-[#1a4d8f] bg-[#c8d9f0] border-[#8ba5d0]'
            }`}>
              {news.category}
            </span>
          </div>
          
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#2c2416] mb-2 link-classic leading-tight hover:text-[#0d2d5f]">
            {news.title}
          </h2>
          
          <p className="text-[#4a4234] text-sm sm:text-base mb-3 leading-relaxed">{news.excerpt}</p>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center flex-wrap gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-[#6b6558]">
              <span className="font-bold uppercase tracking-wide">{news.source}</span>
              {news.author && (
                <span className="italic">by {news.author}</span>
              )}
              <span className="flex items-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {news.timeAgo}
              </span>
            </div>
            
            {news.tags && news.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                {news.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-[#4a4234] bg-[#e8e4d9] px-2 py-1 border border-[#c9c4b5] uppercase tracking-wide font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex sm:flex-col gap-2 flex-shrink-0 self-start">
          <button 
            onClick={handleSaveArticle}
            className="btn-classic p-2" 
            title="Save Article"
          >
            <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={handleOpenLink}
            className="btn-classic p-2" 
            title="Open Link"
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
