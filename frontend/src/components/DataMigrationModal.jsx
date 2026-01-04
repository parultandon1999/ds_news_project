import { useState, useEffect, useRef } from 'react';
import { Database, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { dataMigration } from '../utils/dataMigration';

const DataMigrationModal = ({ isOpen, onClose, onComplete }) => {
  const [migrationState, setMigrationState] = useState('idle'); // idle, running, completed, error, cancelled
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const migrationRef = useRef(null);

  useEffect(() => {
    if (isOpen && migrationState === 'idle') {
      // Check if migration is needed
      if (!dataMigration.needsMigration()) {
        setMigrationState('completed');
        setResults({
          success: true,
          summary: { savedArticles: 0, userSettings: 0, newsAlerts: 0 }
        });
      }
    }
  }, [isOpen, migrationState]);

  // Cleanup effect to cancel migration if component unmounts
  useEffect(() => {
    return () => {
      if (migrationState === 'running') {
        dataMigration.cancelMigration();
      }
    };
  }, [migrationState]);

  const runMigration = async () => {
    setMigrationState('running');
    setError(null);

    try {
      migrationRef.current = dataMigration.migrateAll();
      const migrationResults = await migrationRef.current;
      
      setResults(migrationResults);
      
      if (migrationResults.success) {
        setMigrationState('completed');
        if (onComplete) {
          onComplete(migrationResults);
        }
      } else {
        setMigrationState('error');
        setError('Some data could not be migrated. Check console for details.');
      }
    } catch (err) {
      console.error('Migration failed:', err);
      if (err.message === 'Migration was cancelled') {
        setMigrationState('cancelled');
        setError('Migration was cancelled by user.');
      } else {
        setMigrationState('error');
        setError(err.message || 'Migration failed unexpectedly');
      }
    } finally {
      migrationRef.current = null;
    }
  };

  const cancelMigration = () => {
    if (migrationState === 'running') {
      dataMigration.cancelMigration();
    }
  };

  const handleClose = () => {
    if (migrationState === 'running') {
      // Cancel migration if it's running
      dataMigration.cancelMigration();
      setMigrationState('cancelled');
      setError('Migration was cancelled.');
    } else if (migrationState !== 'running') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#e8e4d9] border-2 border-[#8b8577] max-w-md w-full panel-outset">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#4a5f7f]" />
              <h2 className="text-lg font-bold text-[#2c2416] uppercase tracking-wide">
                Data Migration
              </h2>
            </div>
            {migrationState !== 'running' && (
              <button
                onClick={handleClose}
                className="btn-classic p-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Content */}
          {migrationState === 'idle' && (
            <div>
              <p className="text-[#4a4234] mb-4">
                We've detected data stored in your browser that can be migrated to local JSON files 
                for better performance and reliability.
              </p>
              <p className="text-[#4a4234] mb-6 text-sm">
                This will move your saved articles, settings, and alerts from browser storage 
                to local files on your computer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={runMigration}
                  className="btn-classic px-4 py-2 flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Start Migration
                </button>
                <button
                  onClick={handleClose}
                  className="btn-classic px-4 py-2"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}

          {migrationState === 'running' && (
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#4a5f7f] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#4a4234] mb-2">Migrating your data...</p>
              <p className="text-[#6b6558] text-sm mb-4">Please wait while we transfer your data to local files.</p>
              <button
                onClick={cancelMigration}
                className="btn-classic px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800"
              >
                Cancel Migration
              </button>
            </div>
          )}

          {migrationState === 'completed' && results && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-[#2c2416] font-bold">Migration Completed!</span>
              </div>
              
              <div className="bg-[#f8f6f0] border border-[#c9c4b5] p-3 mb-4 text-sm">
                <h4 className="font-bold text-[#2c2416] mb-2">Migration Summary:</h4>
                <ul className="space-y-1 text-[#4a4234]">
                  <li>• Saved Articles: {results.summary.savedArticles} migrated</li>
                  <li>• User Settings: {results.summary.userSettings ? 'Migrated' : 'None found'}</li>
                  <li>• News Alerts: {results.summary.newsAlerts} migrated</li>
                </ul>
              </div>

              <p className="text-[#4a4234] text-sm mb-4">
                Your data has been successfully moved to local JSON files. 
                The old browser storage has been cleared.
              </p>

              <button
                onClick={handleClose}
                className="btn-classic px-4 py-2 w-full"
              >
                Continue
              </button>
            </div>
          )}

          {(migrationState === 'error' || migrationState === 'cancelled') && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-[#2c2416] font-bold">
                  {migrationState === 'cancelled' ? 'Migration Cancelled' : 'Migration Error'}
                </span>
              </div>
              
              <p className="text-[#4a4234] mb-4">
                {error || 'An error occurred during migration.'}
              </p>

              <div className="flex gap-3">
                {migrationState === 'error' && (
                  <button
                    onClick={runMigration}
                    className="btn-classic px-4 py-2 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                )}
                {migrationState === 'cancelled' && (
                  <button
                    onClick={runMigration}
                    className="btn-classic px-4 py-2 flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Start Migration
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="btn-classic px-4 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataMigrationModal;