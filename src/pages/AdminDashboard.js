import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../context/authContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import TravelAdvisor from '../components/chat/TravelAdvisor';
import { io } from 'socket.io-client';
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
  Divider,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  AppBar,
  Toolbar,
  Menu,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  People,
  Business,
  Assignment,
  Dashboard,
  Edit,
  Delete,
  Add,
  Home,
  Notifications,
  Message,
  Lock,
  Settings,
  ExitToApp,
  Search,
  FilterList,
  Refresh,
  VerifiedUser as VerifiedUserIcon,
  GppMaybe as GppMaybeIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [providerRequests, setProviderRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [chatNotifications, setChatNotifications] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    activeProviders: 0,
    totalServices: 0,
    totalReservations: 0,
    unreadMessages: 0,
    unreadContactMessages: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [openRealTimeChatDialog, setOpenRealTimeChatDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Real-time chat state
  const [allChats, setAllChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const socket = useRef();
  const messagesEndRef = useRef(null);
  
  // Community posts state
  const [communityPosts, setCommunityPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Service form data
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    type: '',
    price: '',
    location: '',
    providerId: ''
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
        loadContactMessages(),
        loadChatNotifications(),
        loadStats(),
        loadCommunityPosts()
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

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (user?.isAdmin) {
      const interval = setInterval(() => {
        loadChatNotifications();
        loadStats();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Scroll to bottom when chat messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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
      const response = await fetch(`/api/admin/users?search=${searchTerm}&userType=${filterType}`, {
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
      const response = await fetch(`/api/admin/services?search=${searchTerm}&serviceType=${filterType}`, {
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



  const loadContactMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact-messages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setContactMessages(result.data);
      } else {
        console.error('Failed to load contact messages:', result.message);
      }
    } catch (error) {
      console.error('Error loading contact messages:', error);
    }
  };

  const loadChatNotifications = async () => {
    try {
      const response = await fetch('/api/admin/chat/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setChatNotifications(result.data);
      } else {
        console.error('Failed to load chat notifications:', result.message);
      }
    } catch (error) {
      console.error('Error loading chat notifications:', error);
    }
  };

  // Real-time chat functions
  const initializeSocket = () => {
    socket.current = io('https://travelly-backend-27bn.onrender.com');
    socket.current.emit('setup', user);
    
    socket.current.on('message received', (newMessage) => {
      if (selectedChat && selectedChat._id === newMessage.chat._id) {
        setChatMessages(prev => [...prev, newMessage]);
      }
    });
  };

  const loadAllChats = async () => {
    try {
      setChatLoading(true);
      const response = await fetch('/api/chat', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAllChats(data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const loadChatMessages = async (chatId) => {
    try {
      setChatLoading(true);
      const response = await fetch(`/api/message/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setChatMessages(data);
      socket.current?.emit('join chat', chatId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          chatId: selectedChat._id
        })
      });
      
      const data = await response.json();
      setChatMessages(prev => [...prev, data]);
      setNewMessage('');
      socket.current?.emit('new message', data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    loadChatMessages(chat._id);
  };

  const getOtherUser = (chatUsers) => {
    return chatUsers?.find(chatUser => chatUser._id !== user._id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCommunityPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await fetch('/api/community/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setCommunityPosts(result.posts);
      } else {
        console.error('Failed to load community posts:', result.message);
      }
    } catch (error) {
      console.error('Error loading community posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This post will be permanently deleted. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/community/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setCommunityPosts(prev => prev.filter(post => post._id !== postId));
          Swal.fire('Deleted!', 'Post has been deleted successfully.', 'success');
        } else {
          throw new Error(data.message || 'Failed to delete post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        Swal.fire('Error!', 'Failed to delete post. Please try again.', 'error');
      }
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

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/service-provider-requests/${selectedRequest._id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        // Close dialog
        setOpenRequestDialog(false);
        setSelectedRequest(null);
        
        // Refresh the requests list
        await loadProviderRequests();
        
        // Show success message
        setSnackbar({ 
          open: true, 
          message: 'Service provider request approved successfully!', 
          severity: 'success' 
        });
      } else {
        throw new Error(result.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error approving request: ' + error.message, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      setSnackbar({ 
        open: true, 
        message: 'Please provide a rejection reason', 
        severity: 'warning' 
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/service-provider-requests/${selectedRequest._id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const result = await response.json();

      if (result.success) {
        // Close dialogs
        setOpenRejectDialog(false);
        setOpenRequestDialog(false);
        setSelectedRequest(null);
        setRejectionReason('');
        
        // Refresh the requests list
        await loadProviderRequests();
        
        // Show success message
        setSnackbar({ 
          open: true, 
          message: 'Service provider request rejected successfully!', 
          severity: 'success' 
        });
      } else {
        throw new Error(result.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error rejecting request: ' + error.message, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setOpenPasswordDialog(true);
  };

  const handleToggleVerification = async (userId, isEmailVerified) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verification`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isEmailVerified })
      });

      const result = await response.json();

      if (result.success) {
        // Update user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, isEmailVerified }
              : user
          )
        );

        Swal.fire({
          title: 'Success!',
          text: result.message,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update verification status',
        icon: 'error'
      });
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setServiceFormData({
      name: service.name || '',
      description: service.description || '',
      type: service.type || '',
      price: service.price || '',
      location: service.location || '',
      providerId: service.providerId?._id || ''
    });
    setOpenServiceDialog(true);
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setServiceFormData({
      name: '',
      description: '',
      type: '',
      price: '',
      location: '',
      providerId: ''
    });
    setOpenServiceDialog(true);
  };

  const handleEditUser = (user) => {
    // For now, just show an alert. Can be enhanced to open an edit dialog
    Swal.fire({
      title: 'Edit User',
      text: `Edit functionality for ${user.name} can be implemented here`,
      icon: 'info'
    });
  };

  const submitPasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Password must be at least 6 characters long'
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Password updated successfully'
        });
        setOpenPasswordDialog(false);
        setNewPassword('');
        setSelectedUser(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update password'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          Swal.fire('Deleted!', 'User has been deleted.', 'success');
          loadUsers();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete user', 'error');
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          Swal.fire('Deleted!', 'Service has been deleted.', 'success');
          loadServices();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete service', 'error');
      }
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    const result = await Swal.fire({
      title: 'Delete Reservation?',
      text: 'This action cannot be undone. The reservation will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/reservations/${reservationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          Swal.fire('Deleted!', 'Reservation has been deleted.', 'success');
          loadReservations();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        Swal.fire('Error!', error.message || 'Failed to delete reservation', 'error');
      }
    }
  };

  const submitServiceForm = async () => {
    try {
      const url = selectedService 
        ? `/api/admin/services/${selectedService._id}`
        : '/api/admin/services';
      
      const method = selectedService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceFormData)
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Service ${selectedService ? 'updated' : 'created'} successfully`
        });
        setOpenServiceDialog(false);
        loadServices();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || `Failed to ${selectedService ? 'update' : 'create'} service`
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const renderNavBar = () => (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Travel Buddy Admin Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Home Button */}
          <Button
            color="inherit"
            startIcon={<Home />}
            component={Link}
            to="/"
            sx={{ textTransform: 'none' }}
          >
            Home
          </Button>

          {/* Chat Notifications */}
          <Tooltip title="Real-time Chat Messages">
            <Badge badgeContent={stats.unreadMessages} color="error">
              <IconButton 
                color="inherit" 
                onClick={() => {
                  setOpenRealTimeChatDialog(true);
                  initializeSocket();
                  loadAllChats();
                }}
              >
                <Message />
              </IconButton>
            </Badge>
          </Tooltip>

                    {/* General Notifications */}
          <Tooltip title="Contact Messages">
            <Badge badgeContent={stats.unreadContactMessages} color="error">
              <IconButton 
                color="inherit"
                onClick={() => {
                  // Show contact messages in a dialog
                  setOpenContactDialog(true);
                }}
              >
                <Notifications />
              </IconButton>
            </Badge>
          </Tooltip>

          {/* Refresh Button */}
          <Tooltip title="Refresh All Data">
            <IconButton 
              color="inherit" 
              onClick={() => {
                loadData();
                setSnackbar({
                  open: true,
                  message: 'Data refreshed successfully',
                  severity: 'success'
                });
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Avatar src={user?.pic} sx={{ width: 32, height: 32 }}>
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => setAnchorEl(null)}>
              <Settings sx={{ mr: 2 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );

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
                <Typography variant="h4">{stats.totalServices}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Services
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

      {/* Chat Notifications Card */}
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Chat Messages
            </Typography>
            {chatNotifications.length > 0 ? (
              <List>
                {chatNotifications.slice(0, 5).map((notification) => (
                  <ListItem key={notification.chatId}>
                    <ListItemText
                      primary={`${notification.unreadCount} unread messages`}
                      secondary={`From: ${notification.users?.map(u => u.name).join(', ')}`}
                    />
                    <Badge badgeContent={notification.unreadCount} color="error" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No unread messages</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Contact Messages Card */}
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Contact Messages
            </Typography>
            {contactMessages.length > 0 ? (
              <List>
                {contactMessages.slice(0, 5).map((message) => (
                  <ListItem key={message._id}>
                    <ListItemText
                      primary={message.name}
                      secondary={message.subject}
                    />
                    <Chip 
                      label={message.status} 
                      color={getStatusColor(message.status)} 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No contact messages</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderProviderRequests = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Service Provider Requests</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applicant Name</TableCell>
              <TableCell>Provider Type</TableCell>
              <TableCell>Submitted Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providerRequests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{`${request.firstName || 'N/A'} ${request.lastName || 'N/A'}`}</TableCell>
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
    </Box>
  );

  const renderUsers = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">User Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="provider">Provider</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={loadUsers} startIcon={<FilterList />}>
            Apply Filter
          </Button>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>User Type</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Email Verified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={user.pic} sx={{ mr: 2 }}>
                      {user.name?.charAt(0)}
                    </Avatar>
                    {user.name}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.type || 'Customer'} 
                    size="small"
                    color={user.isAdmin ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell>{user.mobile}</TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={user.isEmailVerified ? 'Verified' : 'Unverified'}
                      color={user.isEmailVerified ? 'success' : 'warning'}
                      size="small"
                    />
                    <Tooltip title={user.isEmailVerified ? 'Mark as Unverified' : 'Mark as Verified'}>
                      <IconButton
                        onClick={() => handleToggleVerification(user._id, !user.isEmailVerified)}
                        size="small"
                        color={user.isEmailVerified ? 'warning' : 'success'}
                      >
                        {user.isEmailVerified ? (
                          <VerifiedUserIcon fontSize="small" />
                        ) : (
                          <GppMaybeIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="Change Password">
                    <IconButton onClick={() => handlePasswordChange(user)}>
                      <Lock />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit User">
                    <IconButton onClick={() => handleEditUser(user)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton 
                      onClick={() => handleDeleteUser(user._id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderServices = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Service Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateService}
          >
            Add Service
          </Button>
          <TextField
            size="small"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Service Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Service Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="vehicle">Vehicle</MenuItem>
              <MenuItem value="tour">Tour</MenuItem>
              <MenuItem value="restaurant">Restaurant</MenuItem>
              <MenuItem value="event">Event</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={loadServices} startIcon={<FilterList />}>
            Apply Filter
          </Button>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service._id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>
                  <Chip label={service.type} size="small" />
                </TableCell>
                <TableCell>
                  {service.providerId?.businessName || service.providerId?.name || 'N/A'}
                </TableCell>
                <TableCell>Rs. {service.price?.toLocaleString()}</TableCell>
                <TableCell>{service.location}</TableCell>
                <TableCell>
                  <Chip
                    label={service.status || 'Active'}
                    color={getStatusColor(service.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Service">
                    <IconButton onClick={() => handleEditService(service)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Service">
                    <IconButton 
                      onClick={() => handleDeleteService(service._id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderReservations = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Reservation Management</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation._id}>
                <TableCell>
                  {reservation.customerId?.name || reservation.customerName}
                </TableCell>
                <TableCell>
                  {reservation.serviceId?.name}
                  <br />
                  <Chip label={reservation.serviceId?.type} size="small" />
                </TableCell>
                <TableCell>
                  {reservation.providerId?.businessName || reservation.providerId?.name}
                </TableCell>
                <TableCell>
                  {new Date(reservation.checkInDate).toLocaleDateString()}
                </TableCell>
                <TableCell>Rs. {reservation.totalAmount?.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={reservation.status || 'Pending'}
                    color={getStatusColor(reservation.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Delete Reservation">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteReservation(reservation._id)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderCommunityPosts = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Community Posts Management</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Author</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Likes</TableCell>
              <TableCell>Replies</TableCell>
              <TableCell>Posted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {postsLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              communityPosts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={post.user?.pic} sx={{ width: 24, height: 24 }}>
                        {post.user?.name?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {post.user?.name || 'Unknown User'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.content}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {post.location ? (
                      <Chip label={post.location} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={post.likes?.length || 0} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Chip label={post.replies?.length || 0} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete Post">
                      <IconButton
                        color="error"
                        onClick={() => handleDeletePost(post._id)}
                        size="small"
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
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {renderNavBar()}

      <Paper sx={{ mt: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Provider Requests" />
          <Tab label="Users" />
          <Tab label="Services" />
          <Tab label="Reservations" />
          <Tab label="Community Posts" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && renderOverview()}
          {currentTab === 1 && renderProviderRequests()}
          {currentTab === 2 && renderUsers()}
          {currentTab === 3 && renderServices()}
          {currentTab === 4 && renderReservations()}
          {currentTab === 5 && renderCommunityPosts()}
        </Box>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change User Password</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Changing password for: {selectedUser?.name}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Password must be at least 6 characters long"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={submitPasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Service Dialog */}
      <Dialog 
        open={openServiceDialog} 
        onClose={() => setOpenServiceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedService ? 'Edit Service' : 'Create Service'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Service Name"
                fullWidth
                value={serviceFormData.name}
                onChange={(e) => setServiceFormData({
                  ...serviceFormData,
                  name: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={serviceFormData.description}
                onChange={(e) => setServiceFormData({
                  ...serviceFormData,
                  description: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={serviceFormData.type}
                  onChange={(e) => setServiceFormData({
                    ...serviceFormData,
                    type: e.target.value
                  })}
                  label="Service Type"
                >
                  <MenuItem value="hotel">Hotel</MenuItem>
                  <MenuItem value="vehicle">Vehicle</MenuItem>
                  <MenuItem value="tour">Tour</MenuItem>
                  <MenuItem value="restaurant">Restaurant</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={serviceFormData.price}
                onChange={(e) => setServiceFormData({
                  ...serviceFormData,
                  price: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location"
                fullWidth
                value={serviceFormData.location}
                onChange={(e) => setServiceFormData({
                  ...serviceFormData,
                  location: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Provider ID"
                fullWidth
                value={serviceFormData.providerId}
                onChange={(e) => setServiceFormData({
                  ...serviceFormData,
                  providerId: e.target.value
                })}
                helperText="Enter the Provider's User ID"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenServiceDialog(false)}>Cancel</Button>
          <Button onClick={submitServiceForm} variant="contained">
            {selectedService ? 'Update' : 'Create'} Service
          </Button>
        </DialogActions>
      </Dialog>

      {/* Service Provider Request View Dialog */}
      <Dialog 
        open={openRequestDialog} 
        onClose={() => setOpenRequestDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Service Provider Request Details
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Service Type
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Service Type:</strong> {selectedRequest.providerType?.charAt(0).toUpperCase() + selectedRequest.providerType?.slice(1)}
              </Typography>
              
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                Personal Information
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Name:</strong> {selectedRequest.firstName} {selectedRequest.lastName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>CNIC:</strong> {selectedRequest.cnic}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Mobile:</strong> {selectedRequest.mobileForOTP}
              </Typography>

              {/* Service-specific details */}
              {selectedRequest.providerType === 'hotel' && (
                <>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                    Hotel Details
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Hotel Name:</strong> {selectedRequest.hotelName}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Property Type:</strong> {selectedRequest.propertyType}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Address:</strong> {selectedRequest.hotelAddress}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Number of Rooms:</strong> {selectedRequest.numberOfRooms}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Star Rating:</strong> {selectedRequest.starRating}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Price Range:</strong> Rs. {selectedRequest.priceRangeMin} - Rs. {selectedRequest.priceRangeMax} per night
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Contact:</strong> {selectedRequest.hotelPhone} | {selectedRequest.hotelEmail}
                  </Typography>
                </>
              )}

              {selectedRequest.providerType === 'restaurant' && (
                <>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                    Restaurant Details
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Restaurant Name:</strong> {selectedRequest.restaurantName}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Address:</strong> {selectedRequest.restaurantAddress}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Cuisine Type:</strong> {selectedRequest.cuisineType}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Seating Capacity:</strong> {selectedRequest.seatingCapacity}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Contact:</strong> {selectedRequest.restaurantPhone} | {selectedRequest.restaurantEmail}
                  </Typography>
                </>
              )}

              {selectedRequest.providerType === 'event' && (
                <>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                    Event Details
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Event Name:</strong> {selectedRequest.eventName}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Address:</strong> {selectedRequest.eventAddress}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Contact:</strong> {selectedRequest.eventPhone} | {selectedRequest.eventEmail}
                  </Typography>
                </>
              )}

              {selectedRequest.providerType === 'vehicle' && (
                <>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                    Vehicle Rental Shop Details
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Shop Name:</strong> {selectedRequest.shopName}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Address:</strong> {selectedRequest.shopAddress}, {selectedRequest.shopCity}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Fleet Size:</strong> {selectedRequest.fleetSize} vehicles
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Contact:</strong> {selectedRequest.shopPhone}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Description:</strong> {selectedRequest.shopDescription}
                  </Typography>
                </>
              )}

              {selectedRequest.providerType === 'tour' && (
                <>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                    Tour Operator Registration
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Registration Type:</strong> Tour Operator (Simplified)
                  </Typography>
                </>
              )}

              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                Documents
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>CNIC Copy:</strong> {selectedRequest.documents?.cnicCopy ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.open(selectedRequest.documents.cnicCopy, '_blank')}
                      sx={{ mr: 2 }}
                    >
                      View Full Size
                    </Button>
                    <img 
                      src={selectedRequest.documents.cnicCopy} 
                      alt="CNIC Preview"
                      style={{ width: '100px', height: '60px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => window.open(selectedRequest.documents.cnicCopy, '_blank')}
                    />
                  </Box>
                ) : '❌ Not uploaded'}
              </Typography>
              
              {/* Service-specific documents */}
              {selectedRequest.providerType === 'hotel' && selectedRequest.documents?.licensePhoto && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Hotel Front Photo:</strong>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.open(selectedRequest.documents.licensePhoto, '_blank')}
                      sx={{ mr: 2 }}
                    >
                      View Full Size
                    </Button>
                    <img 
                      src={selectedRequest.documents.licensePhoto} 
                      alt="Hotel Photo Preview"
                      style={{ width: '100px', height: '60px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => window.open(selectedRequest.documents.licensePhoto, '_blank')}
                    />
                  </Box>
                </Typography>
              )}
              
              {selectedRequest.providerType === 'tour' && selectedRequest.documents?.licensePhoto && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>License Photo:</strong>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.open(selectedRequest.documents.licensePhoto, '_blank')}
                      sx={{ mr: 2 }}
                    >
                      View Full Size
                    </Button>
                    <img 
                      src={selectedRequest.documents.licensePhoto} 
                      alt="License Preview"
                      style={{ width: '100px', height: '60px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => window.open(selectedRequest.documents.licensePhoto, '_blank')}
                    />
                  </Box>
                </Typography>
              )}
              
              {selectedRequest.providerType === 'restaurant' && selectedRequest.documents?.restaurantPhotos && selectedRequest.documents.restaurantPhotos.length > 0 && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Restaurant Photos:</strong>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedRequest.documents.restaurantPhotos.map((photo, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img 
                          src={photo} 
                          alt={`Restaurant Photo ${index + 1}`}
                          style={{ width: '100px', height: '60px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', marginBottom: '4px' }}
                          onClick={() => window.open(photo, '_blank')}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(photo, '_blank')}
                          sx={{ fontSize: '10px', minWidth: '60px' }}
                        >
                          Photo {index + 1}
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Typography>
              )}
              
              {selectedRequest.providerType === 'event' && selectedRequest.documents?.eventPhotos && selectedRequest.documents.eventPhotos.length > 0 && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Event Photos:</strong>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedRequest.documents.eventPhotos.map((photo, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img 
                          src={photo} 
                          alt={`Event Photo ${index + 1}`}
                          style={{ width: '100px', height: '60px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', marginBottom: '4px' }}
                          onClick={() => window.open(photo, '_blank')}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(photo, '_blank')}
                          sx={{ fontSize: '10px', minWidth: '60px' }}
                        >
                          Photo {index + 1}
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Typography>
              )}
              
              {selectedRequest.providerType === 'vehicle' && selectedRequest.documents?.vehiclePhotos && selectedRequest.documents.vehiclePhotos.length > 0 && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Vehicle Photos:</strong>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedRequest.documents.vehiclePhotos.map((photo, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img 
                          src={photo} 
                          alt={`Vehicle Photo ${index + 1}`}
                          style={{ width: '100px', height: '60px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', marginBottom: '4px' }}
                          onClick={() => window.open(photo, '_blank')}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(photo, '_blank')}
                          sx={{ fontSize: '10px', minWidth: '60px' }}
                        >
                          Photo {index + 1}
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Typography>
              )}
              
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                Application Status
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong> {selectedRequest.status?.charAt(0).toUpperCase() + selectedRequest.status?.slice(1)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Submitted:</strong> {new Date(selectedRequest.submittedAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Close</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button 
                color="error" 
                onClick={() => {
                  setRejectionReason('');
                  setOpenRejectDialog(true);
                }}
              >
                Reject
              </Button>
              <Button 
                variant="contained" 
                color="success"
                onClick={handleApproveRequest}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Approve'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog 
        open={openRejectDialog} 
        onClose={() => setOpenRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Service Provider Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this service provider request. This will be sent to the applicant.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please explain why this request is being rejected..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleRejectRequest} 
            color="error" 
            variant="contained"
            disabled={loading || !rejectionReason.trim()}
          >
            {loading ? 'Processing...' : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Real-time Chat Dialog */}
      <Dialog 
        open={openRealTimeChatDialog} 
        onClose={() => setOpenRealTimeChatDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '800px'
          }
        }}
      >
        <DialogTitle>
          Real-time Chat Messages
          <Button 
            onClick={() => setOpenRealTimeChatDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Cancel />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', height: '100%' }}>
          <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Chat List Sidebar */}
            <Box sx={{ width: '30%', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">All Chats</Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {chatLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  allChats.map((chat) => {
                    const otherUser = getOtherUser(chat.users);
                    return (
                      <Box
                        key={chat._id}
                        onClick={() => handleChatSelect(chat)}
                        sx={{
                          p: 2,
                          borderBottom: 1,
                          borderColor: 'divider',
                          cursor: 'pointer',
                          backgroundColor: selectedChat?._id === chat._id ? 'action.selected' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={otherUser?.pic} sx={{ width: 32, height: 32 }}>
                            {otherUser?.name?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap>
                              {otherUser?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {chat.latestMessage?.content || 'No messages yet'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>

            {/* Chat Messages Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={getOtherUser(selectedChat.users)?.pic} sx={{ width: 32, height: 32 }}>
                        {getOtherUser(selectedChat.users)?.name?.charAt(0)}
                      </Avatar>
                      <Typography variant="h6">
                        {getOtherUser(selectedChat.users)?.name || 'Unknown User'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Messages Area */}
                  <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {chatMessages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender._id === user._id ? 'flex-end' : 'flex-start',
                          mb: 1
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: message.sender._id === user._id ? 'primary.main' : 'grey.100',
                            color: message.sender._id === user._id ? 'white' : 'text.primary'
                          }}
                        >
                          <Typography variant="body2">{message.content}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Message Input */}
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: 8 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={chatLoading}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={!newMessage.trim() || chatLoading}
                      >
                        Send
                      </Button>
                    </form>
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    Select a chat to start messaging
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* AI Chat Dialog */}
      <Dialog 
        open={openChatDialog} 
        onClose={() => setOpenChatDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: '600px'
          }
        }}
      >
        <DialogTitle>
          AI Travel Advisor Chat
          <Button 
            onClick={() => setOpenChatDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Cancel />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <TravelAdvisor isModal={true} onClose={() => setOpenChatDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Contact Messages Dialog */}
      <Dialog 
        open={openContactDialog} 
        onClose={() => setOpenContactDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Contact Messages
          <Button 
            onClick={() => setOpenContactDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Cancel />
          </Button>
        </DialogTitle>
        <DialogContent>
          {contactMessages.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              {contactMessages.map((message) => (
                <Card key={message._id} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6">
                      {message.userId?.name || 'Anonymous'}
                    </Typography>
                    <Chip 
                      label={message.status} 
                      color={message.status === 'new' ? 'error' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {message.userId?.email || 'No email provided'}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {message.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(message.createdAt).toLocaleString()}
                  </Typography>
                  {message.status === 'new' && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/admin/contact-messages/${message._id}`, {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('token')}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ status: 'read' })
                          });
                          if (response.ok) {
                            loadContactMessages();
                            loadStats();
                          }
                        } catch (error) {
                          console.error('Error marking message as read:', error);
                        }
                      }}
                    >
                      Mark as Read
                    </Button>
                  )}
                </Card>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No contact messages found
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard; 