import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider
} from '@mui/material';
import {
  HourglassEmpty,
  CheckCircle,
  Cancel,
  Info
} from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const ReservationStatusModal = ({ open, onClose, reservationId }) => {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && reservationId) {
      loadReservationStatus();
    }
  }, [open, reservationId]);

  const loadReservationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reservations/${reservationId}/status`);
      const data = await response.json();
      setReservation(data);
    } catch (error) {
      console.error('Error loading reservation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <HourglassEmpty color="warning" />;
      case 'approved':
        return <CheckCircle color="success" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <Info />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your reservation is being reviewed by the service provider. Please wait for confirmation.';
      case 'approved':
        return 'Great! Your reservation has been approved. You will receive confirmation details via email.';
      case 'rejected':
        return 'Sorry, your reservation has been declined. Please try different dates or contact the provider.';
      default:
        return 'Unknown status';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="reservation-status-modal"
    >
      <Box sx={style}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Reservation Status
        </Typography>

        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : reservation ? (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {getStatusIcon(reservation.status)}
              <Typography variant="h6" sx={{ mt: 1 }}>
                <Chip
                  label={reservation.status.toUpperCase()}
                  color={getStatusColor(reservation.status)}
                  size="large"
                />
              </Typography>
            </Box>

            <Alert severity={getStatusColor(reservation.status)} sx={{ mb: 3 }}>
              {getStatusMessage(reservation.status)}
            </Alert>

            <Typography variant="h6" gutterBottom>
              Reservation Details
            </Typography>

            <List>
              <ListItem>
                <ListItemText
                  primary="Service"
                  secondary={reservation.serviceName}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Date"
                  secondary={reservation.date}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Total Amount"
                  secondary={`$${reservation.totalAmount}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Reservation ID"
                  secondary={reservation.id}
                />
              </ListItem>
              {reservation.status === 'approved' && (
                <>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Confirmation Number"
                      secondary={reservation.confirmationNumber}
                    />
                  </ListItem>
                </>
              )}
              {reservation.status === 'rejected' && reservation.rejectionReason && (
                <>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Reason"
                      secondary={reservation.rejectionReason}
                    />
                  </ListItem>
                </>
              )}
            </List>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="contained" onClick={onClose}>
                Close
              </Button>
              {reservation.status === 'pending' && (
                <Button
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={loadReservationStatus}
                >
                  Refresh Status
                </Button>
              )}
            </Box>
          </>
        ) : (
          <Alert severity="error">
            Unable to load reservation details. Please try again.
          </Alert>
        )}
      </Box>
    </Modal>
  );
};

export default ReservationStatusModal; 