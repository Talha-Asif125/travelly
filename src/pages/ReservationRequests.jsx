import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Hotel,
  DirectionsCar
} from '@mui/icons-material';
import Swal from 'sweetalert2';

const ReservationRequests = () => {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [selectedReservationType, setSelectedReservationType] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reservation type options
  const reservationTypeOptions = [
    { value: 'all', label: 'All Reservations', icon: '📋' },
    { value: 'hotel', label: 'Hotel Reservations', icon: '🏨' },
    { value: 'vehicle', label: 'Vehicle Reservations', icon: '🚗' }
  ];

  useEffect(() => {
    loadReservations();
  }, [selectedReservationType]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      let url = '/api/reservations/provider';
      
      if (selectedReservationType === 'hotel') {
        url += '?type=service';
      } else if (selectedReservationType === 'vehicle') {
        url += '?type=vehicle';
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setReservations(result.data || []);
      } else {
        setError(result.message || 'Failed to load reservations');
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError('Error loading reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReservation = async (reservation) => {
    try {
      let response;
      
      if (reservation.isLegacyVehicle) {
        // Handle legacy vehicle reservations
        response = await fetch(`/api/vehiclereservation/${reservation._id}/status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            status: 'confirmed'
          })
        });
      } else {
        // Handle new service reservations
        response = await fetch(`/api/reservations/${reservation._id}/status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            status: 'confirmed'
          })
        });
      }

      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Reservation Approved!',
          text: 'The reservation has been confirmed successfully.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#41A4FF',
        });
        loadReservations();
      } else {
        setError(result.message || 'Failed to approve reservation');
      }
    } catch (error) {
      console.error('Error approving reservation:', error);
      setError('Error approving reservation');
    }
  };

  const handleRejectReservation = (reservation) => {
    setSelectedReservation(reservation);
    setOpenRejectDialog(true);
  };

  const confirmRejectReservation = async () => {
    try {
      let response;
      
      if (selectedReservation.isLegacyVehicle) {
        // Handle legacy vehicle reservations
        response = await fetch(`/api/vehiclereservation/${selectedReservation._id}/status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            status: 'cancelled',
            rejectionReason 
          })
        });
      } else {
        // Handle new service reservations
        response = await fetch(`/api/reservations/${selectedReservation._id}/status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            status: 'cancelled',
            rejectionReason 
          })
        });
      }

      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Reservation Rejected',
          text: 'The reservation has been cancelled successfully.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#41A4FF',
        });

        setOpenRejectDialog(false);
        setRejectionReason('');
        setSelectedReservation(null);
        loadReservations();
      } else {
        setError(result.message || 'Failed to reject reservation');
      }
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      setError('Error rejecting reservation');
    }
  };

  const getFilteredReservations = () => {
    if (selectedReservationType === 'all') {
      return reservations;
    } else if (selectedReservationType === 'hotel') {
      return reservations.filter(reservation => 
        reservation.serviceId?.type === 'hotel' && !reservation.isLegacyVehicle
      );
    } else if (selectedReservationType === 'vehicle') {
      return reservations.filter(reservation => 
        reservation.serviceId?.type === 'vehicle' || reservation.isLegacyVehicle
      );
    }
    return reservations;
  };

  const filteredReservations = getFilteredReservations();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reservation Requests
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your incoming reservation requests
        </Typography>
      </Box>

      {/* Reservation Type Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6">Filter by Type:</Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Reservation Type</InputLabel>
            <Select
              value={selectedReservationType}
              label="Reservation Type"
              onChange={(e) => setSelectedReservationType(e.target.value)}
            >
              {reservationTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Check-in / Pickup</TableCell>
                <TableCell>Check-out / Return</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">
                      Loading reservations...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">
                      No reservations found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => (
                  <TableRow key={reservation._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {reservation.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reservation.customerEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {reservation.serviceId?.type === 'vehicle' || reservation.isLegacyVehicle ? (
                          <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                        ) : (
                          <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                        )}
                        <Typography variant="body2">
                          {reservation.serviceId?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(reservation.checkInDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(reservation.checkOutDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Guests: {reservation.guests || 1}
                        </Typography>
                        {reservation.isLegacyVehicle && (
                          <>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              Driver: {reservation.needDriver ? 'Yes' : 'No'}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        Rs. {reservation.totalAmount?.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={reservation.status}
                        color={
                          reservation.status === 'pending' ? 'warning' :
                          reservation.status === 'confirmed' ? 'success' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {reservation.status === 'pending' && (
                        <>
                          <IconButton
                            color="success"
                            onClick={() => handleApproveReservation(reservation)}
                            title="Approve"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleRejectReservation(reservation)}
                            title="Reject"
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                      {reservation.isLegacyVehicle && (
                        <Chip size="small" label="Legacy" variant="outlined" />
                      )}
                      <IconButton>
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Rejection Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Reservation</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please provide a reason for rejecting this reservation:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmRejectReservation} 
            variant="contained" 
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Reject Reservation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReservationRequests; 