import { useState, useEffect } from 'react';
import { Bell, Menu, Search, X } from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen, onSearch, searchTerm = '' }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    // Listen for new articles notifications
    const handleNewArticles = () => {
      setHasNewNotifications(true);
      // Auto-hide notification indicator after 10 seconds
      setTimeout(() => setHasNewNotifications(false), 10000);
    };

    window.addEventListener('newArticlesAvailable', handleNewArticles);
    
    return () => {
      window.removeEventListener('newArticlesAvailable', handleNewArticles);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleNotificationClick = () => {
    setHasNewNotifications(false);
    // You could open a notifications panel here
  };

  return (
    <header className="panel-outset flex items-center justify-between px-3 sm:px-6 py-2 flex-shrink-0 border-b-4 border-[#8b8577]">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <button 
          className="btn-classic p-2 flex-shrink-0 md:hidden" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative flex-1 max-w-xs sm:max-w-md lg:max-w-lg">
          <input
            type="text"
            placeholder="Search articles..."
            value={localSearchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`input-classic w-full pl-10 pr-10 py-1 text-sm transition-all ${
              isSearchFocused ? 'border-[#4a5f7f]' : ''
            }`}
          />
          {localSearchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b6558] hover:text-[#2c2416]"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2">
        <button 
          onClick={handleNotificationClick}
          className="btn-classic p-2 relative flex-shrink-0" 
          title="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {hasNewNotifications && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#8b2e2e] border border-[#f5f2ea] animate-pulse"></span>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;
