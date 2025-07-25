import axios from "axios";

// DEPRECATED: Use '../api/axios' for all API calls. This file is a duplicate and should be removed after migration.
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to handle errors
instance.interceptors.request.use(
  (config) => {
    // You can add auth token or other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default instance; 