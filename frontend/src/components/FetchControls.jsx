import { Clock, Tag } from 'lucide-react';

const FetchControls = ({ timeFilter, setTimeFilter, handleFetchNews, handleCancelFetch, handleCategorize, loading, categorizing }) => {
  return (
    <div className="mb-3 sm:mb-4 panel-outset p-2 sm:p-3 border-classic relative z-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
            {loading ? 'Fetch in Progress...' : 'Fetch News Articles'}
          </h3>
          <p className="text-xs text-[#6b6558]">
            {loading ? 'Fetching, categorizing and summarizing articles...' : 'Select a time period and fetch the latest articles'}
          </p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            disabled={loading}
            className="input-classic px-3 py-2 text-xs sm:text-sm font-bold uppercase relative z-0 disabled:opacity-50"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          
          {loading ? (
            <button
              onClick={handleCancelFetch}
              className="btn-classic px-4 sm:px-6 py-2 text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap bg-[#8b2e2e] text-white border-[#6b1e1e]"
            >
              <span>Cancel Fetch</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => handleFetchNews(timeFilter)}
                className="btn-classic-primary px-4 sm:px-6 py-2 text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Fetch News</span>
              </button>
              
              <button
                onClick={handleCategorize}
                disabled={categorizing}
                className="btn-classic px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                title="Categorize existing articles"
              >
                <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{categorizing ? 'Categorizing...' : 'Categorize'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FetchControls;
