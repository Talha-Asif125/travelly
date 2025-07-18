import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
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
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  FilterList,
  Refresh,
  Search,
  Mail,
  MailOutline,
  CheckCircle,
  Cancel,
  Reply
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import AdminBackButton from '../../components/AdminBackButton';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await fetch(`/api/contact/admin?${params.toString()}`, {
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (result.success) {
        setMessages(result.data.messages);
        setPagination(result.data.pagination);
        setStats(result.data.stats);
      } else {
        setError(result.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/contact/admin/${messageId}`, {
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (result.success) {
        setSelectedMessage(result.data);
        setDetailsOpen(true);
        // Refresh the list to show updated status
        fetchMessages();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Failed to fetch message details'
        });
      }
    } catch (error) {
      console.error('Error fetching message details:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch message details'
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedMessage || !newStatus) return;

    try {
      const response = await fetch(`/api/contact/admin/${selectedMessage._id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Message status updated successfully'
        });
        setStatusUpdateOpen(false);
        setAdminNotes('');
        setNewStatus('');
        fetchMessages();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Failed to update status'
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update message status'
      });
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/contact/admin/${messageId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        const result = await response.json();

        if (result.success) {
          Swal.fire('Deleted!', 'Message has been deleted.', 'success');
          fetchMessages();
        } else {
          Swal.fire('Error!', result.message || 'Failed to delete message', 'error');
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        Swal.fire('Error!', 'Failed to delete message', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'error';
      case 'read': return 'warning';
      case 'replied': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <MailOutline />;
      case 'read': return <Mail />;
      case 'replied': return <Reply />;
      case 'resolved': return <CheckCircle />;
      default: return <Mail />;
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AdminBackButton />
      
      <Typography variant="h4" gutterBottom>
        Contact Messages
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              {stats.new || 0}
            </Typography>
            <Typography variant="body2">New Messages</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main">
              {stats.read || 0}
            </Typography>
            <Typography variant="body2">Read</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="info.main">
              {stats.replied || 0}
            </Typography>
            <Typography variant="body2">Replied</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              {stats.resolved || 0}
            </Typography>
            <Typography variant="body2">Resolved</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search messages..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'gray' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Messages</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="replied">Replied</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchMessages}
              fullWidth
              size="small"
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Messages Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow key={message._id}>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(message.status)}
                        label={message.status.toUpperCase()}
                        color={getStatusColor(message.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>
                      {message.subject || 'General Inquiry'}
                    </TableCell>
                    <TableCell>
                      {new Date(message.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewMessage(message._id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedMessage(message);
                            setNewStatus(message.status);
                            setAdminNotes(message.adminNotes || '');
                            setStatusUpdateOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteMessage(message._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={pagination.pages}
              page={pagination.current}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Message Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Message Details
          {selectedMessage && (
            <Chip
              icon={getStatusIcon(selectedMessage.status)}
              label={selectedMessage.status.toUpperCase()}
              color={getStatusColor(selectedMessage.status)}
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Name:</Typography>
                <Typography variant="body2" gutterBottom>{selectedMessage.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email:</Typography>
                <Typography variant="body2" gutterBottom>{selectedMessage.email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Subject:</Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedMessage.subject || 'General Inquiry'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Message:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {selectedMessage.message}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Date:</Typography>
                <Typography variant="body2">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              {selectedMessage.userId && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">User Account:</Typography>
                  <Typography variant="body2">
                    {selectedMessage.userId.name} ({selectedMessage.userId.email})
                  </Typography>
                </Grid>
              )}
              {selectedMessage.adminNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Admin Notes:</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.adminNotes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedMessage) {
                setNewStatus(selectedMessage.status);
                setAdminNotes(selectedMessage.adminNotes || '');
                setStatusUpdateOpen(true);
              }
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onClose={() => setStatusUpdateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Message Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="replied">Replied</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Admin Notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about this message..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContactMessages; 