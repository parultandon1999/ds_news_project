import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Saved from './pages/Saved';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import DataMigrationModal from './components/DataMigrationModal';
import { dataMigration } from './utils/dataMigration';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      switch (path) {
        case '/':
          setCurrentPage('dashboard');
          break;
        case '/analytics':
          setCurrentPage('analytics');
          break;
        case '/saved':
          setCurrentPage('saved');
          break;
        case '/alerts':
          setCurrentPage('alerts');
          break;
        case '/settings':
          setCurrentPage('settings');
          break;
        default:
          setCurrentPage('dashboard');
      }
    };

    // Set initial page based on URL
    handlePopState();

    // Listen for navigation changes
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    // Check if migration is needed on app start
    const checkMigration = () => {
      if (dataMigration.needsMigration()) {
        setShowMigrationModal(true);
      }
    };

    // Delay the check slightly to ensure the app is fully loaded
    const timer = setTimeout(checkMigration, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMigrationComplete = (results) => {
    console.log('Migration completed:', results);
    setShowMigrationModal(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'analytics':
        return <Analytics />;
      case 'saved':
        return <Saved />;
      case 'alerts':
        return <Alerts />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {renderPage()}
      <DataMigrationModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        onComplete={handleMigrationComplete}
      />
    </>
  );
};

export default App;
