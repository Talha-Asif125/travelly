import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Star,
  CalendarToday,
  Group,
  AttachMoney
} from '@mui/icons-material';
import { AuthContext } from '../context/authContext';

const ServiceDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Booking form state
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    rooms: 1,
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    specialRequests: ''
  });

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerEmail: user.email || ''
      }));
    }
  }, [user]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/details/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setService(result.data);
      } else {
        setError(result.message || 'Service not found');
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError('');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: id,
          ...bookingData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setBookingSuccess('Booking request submitted successfully! The provider will review and confirm your booking.');
        setTimeout(() => {
          setBookingOpen(false);
          setBookingSuccess('');
        }, 3000);
      } else {
        setBookingError(result.message || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setBookingError('Failed to submit booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!service || !bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const units = bookingData.rooms || bookingData.guests || 1;
    
    return service.price * days * units;
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading service details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!service) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Service not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Service Images */}
        <Grid item xs={12} md={8}>
          {service.images && service.images.length > 0 ? (
            <CardMedia
              component="img"
              height="400"
              image={service.images[0]}
              alt={service.name}
              sx={{ borderRadius: 2, mb: 2 }}
            />
          ) : (
            <Box
              sx={{
                height: 400,
                bgcolor: 'grey.200',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Typography color="text.secondary">No image available</Typography>
            </Box>
          )}

          {/* Additional images */}
          {service.images && service.images.length > 1 && (
            <Grid container spacing={1}>
              {service.images.slice(1).map((image, index) => (
                <Grid item xs={3} key={index}>
                  <CardMedia
                    component="img"
                    height="100"
                    image={image}
                    alt={`${service.name} ${index + 2}`}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Service Info & Booking */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h4" gutterBottom>
              {service.name}
            </Typography>
            
            <Chip 
              label={service.type.charAt(0).toUpperCase() + service.type.slice(1)} 
              color="primary" 
              sx={{ mb: 2 }}
            />

            {service.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{service.location}</Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="h5" color="primary">
                Rs. {service.price}
                <Typography component="span" variant="body2" color="text.secondary">
                  {service.type === 'hotel' ? '/night' : service.type === 'tour' ? '/person' : '/day'}
                </Typography>
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setBookingOpen(true)}
              sx={{ mb: 2 }}
            >
              Book Now
            </Button>

            <Divider sx={{ my: 2 }} />

            {/* Provider Info */}
            <Typography variant="h6" gutterBottom>
              Provider Information
            </Typography>
            <Typography variant="body1" gutterBottom>
              {service.providerId?.businessName || service.providerId?.name}
            </Typography>
            {service.providerId?.businessEmail && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                <Typography variant="body2">{service.providerId.businessEmail}</Typography>
              </Box>
            )}
            {service.providerId?.businessPhone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                <Typography variant="body2">{service.providerId.businessPhone}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Service Description */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              About This {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
            </Typography>
            <Typography variant="body1" paragraph>
              {service.description}
            </Typography>

            {/* Service-specific details */}
            <Grid container spacing={2}>
              {service.roomType && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="primary">Room Type</Typography>
                  <Typography variant="body2">{service.roomType}</Typography>
                </Grid>
              )}
              {service.availableRooms && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="primary">Available Rooms</Typography>
                  <Typography variant="body2">{service.availableRooms}</Typography>
                </Grid>
              )}
              {service.duration && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="primary">Duration</Typography>
                  <Typography variant="body2">{service.duration}</Typography>
                </Grid>
              )}
              {service.maxGroupSize && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="primary">Max Group Size</Typography>
                  <Typography variant="body2">{service.maxGroupSize}</Typography>
                </Grid>
              )}
              {service.capacity && (
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="primary">Capacity</Typography>
                  <Typography variant="body2">{service.capacity}</Typography>
                </Grid>
              )}
              {service.features && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Features</Typography>
                  <Typography variant="body2">{service.features}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Book {service.name}</DialogTitle>
        <DialogContent>
          {bookingError && <Alert severity="error" sx={{ mb: 2 }}>{bookingError}</Alert>}
          {bookingSuccess && <Alert severity="success" sx={{ mb: 2 }}>{bookingSuccess}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check-in Date"
                type="date"
                value={bookingData.checkInDate}
                onChange={(e) => setBookingData({...bookingData, checkInDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: getTodayDate() }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check-out Date"
                type="date"
                value={bookingData.checkOutDate}
                onChange={(e) => setBookingData({...bookingData, checkOutDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: bookingData.checkInDate || getTodayDate() }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Guests"
                type="number"
                value={bookingData.guests}
                onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                inputProps={{ min: 1 }}
              />
            </Grid>
            {service.type === 'hotel' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Rooms"
                  type="number"
                  value={bookingData.rooms}
                  onChange={(e) => setBookingData({...bookingData, rooms: parseInt(e.target.value)})}
                  inputProps={{ min: 1 }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Your Name"
                value={bookingData.customerName}
                onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={bookingData.customerEmail}
                onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={bookingData.customerPhone}
                onChange={(e) => setBookingData({...bookingData, customerPhone: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests"
                multiline
                rows={3}
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                placeholder="Any special requirements or requests..."
              />
            </Grid>
            
            {/* Total Amount */}
            {bookingData.checkInDate && bookingData.checkOutDate && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h6">
                    Total Amount: Rs. {calculateTotal()}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBookingSubmit} 
            variant="contained"
            disabled={bookingLoading || !bookingData.checkInDate || !bookingData.checkOutDate || !bookingData.customerName || !bookingData.customerEmail || !bookingData.customerPhone}
          >
            {bookingLoading ? 'Submitting...' : 'Submit Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceDetails; 