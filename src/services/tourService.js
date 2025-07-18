import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const getAllTours = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tour`);
    return response.data;
  } catch (error) {
    console.error('Tour fetch error:', error);
    throw new Error('Failed to fetch tours. Please try again later.');
  }
};

export const getToursByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tour/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Category tours error:', error);
    throw new Error(`Failed to fetch ${category} tours. Please try again later.`);
  }
};

export const getTourDetails = async (tourId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tour/${tourId}`);
    return response.data;
  } catch (error) {
    console.error('Tour details error:', error);
    throw new Error('Failed to fetch tour details. Please try again later.');
  }
};

export const bookTour = async (bookingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tour-reservations`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Tour booking error:', error);
    throw new Error('Failed to book tour. Please try again later.');
  }
};

export const getPopularTours = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tour/popular`);
    return response.data;
  } catch (error) {
    console.error('Popular tours error:', error);
    throw new Error('Failed to fetch popular tours. Please try again later.');
  }
};
