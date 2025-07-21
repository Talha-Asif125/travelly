import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Hotel,
  DirectionsCar,
  Tour,
  Restaurant,
  Event,
  LocationOn,
  CalendarToday,
  Group,
  AttachMoney,
  CheckCircle,
  Cancel,
  Schedule,
  Info,
  FilterList,
  Delete
} from '@mui/icons-material';
import { AuthContext } from '../context/authContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import api from '../api/axios';

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = '/api/reservations/my-bookings';
      const params = new URLSearchParams();
      
      if (serviceTypeFilter === 'hotel') {
        params.append('type', 'service');
      } else if (serviceTypeFilter === 'vehicle') {
        params.append('type', 'vehicle');
      } else if (serviceTypeFilter === 'tour') {
        params.append('type', 'tour');
      } else if (serviceTypeFilter === 'restaurant') {
        params.append('type', 'service');
      } else if (serviceTypeFilter === 'event') {
        params.append('type', 'service');
      }
      // For 'all', we don't add type parameter to get all types
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      const result = response.data;
      
      if (result.success) {
        setBookings(result.data || []);
      } else {
        setError(result.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [serviceTypeFilter]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        // Try multiple endpoints to get all booking types
        const [hotelBookings, serviceBookings, tourBookings] = await Promise.allSettled([
          api.get('/hotel-reservations/user'),
          api.get('/reservations/customer'), 
          api.get('/tour-reservations/customer')
        ]);
        
        let allBookings = [];
        
        // Combine successful responses
        if (hotelBookings.status === 'fulfilled' && hotelBookings.value.data) {
          allBookings = [...allBookings, ...hotelBookings.value.data];
        }
        
        if (serviceBookings.status === 'fulfilled' && serviceBookings.value.data?.data) {
          allBookings = [...allBookings, ...serviceBookings.value.data.data];
        }
        
        if (tourBookings.status === 'fulfilled' && tourBookings.value.data) {
          allBookings = [...allBookings, ...tourBookings.value.data];
        }
        
        setBookings(allBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const getServiceIcon = (type) => {
    const iconProps = { fontSize: 'medium', color: 'primary' };
    switch (type) {
      case 'hotel': return <Hotel {...iconProps} />;
      case 'vehicle': return <DirectionsCar {...iconProps} />;
      case 'tour': return <Tour {...iconProps} />;
      case 'restaurant': return <Restaurant {...iconProps} />;
      case 'event': return <Event {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle fontSize="small" />;
      case 'pending': return <Schedule fontSize="small" />;
      case 'cancelled': return <Cancel fontSize="small" />;
      case 'completed': return <CheckCircle fontSize="small" />;
      default: return <Info fontSize="small" />;
    }
  };

  const getFilteredBookings = () => {
    let filteredByType = bookings;
    
    // Apply service type filter
    if (serviceTypeFilter === 'hotel') {
      filteredByType = bookings.filter(booking => 
        booking.serviceId?.type === 'hotel' || 
        (!booking.serviceId?.type && !booking.isLegacyVehicle && !booking.isTourReservation)
      );
    } else if (serviceTypeFilter === 'vehicle') {
      filteredByType = bookings.filter(booking => 
        booking.serviceId?.type === 'vehicle' || 
        booking.isLegacyVehicle
      );
    } else if (serviceTypeFilter === 'tour') {
      filteredByType = bookings.filter(booking => 
        booking.serviceId?.type === 'tour' || 
        booking.isTourReservation
      );
    } else if (serviceTypeFilter === 'restaurant') {
      filteredByType = bookings.filter(booking => 
        booking.serviceId?.type === 'restaurant'
      );
    } else if (serviceTypeFilter === 'event') {
      filteredByType = bookings.filter(booking => 
        booking.serviceId?.type === 'event'
      );
    }

    // Apply status filter based on active tab
    const now = new Date();
    switch (activeTab) {
      case 0: // All
        return filteredByType;
      case 1: // Upcoming
        return filteredByType.filter(booking => 
          new Date(booking.checkInDate) >= now && booking.status !== 'cancelled'
        );
      case 2: // Past
        return filteredByType.filter(booking => 
          new Date(booking.checkOutDate) < now || booking.status === 'completed'
        );
      case 3: // Cancelled
        return filteredByType.filter(booking => booking.status === 'cancelled');
      default:
        return filteredByType;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (checkIn, checkOut) => {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleServiceTypeChange = (event, newType) => {
    if (newType !== null) {
      setServiceTypeFilter(newType);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Delete Booking?',
        text: 'Are you sure you want to permanently delete this booking? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        cancelButtonColor: '#1976d2',
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        
        const response = await api.delete(`/reservations/${bookingId}`);
        const result = response.data;

        if (result.success) {
          // Remove the booking from local state
          setBookings(prev => prev.filter(booking => booking._id !== bookingId));
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Your booking has been deleted successfully.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error(result.message || 'Failed to delete booking');
        }
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to delete booking. Please try again.',
        confirmButtonColor: '#1976d2'
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Service Type Filter */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FilterList color="action" />
        <ToggleButtonGroup
          value={serviceTypeFilter}
          exclusive
          onChange={handleServiceTypeChange}
          aria-label="service type filter"
          size="small"
        >
          <ToggleButton value="all" aria-label="all services">
            All Services
          </ToggleButton>
          <ToggleButton value="hotel" aria-label="hotel services">
            <Hotel sx={{ mr: 1 }} fontSize="small" />
            Hotels
          </ToggleButton>
          <ToggleButton value="vehicle" aria-label="vehicle services">
            <DirectionsCar sx={{ mr: 1 }} fontSize="small" />
            Vehicles
          </ToggleButton>
          <ToggleButton value="tour" aria-label="tour services">
            <Tour sx={{ mr: 1 }} fontSize="small" />
            Tours
          </ToggleButton>
          <ToggleButton value="restaurant" aria-label="restaurant services">
            <Restaurant sx={{ mr: 1 }} fontSize="small" />
            Restaurants
          </ToggleButton>
          <ToggleButton value="event" aria-label="event services">
            <Event sx={{ mr: 1 }} fontSize="small" />
            Events
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper sx={{ mt: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ px: 2 }}
        >
          <Tab label="All Bookings" />
          <Tab label="Upcoming" />
          <Tab label="Past" />
          <Tab label="Cancelled" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {getFilteredBookings().length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography variant="h6" color="text.secondary">
                No bookings found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {activeTab === 1 && "You don't have any upcoming bookings."}
                {activeTab === 2 && "You don't have any past bookings."}
                {activeTab === 3 && "You don't have any cancelled bookings."}
                {activeTab === 0 && "You haven't made any bookings yet."}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {getFilteredBookings().map((booking) => (
                <Grid item xs={12} md={6} lg={4} key={booking._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6 }
                    }}
                    onClick={() => handleViewDetails(booking)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center">
                          {getServiceIcon(booking.serviceId?.type)}
                          <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                            {booking.serviceId?.name}
                          </Typography>
                        </Box>
                        <Chip
                          icon={getStatusIcon(booking.status)}
                          label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {booking.serviceId?.location || 'Location not specified'}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {booking.isTourReservation ? (
                            `Tour Date: ${formatDate(booking.tourDate || booking.checkInDate)}`
                          ) : booking.isLegacyVehicle ? (
                            `Pickup: ${formatDate(booking.checkInDate)} - Return: ${formatDate(booking.checkOutDate)}`
                          ) : (
                            <>
                              {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                              {booking.checkInDate !== booking.checkOutDate && (
                                <span> ({calculateDays(booking.checkInDate, booking.checkOutDate)} days)</span>
                              )}
                            </>
                          )}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={2}>
                        <Group fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {booking.isLegacyVehicle ? (
                            <>
                              {booking.needDriver ? 'With Driver' : 'Self Drive'}
                              {booking.vehicleNumber && ` • ${booking.vehicleNumber}`}
                            </>
                          ) : (
                            <>
                              {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                              {booking.rooms && ` • ${booking.rooms} ${booking.rooms === 1 ? 'Room' : 'Rooms'}`}
                            </>
                          )}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <AttachMoney fontSize="small" color="action" />
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                            Rs. {booking.totalAmount?.toLocaleString()}
                          </Typography>
                        </Box>
                        {(booking.confirmationNumber || booking.transactionId) && (
                          <Typography variant="caption" color="text.secondary">
                            #{booking.confirmationNumber || booking.transactionId}
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Booked on {formatDate(booking.createdAt)}
                      </Typography>

                      {/* Delete button for cancelled or completed bookings */}
                      {(booking.status === 'cancelled' || booking.status === 'completed' || new Date(booking.checkOutDate) < new Date()) && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<Delete />}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              handleDeleteBooking(booking._id);
                            }}
                            sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            Delete
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Booking Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            {selectedBooking && getServiceIcon(selectedBooking.serviceId?.type)}
            <Typography variant="h5" sx={{ ml: 1, fontWeight: 'bold' }}>
              {selectedBooking?.serviceId?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  icon={getStatusIcon(selectedBooking.status)}
                  label={selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  color={getStatusColor(selectedBooking.status)}
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              {(selectedBooking.confirmationNumber || selectedBooking.transactionId) && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedBooking.isLegacyVehicle ? 'Transaction ID' : 'Confirmation Number'}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {selectedBooking.confirmationNumber || selectedBooking.transactionId}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {selectedBooking.isTourReservation ? 'Tour Date' : 
                   selectedBooking.isLegacyVehicle ? 'Pickup Date' : 'Check-in Date'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {formatDate(selectedBooking.isTourReservation ? 
                    (selectedBooking.tourDate || selectedBooking.checkInDate) : 
                    selectedBooking.checkInDate)}
                </Typography>
              </Grid>

              {!selectedBooking.isTourReservation && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedBooking.isLegacyVehicle ? 'Return Date' : 'Check-out Date'}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {formatDate(selectedBooking.checkOutDate)}
                  </Typography>
                </Grid>
              )}

              {/* Vehicle-specific fields */}
              {selectedBooking.isLegacyVehicle && (
                <>
                  {selectedBooking.vehicleNumber && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Vehicle Number</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {selectedBooking.vehicleNumber}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Driver Required</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {selectedBooking.needDriver ? 'Yes' : 'No (Self Drive)'}
                    </Typography>
                  </Grid>
                </>
              )}

              {/* Hotel/Service/Tour-specific fields */}
              {!selectedBooking.isLegacyVehicle && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Guests</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {selectedBooking.guests} {selectedBooking.guests === 1 ? 'Guest' : 'Guests'}
                    </Typography>
                  </Grid>

                  {selectedBooking.rooms && !selectedBooking.isTourReservation && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Rooms</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {selectedBooking.rooms} {selectedBooking.rooms === 1 ? 'Room' : 'Rooms'}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Rs. {selectedBooking.totalAmount?.toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Booking Date</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {formatDate(selectedBooking.createdAt)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Contact Information</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {selectedBooking.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedBooking.customerEmail} • {selectedBooking.customerPhone}
                </Typography>
              </Grid>

              {selectedBooking.specialRequests && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Special Requests</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {selectedBooking.specialRequests}
                  </Typography>
                </Grid>
              )}

              {selectedBooking.rejectionReason && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Cancellation Reason:</Typography>
                    <Typography variant="body2">{selectedBooking.rejectionReason}</Typography>
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  {selectedBooking.isLegacyVehicle ? 'Vehicle Owner Information' : 'Provider Information'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {selectedBooking.providerId?.businessName || selectedBooking.providerId?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedBooking.providerId?.businessEmail} • {selectedBooking.providerId?.businessPhone}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBookings; 
