// Use the service reservations endpoint
const response = await axios.post('/api/reservations', bookingData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});