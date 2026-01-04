// Notification utility functions
export class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
  }

  async requestPermission() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    }
    return false;
  }

  showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'news-update',
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  showNewArticlesNotification(count, latestArticle) {
    const title = `${count} New Article${count > 1 ? 's' : ''} Available`;
    const body = latestArticle ? `Latest: ${latestArticle.title}` : 'Check out the latest news updates';
    
    return this.showNotification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'new-articles',
      data: { type: 'new-articles', count, latestArticle }
    });
  }

  showAlertNotification(alertName, article) {
    const title = `Alert: ${alertName}`;
    const body = article.title;
    
    return this.showNotification(title, {
      body,
      icon: '/favicon.ico',
      tag: `alert-${alertName}`,
      data: { type: 'alert', alertName, article }
    });
  }

  isSupported() {
    return 'Notification' in window;
  }

  isGranted() {
    return this.permission === 'granted';
  }
}

export const notificationManager = new NotificationManager();