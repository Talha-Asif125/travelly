import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Paper, Typography, MenuItem, Select, FormControl, InputLabel, Alert, Snackbar } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import AdminBackButton from '../../components/AdminBackButton';

const AddHotelReservation = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    hotelId: '',
    roomType: '',
    numberOfRooms: 1,
    checkInDate: null,
    checkOutDate: null,
    numberOfGuests: 1,
    specialRequests: '',
  });

  // Fetch available hotels
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get('/hotels');
        setHotels(response.data);
      } catch (err) {
        console.error('Error fetching hotels:', err);
        setError('Failed to load hotels. Please try again later.');
      }
    };

    fetchHotels();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (name) => (date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Input validation
      if (!formData.customerName || !formData.email || !formData.phone || 
          !formData.hotelId || !formData.roomType || !formData.checkInDate || 
          !formData.checkOutDate) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.checkInDate >= formData.checkOutDate) {
        throw new Error('Check-out date must be after check-in date');
      }

      // Create reservation payload
      const payload = {
        hotelName: hotels.find(h => h._id === formData.hotelId)?.name || '',
        userName: formData.customerName,
        checkInDate: formData.checkInDate.toISOString(),
        checkOutDate: formData.checkOutDate.toISOString(),
        totalDays: Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24)),
        totalPrice: formData.numberOfRooms * 100, // Simplified price calculation
        status: 'pending',
        email: formData.email,
        phone: formData.phone,
        numberOfGuests: formData.numberOfGuests,
        specialRequests: formData.specialRequests
      };

      // Submit reservation
      await axios.post('/hotelreservation/reservation', payload);
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/hotel-reservations');
      }, 2000);
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const roomTypes = ['Single', 'Double', 'Twin', 'Suite', 'Deluxe'];

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminBackButton />
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Add New Hotel Reservation
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Snackbar 
          open={success} 
          autoHideDuration={4000} 
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success">Reservation created successfully!</Alert>
        </Snackbar>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Select Hotel</InputLabel>
                <Select
                  name="hotelId"
                  value={formData.hotelId}
                  onChange={handleChange}
                  label="Select Hotel"
                >
                  {hotels.map((hotel) => (
                    <MenuItem key={hotel._id} value={hotel._id}>
                      {hotel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Room Type</InputLabel>
                <Select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  label="Room Type"
                >
                  {roomTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Rooms"
                name="numberOfRooms"
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                value={formData.numberOfRooms}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-in Date"
                  value={formData.checkInDate}
                  onChange={handleDateChange('checkInDate')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-out Date"
                  value={formData.checkOutDate}
                  onChange={handleDateChange('checkOutDate')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={formData.checkInDate || new Date()}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Guests"
                name="numberOfGuests"
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                value={formData.numberOfGuests}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests"
                name="specialRequests"
                multiline
                rows={3}
                value={formData.specialRequests}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                onClick={() => navigate('/hotel-reservations')}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Create Reservation'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default AddHotelReservation; 