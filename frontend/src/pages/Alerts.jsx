import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit, Search, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  getNewsAlerts, 
  createNewsAlert, 
  updateNewsAlert, 
  deleteNewsAlert, 
  toggleNewsAlert 
} from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAlert, setNewAlert] = useState({
    name: '',
    keywords: '',
    categories: [],
    sources: '',
    enabled: true
  });

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
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNewsAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError('Failed to load alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const saveAlert = async () => {
    if (!newAlert.name.trim()) return;

    try {
      setError(null);
      
      const alertData = {
        ...newAlert,
        keywords: newAlert.keywords.split(',').map(k => k.trim()).filter(k => k),
        sources: newAlert.sources.split(',').map(s => s.trim()).filter(s => s),
      };

      if (editingAlert) {
        await updateNewsAlert(editingAlert.id, alertData);
      } else {
        await createNewsAlert(alertData);
      }

      // Reload alerts
      await loadAlerts();
      
      setNewAlert({ name: '', keywords: '', categories: [], sources: '', enabled: true });
      setShowCreateForm(false);
      setEditingAlert(null);
    } catch (err) {
      console.error('Error saving alert:', err);
      setError('Failed to save alert');
    }
  };

  const deleteAlert = async (id) => {
    try {
      setError(null);
      await deleteNewsAlert(id);
      await loadAlerts();
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('Failed to delete alert');
    }
  };

  const toggleAlert = async (id) => {
    try {
      setError(null);
      await toggleNewsAlert(id);
      await loadAlerts();
    } catch (err) {
      console.error('Error toggling alert:', err);
      setError('Failed to toggle alert');
    }
  };

  const startEdit = (alert) => {
    setEditingAlert(alert);
    setNewAlert({
      name: alert.name,
      keywords: alert.keywords.join(', '),
      categories: alert.categories,
      sources: alert.sources.join(', '),
      enabled: alert.enabled
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingAlert(null);
    setNewAlert({ name: '', keywords: '', categories: [], sources: '', enabled: true });
    setShowCreateForm(false);
  };

  const availableCategories = [
    'Machine Learning', 'AI Research', 'Data Science', 'MLOps', 
    'Generative AI', 'Computer Vision', 'NLP', 'Robotics'
  ];

  return (
    <div className="flex h-screen bg-[#e8e4d9] overflow-hidden relative">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage="alerts"
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#4a5f7f]" />
                  <h1 className="text-xl font-bold text-[#2c2416] uppercase tracking-wide">News Alerts</h1>
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-classic-primary px-4 py-2 text-xs flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Create Alert
                </button>
              </div>
              
              <p className="text-[#6b6558] text-sm">
                Get notified when articles match your criteria ({alerts.length} alerts configured)
              </p>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
              <div className="mb-4 panel-outset p-4 border-classic">
                <h3 className="text-lg font-bold text-[#2c2416] mb-3 uppercase tracking-wide">
                  {editingAlert ? 'Edit Alert' : 'Create New Alert'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Alert Name
                    </label>
                    <input
                      type="text"
                      value={newAlert.name}
                      onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                      placeholder="e.g., Machine Learning Breakthroughs"
                      className="input-classic w-full px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newAlert.keywords}
                      onChange={(e) => setNewAlert({...newAlert, keywords: e.target.value})}
                      placeholder="e.g., neural network, deep learning, transformer"
                      className="input-classic w-full px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map(category => (
                        <label key={category} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={newAlert.categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAlert({
                                  ...newAlert, 
                                  categories: [...newAlert.categories, category]
                                });
                              } else {
                                setNewAlert({
                                  ...newAlert,
                                  categories: newAlert.categories.filter(c => c !== category)
                                });
                              }
                            }}
                            className="mr-1"
                          />
                          <span className="text-xs text-[#2c2416]">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2c2416] mb-1 uppercase tracking-wide">
                      Sources (comma-separated, optional)
                    </label>
                    <input
                      type="text"
                      value={newAlert.sources}
                      onChange={(e) => setNewAlert({...newAlert, sources: e.target.value})}
                      placeholder="e.g., TechCrunch, MIT News, OpenAI"
                      className="input-classic w-full px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newAlert.enabled}
                        onChange={(e) => setNewAlert({...newAlert, enabled: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-[#2c2416] uppercase tracking-wide">
                        Enable Alert
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveAlert}
                      className="btn-classic-primary px-4 py-2 text-sm"
                    >
                      {editingAlert ? 'Update Alert' : 'Create Alert'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn-classic px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts List */}
            {alerts.length === 0 ? (
              <div className="text-center py-12 panel-inset p-8 border-classic">
                <Bell className="w-12 h-12 text-[#6b6558] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#2c2416] mb-2 uppercase tracking-wide">
                  No Alerts Configured
                </h3>
                <p className="text-[#6b6558] mb-4">
                  Create your first alert to get notified about relevant news.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-classic-primary px-6 py-3"
                >
                  Create Your First Alert
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="panel-outset p-4 border-classic">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-[#2c2416]">{alert.name}</h3>
                          <span className={`text-xs px-2 py-1 border uppercase tracking-wide font-bold ${
                            alert.enabled 
                              ? 'text-[#2d5a2d] bg-[#d4edda] border-[#5a9a5a]'
                              : 'text-[#6b6558] bg-[#e8e4d9] border-[#8b8577]'
                          }`}>
                            {alert.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-[#4a4234]">
                          {alert.keywords.length > 0 && (
                            <div>
                              <span className="font-bold">Keywords:</span> {alert.keywords.join(', ')}
                            </div>
                          )}
                          
                          {alert.categories.length > 0 && (
                            <div>
                              <span className="font-bold">Categories:</span> {alert.categories.join(', ')}
                            </div>
                          )}
                          
                          {alert.sources.length > 0 && (
                            <div>
                              <span className="font-bold">Sources:</span> {alert.sources.join(', ')}
                            </div>
                          )}
                          
                          <div className="text-xs text-[#6b6558]">
                            Created: {new Date(alert.createdAt).toLocaleDateString()} • 
                            Triggered: {alert.triggerCount} times
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleAlert(alert.id)}
                          className={`btn-classic p-2 ${alert.enabled ? '' : 'opacity-50'}`}
                          title={alert.enabled ? 'Disable Alert' : 'Enable Alert'}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEdit(alert)}
                          className="btn-classic p-2"
                          title="Edit Alert"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="btn-classic p-2"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Alerts;