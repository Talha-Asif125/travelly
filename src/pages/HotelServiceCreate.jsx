import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Business,
  LocationOn,
  Hotel,
  Photo,
  Save,
  ArrowBack,
  ArrowForward,
  Add,
  Delete,
  Star,
  Wifi,
  LocalParking,
  Restaurant,
  FitnessCenter,
  Pool,
  Spa
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Swal from 'sweetalert2';

const HotelServiceCreate = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.state?.isEdit || false;
  const existingService = location.state?.service || null;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Hotel service data
  const [hotelData, setHotelData] = useState({
    // Basic Information
    name: '',
    description: '',
    category: 'mid-range',
    starRating: 3,
    
    // Location
    address: '',
    city: '',
    province: '',
    zipCode: '',
    coordinates: { latitude: '', longitude: '' },
    
    // Contact
    phone: '',
    email: '',
    website: '',
    
    // Pricing
    basePrice: '',
    priceRange: { minimum: '', maximum: '' },
    
    // Amenities
    amenities: {
      popular: [],
      parking: [],
      food: [],
      internet: [],
      family: [],
      conveniences: [],
      guest: [],
      accessibility: [],
      languages: [],
      entertainment: [],
      more: []
    },
    
    // Room Types
    roomTypes: [{
      name: 'Standard Room',
      sleeps: 2,
      beds: '1 Double Bed',
      pricePerNight: '',
      totalRooms: 10,
      availableRooms: 10,
      highlights: [],
      images: [],
      amenities: {
        parking: [],
        food: [],
        internet: [],
        family: [],
        conveniences: [],
        guest: [],
        accessibility: [],
        languages: [],
        entertainment: [],
        bathroom: [],
        more: []
      }
    }],
    
    // Policies
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'Free cancellation before 24 hours',
      petPolicy: 'Pets not allowed',
      smokingPolicy: 'no-smoking',
      childPolicy: 'Children are welcome'
    },
    
    // Images
    images: [],
    
    // Status
    status: 'active',
    featured: false
  });

  const steps = ['Basic Info', 'Location & Contact', 'Amenities', 'Room Types', 'Policies & Images'];

  // Amenity options
  const amenityOptions = {
    popular: ['front-desk-24', 'air-conditioning', 'laundry', 'restaurant', 'free-wifi', 'pool', 'gym', 'spa', 'bar', 'parking'],
    parking: ['free-parking', 'paid-parking', 'valet-parking', 'no-parking', 'street-parking'],
    food: ['restaurant', 'room-service', 'breakfast', 'bar', 'kitchen', 'microwave', 'refrigerator'],
    internet: ['free-wifi', 'paid-wifi', 'wifi-all-rooms', 'business-center', 'wifi-speed-high'],
    family: ['family-friendly', 'kids-club', 'babysitting', 'playground', 'laundry-facilities'],
    conveniences: ['front-desk-24', 'concierge', 'laundry-facilities', 'dry-cleaning', 'luggage-storage', 'currency-exchange'],
    guest: ['dry-cleaning', 'housekeeping', 'wake-up-service', 'newspaper', 'shoe-shine'],
    accessibility: ['wheelchair-accessible', 'elevator', 'accessible-rooms', 'accessible-bathroom', 'braille-signage'],
    languages: ['english', 'urdu', 'arabic', 'french', 'spanish', 'chinese'],
    entertainment: ['tv', 'cable-channels', 'satellite-tv', 'netflix', 'music-system', 'games-room'],
    more: ['no-smoking', 'smoking-rooms', 'pet-friendly', 'eco-friendly', 'adults-only']
  };

  useEffect(() => {
    if (isEdit && existingService) {
      setHotelData({ ...hotelData, ...existingService });
    }
  }, [isEdit, existingService]);

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = () => {
    const newErrors = {};
    
    switch (activeStep) {
      case 0: // Basic Info
        if (!hotelData.name.trim()) newErrors.name = 'Hotel name is required';
        if (!hotelData.description.trim()) newErrors.description = 'Description is required';
        if (!hotelData.basePrice) newErrors.basePrice = 'Base price is required';
        break;
      case 1: // Location & Contact
        if (!hotelData.address.trim()) newErrors.address = 'Address is required';
        if (!hotelData.city.trim()) newErrors.city = 'City is required';
        if (!hotelData.phone.trim()) newErrors.phone = 'Phone is required';
        break;
      case 3: // Room Types
        const validRoomTypes = hotelData.roomTypes.filter(room => {
          return room.name && room.name.trim() && room.pricePerNight && parseFloat(room.pricePerNight) > 0;
        });
        if (validRoomTypes.length === 0) {
          newErrors.roomTypes = 'At least one room type with name and price is required';
        }
        // Check each room type for required fields
        hotelData.roomTypes.forEach((room, index) => {
          if (!room.name || !room.name.trim()) {
            newErrors[`roomType_${index}_name`] = 'Room name is required';
          }
          if (!room.pricePerNight || parseFloat(room.pricePerNight) <= 0) {
            newErrors[`roomType_${index}_price`] = 'Valid price per night is required';
          }
        });
        break;
      // Add more validation as needed
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setHotelData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleNestedChange = (section, field, value) => {
    setHotelData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAmenityToggle = (category, amenity) => {
    setHotelData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [category]: prev.amenities[category].includes(amenity)
          ? prev.amenities[category].filter(a => a !== amenity)
          : [...prev.amenities[category], amenity]
      }
    }));
  };

  const addRoomType = () => {
    setHotelData(prev => ({
      ...prev,
      roomTypes: [...prev.roomTypes, {
        name: '',
        sleeps: 2,
        beds: '1 Double Bed',
        pricePerNight: '',
        totalRooms: 1,
        availableRooms: 1,
        highlights: [],
        images: [],
        amenities: {
          parking: [],
          food: [],
          internet: [],
          family: [],
          conveniences: [],
          guest: [],
          accessibility: [],
          languages: [],
          entertainment: [],
          bathroom: [],
          more: []
        }
      }]
    }));
  };

  const removeRoomType = (index) => {
    setHotelData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, i) => i !== index)
    }));
  };

  const updateRoomType = (index, field, value) => {
    setHotelData(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map((room, i) => 
        i === index ? { ...room, [field]: value } : room
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Filter out empty room types and ensure required fields
      const validRoomTypes = hotelData.roomTypes.filter(room => {
        return room.name && room.name.trim() && room.pricePerNight && parseFloat(room.pricePerNight) > 0;
      }).map(room => ({
        ...room,
        pricePerNight: parseFloat(room.pricePerNight),
        sleeps: parseInt(room.sleeps) || 2,
        totalRooms: parseInt(room.totalRooms) || 1,
        availableRooms: parseInt(room.availableRooms) || 1
      }));

      // Ensure at least one valid room type
      if (validRoomTypes.length === 0) {
        throw new Error('Please add at least one valid room type with name and price');
      }
      
      const serviceData = {
        ...hotelData,
        type: 'hotel',
        price: parseFloat(hotelData.basePrice),
        location: hotelData.city,
        providerId: user?.id,
        roomTypes: validRoomTypes
      };

      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/services/${existingService._id}` : '/api/services';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(serviceData)
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Hotel service ${isEdit ? 'updated' : 'created'} successfully!`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#1976d2'
        });
        
        navigate('/service-provider-dashboard');
      } else {
        throw new Error(result.message || 'Failed to save hotel service');
      }
    } catch (error) {
      console.error('Error saving hotel service:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save hotel service',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Basic Info
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hotel Name"
                value={hotelData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={hotelData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={hotelData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <MenuItem value="budget">Budget</MenuItem>
                  <MenuItem value="mid-range">Mid-range</MenuItem>
                  <MenuItem value="luxury">Luxury</MenuItem>
                  <MenuItem value="resort">Resort</MenuItem>
                  <MenuItem value="boutique">Boutique</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Star Rating</InputLabel>
                <Select
                  value={hotelData.starRating}
                  onChange={(e) => handleInputChange('starRating', e.target.value)}
                >
                  {[1, 2, 3, 4, 5].map(star => (
                    <MenuItem key={star} value={star}>
                      {Array.from({ length: star }, (_, i) => '⭐').join('')} {star} Star{star > 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Price (Rs.)"
                type="number"
                value={hotelData.basePrice}
                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                error={!!errors.basePrice}
                helperText={errors.basePrice}
                required
              />
            </Grid>
          </Grid>
        );

      case 1: // Location & Contact
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={hotelData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={hotelData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Province"
                value={hotelData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pakistani Phone Number"
                value={hotelData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone || 'Format: 03XX-XXXXXXX'}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={hotelData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={hotelData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourhotel.com"
              />
            </Grid>
          </Grid>
        );

      case 2: // Amenities
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Hotel Amenities
            </Typography>
            {Object.entries(amenityOptions).map(([category, options]) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                  {category.replace('-', ' ')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {options.map(amenity => (
                    <Chip
                      key={amenity}
                      label={amenity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      onClick={() => handleAmenityToggle(category, amenity)}
                      variant={hotelData.amenities[category].includes(amenity) ? 'filled' : 'outlined'}
                      color={hotelData.amenities[category].includes(amenity) ? 'primary' : 'default'}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        );

      case 3: // Room Types
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Room Types</Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addRoomType}
              >
                Add Room Type
              </Button>
            </Box>
            
            {errors.roomTypes && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.roomTypes}
              </Alert>
            )}
            
            {hotelData.roomTypes.map((room, index) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Room Type {index + 1}</Typography>
                    {hotelData.roomTypes.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeRoomType(index)}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Room Name"
                        value={room.name}
                        onChange={(e) => updateRoomType(index, 'name', e.target.value)}
                        error={!!errors[`roomType_${index}_name`]}
                        helperText={errors[`roomType_${index}_name`]}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        label="Sleeps"
                        type="number"
                        value={room.sleeps}
                        onChange={(e) => updateRoomType(index, 'sleeps', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        label="Price per Night (Rs.)"
                        type="number"
                        value={room.pricePerNight}
                        onChange={(e) => updateRoomType(index, 'pricePerNight', e.target.value)}
                        error={!!errors[`roomType_${index}_price`]}
                        helperText={errors[`roomType_${index}_price`]}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Bed Configuration"
                        value={room.beds}
                        onChange={(e) => updateRoomType(index, 'beds', e.target.value)}
                        placeholder="e.g., 1 Double Bed, 2 Single Beds"
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        label="Total Rooms"
                        type="number"
                        value={room.totalRooms}
                        onChange={(e) => updateRoomType(index, 'totalRooms', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        fullWidth
                        label="Available Rooms"
                        type="number"
                        value={room.availableRooms}
                        onChange={(e) => updateRoomType(index, 'availableRooms', parseInt(e.target.value))}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 4: // Policies & Images
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-in Time"
                value={hotelData.policies.checkIn}
                onChange={(e) => handleNestedChange('policies', 'checkIn', e.target.value)}
                placeholder="14:00"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-out Time"
                value={hotelData.policies.checkOut}
                onChange={(e) => handleNestedChange('policies', 'checkOut', e.target.value)}
                placeholder="12:00"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cancellation Policy"
                multiline
                rows={2}
                value={hotelData.policies.cancellation}
                onChange={(e) => handleNestedChange('policies', 'cancellation', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pet Policy"
                value={hotelData.policies.petPolicy}
                onChange={(e) => handleNestedChange('policies', 'petPolicy', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Smoking Policy</InputLabel>
                <Select
                  value={hotelData.policies.smokingPolicy}
                  onChange={(e) => handleNestedChange('policies', 'smokingPolicy', e.target.value)}
                >
                  <MenuItem value="no-smoking">No Smoking</MenuItem>
                  <MenuItem value="smoking-areas">Designated Smoking Areas</MenuItem>
                  <MenuItem value="smoking-rooms-available">Smoking Rooms Available</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Image upload functionality will be available in the next step. 
                You can add images after creating the basic hotel service.
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate('/service-provider-dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Hotel sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {isEdit ? 'Edit Hotel Service' : 'Create Hotel Service'}
          </Typography>
        </Box>

        {/* Progress */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent()}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<Save />}
                size="large"
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Hotel' : 'Create Hotel')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                size="large"
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default HotelServiceCreate; 