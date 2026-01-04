import { 
  saveArticle, 
  updateUserSettings, 
  createNewsAlert 
} from '../services/api';

/**
 * Migrate data from localStorage to backend JSON files
 */
export class DataMigration {
  constructor() {
    this.migrationStatus = {
      savedArticles: false,
      userSettings: false,
      newsAlerts: false
    };
    this.abortController = null;
  }

  /**
   * Check if migration is needed
   */
  needsMigration() {
    const hasLocalSavedArticles = localStorage.getItem('savedArticles');
    const hasLocalSettings = localStorage.getItem('newsSettings');
    const hasLocalAlerts = localStorage.getItem('newsAlerts');
    
    return !!(hasLocalSavedArticles || hasLocalSettings || hasLocalAlerts);
  }

  /**
   * Migrate saved articles from localStorage to backend
   */
  async migrateSavedArticles(signal) {
    try {
      const savedArticlesStr = localStorage.getItem('savedArticles');
      if (!savedArticlesStr) {
        this.migrationStatus.savedArticles = true;
        return { success: true, count: 0 };
      }

      const savedArticles = JSON.parse(savedArticlesStr);
      let successCount = 0;
      let errorCount = 0;

      for (const article of savedArticles) {
        if (signal?.aborted) {
          throw new Error('Migration cancelled');
        }
        
        try {
          await saveArticle(article, signal);
          successCount++;
        } catch (error) {
          if (error.name === 'AbortError' || error.message === 'Migration cancelled') {
            throw error;
          }
          console.error('Failed to migrate article:', article.id, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        // Only remove localStorage data if all articles were migrated successfully
        localStorage.removeItem('savedArticles');
        this.migrationStatus.savedArticles = true;
      }

      return { 
        success: errorCount === 0, 
        count: successCount, 
        errors: errorCount 
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Migration cancelled') {
        throw error;
      }
      console.error('Error migrating saved articles:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate user settings from localStorage to backend
   */
  async migrateUserSettings(signal) {
    try {
      const settingsStr = localStorage.getItem('newsSettings');
      if (!settingsStr) {
        this.migrationStatus.userSettings = true;
        return { success: true };
      }

      if (signal?.aborted) {
        throw new Error('Migration cancelled');
      }

      const settings = JSON.parse(settingsStr);
      await updateUserSettings(settings, signal);
      
      localStorage.removeItem('newsSettings');
      this.migrationStatus.userSettings = true;
      
      return { success: true };
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Migration cancelled') {
        throw error;
      }
      console.error('Error migrating user settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate news alerts from localStorage to backend
   */
  async migrateNewsAlerts(signal) {
    try {
      const alertsStr = localStorage.getItem('newsAlerts');
      if (!alertsStr) {
        this.migrationStatus.newsAlerts = true;
        return { success: true, count: 0 };
      }

      const alerts = JSON.parse(alertsStr);
      let successCount = 0;
      let errorCount = 0;

      for (const alert of alerts) {
        if (signal?.aborted) {
          throw new Error('Migration cancelled');
        }
        
        try {
          // Remove the id field as the backend will generate a new one
          const { id, ...alertData } = alert;
          await createNewsAlert(alertData, signal);
          successCount++;
        } catch (error) {
          if (error.name === 'AbortError' || error.message === 'Migration cancelled') {
            throw error;
          }
          console.error('Failed to migrate alert:', alert.id, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        localStorage.removeItem('newsAlerts');
        this.migrationStatus.newsAlerts = true;
      }

      return { 
        success: errorCount === 0, 
        count: successCount, 
        errors: errorCount 
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Migration cancelled') {
        throw error;
      }
      console.error('Error migrating news alerts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run complete migration
   */
  async migrateAll() {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const results = {
        savedArticles: await this.migrateSavedArticles(signal),
        userSettings: await this.migrateUserSettings(signal),
        newsAlerts: await this.migrateNewsAlerts(signal)
      };

      const allSuccessful = Object.values(results).every(r => r.success);
      
      return {
        success: allSuccessful,
        results,
        summary: {
          savedArticles: results.savedArticles.count || 0,
          userSettings: results.userSettings.success ? 1 : 0,
          newsAlerts: results.newsAlerts.count || 0
        }
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Migration cancelled') {
        throw new Error('Migration was cancelled');
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Cancel ongoing migration
   */
  cancelMigration() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Get migration status
   */
  getStatus() {
    return this.migrationStatus;
  }
}

// Create singleton instance
export const dataMigration = new DataMigration();