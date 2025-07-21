import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Visibility,
  DirectionsCar,
  Hotel,
  Map,
  Business,
  Schedule,
  AttachMoney,
  Assessment,
  TrendingUp,
  AccountBalanceWallet,
  Tour,
  Restaurant,
  Event
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { notificationManager, NotificationTypes } from '../services/notificationService';
import { AuthContext } from '../context/authContext';
import ServiceEditModal from '../components/ServiceEditModal';

const ServiceProviderDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [services, setServices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerStatus, setProviderStatus] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewReservation, setViewReservation] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Service type options for the dashboard
  const serviceTypeOptions = [
    { value: 'all', label: 'All Services', icon: '🏢' },
    { value: 'hotel', label: 'Hotels', icon: '🏨' },
    { value: 'vehicle', label: 'Vehicles', icon: '🚗' },
    { value: 'tour', label: 'Tours', icon: '🗺️' },
    { value: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { value: 'event', label: 'Events', icon: '🎉' }
  ];

  useEffect(() => {
    if (user) {
      loadProviderStatus();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadServices();
      loadReservations();
    }
  }, [user, selectedServiceType]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadProviderStatus = async () => {
    try {
      const response = await fetch('/api/provider/services/status/me', {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setProviderStatus(result.data);
        // Set default service type to first approved type
        if (result.data.approvedTypes.length > 0) {
          setSelectedServiceType(result.data.approvedTypes[0]);
        }
      } else {
        setError(result.message || 'Failed to load provider status');
      }
    } catch (error) {
      console.error('Error loading provider status:', error);
      setError('Error loading provider status');
    }
  };

  const repairProviderData = async () => {
    try {
      setLoading(true);
      console.log('Attempting to repair provider data...');
      
      const response = await fetch('/api/provider/services/repair', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      console.log('Repair result:', result);
      
      if (result.success) {
        setError(''); // Clear any existing errors
        
        // Show repair results
        if (result.data.repairsMade.length > 0) {
          alert(`Data repaired successfully!\n\nRepairs made:\n${result.data.repairsMade.join('\n')}`);
        } else {
          alert('No repairs needed - your provider data is consistent.');
        }
        
        // Reload provider status
        await loadProviderStatus();
        await loadServices();
      } else {
        setError(result.message || 'Failed to repair provider data');
      }
    } catch (error) {
      console.error('Error repairing provider data:', error);
      setError('Error repairing provider data');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      let allServices = [];

      // Load all services from provider services API (includes tours, vehicles, etc.)
      try {
        const serviceType = selectedServiceType === 'all' ? '' : selectedServiceType;
        const servicesResponse = await fetch(`https://travelly-backend-27bn.onrender.com/api/provider/services?type=${serviceType}`, {
          headers: getAuthHeaders()
        });
        
        console.log('Loading services for type:', serviceType);
        
        if (servicesResponse.ok) {
          const servicesResult = await servicesResponse.json();
          console.log('Provider services response:', servicesResult);
          
          if (servicesResult.success) {
            const userServices = (servicesResult.data || []).map(service => ({
              ...service,
              status: service.status || 'active'
            }));
            allServices = [...allServices, ...userServices];
            console.log('User services loaded:', userServices.length);
          }
        } else {
          console.error('Services API response not ok:', servicesResponse.status);
        }
      } catch (error) {
        console.error('Error loading provider services:', error);
      }

      // Also load traditional tours if tour type is selected or all services
      if (selectedServiceType === 'tour' || selectedServiceType === 'all') {
        try {
          const toursResponse = await fetch('/api/tours', {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (toursResponse.ok) {
            const toursData = await toursResponse.json();
            console.log('Traditional tours data:', toursData);
            
            // Filter tours by current user
            const userTours = (toursData || []).filter(tour => 
              tour.currentUser === user?.email
            ).map(tour => ({
              ...tour,
              type: 'tour',
              price: tour.price,
              status: 'active', // Tours don't have explicit status
              isTraditionalTour: true // Flag to distinguish
            }));
            
            allServices = [...allServices, ...userTours];
            console.log('Traditional tours loaded:', userTours.length);
          }
        } catch (error) {
          console.error('Error loading traditional tours:', error);
        }
      }

      console.log('Total services loaded:', allServices.length);
      setServices(allServices);
      
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Error loading services');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const response = await fetch('/api/reservations/provider', {
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.success) {
        setReservations(result.data || []);
      } else {
        console.error('Failed to load reservations:', result.message);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddService = (serviceType = null) => {
    // Use passed serviceType or fall back to selectedServiceType
    const actualServiceType = serviceType || (selectedServiceType === 'all' 
      ? (providerStatus?.approvedTypes[0] || 'hotel') 
      : selectedServiceType);

    if (actualServiceType === 'hotel') {
      // Navigate to comprehensive hotel service creation
      navigate('/hotel-service-create');
      return;
    }

    if (actualServiceType === 'vehicle') {
      // Navigate to comprehensive vehicle service creation
      navigate('/vehicle-service-create');
      return;
    }

    if (actualServiceType === 'tour') {
      // Navigate to comprehensive tour service creation
      navigate('/tour-service-create');
      return;
    }

    if (actualServiceType === 'restaurant') {
      // Navigate to comprehensive restaurant service creation
      navigate('/restaurant-service-create');
      return;
    }

    if (actualServiceType === 'event') {
      // Navigate to comprehensive event service creation
      navigate('/event-service-create');
      return;
    }

    // For other service types, use the existing dialog
    setSelectedService(null);
    setServiceFormData({ type: actualServiceType });
    setOpenServiceDialog(true);
  };

  const handleEditService = (service) => {
    // Use the new beautiful edit modal for all service types
    setEditingService(service);
    setEditModalOpen(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      // Find the service to determine if it's a tour
      const service = services.find(s => s._id === serviceId);
      
      if (service && service.type === 'tour') {
        // Delete from tours API
        const response = await fetch(`/api/tours/${serviceId}`, { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          loadServices();
          alert('Tour deleted successfully!');
        } else {
          const result = await response.json();
          setError(result.message || 'Failed to delete tour');
        }
      } else {
        // Delete from provider services API
        const response = await fetch(`/api/provider/services/${serviceId}`, { 
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        const result = await response.json();
        if (result.success) {
          loadServices();
        } else {
          setError(result.message || 'Failed to delete service');
        }
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      setError('Error deleting service');
    }
  };

  const handleSaveService = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      const { name, description, price, type } = serviceFormData;
      
      if (!name?.trim() || !description?.trim() || !price || !type) {
        setError('Please fill in all required fields (Name, Description, Price, Type)');
        return;
      }

      if (isNaN(price) || parseFloat(price) <= 0) {
        setError('Please enter a valid price greater than 0');
        return;
      }

      // Additional validation for tour services
      if (type === 'tour') {
        const { category, groupCount, languages, duration, cities, introduction } = serviceFormData;
        if (!category?.trim() || !groupCount || !languages?.trim() || !duration?.trim() || !cities?.trim() || !introduction?.trim()) {
          setError('For tour services, please fill in all fields: Category, Group Size, Languages, Duration, Cities, Description, and Introduction');
          return;
        }
        
        if (isNaN(groupCount) || parseInt(groupCount) <= 0) {
          setError('Please enter a valid group size greater than 0');
          return;
        }
      }

      // Additional validation for vehicle services
      if (type === 'vehicle') {
        const { vehicleType, capacity, location } = serviceFormData;
        if (!vehicleType?.trim() || !capacity || !location?.trim()) {
          setError('For vehicle services, please fill in Vehicle Type, Capacity, and Location');
          return;
        }
        
        if (isNaN(capacity) || parseInt(capacity) <= 0) {
          setError('Please enter a valid seating capacity greater than 0');
          return;
        }
      }

      // Handle tours separately to save to the correct API
      if (type === 'tour') {
        await handleSaveTour();
      } else {
        await handleSaveGenericService();
      }

    } catch (error) {
      console.error('Error saving service:', error);
      setError('Error saving service');
    } finally {
      setLoading(false);
    }
  };

  // Function to save tours to the tours API
  const handleSaveTour = async () => {
    try {
      let imageUrl = '';
      
      // Handle image upload to Cloudinary if there's a new image
      if (serviceFormData.images && serviceFormData.images.length > 0) {
        const firstImage = serviceFormData.images[0];
        
        if (firstImage instanceof File) {
          try {
            // Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", firstImage);
            formData.append("upload_preset", "upload"); // Make sure this matches your Cloudinary upload preset
            
            console.log("Uploading image to Cloudinary...");
            const uploadResponse = await fetch(
              "https://api.cloudinary.com/v1_1/dpgelkpd4/image/upload", // Make sure this matches your Cloudinary cloud name
              {
                method: "POST",
                body: formData
              }
            );
            
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              imageUrl = uploadResult.url;
              console.log("Image uploaded successfully:", imageUrl);
            } else {
              console.error("Failed to upload image to Cloudinary");
              setError("Failed to upload image. Please try again.");
              return;
            }
          } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
            setError("Error uploading image. Please try again.");
            return;
          }
        } else if (typeof firstImage === 'string') {
          // It's already a URL
          imageUrl = firstImage;
        }
      }

      // Prepare tour data for the tours API
      const tourData = {
        currentUser: user?.email || '',
        img: imageUrl || serviceFormData.img || '', // Use uploaded image or existing image
        name: serviceFormData.name,
        category: serviceFormData.category,
        price: parseFloat(serviceFormData.price),
        groupCount: parseInt(serviceFormData.groupCount),
        languages: serviceFormData.languages,
        duration: serviceFormData.duration,
        cities: serviceFormData.cities,
        description: serviceFormData.description,
        introduction: serviceFormData.introduction
      };

      console.log('Saving tour with data:', tourData);

      const method = selectedService ? 'PATCH' : 'POST';
      const url = selectedService 
        ? `/api/tours/${selectedService._id}`
        : '/api/tours';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tourData)
      });

      const result = await response.json();
      console.log('Tour save result:', result);
      
      if (response.ok && (result.status === "Success" || result.message)) {
        setOpenServiceDialog(false);
        loadServices();
        setError('');
        
        // Show success message
        alert(selectedService ? 'Tour updated successfully!' : 'Tour created successfully! Your tour will now appear in the tours section.');
      } else {
        setError(result.message || 'Failed to save tour');
      }
    } catch (error) {
      console.error('Error saving tour:', error);
      setError('Error saving tour to tours collection');
    }
  };

  // Function to save other services to the provider services API
  const handleSaveGenericService = async () => {
    try {
      const method = selectedService ? 'PUT' : 'POST';
      const url = selectedService 
        ? `/api/provider/services/${selectedService._id}`
        : '/api/provider/services';

      // Prepare service data without File objects
      const serviceDataToSend = { ...serviceFormData };
      
      // Handle images - convert File objects to base64 or skip them for now
      if (serviceDataToSend.images) {
        const processedImages = [];
        for (const image of serviceDataToSend.images) {
          if (typeof image === 'string') {
            // It's already a URL/base64 string
            processedImages.push(image);
          } else if (image instanceof File) {
            // Convert File to base64 for now (you might want to implement proper file upload later)
            try {
              const base64 = await convertFileToBase64(image);
              processedImages.push(base64);
            } catch (error) {
              console.error('Error converting file to base64:', error);
              // Skip this file for now
            }
          }
        }
        serviceDataToSend.images = processedImages;
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(serviceDataToSend)
      });

      // Log response details for debugging
      console.log('Service creation response status:', response.status);
      console.log('Service creation response headers:', response.headers);
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Error parsing response JSON:', parseError);
        setError('Server returned invalid response. Please check console for details.');
        return;
      }
      
      console.log('Service creation result:', result);
      
      if (result.success) {
        setOpenServiceDialog(false);
        loadServices();
        setError('');

        // Send notification for new service (non-blocking)
        if (!selectedService) {
          try {
            await notificationManager.sendToAdmin(NotificationTypes.SERVICE_ADDED, {
              serviceType: serviceDataToSend.type,
              serviceName: serviceDataToSend.name,
              providerName: user?.name || 'Provider'
            });
          } catch (notifError) {
            console.error('Error sending notification:', notifError);
            // Don't fail the entire operation if notification fails
          }
        }
      } else {
        setError(result.message || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving generic service:', error);
      setError('Error saving service');
    }
  };

  // Helper function to convert File to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
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
      } else if (reservation.isTourReservation) {
        // Handle tour reservations
        response = await fetch(`/api/tours/reservations/${reservation._id}/status`, {
          method: 'PATCH',
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
        // Send notification to customer
        try {
          await notificationManager.sendToUser(reservation.customerId._id, NotificationTypes.RESERVATION_APPROVED, {
            serviceName: reservation.serviceId.name,
            confirmationNumber: result.data.confirmationNumber
          });
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }

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

  const handleViewReservation = (reservation) => {
    setViewReservation(reservation);
    setOpenViewDialog(true);
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
      } else if (selectedReservation.isTourReservation) {
        // Handle tour reservations
        response = await fetch(`/api/tours/reservations/${selectedReservation._id}/status`, {
          method: 'PATCH',
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
        // Send notification to customer
        try {
          await notificationManager.sendToUser(selectedReservation.customerId._id, NotificationTypes.RESERVATION_REJECTED, {
            serviceName: selectedReservation.serviceId.name,
            reason: rejectionReason
          });
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }

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

  const renderServiceForm = () => {
    const serviceFormType = serviceFormData.type || selectedServiceType;
    
    return (
      <Grid container spacing={3}>
        {!selectedService && (
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Service Type"
              value={serviceFormData.type || ''}
              onChange={(e) => setServiceFormData({ ...serviceFormData, type: e.target.value })}
              helperText="Select the type of service you want to add"
              required
            >
              {providerStatus?.approvedTypes.map((type) => {
                const option = serviceTypeOptions.find(opt => opt.value === type);
                return (
                  <MenuItem key={type} value={type}>
                    {option?.icon} {option?.label}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
        )}
        
        {serviceFormType && renderServiceTypeForm(serviceFormType)}
      </Grid>
    );
  };

  const renderServiceTypeForm = (serviceType) => {
    switch (serviceType) {
      case 'hotel':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hotel Name"
                value={serviceFormData.name || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={serviceFormData.location || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room Type"
                value={serviceFormData.roomType || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, roomType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Night"
                type="number"
                value={serviceFormData.price || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Available Rooms"
                type="number"
                value={serviceFormData.availableRooms || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, availableRooms: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Choose Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </Button>
                {serviceFormData.images && serviceFormData.images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {serviceFormData.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper' }}
                          onClick={() => removeImage(index)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={serviceFormData.description || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        );

      case 'tour':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tour Name"
                value={serviceFormData.name || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Tour Category"
                value={serviceFormData.category || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                required
              >
                <MenuItem value="">--Select one--</MenuItem>
                <MenuItem value="private car service">Private Car Service</MenuItem>
                <MenuItem value="city to city">City to City</MenuItem>
                <MenuItem value="wild safari">Wild Safari</MenuItem>
                <MenuItem value="cultural">Cultural</MenuItem>
                <MenuItem value="festival">Festival</MenuItem>
                <MenuItem value="special tours">Special Tours</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Person"
                type="number"
                value={serviceFormData.price || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Group Size"
                type="number"
                value={serviceFormData.groupCount || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, groupCount: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Languages"
                value={serviceFormData.languages || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, languages: e.target.value })}
                placeholder="English, French, German etc.."
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Tour Duration"
                value={serviceFormData.duration || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, duration: e.target.value })}
                required
              >
                <MenuItem value="">--Select One--</MenuItem>
                <MenuItem value="1">1 Day</MenuItem>
                <MenuItem value="2">2 Days</MenuItem>
                <MenuItem value="3">3 Days</MenuItem>
                <MenuItem value="5">5 Days</MenuItem>
                <MenuItem value="7">7 Days</MenuItem>
                <MenuItem value="9">9 Days</MenuItem>
                <MenuItem value="12">12 Days</MenuItem>
                <MenuItem value="15">15 Days</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cities"
                value={serviceFormData.cities || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, cities: e.target.value })}
                placeholder="Cities that will be visited during the tour"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Choose Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </Button>
                {serviceFormData.images && serviceFormData.images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {serviceFormData.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper' }}
                          onClick={() => removeImage(index)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tour Description"
                multiline
                rows={4}
                value={serviceFormData.description || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                placeholder="Provide a detailed description of the tour"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tour Introduction"
                multiline
                rows={4}
                value={serviceFormData.introduction || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, introduction: e.target.value })}
                placeholder="Introductory information about destinations and activities"
                required
              />
            </Grid>
          </Grid>
        );

      case 'vehicle':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vehicle Name"
                value={serviceFormData.name || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vehicle Type"
                value={serviceFormData.vehicleType || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, vehicleType: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Day"
                type="number"
                value={serviceFormData.price || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Seating Capacity"
                type="number"
                value={serviceFormData.capacity || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, capacity: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={serviceFormData.location || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, location: e.target.value })}
                placeholder="e.g., Colombo, Sri Lanka"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Features"
                multiline
                rows={3}
                value={serviceFormData.features || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, features: e.target.value })}
                placeholder="e.g., Air conditioning, GPS, Insurance included"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={serviceFormData.description || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                placeholder="Provide a detailed description of your vehicle service"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Choose Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </Button>
                {serviceFormData.images && serviceFormData.images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {serviceFormData.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper' }}
                          onClick={() => removeImage(index)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        );

      case 'restaurant':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Restaurant Name"
                value={serviceFormData.name || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location/Address"
                value={serviceFormData.location || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Cuisine Type</InputLabel>
                <Select
                  value={serviceFormData.cuisineType || ''}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, cuisineType: e.target.value })}
                  label="Cuisine Type"
                >
                  <MenuItem value="Pakistani">Pakistani</MenuItem>
                  <MenuItem value="Chinese">Chinese</MenuItem>
                  <MenuItem value="Italian">Italian</MenuItem>
                  <MenuItem value="Continental">Continental</MenuItem>
                  <MenuItem value="Fast Food">Fast Food</MenuItem>
                  <MenuItem value="BBQ & Grill">BBQ & Grill</MenuItem>
                  <MenuItem value="Seafood">Seafood</MenuItem>
                  <MenuItem value="Indian">Indian</MenuItem>
                  <MenuItem value="Arabic">Arabic</MenuItem>
                  <MenuItem value="Mixed">Mixed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Average Price per Person (Rs.)"
                type="number"
                value={serviceFormData.price || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Seating Capacity"
                type="number"
                value={serviceFormData.capacity || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, capacity: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Staff Size</InputLabel>
                <Select
                  value={serviceFormData.staffSize || ''}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, staffSize: e.target.value })}
                  label="Staff Size"
                >
                  <MenuItem value="4-7">4-7 Staff</MenuItem>
                  <MenuItem value="7-10">7-10 Staff</MenuItem>
                  <MenuItem value="10-15">10-15 Staff</MenuItem>
                  <MenuItem value="15-30">15-30 Staff</MenuItem>
                  <MenuItem value="30-50">30-50 Staff</MenuItem>
                  <MenuItem value="50+">50+ Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Restaurant Description"
                multiline
                rows={3}
                value={serviceFormData.description || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                placeholder="Describe your restaurant, ambiance, special features..."
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specialties & Signature Dishes"
                multiline
                rows={2}
                value={serviceFormData.specialties || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, specialties: e.target.value })}
                placeholder="Famous dishes, specialties, unique offerings..."
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Restaurant Images *
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Upload high-quality images of your restaurant, interior, and signature dishes
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Choose Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </Button>
                {serviceFormData.images && serviceFormData.images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {serviceFormData.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper' }}
                          onClick={() => removeImage(index)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        );



      case 'event':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Name"
                value={serviceFormData.name || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Type"
                value={serviceFormData.eventType || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, eventType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Person"
                type="number"
                value={serviceFormData.price || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Attendees"
                type="number"
                value={serviceFormData.maxAttendees || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, maxAttendees: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (hours)"
                type="number"
                value={serviceFormData.duration || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, duration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Venue"
                value={serviceFormData.venue || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, venue: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Upload Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Choose Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </Button>
                {serviceFormData.images && serviceFormData.images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {serviceFormData.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper' }}
                          onClick={() => removeImage(index)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Description"
                multiline
                rows={4}
                value={serviceFormData.description || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        );



      default:
        return null;
    }
  };

  // Image handling functions
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      setServiceFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    }
  };

  const removeImage = (index) => {
    setServiceFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleApplyAsProvider = () => {
    navigate('/service-provider-request', {
      state: { 
        mode: 'apply',
        redirectTo: '/service-provider-dashboard'
      }
    });
  };

  const renderServiceTypeCards = () => {
    const approvedTypes = providerStatus?.approvedTypes || [];
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {serviceTypeOptions.slice(1).map((option) => {
          const isApproved = approvedTypes.includes(option.value);
          const serviceCount = services.filter(s => s.type === option.value).length;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={option.value}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: isApproved ? '2px solid' : '1px solid',
                  borderColor: isApproved ? 'primary.main' : 'grey.300',
                  opacity: isApproved ? 1 : 0.7
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" sx={{ mr: 1 }}>
                      {option.icon}
                    </Typography>
                    <Typography variant="h6" component="div">
                      {option.label}
                    </Typography>
                  </Box>
                  
                  {isApproved ? (
                    <>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {serviceCount} service{serviceCount !== 1 ? 's' : ''} active
                      </Typography>
                      <Chip label="Approved" color="success" size="small" sx={{ mb: 2 }} />
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Not approved for this service type
                      </Typography>
                      <Chip label="Not Approved" color="default" size="small" sx={{ mb: 2 }} />
                    </>
                  )}
                </CardContent>
                <CardActions>
                  {isApproved ? (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setSelectedServiceType(option.value);
                        handleAddService(option.value);
                      }}
                      startIcon={<Add />}
                    >
                      Add {option.label.slice(0, -1)}
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleApplyAsProvider}
                      disabled
                    >
                      Apply for Approval
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Service Provider Dashboard
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="My Services" />
          <Tab label="Reservations" />
        </Tabs>

        {currentTab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Header with Apply/Add Service Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Service Management</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {!providerStatus || providerStatus.approvedTypes.length === 0 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<Business />}
                    onClick={handleApplyAsProvider}
                  >
                    Apply to Become Service Provider
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddService}
                    disabled={loading}
                  >
                    Add New Service
                  </Button>
                )}
              </Box>
            </Box>

            {/* Service Type Cards */}
            {providerStatus && providerStatus.approvedTypes.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Your Service Types
                </Typography>
                {renderServiceTypeCards()}
              </>
            )}



            {/* Provider Status Info */}
            {providerStatus ? (
              <Box sx={{ mb: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Provider Status
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={repairProviderData}
                    disabled={loading}
                    sx={{ ml: 2 }}
                  >
                    {loading ? 'Repairing...' : 'Repair Data'}
                  </Button>
                </Box>
                {providerStatus.approvedTypes.length > 0 ? (
                  <>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        🎉 Congratulations! You are approved to provide services.
                      </Typography>
                    </Alert>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Approved service types:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {providerStatus.approvedTypes.map(type => {
                        const option = serviceTypeOptions.find(opt => opt.value === type);
                        return (
                          <Chip
                            key={type}
                            label={`${option?.icon} ${option?.label}`}
                            variant="outlined"
                            color="primary"
                          />
                        );
                      })}
                    </Box>
                  </>
                ) : (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      ⏳ No approved service types found. 
                    </Typography>
                    <Typography variant="body2">
                      Click "Apply to Become Service Provider" above to start the approval process.
                    </Typography>
                  </Alert>
                )}
              </Box>
            ) : (
              <Box sx={{ mb: 3, p: 3, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🚀 Start Your Service Provider Journey
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Welcome to Travely! To start offering your services (hotels, vehicles, tours, etc.), 
                  you need to complete our verification process.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>What you'll need:</strong>
                </Typography>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  <li>CNIC for identity verification</li>
                  <li>Business registration documents</li>
                  <li>NTN certificate</li>
                  <li>Proof of ownership documents</li>
                  <li>Business signboard photo</li>
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<Business />}
                  onClick={handleApplyAsProvider}
                  sx={{ mt: 2 }}
                >
                  Start Application Process
                </Button>
              </Box>
            )}

            {/* Service Type Filter */}
            {providerStatus && providerStatus.approvedTypes.length > 1 && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="all">All Services</MenuItem>
                  {providerStatus.approvedTypes.map(type => {
                    const option = serviceTypeOptions.find(opt => opt.value === type);
                    return (
                      <MenuItem key={type} value={type}>
                        {option?.icon} {option?.label}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Typography>Loading services...</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="textSecondary">
                            No services found. Click "Add New Service" to get started.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((service) => (
                        <TableRow key={service._id}>
                          <TableCell>{service.name}</TableCell>
                          <TableCell>{service.type}</TableCell>
                          <TableCell>${service.price}</TableCell>
                          <TableCell>
                            <Chip
                              label={service.status}
                              color={service.status === 'active' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEditService(service)}>
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteService(service._id)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {currentTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Reservation Requests
            </Typography>

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
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="textSecondary">
                          No reservations found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations.map((reservation) => (
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
                            ) : reservation.serviceId?.type === 'tour' || reservation.isTourReservation ? (
                              <Map sx={{ mr: 1, color: 'primary.main' }} />
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
                          {reservation.isLegacyVehicle ? (
                            <Box>
                              <Typography variant="caption" display="block">
                                Vehicle: {reservation.vehicleNumber}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Driver: {reservation.needDriver ? 'Required' : 'Self Drive'}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                ID: {reservation.transactionId}
                              </Typography>
                            </Box>
                          ) : reservation.isTourReservation ? (
                            <Box>
                              <Typography variant="caption" display="block">
                                Group Size: {reservation.guests || reservation.groupSize || 1}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Tour Date: {new Date(reservation.tourDate).toLocaleDateString()}
                              </Typography>
                              {reservation.specialRequests && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Requests: {reservation.specialRequests}
                                </Typography>
                              )}
                              {reservation.confirmationNumber && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Conf: {reservation.confirmationNumber}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Box>
                              {/* Use the new formatted details from backend if available */}
                              {reservation.formattedDetails ? (
                                <>
                                  <Typography variant="caption" display="block" color="primary.main" fontWeight="bold">
                                    {reservation.serviceTypeLabel || 'Service Reservation'}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    {reservation.formattedDetails}
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  {/* Fallback to old format for backward compatibility */}
                                  <Typography variant="caption" display="block">
                                    Guests: {reservation.guests || 1}
                                  </Typography>
                                  {reservation.rooms && reservation.serviceId?.type === 'hotel' && (
                                    <Typography variant="caption" display="block">
                                      Rooms: {reservation.rooms}
                                    </Typography>
                                  )}
                                  {reservation.vehicleType && (
                                    <Typography variant="caption" display="block">
                                      Vehicle: {reservation.vehicleType}
                                    </Typography>
                                  )}
                                  {reservation.eventType && (
                                    <Typography variant="caption" display="block">
                                      Event: {reservation.eventType}
                                    </Typography>
                                  )}
                                </>
                              )}
                              {reservation.confirmationNumber && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Conf: {reservation.confirmationNumber}
                                </Typography>
                              )}
                            </Box>
                          )}
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
                          {reservation.status === 'pending' && !reservation.isLegacyVehicle && (
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
                          {reservation.isTourReservation && (
                            <Chip size="small" label="Tour" variant="outlined" color="primary" />
                          )}
                          <IconButton
                            onClick={() => handleViewReservation(reservation)}
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}


      </Paper>

      {/* Beautiful Service Edit Modal */}
      <ServiceEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingService(null);
        }}
        service={editingService}
        onSave={(updatedService) => {
          loadServices(); // Refresh the services list
          setEditModalOpen(false);
          setEditingService(null);
        }}
      />

      {/* Service Dialog (kept for add new service functionality) */}
      <Dialog open={openServiceDialog} onClose={() => setOpenServiceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent>
          {renderServiceForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenServiceDialog(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSaveService} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : (selectedService ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reject Reservation
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason for rejection"
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this reservation..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button onClick={confirmRejectReservation} variant="contained" color="error">
            Reject Reservation
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Reservation Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Reservation Details
        </DialogTitle>
        <DialogContent>
          {viewReservation && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {/* Customer Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Customer Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Customer Name</Typography>
                  <Typography variant="body1">{viewReservation.customerName || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{viewReservation.customerEmail || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{viewReservation.customerPhone || 'N/A'}</Typography>
                </Grid>
                {viewReservation.cnicNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">CNIC Number</Typography>
                    <Typography variant="body1">{viewReservation.cnicNumber}</Typography>
                  </Grid>
                )}

                {/* Booking Information */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Booking Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Service</Typography>
                  <Typography variant="body1">{viewReservation.serviceId?.name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={viewReservation.status?.charAt(0).toUpperCase() + viewReservation.status?.slice(1) || 'N/A'} 
                    color={
                      viewReservation.status === 'confirmed' ? 'success' : 
                      viewReservation.status === 'cancelled' ? 'error' : 
                      'default'
                    }
                    size="small"
                  />
                </Grid>
                
                {/* Date Information */}
                {viewReservation.checkInDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Check-in Date</Typography>
                    <Typography variant="body1">{new Date(viewReservation.checkInDate).toLocaleString()}</Typography>
                  </Grid>
                )}
                {viewReservation.checkOutDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Check-out Date</Typography>
                    <Typography variant="body1">{new Date(viewReservation.checkOutDate).toLocaleString()}</Typography>
                  </Grid>
                )}
                {viewReservation.tourDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Tour Date</Typography>
                    <Typography variant="body1">{new Date(viewReservation.tourDate).toLocaleDateString()}</Typography>
                  </Grid>
                )}
                {viewReservation.pickupDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Pickup Date</Typography>
                    <Typography variant="body1">{new Date(viewReservation.pickupDate).toLocaleDateString()}</Typography>
                  </Grid>
                )}
                {viewReservation.returnDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Return Date</Typography>
                    <Typography variant="body1">{new Date(viewReservation.returnDate).toLocaleDateString()}</Typography>
                  </Grid>
                )}

                {/* Service Details */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Guests</Typography>
                  <Typography variant="body1">{viewReservation.guests || 'N/A'}</Typography>
                </Grid>
                {viewReservation.rooms && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Rooms</Typography>
                    <Typography variant="body1">{viewReservation.rooms}</Typography>
                  </Grid>
                )}
                {viewReservation.needDriver !== undefined && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Driver Required</Typography>
                    <Typography variant="body1">{viewReservation.needDriver ? 'Yes' : 'No'}</Typography>
                  </Grid>
                )}

                {/* Financial Information */}
                {viewReservation.totalAmount && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      Rs. {viewReservation.totalAmount.toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                {viewReservation.pricePerUnit && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Price per Unit</Typography>
                    <Typography variant="body1">Rs. {viewReservation.pricePerUnit}</Typography>
                  </Grid>
                )}

                {/* Special Requests */}
                {viewReservation.specialRequests && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Special Requests</Typography>
                    <Typography variant="body1">{viewReservation.specialRequests}</Typography>
                  </Grid>
                )}

                {/* CNIC Photo */}
                {viewReservation.cnicPhoto && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Identity Verification
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      CNIC Photo
                    </Typography>
                    <Box 
                      component="img" 
                      src={viewReservation.cnicPhoto} 
                      alt="CNIC Photo" 
                      sx={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        p: 1
                      }} 
                    />
                  </Grid>
                )}

                {/* Timestamps */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Booking Details
                  </Typography>
                </Grid>
                {viewReservation.createdAt && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Booking Date</Typography>
                    <Typography variant="body1">{new Date(viewReservation.createdAt).toLocaleString()}</Typography>
                  </Grid>
                )}
                {viewReservation.confirmationNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Confirmation Number</Typography>
                    <Typography variant="body1">{viewReservation.confirmationNumber}</Typography>
                  </Grid>
                )}
                {viewReservation.transactionId && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Transaction ID</Typography>
                    <Typography variant="body1">{viewReservation.transactionId}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceProviderDashboard; 