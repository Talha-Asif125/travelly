import axios from '../api/axios';

export const searchHotels = async (searchParams) => {
  try {
    const response = await axios.get(`/api/hotelreservation/getAll`); // No search params supported in backend, fallback to getAll
    return response.data;
  } catch (error) {
    console.error('Hotel search error:', error);
    throw new Error('Failed to search hotels. Please try again later.');
  }
};

export const getHotelDetails = async (hotelId) => {
  try {
    const response = await axios.get(`/api/hotelreservation/${hotelId}`);
    return response.data;
  } catch (error) {
    console.error('Hotel details error:', error);
    throw new Error('Failed to get hotel details. Please try again later.');
  }
};

export const bookHotel = async (bookingData) => {
  try {
    const response = await axios.post(`/api/hotelreservation/reservation`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Hotel booking error:', error);
    throw new Error('Failed to book hotel. Please try again later.');
  }
};

export const getPopularHotels = async () => {
  try {
    const response = await axios.get(`/api/hotelreservation/getAll`); // No popular endpoint, fallback to getAll
    return response.data;
  } catch (error) {
    console.error('Popular hotels error:', error);
    throw new Error('Failed to get popular hotels. Please try again later.');
  }
}; 