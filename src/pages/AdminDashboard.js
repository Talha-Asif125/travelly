import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/authContext';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  Tabs,
  Tab,
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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  People,
  Business,
  Assignment,
  Dashboard
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [currentTab, setCurrentTab] = useState(0);
  const [providerRequests, setProviderRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    activeProviders: 0,
    totalReservations: 0
  });

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token available, skipping data load');
        return;
      }
      
      if (!user || !user.isAdmin) {
        console.log('User not admin, skipping data load');
        return;
      }
      
      console.log('Starting admin data load with token:', token?.substring(0, 20) + '...');
      setLoading(true);
      await Promise.all([
        loadProviderRequests(),
        loadUsers(),
        loadServices(),
        loadReservations(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check admin access
  useEffect(() => {
    console.log("AdminDashboard useEffect triggered");
    
    const token = localStorage.getItem('token');
    console.log('Admin access check:');
    console.log('Token exists:', !!token);
    console.log('User:', user);
    console.log('User isAdmin:', user?.isAdmin);
    
    if (!token) {
      setError('Authentication required. Please log in as an admin.');
      return;
    }
    
    if (!user || !user.isAdmin) {
      console.log('Current user:', user);
      setError('Admin access required. Please log in with admin credentials.');
      return;
    }
    
    // Clear any previous errors
    setError('');
    loadData();
  }, [user, loadData]);

  // Show error message if not admin
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Please contact your administrator if you believe you should have access to this page.
        </Typography>
      </Container>
    );
  }

  const loadProviderRequests = async () => {
    try {
      console.log('Loading provider requests...');
      const response = await fetch('/api/admin/service-provider-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Provider requests result:', result);
      
      if (result.success) {
        setProviderRequests(result.data);
        console.log('Loaded provider requests:', result.data);
      } else {
        console.error('Failed to load provider requests:', result.message);
      }
    } catch (error) {
      console.error('Error loading service provider requests:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
      } else {
        console.error('Failed to load users:', result.message);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch('/api/admin/services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setServices(result.data);
      } else {
        console.error('Failed to load services:', result.message);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadReservations = async () => {
    try {
      const response = await fetch('/api/admin/reservations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setReservations(result.data);
      } else {
        console.error('Failed to load reservations:', result.message);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('Failed to load stats:', result.message);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setOpenRequestDialog(true);
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/admin/service-provider-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`Provider request approved successfully: ${result.message}`);
        setOpenRequestDialog(false);
        loadProviderRequests();
        loadStats(); // Refresh stats after approval
      } else {
        console.error('Failed to approve request:', result.message);
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/admin/service-provider-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`Provider request rejected successfully: ${result.message}`);
        setOpenRequestDialog(false);
        setRejectionReason('');
        loadProviderRequests();
        loadStats(); // Refresh stats after rejection
      } else {
        console.error('Failed to reject request:', result.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.totalUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.pendingRequests}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Requests
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Business sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.activeProviders}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Providers
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Dashboard sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.totalReservations}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reservations
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderProviderRequests = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Business Name</TableCell>
            <TableCell>Provider Type</TableCell>
            <TableCell>Submitted Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {providerRequests.map((request) => (
            <TableRow key={request._id}>
              <TableCell>{request.businessName}</TableCell>
              <TableCell>
                <Chip label={request.providerType} size="small" />
              </TableCell>
              <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Chip
                  label={request.status}
                  color={getStatusColor(request.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleViewRequest(request)}>
                  <Visibility />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Provider Requests" />
          <Tab label="Users" />
          <Tab label="Services" />
          <Tab label="Reservations" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && renderOverview()}
          
          {currentTab === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Service Provider Requests
              </Typography>
              {renderProviderRequests()}
            </Box>
          )}

          {currentTab === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                User Management
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>User Type</TableCell>
                      <TableCell>Joined Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip label={user.userType || 'Customer'} size="small" />
                        </TableCell>
                        <TableCell>{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            color={user.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {currentTab === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Service Management
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Provider</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>
                          <Chip label={service.type} size="small" />
                        </TableCell>
                        <TableCell>{service.providerName}</TableCell>
                        <TableCell>${service.price}</TableCell>
                        <TableCell>
                          <Chip
                            label={service.status}
                            color={service.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {currentTab === 4 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Reservation Monitoring
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.customerName}</TableCell>
                        <TableCell>{reservation.serviceName}</TableCell>
                        <TableCell>{reservation.date}</TableCell>
                        <TableCell>${reservation.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={reservation.status}
                            color={getStatusColor(reservation.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Service Provider Request Review Dialog */}
      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Review Service Provider Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Business Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Business Name"
                      secondary={selectedRequest.businessName}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Service Type"
                      secondary={selectedRequest.providerType}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Business Email"
                      secondary={selectedRequest.businessEmail}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Registration Number"
                      secondary={selectedRequest.registrationNumber}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="License Number"
                      secondary={selectedRequest.licenseNumber}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Experience"
                      secondary={`${selectedRequest.experience} years`}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Service Details"
                      secondary={selectedRequest.serviceDetails}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              {selectedRequest.status === 'pending' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rejection Reason (if rejecting)"
                    multiline
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Close</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button
                color="error"
                onClick={() => handleRejectRequest(selectedRequest._id)}
                startIcon={<Cancel />}
              >
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={() => handleApproveRequest(selectedRequest._id)}
                startIcon={<CheckCircle />}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 