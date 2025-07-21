import axios from 'axios';
import SessionService from './src/services/sessionService';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true // This will send cookies with requests
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Reset session timer on API activity (user is active)
      SessionService.resetSessionTimer();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 