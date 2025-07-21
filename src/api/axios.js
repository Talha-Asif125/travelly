import axios from 'axios';

const api = axios.create({
  baseURL: 'https://travelly-backend-27bn.onrender.com',
  // Make sure baseURL doesn't end with /api if routes include it
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;



