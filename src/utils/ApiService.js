import AuthService from '../services/authService';

/**
 * Centralized API Service
 * Handles all HTTP requests with consistent patterns
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  /**
   * Handle API response
   * @param {Response} response - Fetch response object
   */
  static async handleResponse(response) {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          AuthService.clearToken();
          AuthService.clearUser();
          window.location.href = '/login';
          throw new Error(data.message || 'Authentication required');
        }
        
        // Handle authorization errors
        if (response.status === 403) {
          throw new Error(data.message || 'Access denied');
        }
        
        // Handle other errors
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      if (error.name === 'SyntaxError') {
        throw new Error('Invalid response from server');
      }
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional options
   */
  static async get(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          ...AuthService.getHeaders(),
          ...options.headers
        },
        credentials: 'include',
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional options
   */
  static async post(endpoint, data = null, options = {}) {
    try {
      const isFormData = data instanceof FormData;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(isFormData ? AuthService.getAuthHeaders() : AuthService.getHeaders()),
          ...options.headers
        },
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional options
   */
  static async put(endpoint, data = null, options = {}) {
    try {
      const isFormData = data instanceof FormData;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          ...(isFormData ? AuthService.getAuthHeaders() : AuthService.getHeaders()),
          ...options.headers
        },
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional options
   */
  static async delete(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          ...AuthService.getHeaders(),
          ...options.headers
        },
        credentials: 'include',
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional options
   */
  static async patch(endpoint, data = null, options = {}) {
    try {
      const isFormData = data instanceof FormData;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          ...(isFormData ? AuthService.getAuthHeaders() : AuthService.getHeaders()),
          ...options.headers
        },
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
        ...options
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`PATCH ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Upload file(s)
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with files
   * @param {function} onProgress - Progress callback
   */
  static async upload(endpoint, formData, onProgress = null) {
    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', async () => {
          try {
            const response = {
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              json: async () => JSON.parse(xhr.responseText)
            };
            
            const data = await this.handleResponse(response);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        xhr.open('POST', `${API_BASE_URL}${endpoint}`);
        
        // Set auth header
        const token = AuthService.getToken();
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error(`Upload ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Download file
   * @param {string} endpoint - API endpoint
   * @param {string} filename - Desired filename
   */
  static async download(endpoint, filename) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error(`Download ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Get with query parameters
   * @param {string} endpoint - API endpoint
   * @param {object} params - Query parameters
   * @param {object} options - Additional options
   */
  static async getWithParams(endpoint, params = {}, options = {}) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.get(url, options);
  }

  /**
   * Paginated GET request
   * @param {string} endpoint - API endpoint
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {object} filters - Additional filters
   */
  static async getPaginated(endpoint, page = 1, limit = 10, filters = {}) {
    const params = {
      page,
      limit,
      ...filters
    };
    
    return this.getWithParams(endpoint, params);
  }

  /**
   * Retry mechanism for failed requests
   * @param {function} requestFn - Request function to retry
   * @param {number} maxRetries - Maximum retry attempts
   * @param {number} delay - Delay between retries (ms)
   */
  static async retry(requestFn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (i === maxRetries) {
          break;
        }
        
        // Don't retry auth errors
        if (error.message.includes('Authentication') || error.message.includes('Access denied')) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
    
    throw lastError;
  }
}

export default ApiService; 