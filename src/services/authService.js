/**
 * Frontend Authentication Service
 * Centralized auth management for consistent behavior
 */

import SessionService from './sessionService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data) {
        this.setToken(data.data.token);
        this.setUser(data.data.user);
        return data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      // Clear local storage regardless of response
      this.clearToken();
      this.clearUser();

      return response.ok;
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
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          this.clearUser();
        }
        throw new Error(data.message || 'Failed to get user data');
      }

      if (data.success && data.data) {
        this.setUser(data.data);
        return data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  static async resetPasswordRequest(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }

      return data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  static async resetPassword(token, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  static async checkEmailExists(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      // Return true if email exists (409 status)
      return response.status === 409;
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