import { TrendingUp, Home, Bookmark, BarChart, Bell, Settings } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activePage = 'dashboard' }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', href: '/' },
    { id: 'saved', icon: Bookmark, label: 'Saved', href: '/saved' },
    { id: 'analytics', icon: BarChart, label: 'Analytics', href: '/analytics' },
    { id: 'alerts', icon: Bell, label: 'Alerts', href: '/alerts' },
    { id: 'settings', icon: Settings, label: 'Settings', href: '/settings' }
  ];

  const handleNavigation = (href) => {
    // Simple client-side routing
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <aside className={`fixed md:relative left-0 top-0 h-full transition-transform duration-300 ${sidebarOpen ? 'translate-x-0 z-[9999]' : '-translate-x-full'} md:translate-x-0 md:z-auto ${sidebarOpen ? 'md:w-48 md:sm:w-56 md:lg:w-64' : 'md:w-0'} panel-outset border-r-4 border-[#8b8577] overflow-hidden`}>
      <div className="w-48 sm:w-56 lg:w-64 h-full overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center px-3 sm:px-4 lg:px-6 py-3 border-b-2 border-[#8b8577]">
          <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-[#4a5f7f] mr-2 flex-shrink-0" />
          <span className="font-bold text-sm lg:text-base text-[#2c2416] uppercase tracking-wide">News Feed</span>
        </div>
        
        {/* Navigation */}
        <nav className="px-2 sm:px-3 lg:px-4 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide ${
                  isActive
                    ? 'text-[#f5f2ea] bg-[#4a5f7f] border-2 border-[#2a3f5f]'
                    : 'text-[#2c2416] btn-classic'
                }`}
              >
                <Icon className="w-4 h-4 lg:w-5 lg:h-5 mr-2 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
