const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://travelly-backend-27bn.onrender.com'
  : 'http://localhost:5000';
// Remove /api from base URL if routes already include it
