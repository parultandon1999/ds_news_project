import { checkFetchStatus, getArticleCount, getUserSettings } from '../services/api';
import { notificationManager } from './notifications';

export class BackgroundFetcher {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.lastArticleCount = 0;
    this.lastUpdateTime = null;
    this.settings = this.loadSettings();
  }

  async loadSettings() {
    const defaultSettings = {
      autoRefresh: true,
      refreshInterval: 300, // 5 minutes
      enableNotifications: true,
      notificationSound: true
    };
    
    try {
      const saved = await getUserSettings();
      return { ...defaultSettings, ...saved };
    } catch (error) {
      console.error('Error loading settings from API, using localStorage fallback:', error);
      const saved = JSON.parse(localStorage.getItem('newsSettings') || '{}');
      return { ...defaultSettings, ...saved };
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Restart if interval changed
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  async checkForNewArticles() {
    try {
      const data = await getArticleCount();
      const currentCount = data.count || 0;
      const currentUpdateTime = data.last_updated;
      
      // Check if we have new articles
      if (this.lastArticleCount > 0 && currentCount > this.lastArticleCount) {
        const newArticlesCount = currentCount - this.lastArticleCount;
        
        if (this.settings.enableNotifications) {
          // Get the latest article for notification
          try {
            const articlesData = await import('../services/api').then(api => api.fetchArticles());
            const latestArticle = articlesData.articles[0];
            notificationManager.showNewArticlesNotification(newArticlesCount, latestArticle);
          } catch (error) {
            notificationManager.showNewArticlesNotification(newArticlesCount, null);
          }
        }
        
        // Check alerts
        this.checkAlertsForNewArticles(newArticlesCount);
        
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('newArticlesAvailable', {
          detail: { count: newArticlesCount, totalCount: currentCount }
        }));
      }
      
      // Update tracking variables
      this.lastArticleCount = currentCount;
      this.lastUpdateTime = currentUpdateTime;
      
    } catch (error) {
      console.error('Background fetch check failed:', error);
    }
  }

  async checkAlertsForNewArticles(newArticlesCount) {
    try {
      const { fetchArticles } = await import('../services/api');
      const data = await fetchArticles();
      const newArticles = data.articles.slice(0, newArticlesCount);
      
      this.checkAlerts(newArticles);
    } catch (error) {
      console.error('Failed to check alerts for new articles:', error);
    }
  }

  checkAlerts(newArticles) {
    const alerts = JSON.parse(localStorage.getItem('newsAlerts') || '[]');
    const activeAlerts = alerts.filter(alert => alert.enabled);
    
    newArticles.forEach(article => {
      activeAlerts.forEach(alert => {
        if (this.articleMatchesAlert(article, alert)) {
          // Update alert trigger count
          alert.triggerCount = (alert.triggerCount || 0) + 1;
          alert.lastTriggered = new Date().toISOString();
          
          // Show notification
          if (this.settings.enableNotifications) {
            notificationManager.showAlertNotification(alert.name, article);
          }
        }
      });
    });
    
    // Save updated alerts
    localStorage.setItem('newsAlerts', JSON.stringify(alerts));
  }

  articleMatchesAlert(article, alert) {
    // Check keywords
    if (alert.keywords && alert.keywords.length > 0) {
      const articleText = `${article.title} ${article.summary || article.content || ''}`.toLowerCase();
      const hasKeyword = alert.keywords.some(keyword => 
        articleText.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }
    
    // Check categories
    if (alert.categories && alert.categories.length > 0) {
      if (!alert.categories.includes(article.ai_category)) return false;
    }
    
    // Check sources
    if (alert.sources && alert.sources.length > 0) {
      const hasSource = alert.sources.some(source => 
        article.source.toLowerCase().includes(source.toLowerCase())
      );
      if (!hasSource) return false;
    }
    
    return true;
  }

  async checkBackgroundFetch() {
    try {
      const status = await checkFetchStatus();
      
      // If a fetch just completed, check for new articles
      if (!status.running && status.last_result && status.last_result.fetched_at) {
        const lastFetchTime = new Date(status.last_result.fetched_at);
        const now = new Date();
        const timeDiff = now - lastFetchTime;
        
        // If fetch completed within last 30 seconds, check for new articles
        if (timeDiff < 30000) {
          await this.checkForNewArticles();
        }
      }
    } catch (error) {
      console.error('Background fetch status check failed:', error);
    }
  }

  start() {
    if (this.isRunning || !this.settings.autoRefresh) return;
    
    console.log('Starting background fetcher...');
    this.isRunning = true;
    
    // Initial check
    this.checkForNewArticles();
    
    // Set up interval
    this.interval = setInterval(() => {
      this.checkForNewArticles();
      this.checkBackgroundFetch();
    }, this.settings.refreshInterval * 1000);
  }

  stop() {
    if (!this.isRunning) return;
    
    console.log('Stopping background fetcher...');
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  restart() {
    this.stop();
    this.start();
  }
}

export const backgroundFetcher = new BackgroundFetcher();