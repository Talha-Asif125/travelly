/**
 * Frontend Authentication Service
 * Centralized auth management for consistent behavior
 */

import axios from '../api/axios';
import SessionService from './sessionService';

// Remove API_BASE_URL, use relative paths

class AuthService {
  // Token management
  static getToken() {
    return localStorage.getItem('token');
  }

  static setToken(token) {
    localStorage.setItem('token', token);
  }

  static clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // User management
  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  static clearUser() {
    localStorage.removeItem('user');
  }

  // Authentication state
  static isAuthenticated() {
    return !!this.getToken();
  }

  static isAdmin() {
    const user = this.getUser();
    return user?.isAdmin === true;
  }

  static hasPermission(permission) {
    const user = this.getUser();
    if (!user) return false;

    const rolePermissions = {
      admin: [
        'VIEW_ADMIN_DASHBOARD',
        'MANAGE_USERS',
        'APPROVE_PROVIDERS',
        'MANAGE_FINANCES',
        'MANAGE_SERVICES',
        'VIEW_ALL_RESERVATIONS',
        'MANAGE_EVENTS'
      ],
      financeManager: [
        'MANAGE_FINANCES',
        'VIEW_FINANCIAL_REPORTS',
        'PROCESS_REFUNDS'
      ],
      serviceProvider: [
        'CREATE_SERVICES',
        'MANAGE_OWN_SERVICES',
        'VIEW_OWN_RESERVATIONS'
      ],
      eventOrganizer: [
        'CREATE_EVENTS',
        'MANAGE_OWN_EVENTS'
      ],
      customer: [
        'CREATE_RESERVATIONS',
        'VIEW_OWN_PROFILE',
        'MANAGE_OWN_BOOKINGS'
      ]
    };

    if (user.isAdmin) {
      return rolePermissions.admin.includes(permission);
    }

    const userRole = user.userType || 'customer';
    const permissions = rolePermissions[userRole] || rolePermissions.customer;
    
    return permissions.includes(permission);
  }

  // HTTP headers
  static getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static getHeaders(contentType = 'application/json') {
    return {
      'Content-Type': contentType,
      ...this.getAuthHeaders()
    };
  }

  // API calls
  static async login(email, password) {
    try {
      const response = await axios.post('/auth/login', { email, password });

      if (response.data.success && response.data.data) {
        this.setToken(response.data.data.token);
        this.setUser(response.data.data.user);
        return response.data;
      }

      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(userData) {
    try {
      const response = await axios.post('/auth/register', userData);

      if (response.data.success) {
        return response.data;
      }

      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      const response = await axios.post('/auth/logout', {}, { headers: this.getAuthHeaders() });

      // Clear local storage regardless of response
      this.clearToken();
      this.clearUser();

      return response.status === 200; // Check for 200 status for success
    } catch (error) {
      // Clear local storage even if request fails
      this.clearToken();
      this.clearUser();
      console.error('Logout error:', error);
      return false;
    }
  }

  static async getCurrentUser() {
    try {
      const response = await axios.get('/auth/me', { headers: this.getAuthHeaders() });

      if (response.data.success && response.data.data) {
        this.setUser(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to get user data');
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  static async resetPasswordRequest(email) {
    try {
      const response = await axios.post('/auth/reset-password-request', { email });

      if (response.data.success) {
        return response.data;
      }

      throw new Error(response.data.message || 'Password reset request failed');
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  static async resetPassword(token, password) {
    try {
      const response = await axios.post('/auth/reset-password', { token, password });

      if (response.data.success) {
        return response.data;
      }

      throw new Error(response.data.message || 'Password reset failed');
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  static async checkEmailExists(email) {
    try {
      const response = await axios.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return response.status === 409; // Return true if email exists (409 status)
    } catch (error) {
      console.error('Check email error:', error);
      return false;
    }
  }

  // Token validation
  static isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      
      // If token is expired, trigger session cleanup
      if (isExpired) {
        this.clearToken();
        this.clearUser();
        SessionService.stopSessionMonitoring();
      }
      
      return isExpired;
    } catch (error) {
      return true;
    }
  }

  // Automatic token refresh check
  static shouldRefreshToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Refresh if token expires in less than 5 minutes
      return timeUntilExpiry < 300;
    } catch (error) {
      return false;
    }
  }

  // Initialize auth state (call on app startup)
  static async initializeAuth() {
    try {
      if (this.isAuthenticated() && !this.isTokenExpired()) {
        await this.getCurrentUser();
        // Start session monitoring for authenticated user
        const user = this.getUser();
        if (user) {
          SessionService.initializeSession(
            () => {
              this.clearToken();
              this.clearUser();
              window.location.href = '/login';
            }
          );
        }
        return true;
      } else {
        this.clearToken();
        this.clearUser();
        SessionService.stopSessionMonitoring();
        return false;
      }
    } catch (error) {
      this.clearToken();
      this.clearUser();
      SessionService.stopSessionMonitoring();
      return false;
    }
  }
}

export default AuthService; 