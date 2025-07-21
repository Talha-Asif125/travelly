import axios from '../api/axios';

export const getAllTours = async () => {
  try {
    const response = await axios.get(`/api/tours`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tours:', error);
    throw new Error('Failed to fetch tours. Please try again later.');
  }
};

export const getToursByCategory = async (category) => {
  try {
    const response = await axios.get(`/api/tours/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Category tours error:', error);
    throw new Error(`Failed to fetch ${category} tours. Please try again later.`);
  }
};

export const getTourDetails = async (tourId) => {
  try {
    const response = await axios.get(`/api/tours/${tourId}`);
    return response.data;
  } catch (error) {
    console.error('Tour details error:', error);
    throw new Error('Failed to fetch tour details. Please try again later.');
  }
};

export const bookTour = async (bookingData) => {
  try {
    const response = await axios.post(`/tour-reservations`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Tour booking error:', error);
    throw new Error('Failed to book tour. Please try again later.');
  }
};

export const getPopularTours = async () => {
  try {
    const response = await axios.get(`/api/tours/popular`);
    return response.data;
  } catch (error) {
    console.error('Popular tours error:', error);
    throw new Error('Failed to fetch popular tours. Please try again later.');
  }
};
