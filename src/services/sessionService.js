/**
 * Session Management Service
 * Handles automatic logout and session timeout
 */

class SessionService {
  static SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
  static WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before timeout
  static CHECK_INTERVAL = 60 * 1000; // Check every minute
  
  static sessionTimer = null;
  static warningTimer = null;
  static intervalTimer = null;
  static onSessionExpiredCallback = null;
  static onSessionWarningCallback = null;
  
  /**
   * Initialize session monitoring
   * @param {Function} onSessionExpired - Callback when session expires
   * @param {Function} onSessionWarning - Callback for warning before expiration
   */
  static initializeSession(onSessionExpired, onSessionWarning = null) {
    this.onSessionExpiredCallback = onSessionExpired;
    this.onSessionWarningCallback = onSessionWarning;
    
    this.startSessionTimer();
    this.startSessionMonitoring();
    
    console.log('Session monitoring initialized - 1 hour timeout');
  }
  
  /**
   * Start the main session timer
   */
  static startSessionTimer() {
    this.clearTimers();
    
    // Set warning timer (5 minutes before expiration)
    if (this.onSessionWarningCallback) {
      this.warningTimer = setTimeout(() => {
        this.onSessionWarningCallback();
      }, this.SESSION_TIMEOUT - this.WARNING_TIME);
    }
    
    // Set session expiration timer (1 hour)
    this.sessionTimer = setTimeout(() => {
      this.expireSession();
    }, this.SESSION_TIMEOUT);
    
    // Store session start time
    localStorage.setItem('sessionStartTime', Date.now().toString());
  }
  
  /**
   * Start periodic session monitoring
   */
  static startSessionMonitoring() {
    this.intervalTimer = setInterval(() => {
      this.checkSessionExpiration();
    }, this.CHECK_INTERVAL);
  }
  
  /**
   * Check if session has expired based on stored start time
   */
  static checkSessionExpiration() {
    const sessionStartTime = localStorage.getItem('sessionStartTime');
    const token = localStorage.getItem('token');
    
    if (!sessionStartTime || !token) {
      return;
    }
    
    const currentTime = Date.now();
    const sessionAge = currentTime - parseInt(sessionStartTime);
    
    if (sessionAge >= this.SESSION_TIMEOUT) {
      console.log('Session expired - automatic logout');
      this.expireSession();
    }
  }
  
  /**
   * Expire the session and logout user
   */
  static expireSession() {
    console.log('Session timeout - logging out user');
    this.clearTimers();
    
    if (this.onSessionExpiredCallback) {
      this.onSessionExpiredCallback();
    }
  }
  
  /**
   * Reset session timer (call when user is active)
   */
  static resetSessionTimer() {
    if (localStorage.getItem('token')) {
      console.log('Session activity detected - resetting timer');
      this.startSessionTimer();
    }
  }
  
  /**
   * Clear all timers
   */
  static clearTimers() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }
  
  /**
   * Stop session monitoring
   */
  static stopSessionMonitoring() {
    this.clearTimers();
    localStorage.removeItem('sessionStartTime');
    console.log('Session monitoring stopped');
  }
  
  /**
   * Get remaining session time in milliseconds
   */
  static getRemainingTime() {
    const sessionStartTime = localStorage.getItem('sessionStartTime');
    if (!sessionStartTime) return 0;
    
    const currentTime = Date.now();
    const sessionAge = currentTime - parseInt(sessionStartTime);
    const remaining = this.SESSION_TIMEOUT - sessionAge;
    
    return Math.max(0, remaining);
  }
  
  /**
   * Format remaining time for display
   */
  static formatRemainingTime() {
    const remaining = this.getRemainingTime();
    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Check if session warning should be shown
   */
  static shouldShowWarning() {
    const remaining = this.getRemainingTime();
    return remaining <= this.WARNING_TIME && remaining > 0;
  }
}

export default SessionService; 