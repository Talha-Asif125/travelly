import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { bookTour } from '../services/tourService';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto'
};

const TourBookingModal = ({ open, onClose, tour }) => {
  const [bookingData, setBookingData] = useState({
    tourDate: null,
    participants: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field) => (event) => {
    setBookingData({
      ...bookingData,
      [field]: event.target.value
    });
  };

  const handleDateChange = (date) => {
    setBookingData({
      ...bookingData,
      tourDate: date
    });
  };

  const calculateTotalPrice = () => {
    return bookingData.participants * tour.price;
  };

  const validateForm = () => {
    if (!bookingData.tourDate) {
      setError('Please select a tour date');
      return false;
    }
    if (!bookingData.firstName.trim()) {
      setError('Please enter your first name');
      return false;
    }
    if (!bookingData.lastName.trim()) {
      setError('Please enter your last name');
      return false;
    }
    if (!bookingData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!bookingData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingPayload = {
        tourId: tour.id,
        ...bookingData,
        totalPrice: calculateTotalPrice(),
        status: 'pending'
      };

      const response = await bookTour(bookingPayload);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setBookingData({
            tourDate: null,
            participants: 1,
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            specialRequests: ''
          });
        }, 2000);
      } else {
        throw new Error(response.message || 'Booking failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="tour-booking-modal-title"
    >
      <Box sx={style}>
        <Typography id="tour-booking-modal-title" variant="h5" component="h2" gutterBottom>
          Book {tour?.title}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>Booking successful! Redirecting...</Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Tour Date"
                value={bookingData.tourDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Number of Participants</InputLabel>
              <Select
                value={bookingData.participants}
                label="Number of Participants"
                onChange={handleInputChange('participants')}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <MenuItem key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Maximum group size: {tour?.groupSize}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={bookingData.firstName}
              onChange={handleInputChange('firstName')}
              required
              error={error && !bookingData.firstName.trim()}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={bookingData.lastName}
              onChange={handleInputChange('lastName')}
              required
              error={error && !bookingData.lastName.trim()}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={bookingData.email}
              onChange={handleInputChange('email')}
              required
              error={error && !bookingData.email.trim()}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={bookingData.phone}
              onChange={handleInputChange('phone')}
              required
              error={error && !bookingData.phone.trim()}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Special Requests"
              multiline
              rows={3}
              value={bookingData.specialRequests}
              onChange={handleInputChange('specialRequests')}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              Total: ${calculateTotalPrice()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              for {bookingData.participants} {bookingData.participants === 1 ? 'person' : 'people'}
            </Typography>
          </Box>
          <Box>
            <Button onClick={onClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || success}
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default TourBookingModal; 