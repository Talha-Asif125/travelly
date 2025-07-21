import axios from '../api/axios';

export const searchHotels = async (searchParams) => {
  const response = await axios.get(`/api/hotelreservation/getAll`);
  return response.data;
};

export const getHotelDetails = async (hotelId) => {
  const response = await axios.get(`/api/hotelreservation/${hotelId}`);
  return response.data;
};

export const bookHotel = async (bookingData) => {
  const response = await axios.post(`/api/hotelreservation/reservation`, bookingData);
  return response.data;
};
