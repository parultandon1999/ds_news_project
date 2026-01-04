const StatsBar = ({ filteredNews, categories, timeFilter }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="panel-inset p-3 sm:p-4 border-classic">
        <div className="text-xs sm:text-sm text-[#6b6558] mb-1 uppercase tracking-wide font-bold">Total Articles</div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2c2416]">{filteredNews.length}</div>
      </div>
      <div className="panel-inset p-3 sm:p-4 border-classic">
        <div className="text-xs sm:text-sm text-[#6b6558] mb-1 uppercase tracking-wide font-bold">Trending</div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2c2416]">
          {filteredNews.filter(n => n.trending).length}
        </div>
      </div>
      <div className="panel-inset p-3 sm:p-4 border-classic">
        <div className="text-xs sm:text-sm text-[#6b6558] mb-1 uppercase tracking-wide font-bold">Categories</div>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2c2416]">{categories.length - 1}</div>
      </div>
      <div className="panel-inset p-3 sm:p-4 border-classic">
        <div className="text-xs sm:text-sm text-[#6b6558] mb-1 uppercase tracking-wide font-bold">Time Period</div>
        <div className="text-sm sm:text-base lg:text-lg font-bold text-[#2c2416]">
          {timeFilter === '7days' ? 'Last 7 Days' : timeFilter === '30days' ? 'Last 30 Days' : 'Today'}
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
