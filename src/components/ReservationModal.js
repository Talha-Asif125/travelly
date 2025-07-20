import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { bookHotel } from '../services/hotelService';
import ReservationStatusModal from './ReservationStatusModal';

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

const ReservationModal = ({ open, onClose, hotel }) => {
  const [bookingData, setBookingData] = useState({
    checkIn: null,
    checkOut: null,
    guests: 1,
    roomType: 'standard',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [reservationId, setReservationId] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    calculateTotalPrice();
  }, [bookingData.checkIn, bookingData.checkOut, bookingData.roomType]);

  const handleInputChange = (field) => (event) => {
    setBookingData({
      ...bookingData,
      [field]: event.target.value
    });
  };

  const handleDateChange = (field) => (date) => {
    setBookingData({
      ...bookingData,
      [field]: date
    });
  };

  const calculateTotalPrice = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setTotalPrice(0);
      return;
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const days = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

    const roomPrice = hotel.roomTypes.find(room => room.type === bookingData.roomType)?.price || hotel.roomTypes[0].price;
    const total = days * roomPrice;
    setTotalPrice(total);
  };

  const validateForm = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setError('Please select check-in and check-out dates');
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
        hotelId: hotel.id,
        ...bookingData,
        totalPrice,
        currency: 'PKR',
        status: 'pending'
      };

      const response = await bookHotel(bookingPayload);
      
      if (response.success) {
        setSuccess(true);
        setReservationId(response.reservationId);
        
        // Show status after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setShowStatusModal(true);
          // Reset form
          setBookingData({
            checkIn: null,
            checkOut: null,
            guests: 1,
            roomType: 'standard',
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

  const handleCloseStatus = () => {
    setShowStatusModal(false);
    setReservationId(null);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="reservation-modal-title"
      >
        <Box sx={style}>
          <Typography id="reservation-modal-title" variant="h5" component="h2" gutterBottom>
            Reserve at {hotel?.name}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Booking request submitted! Please wait for confirmation from the hotel.
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-in"
                  value={bookingData.checkIn}
                  onChange={handleDateChange('checkIn')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-out"
                  value={bookingData.checkOut}
                  onChange={handleDateChange('checkOut')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={bookingData.checkIn || new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={bookingData.roomType}
                  label="Room Type"
                  onChange={handleInputChange('roomType')}
                >
                  {hotel.roomTypes.map((room) => (
                    <MenuItem key={room.type} value={room.type}>
                      {room.type.charAt(0).toUpperCase() + room.type.slice(1)} - ${room.price}/night
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Guests</InputLabel>
                <Select
                  value={bookingData.guests}
                  label="Guests"
                  onChange={handleInputChange('guests')}
                >
                  {[1, 2, 3, 4].map(num => (
                    <MenuItem key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</MenuItem>
                  ))}
                </Select>
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
                Total: ${totalPrice}
              </Typography>
              {bookingData.checkIn && bookingData.checkOut && (
                <Typography variant="caption" color="text.secondary">
                  for {Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))} nights
                </Typography>
              )}
            </Box>
            <Box>
              <Button onClick={onClose} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || success || totalPrice === 0}
              >
                {loading ? 'Processing...' : 'Submit Request'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Reservation Status Modal */}
      <ReservationStatusModal
        open={showStatusModal}
        onClose={handleCloseStatus}
        reservationId={reservationId}
      />
    </>
  );
};

export default ReservationModal; 