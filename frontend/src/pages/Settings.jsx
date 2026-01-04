import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Database, Bell, Palette, Globe } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { backgroundFetcher } from '../utils/backgroundFetcher';
import { getUserSettings, updateUserSettings } from '../services/api';

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    autoRefresh: true,
    refreshInterval: 300, // seconds
    articlesPerPage: 20,
    defaultTimeFilter: 'today',
    
    // AI Settings
    autoSummarize: true,
    autoCategorize: true,
    summaryLength: 'medium',
    
    // Notification Settings
    enableNotifications: true,
    notificationSound: true,
    emailAlerts: false,
    
    // Display Settings
    compactView: false,
    showImages: true,
    darkMode: false,
    
    // Data Settings
    maxArticles: 1000,
    autoCleanup: true,
    cleanupDays: 30
  });

  const [saved, setSaved] = useState(false);
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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const savedSettings = await getUserSettings();
      setSettings(prev => ({ ...prev, ...savedSettings }));
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
      // Keep default settings if loading fails
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setError(null);
      await updateUserSettings(settings);
      
      // Update background fetcher with new settings
      backgroundFetcher.updateSettings(settings);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      autoRefresh: true,
      refreshInterval: 300,
      articlesPerPage: 20,
      defaultTimeFilter: 'today',
      autoSummarize: true,
      autoCategorize: true,
      summaryLength: 'medium',
      enableNotifications: true,
      notificationSound: true,
      emailAlerts: false,
      compactView: false,
      showImages: true,
      darkMode: false,
      maxArticles: 1000,
      autoCleanup: true,
      cleanupDays: 30
    };
    setSettings(defaultSettings);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen bg-[#e8e4d9] overflow-hidden relative">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage="settings"
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
          <div className="max-w-4xl mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">
            
            {/* Header */}
            <div className="mb-4 panel-outset p-3 border-classic">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-[#4a5f7f]" />
                  <h1 className="text-xl font-bold text-[#2c2416] uppercase tracking-wide">Settings</h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetSettings}
                    className="btn-classic px-4 py-2 text-xs flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset
                  </button>
                  <button
                    onClick={saveSettings}
                    className={`btn-classic-primary px-4 py-2 text-xs flex items-center gap-2 ${saved ? 'bg-[#2d5a2d]' : ''}`}
                  >
                    <Save className="w-3 h-3" />
                    {saved ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>
              
              <p className="text-[#6b6558] text-sm">
                Configure your news aggregator preferences
              </p>
            </div>

            <div className="space-y-4">
              {/* General Settings */}
              <div className="panel-outset p-4 border-classic">
                <h3 className="text-lg font-bold text-[#2c2416] mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  General Settings
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Auto Refresh
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.autoRefresh}
                        onChange={(e) => updateSetting('autoRefresh', e.target.checked)}
                      />
                      <span className="text-sm text-[#4a4234]">Automatically refresh articles</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Refresh Interval (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.refreshInterval}
                      onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                      min="60"
                      max="3600"
                      className="input-classic w-full px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Articles Per Page
                    </label>
                    <select
                      value={settings.articlesPerPage}
                      onChange={(e) => updateSetting('articlesPerPage', parseInt(e.target.value))}
                      className="input-classic w-full px-3 py-2 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Default Time Filter
                    </label>
                    <select
                      value={settings.defaultTimeFilter}
                      onChange={(e) => updateSetting('defaultTimeFilter', e.target.value)}
                      className="input-classic w-full px-3 py-2 text-sm"
                    >
                      <option value="today">Today</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AI Settings */}
              <div className="panel-outset p-4 border-classic">
                <h3 className="text-lg font-bold text-[#2c2416] mb-3 uppercase tracking-wide flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  AI Settings
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Auto Summarize
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.autoSummarize}
                        onChange={(e) => updateSetting('autoSummarize', e.target.checked)}
                      />
                      <span className="text-sm text-[#4a4234]">Automatically summarize new articles</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Auto Categorize
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.autoCategorize}
                        onChange={(e) => updateSetting('autoCategorize', e.target.checked)}
                      />
                      <span className="text-sm text-[#4a4234]">Automatically categorize articles</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Summary Length
                    </label>
                    <select
                      value={settings.summaryLength}
                      onChange={(e) => updateSetting('summaryLength', e.target.value)}
                      className="input-classic w-full px-3 py-2 text-sm"
                    >
                      <option value="short">Short (1-2 sentences)</option>
                      <option value="medium">Medium (2-3 sentences)</option>
                      <option value="long">Long (3-4 sentences)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="panel-outset p-4 border-classic">
                <h3 className="text-lg font-bold text-[#2c2416] mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Enable Notifications
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.enableNotifications}
                        onChange={(e) => updateSetting('enableNotifications', e.target.checked)}
                      />
                      <span className="text-sm text-[#4a4234]">Show browser notifications</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Notification Sound
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.notificationSound}
                        onChange={(e) => updateSetting('notificationSound', e.target.checked)}
                      />
                      <span className="text-sm text-[#4a4234]">Play sound for notifications</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Email Alerts
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.emailAlerts}
                        onChange={(e) => updateSetting('emailAlerts', e.target.checked)}
                      />
                      <span className="text-sm text-[#4a4234]">Send email notifications</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="panel-outset p-4 border-classic">
                <h3 className="text-lg font-bold text-[#2c2416] mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Display
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Compact View
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.compactView}
                        onChange={(e) => updateSetting('compactView', e.target.checked)}
                      />
                      <span className="text-sm text-[#4a4234]">Use compact article layout</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Show Images
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.showImages}
                        onChange={(e) => updateSetting('showImages', e.target.checked)}
                      />
                      <span className="text-sm text-[#4a4234]">Display article images</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="panel-outset p-4 border-classic">
                <h3 className="text-lg font-bold text-[#2c2416] mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Data Management
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Max Articles
                    </label>
                    <input
                      type="number"
                      value={settings.maxArticles}
                      onChange={(e) => updateSetting('maxArticles', parseInt(e.target.value))}
                      min="100"
                      max="10000"
                      className="input-classic w-full px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Auto Cleanup
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.autoCleanup}
                        onChange={(e) => updateSetting('autoCleanup', e.target.checked)}
                      />
                      <span className="text-sm text-[#4a4234]">Automatically delete old articles</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Cleanup After (days)
                    </label>
                    <input
                      type="number"
                      value={settings.cleanupDays}
                      onChange={(e) => updateSetting('cleanupDays', parseInt(e.target.value))}
                      min="1"
                      max="365"
                      className="input-classic w-full px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;