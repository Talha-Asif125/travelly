try {
  const response = await axios.get('/api/hotelreservation/getAll');
  setHotels(response.data);
} catch (error) {
  console.error('Hotel fetch error:', error);
  setError('Unable to load hotels. Please try again.');
}