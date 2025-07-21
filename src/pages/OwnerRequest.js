import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Business, Schedule } from '@mui/icons-material';
import {
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Hotel, DirectionsCar, Tour, Restaurant, Event } from '@mui/icons-material';
import ValidatedInput, { ValidatedTextarea, ValidatedSelect, FormErrorSummary } from '../components/form/ValidatedInput';
import { validateForm, validateField, ValidationTypes, focusOnField } from '../utils/formValidation';
import backgroundImage from "../assets/images/bg.jpg";
import Swal from 'sweetalert2';
import api from '../api/axios';

const serviceProviderTypes = [
  { value: 'hotel', label: 'Hotel Provider', icon: <Hotel />, description: 'Manage hotels and accommodations' },
  { value: 'vehicle', label: 'Vehicle Provider', icon: <DirectionsCar />, description: 'Manage rental vehicles and transportation' },
  { value: 'tour', label: 'Tour Operator', icon: <Tour />, description: 'Organize and manage tour packages' },
  { value: 'restaurant', label: 'Restaurant Provider', icon: <Restaurant />, description: 'Manage dining establishments' },
  { value: 'event', label: 'Event Manager', icon: <Event />, description: 'Organize and manage events and activities' }
];

const stateOptions = [
  'Balochistan', 'Khyber Pakhtunkhwa', 'Punjab', 'Sindh', 'Azad Kashmir', 
  'Gilgit-Baltistan', 'Islamabad Capital Territory'
];

const getStepsForServiceType = (serviceType) => {
  const baseSteps = ['Select Service Type', 'Identity Verification'];
  
  // Skip business details for vehicle, hotel, restaurant, event, and tour providers
  if (serviceType !== 'vehicle' && serviceType !== 'hotel' && serviceType !== 'restaurant' && serviceType !== 'event' && serviceType !== 'tour') {
    baseSteps.push('Business Details');
  }
  
  // Add service-specific details step (skip for tour - simplified registration)
  if (serviceType === 'hotel') {
    baseSteps.push('Hotel Details');
  } else if (serviceType === 'restaurant') {
    baseSteps.push('Restaurant Details');
  } else if (serviceType === 'event') {
    baseSteps.push('Event Details');
  } else if (serviceType === 'vehicle') {
    baseSteps.push('Vehicle Details');
  } else if (serviceType !== 'tour') {
    baseSteps.push('Service Details');
  }
  // Note: Tour operators skip service details step for simplified registration
  
  baseSteps.push('Document Upload', 'Review & Submit');
  return baseSteps;
};

// Enhanced validation schema with specific rules for each step
const getValidationSchema = (step, serviceType) => {
  switch (step) {
    case 1: // Identity Verification
      const identityValidation = {
        firstName: [{ type: ValidationTypes.REQUIRED }],
        lastName: [{ type: ValidationTypes.REQUIRED }],
        cnic: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.PATTERN, param: /^\d{5}-\d{7}-\d{1}$/ }
        ],
        mobileForOTP: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.PATTERN, param: /^[0-9]{10,11}$/ }
        ]
      };

      // Only add email and phone validation for providers that need business details
      if (serviceType !== 'vehicle' && serviceType !== 'hotel' && serviceType !== 'restaurant' && serviceType !== 'event' && serviceType !== 'tour') {
        identityValidation.email = [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.EMAIL }
        ];
        identityValidation.phone = [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.PATTERN, param: /^[0-9]{10,11}$/ }
        ];
      }

      return identityValidation;
    
    case 2: // Business Details - No longer used, all providers simplified
      return {};
    
    case 3: // Service Details (Dynamic based on service type)
      if (serviceType === 'hotel') {
        return {
          hotelName: [{ type: ValidationTypes.REQUIRED }],
          hotelAddress: [{ type: ValidationTypes.REQUIRED }],
          propertyType: [{ type: ValidationTypes.REQUIRED }],
          numberOfRooms: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.POSITIVE_NUMBER }
          ],
          starRating: [{ type: ValidationTypes.REQUIRED }],
          priceRangeMin: [{ type: ValidationTypes.REQUIRED }],
          priceRangeMax: [{ type: ValidationTypes.REQUIRED }],
          hotelPhone: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.PATTERN, param: /^[0-9]{10,11}$/ }
          ],
          hotelEmail: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.EMAIL }
          ]
        };
      }
      
      if (serviceType === 'restaurant') {
        return {
          restaurantName: [{ type: ValidationTypes.REQUIRED }],
          restaurantAddress: [{ type: ValidationTypes.REQUIRED }],
          cuisineType: [{ type: ValidationTypes.REQUIRED }],
          seatingCapacity: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.POSITIVE_NUMBER }
          ],
          restaurantPhone: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.PATTERN, param: /^[0-9]{10,11}$/ }
          ],
          restaurantEmail: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.EMAIL }
          ]
        };
      }
      
      if (serviceType === 'event') {
        return {
          eventName: [{ type: ValidationTypes.REQUIRED }],
          eventAddress: [{ type: ValidationTypes.REQUIRED }],
          eventPhone: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.PATTERN, param: /^[0-9]{10,11}$/ }
          ],
          eventEmail: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.EMAIL }
          ]
        };
      }
      
      if (serviceType === 'tour') {
        // Only identity and documents required for tours
        return {};
      }
      
      if (serviceType === 'vehicle') {
        return {
          shopName: [{ type: ValidationTypes.REQUIRED }],
          shopCity: [{ type: ValidationTypes.REQUIRED }],
          shopAddress: [{ type: ValidationTypes.REQUIRED }],
          fleetSize: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.POSITIVE_NUMBER }
          ],

          shopPhone: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.PATTERN, param: /^[0-9]{10,11}$/ }
          ],
          shopDescription: [{ type: ValidationTypes.REQUIRED }]
        };
      }
      
      // Add other service types here in the future
      return {};
    
    case 4: // Document Upload
      if (serviceType === 'hotel') {
        // Only CNIC and hotel front photo required for hotels
        return {
          cnicCopy: [{ type: ValidationTypes.REQUIRED }],
          licensePhoto: [{ type: ValidationTypes.REQUIRED }]
        };
      }
      
      if (serviceType === 'restaurant') {
        // Only CNIC and restaurant photos required for restaurants
        return {
          cnicCopy: [{ type: ValidationTypes.REQUIRED }],
          restaurantPhotos: [{ type: ValidationTypes.REQUIRED }]
        };
      }
      
      if (serviceType === 'event') {
        // Only CNIC and event photos required for events
        return {
          cnicCopy: [{ type: ValidationTypes.REQUIRED }],
          eventPhotos: [{ type: ValidationTypes.REQUIRED }]
        };
      }
      
      if (serviceType === 'tour') {
        // Only CNIC and license photo required for tours
        return {
          cnicCopy: [{ type: ValidationTypes.REQUIRED }],
          licensePhoto: [{ type: ValidationTypes.REQUIRED }]
        };
      }
      
      if (serviceType === 'vehicle') {
        // Only CNIC and vehicle photos required for vehicles
        return {
          cnicCopy: [{ type: ValidationTypes.REQUIRED }],
          vehiclePhotos: [{ type: ValidationTypes.REQUIRED }]
        };
      }
      
      const baseValidation = {
        cnicCopy: [{ type: ValidationTypes.REQUIRED }],
        signboardPhoto: [{ type: ValidationTypes.REQUIRED }],
        licensePhoto: [{ type: ValidationTypes.REQUIRED }]
      };
      
      // Add business documents validation only for non-vehicle providers
      if (serviceType !== 'vehicle') {
        baseValidation.ownershipDocument = [{ type: ValidationTypes.REQUIRED }];
        baseValidation.ntnCertificateFile = [{ type: ValidationTypes.REQUIRED }];
      }
      
      return baseValidation;
    
    default:
      return {};
  }
};

const ServiceProviderRequest = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    // Personal Details & Identity Verification
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnic: '',
    mobileForOTP: '',
    

    
    // Hotel Specific Fields
    hotelName: '',
    hotelAddress: '',
    propertyType: '',
    numberOfRooms: '',
    starRating: '',
    priceRangeMin: '',
    priceRangeMax: '',
    hotelPhone: '',
    hotelEmail: '',
    amenities: [],
    
    // Vehicle Specific Fields (for future)
    fleetSize: '',
    vehicleTypes: [],
    
    // Restaurant Specific Fields (for future)
    restaurantName: '',
    restaurantAddress: '',
    cuisineType: '',
    seatingCapacity: '',
    restaurantPhone: '',
    restaurantEmail: '',
    restaurantPhotos: [],
    
    // Tour Business Fields (simplified)
    // No additional fields needed
    
    // Vehicle Rental Shop Fields
    shopName: '',
    shopCity: '',
    shopAddress: '',
    fleetSize: '',

    shopPhone: '',
    shopDescription: '',
    vehiclePhotos: [],
    
    // Event Specific Fields
    eventName: '',
    eventAddress: '',

    eventPhone: '',
    eventEmail: '',
    eventPhotos: [],
    
    // Document Uploads for Verification
    cnicCopy: null,
    businessPhotos: [],
    
    // Common Fields
    additionalInfo: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  const handleInputChange = (field) => (value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    // Validate individual field on blur
    const validationSchema = getValidationSchema(activeStep, selectedType);
    if (validationSchema[field]) {
      const { isValid, error } = validateField(formData[field], validationSchema[field]);
      if (!isValid) {
        setFormErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  };

  const validateCurrentStep = () => {
    const validationSchema = getValidationSchema(activeStep, selectedType);
    const validation = validateForm(formData, validationSchema);
    
    setFormErrors(validation.errors);
    setTouchedFields(Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));
    
    if (!validation.isValid && validation.firstErrorField) {
      focusOnField(validation.firstErrorField);
    }
    
    return validation.isValid;
  };

  const handleNext = () => {
    // Special validation for step 0 (service type selection)
    if (activeStep === 0 && !selectedType) {
      setError('Please select a service type to continue');
      return;
    }
    
    // Validate current step
    const currentStepValidation = getValidationSchema(activeStep, selectedType);
    const { isValid, errors } = validateForm(formData, currentStepValidation);
    
    if (!isValid) {
      setFormErrors(errors);
      setError('Please fix all validation errors before proceeding');
      return;
    }

    // Clear any previous errors
    setFormErrors({});
    setError(null);

    let nextStep = activeStep + 1;
    
    // Skip business details step for certain provider types
    if (nextStep === 2 && (selectedType === 'vehicle' || selectedType === 'hotel' || selectedType === 'restaurant' || selectedType === 'event' || selectedType === 'tour')) {
      nextStep = 3; // Skip to step 3
    }
    
    // Skip service details step for tour operators (simplified registration)
    if (nextStep === 3 && selectedType === 'tour') {
      nextStep = 4; // Skip directly to documents upload
    }
    
    setActiveStep(nextStep);
  };

  const handleBack = () => {
    let prevStep = activeStep - 1;
    
    // Skip service details step when going backwards for tour operators
    if (prevStep === 3 && selectedType === 'tour') {
      prevStep = 1; // Skip back to identity verification
    }
    
    // Skip business details step when going backwards for certain provider types
    if (prevStep === 2 && (selectedType === 'vehicle' || selectedType === 'hotel' || selectedType === 'restaurant' || selectedType === 'event' || selectedType === 'tour')) {
      prevStep = 1; // Skip back to step 1
    }
    
    setActiveStep(prevStep);
  };

  const handleSubmit = async () => {
    // Check if user is logged in
    if (!user) {
      setError('You must be logged in to submit a service provider request. Please log in first.');
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Authentication check:', { user, token });
    
    if (!token) {
      setError('Authentication token not found. Please log out and log in again to fix this issue.');
      return;
    }

    // Helper function to upload file to Cloudinary
    const uploadToCloudinary = async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "upload");
      
      const uploadResponse = await fetch(
        "https://api.cloudinary.com/v1_1/dpgelkpd4/image/upload",
        {
          method: "POST",
          body: formData
        }
      );
      
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }
      
      const uploadResult = await uploadResponse.json();
      return uploadResult.url;
    };

    // Upload all files to Cloudinary first
    const uploadFiles = async () => {
      const uploadPromises = {};
      
      // Single file uploads
      if (formData.cnicCopy && formData.cnicCopy instanceof File) {
        uploadPromises.cnicCopy = uploadToCloudinary(formData.cnicCopy);
      }
      
      if (formData.licensePhoto && formData.licensePhoto instanceof File) {
        uploadPromises.licensePhoto = uploadToCloudinary(formData.licensePhoto);
      }
      
      // Multiple file uploads
      if (formData.vehiclePhotos && formData.vehiclePhotos.length > 0) {
        uploadPromises.vehiclePhotos = Promise.all(
          formData.vehiclePhotos.filter(file => file instanceof File).map(uploadToCloudinary)
        );
      }
      
      if (formData.restaurantPhotos && formData.restaurantPhotos.length > 0) {
        uploadPromises.restaurantPhotos = Promise.all(
          formData.restaurantPhotos.filter(file => file instanceof File).map(uploadToCloudinary)
        );
      }
      
      if (formData.eventPhotos && formData.eventPhotos.length > 0) {
        uploadPromises.eventPhotos = Promise.all(
          formData.eventPhotos.filter(file => file instanceof File).map(uploadToCloudinary)
        );
      }
      
      // Wait for all uploads to complete
      const uploadedFiles = {};
      for (const [key, promise] of Object.entries(uploadPromises)) {
        try {
          uploadedFiles[key] = await promise;
        } catch (error) {
          console.error(`Failed to upload ${key}:`, error);
          throw new Error(`Failed to upload ${key}: ${error.message}`);
        }
      }
      
      return uploadedFiles;
    };

    // Validate all steps up to current
    let allErrors = {};
    let isAllValid = true;
    const currentStep = activeStep;

    for (let i = 1; i < currentStep; i++) {
      // Skip step 2 for simplified providers (no business details)
      if ((selectedType === 'vehicle' || selectedType === 'hotel' || selectedType === 'restaurant' || selectedType === 'event' || selectedType === 'tour') && i === 2) continue;
      // Skip step 3 for vehicles only (other simplified providers have details in step 3)
      if (selectedType === 'vehicle' && i === 3) continue;
      
      const stepValidation = getValidationSchema(i, selectedType);
      const { isValid: stepIsValid, errors: stepErrors } = validateForm(formData, stepValidation);
      
      if (!stepIsValid) {
        allErrors = { ...allErrors, ...stepErrors };
        isAllValid = false;
      }
    }

    const stepsToValidate = selectedType === 'hotel' ? [1, 3, 4] : 
                           selectedType === 'restaurant' ? [1, 3, 4] :
                           selectedType === 'event' ? [1, 3, 4] :
                           selectedType === 'tour' ? [1, 3, 4] :
                           selectedType === 'vehicle' ? [1, 3, 4] : [1, 2, 3, 4];
    
    if (!isAllValid) {
      setFormErrors(allErrors);
      setError('Please fix all validation errors before submitting');
      
      // Go back to first step with errors
      for (const step of stepsToValidate) {
        const validationSchema = getValidationSchema(step, selectedType);
        const hasStepErrors = Object.keys(validationSchema).some(field => allErrors[field]);
        if (hasStepErrors) {
          setActiveStep(step);
          break;
        }
      }
      return;
    }

    try {
      setFormLoading(true);
      setError(null);

      // Upload files to Cloudinary first
      console.log('Uploading files to Cloudinary...');
      const uploadedFiles = await uploadFiles();
      console.log('Files uploaded successfully:', uploadedFiles);

      // Map our form fields to backend expected format
      let requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        cnic: formData.cnic,
        mobileForOTP: formData.mobileForOTP,
        providerType: selectedType,
        status: 'pending'
      };

      // Add service-specific data
      if (selectedType === 'hotel') {
        // For hotels, include hotel details instead of business details
        requestData = {
          ...requestData,
          // Hotel specific details
          hotelName: formData.hotelName,
          hotelAddress: formData.hotelAddress,
          propertyType: formData.propertyType,
          numberOfRooms: parseInt(formData.numberOfRooms) || 0,
          starRating: parseInt(formData.starRating) || 1,
          priceRangeMin: parseFloat(formData.priceRangeMin) || 0,
          priceRangeMax: parseFloat(formData.priceRangeMax) || 0,
          hotelPhone: formData.hotelPhone,
          hotelEmail: formData.hotelEmail,
          amenities: formData.amenities || [],
          documents: {
            cnicCopy: uploadedFiles.cnicCopy || formData.cnicCopy,
            licensePhoto: uploadedFiles.licensePhoto || formData.licensePhoto
          }
        };
      } else if (selectedType === 'restaurant') {
        // For restaurants, include restaurant details instead of business details
        requestData = {
          ...requestData,
          // Restaurant specific details
          restaurantName: formData.restaurantName,
          restaurantAddress: formData.restaurantAddress,
          cuisineType: formData.cuisineType,
          seatingCapacity: parseInt(formData.seatingCapacity) || 0,
          restaurantPhone: formData.restaurantPhone,
          restaurantEmail: formData.restaurantEmail,
          documents: {
            cnicCopy: uploadedFiles.cnicCopy || formData.cnicCopy,
            restaurantPhotos: uploadedFiles.restaurantPhotos || formData.restaurantPhotos
          }
        };
      } else if (selectedType === 'event') {
        // For events, include event details instead of business details
        requestData = {
          ...requestData,
          // Event specific details
          eventName: formData.eventName,
          eventAddress: formData.eventAddress,
          eventPhone: formData.eventPhone,
          eventEmail: formData.eventEmail,
          documents: {
            cnicCopy: uploadedFiles.cnicCopy || formData.cnicCopy,
            eventPhotos: uploadedFiles.eventPhotos || formData.eventPhotos
          }
        };
      } else if (selectedType === 'tour') {
        // For tours, include tour details instead of business details
        requestData = {
          ...requestData,
          // Tour business details (simplified)
          documents: {
            cnicCopy: uploadedFiles.cnicCopy || formData.cnicCopy,
            licensePhoto: uploadedFiles.licensePhoto || formData.licensePhoto
          }
        };
      } else if (selectedType === 'vehicle') {
        // For vehicles, include rental shop details instead of business details
        requestData = {
          ...requestData,
          // Vehicle rental shop details
          shopName: formData.shopName,
          shopCity: formData.shopCity,
          shopAddress: formData.shopAddress,
          fleetSize: parseInt(formData.fleetSize) || 0,

          shopPhone: formData.shopPhone,
          shopDescription: formData.shopDescription,
          documents: {
            cnicCopy: uploadedFiles.cnicCopy || formData.cnicCopy,
            vehiclePhotos: uploadedFiles.vehiclePhotos || formData.vehiclePhotos
          }
        };
      }
      // All providers now use simplified registration - no additional business data needed

      console.log('Submitting request data:', requestData);

      // API call to submit service provider request
      const response = await api.post('/service-provider-requests', requestData);
      const result = response.data;

      console.log('Response status:', response.status);
      
      // Check if response is ok and is JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Request failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Non-JSON response:', errorText);
        throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 200)}...`);
      }

      console.log('Server response:', result);

      if (result.success) {
        setSuccess(true);
        setActiveStep(4); // Move to success step
        
        // Show success alert with approval notice
        Swal.fire({
          title: '🎉 Application Submitted Successfully!',
          html: `
            <div style="text-align: center; font-size: 16px; line-height: 1.6;">
              <p style="margin-bottom: 15px; color: #2e7d32;"><strong>Your ${selectedType} service provider request has been submitted!</strong></p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0; color: #555;"><strong>⏳ What happens next?</strong></p>
                <ul style="text-align: left; margin: 10px 0; padding-left: 20px; color: #666;">
                  <li>Our admin team will review your application</li>
                  <li>We'll verify your documents and business details</li>
                  <li>You'll receive an email notification about the approval status</li>
                  <li>This process typically takes 2-3 business days</li>
                </ul>
              </div>
              <p style="margin-top: 15px; color: #1976d2;"><strong>📧 Keep an eye on your email for updates!</strong></p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Back to Home',
          confirmButtonColor: '#1976d2',
          allowOutsideClick: false,
          customClass: {
            popup: 'swal-wide'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirect to home page
            window.location.href = '/';
          }
        });
      } else {
        // Handle backend validation errors
        if (result.fieldErrors || result.errors) {
          setFormErrors(result.fieldErrors || result.errors);
          
          // Find first step with errors and navigate to it
          for (let step = 1; step <= 3; step++) {
            const validationSchema = getValidationSchema(step, selectedType);
            const hasStepErrors = Object.keys(validationSchema).some(field => 
              (result.fieldErrors || result.errors)[field]
            );
            if (hasStepErrors) {
              setActiveStep(step);
              break;
            }
          }
        }
        throw new Error(result.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return touchedFields[fieldName] ? formErrors[fieldName] : null;
  };

  const renderStepContent = (step = activeStep) => {
    // Handle step skipping for providers that don't need business details
    let actualStep = step;
    if (step === 2 && (selectedType === 'vehicle' || selectedType === 'hotel' || selectedType === 'restaurant' || selectedType === 'event' || selectedType === 'tour')) {
      actualStep = 3; // Skip to step 3 (service details)
    }

    switch (actualStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                What type of service do you want to provide?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select the type of service you want to offer to travelers. This will help us configure your dashboard appropriately.
              </Typography>
            </Grid>
            {serviceProviderTypes.map((type) => (
              <Grid item xs={12} sm={6} md={4} key={type.value}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedType === type.value ? 2 : 1,
                    borderColor: selectedType === type.value ? 'primary.main' : 'grey.300',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => setSelectedType(type.value)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}>
                      {type.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {type.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                🛡️ Identity Verification
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We need to verify your identity to prevent fake ownership claims. All information will be cross-verified.
              </Typography>
              <FormErrorSummary errors={formErrors} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                onBlur={() => handleFieldBlur('firstName')}
                error={getFieldError('firstName')}
                required
                placeholder="Enter your first name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                onBlur={() => handleFieldBlur('lastName')}
                error={getFieldError('lastName')}
                required
                placeholder="Enter your last name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="cnic"
                label="CNIC Number"
                value={formData.cnic}
                onChange={handleInputChange('cnic')}
                onBlur={() => handleFieldBlur('cnic')}
                error={getFieldError('cnic')}
                required
                placeholder="XXXXX-XXXXXXX-X"
                helperText="Must match the business owner's CNIC"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="mobileForOTP"
                type="tel"
                label="Mobile Number"
                value={formData.mobileForOTP}
                onChange={handleInputChange('mobileForOTP')}
                onBlur={() => handleFieldBlur('mobileForOTP')}
                error={getFieldError('mobileForOTP')}
                required
                placeholder="Enter your mobile number"
                helperText="Mobile number required for verification"
              />
            </Grid>
            {/* Only show email and contact number for non-vehicle, non-hotel, non-restaurant, non-event, and non-tour providers */}
            {selectedType !== 'vehicle' && selectedType !== 'hotel' && selectedType !== 'restaurant' && selectedType !== 'event' && selectedType !== 'tour' && (
              <>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="email"
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    onBlur={() => handleFieldBlur('email')}
                    error={getFieldError('email')}
                    required
                    placeholder="Enter your email address"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="phone"
                    type="tel"
                    label="Contact Number"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    onBlur={() => handleFieldBlur('phone')}
                    error={getFieldError('phone')}
                    required
                    placeholder="Enter your contact number"
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 2:
        // Business Details step - No longer used for any providers (all simplified)
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                🚀 Step Skipped - Simplified Registration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Business details are no longer required for service provider registration. 
                All provider types now use simplified registration process.
              </Typography>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {selectedType === 'hotel' ? 'Hotel Details' : 
                 selectedType === 'vehicle' ? 'Vehicle Service Details' :
                 selectedType === 'restaurant' ? 'Restaurant Details' :
                 selectedType === 'tour' ? 'Tour Service Details' :
                 selectedType === 'event' ? 'Event Service Details' : 'Service Details'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedType === 'hotel' ? 'Provide information about your hotel property.' :
                 'Provide specific details about your service.'}
              </Typography>
              <FormErrorSummary errors={formErrors} />
            </Grid>
            
            {/* Hotel Specific Fields */}
            {selectedType === 'hotel' && (
              <>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="hotelName"
                    label="Hotel Name"
                    value={formData.hotelName}
                    onChange={handleInputChange('hotelName')}
                    onBlur={() => handleFieldBlur('hotelName')}
                    error={getFieldError('hotelName')}
                    required
                    placeholder="Enter your hotel name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ValidatedSelect
                    name="propertyType"
                    label="Property Type"
                    value={formData.propertyType}
                    onChange={handleInputChange('propertyType')}
                    onBlur={() => handleFieldBlur('propertyType')}
                    error={getFieldError('propertyType')}
                    options={['Hotel', 'Motel', 'B&B', 'Resort']}
                    required
                    placeholder="Select property type"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedInput
                    name="hotelAddress"
                    label="Hotel Address"
                    value={formData.hotelAddress}
                    onChange={handleInputChange('hotelAddress')}
                    onBlur={() => handleFieldBlur('hotelAddress')}
                    error={getFieldError('hotelAddress')}
                    required
                    placeholder="Enter complete hotel address"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ValidatedInput
                    name="numberOfRooms"
                    type="number"
                    label="Number of Rooms"
                    value={formData.numberOfRooms}
                    onChange={handleInputChange('numberOfRooms')}
                    onBlur={() => handleFieldBlur('numberOfRooms')}
                    error={getFieldError('numberOfRooms')}
                    required
                    placeholder="Enter number of rooms"
                    min="1"
                    max="1000"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ValidatedSelect
                    name="starRating"
                    label="Star Rating"
                    value={formData.starRating}
                    onChange={handleInputChange('starRating')}
                    onBlur={() => handleFieldBlur('starRating')}
                    error={getFieldError('starRating')}
                    options={['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']}
                    required
                    placeholder="Select star rating"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ValidatedInput
                    name="priceRangeMin"
                    type="number"
                    label="Min Price per Night"
                    value={formData.priceRangeMin}
                    onChange={handleInputChange('priceRangeMin')}
                    onBlur={() => handleFieldBlur('priceRangeMin')}
                    error={getFieldError('priceRangeMin')}
                    required
                    placeholder="Min price"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="priceRangeMax"
                    type="number"
                    label="Max Price per Night"
                    value={formData.priceRangeMax}
                    onChange={handleInputChange('priceRangeMax')}
                    onBlur={() => handleFieldBlur('priceRangeMax')}
                    error={getFieldError('priceRangeMax')}
                    required
                    placeholder="Max price"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="hotelPhone"
                    type="tel"
                    label="Hotel Contact Phone"
                    value={formData.hotelPhone}
                    onChange={handleInputChange('hotelPhone')}
                    onBlur={() => handleFieldBlur('hotelPhone')}
                    error={getFieldError('hotelPhone')}
                    required
                    placeholder="0XX-XXXXXXX or +92 XX XXXXXXX"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedInput
                    name="hotelEmail"
                    type="email"
                    label="Hotel Contact Email"
                    value={formData.hotelEmail}
                    onChange={handleInputChange('hotelEmail')}
                    onBlur={() => handleFieldBlur('hotelEmail')}
                    error={getFieldError('hotelEmail')}
                    required
                    placeholder="Hotel email address"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Amenities (Select all that apply)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['WiFi', 'Parking', 'Restaurant', 'Pool', 'Gym'].map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        clickable
                        color={formData.amenities.includes(amenity) ? 'primary' : 'default'}
                        onClick={() => {
                          const newAmenities = formData.amenities.includes(amenity)
                            ? formData.amenities.filter(a => a !== amenity)
                            : [...formData.amenities, amenity];
                          handleInputChange('amenities')(newAmenities);
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </>
            )}
            
            {/* Restaurant Specific Fields */}
            {selectedType === 'restaurant' && (
              <>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="restaurantName"
                    label="Restaurant Name"
                    value={formData.restaurantName}
                    onChange={handleInputChange('restaurantName')}
                    onBlur={() => handleFieldBlur('restaurantName')}
                    error={getFieldError('restaurantName')}
                    required
                    placeholder="Enter your restaurant name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedInput
                    name="restaurantAddress"
                    label="Restaurant Address"
                    value={formData.restaurantAddress}
                    onChange={handleInputChange('restaurantAddress')}
                    onBlur={() => handleFieldBlur('restaurantAddress')}
                    error={getFieldError('restaurantAddress')}
                    required
                    placeholder="Enter complete restaurant address"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ValidatedSelect
                    name="cuisineType"
                    label="Cuisine Type"
                    value={formData.cuisineType}
                    onChange={handleInputChange('cuisineType')}
                    onBlur={() => handleFieldBlur('cuisineType')}
                    error={getFieldError('cuisineType')}
                    options={['Pakistani', 'Chinese', 'Italian', 'Fast Food', 'Bakery', 'Others']}
                    required
                    placeholder="Select cuisine type"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <ValidatedInput
                    name="seatingCapacity"
                    type="number"
                    label="Seating Capacity"
                    value={formData.seatingCapacity}
                    onChange={handleInputChange('seatingCapacity')}
                    onBlur={() => handleFieldBlur('seatingCapacity')}
                    error={getFieldError('seatingCapacity')}
                    required
                    placeholder="Enter seating capacity"
                    min="1"
                    max="1000"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="restaurantPhone"
                    type="tel"
                    label="Restaurant Contact Phone"
                    value={formData.restaurantPhone}
                    onChange={handleInputChange('restaurantPhone')}
                    onBlur={() => handleFieldBlur('restaurantPhone')}
                    error={getFieldError('restaurantPhone')}
                    required
                    placeholder="0XX-XXXXXXX or +92 XX XXXXXXX"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedInput
                    name="restaurantEmail"
                    type="email"
                    label="Restaurant Contact Email"
                    value={formData.restaurantEmail}
                    onChange={handleInputChange('restaurantEmail')}
                    onBlur={() => handleFieldBlur('restaurantEmail')}
                    error={getFieldError('restaurantEmail')}
                    required
                    placeholder="Restaurant email address"
                  />
                </Grid>
              </>
            )}

            {/* Event Specific Fields */}
            {selectedType === 'event' && (
              <>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="eventName"
                    label="Event Name"
                    value={formData.eventName}
                    onChange={handleInputChange('eventName')}
                    onBlur={() => handleFieldBlur('eventName')}
                    error={getFieldError('eventName')}
                    required
                    placeholder="Enter event name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedInput
                    name="eventAddress"
                    label="Event Address"
                    value={formData.eventAddress}
                    onChange={handleInputChange('eventAddress')}
                    onBlur={() => handleFieldBlur('eventAddress')}
                    error={getFieldError('eventAddress')}
                    required
                    placeholder="Enter complete event address"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="eventPhone"
                    type="tel"
                    label="Event Contact Phone"
                    value={formData.eventPhone}
                    onChange={handleInputChange('eventPhone')}
                    onBlur={() => handleFieldBlur('eventPhone')}
                    error={getFieldError('eventPhone')}
                    required
                    placeholder="0XX-XXXXXXX or +92 XX XXXXXXX"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedInput
                    name="eventEmail"
                    type="email"
                    label="Event Contact Email"
                    value={formData.eventEmail}
                    onChange={handleInputChange('eventEmail')}
                    onBlur={() => handleFieldBlur('eventEmail')}
                    error={getFieldError('eventEmail')}
                    required
                    placeholder="Event email address"
                  />
                </Grid>
              </>
            )}

            {/* Tour operators skip this step entirely */}

            {/* Vehicle Rental Shop Details */}
            {selectedType === 'vehicle' && (
              <>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="shopName"
                    label="Rental Shop Name"
                    value={formData.shopName}
                    onChange={handleInputChange('shopName')}
                    onBlur={() => handleFieldBlur('shopName')}
                    error={getFieldError('shopName')}
                    required
                    placeholder="Enter your rental shop name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="shopCity"
                    label="Shop City"
                    value={formData.shopCity}
                    onChange={handleInputChange('shopCity')}
                    onBlur={() => handleFieldBlur('shopCity')}
                    error={getFieldError('shopCity')}
                    required
                    placeholder="Enter shop city"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedInput
                    name="shopAddress"
                    label="Shop Address"
                    value={formData.shopAddress}
                    onChange={handleInputChange('shopAddress')}
                    onBlur={() => handleFieldBlur('shopAddress')}
                    error={getFieldError('shopAddress')}
                    required
                    placeholder="Enter complete shop address"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="fleetSize"
                    type="number"
                    label="Total Number of Vehicles"
                    value={formData.fleetSize}
                    onChange={handleInputChange('fleetSize')}
                    onBlur={() => handleFieldBlur('fleetSize')}
                    error={getFieldError('fleetSize')}
                    required
                    placeholder="How many vehicles do you have?"
                    min="1"
                    max="500"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ValidatedInput
                    name="shopPhone"
                    type="tel"
                    label="Shop Contact Phone"
                    value={formData.shopPhone}
                    onChange={handleInputChange('shopPhone')}
                    onBlur={() => handleFieldBlur('shopPhone')}
                    error={getFieldError('shopPhone')}
                    required
                    placeholder="0XX-XXXXXXX or +92 XX XXXXXXX"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ValidatedInput
                    name="shopDescription"
                    label="Shop Description"
                    value={formData.shopDescription}
                    onChange={handleInputChange('shopDescription')}
                    onBlur={() => handleFieldBlur('shopDescription')}
                    error={getFieldError('shopDescription')}
                    required
                    multiline
                    rows={3}
                    placeholder="Describe your rental shop, services, and what makes you unique"
                  />
                </Grid>
              </>
            )}

            {/* Placeholder for other service types */}
            {selectedType !== 'hotel' && selectedType !== 'restaurant' && selectedType !== 'event' && selectedType !== 'tour' && selectedType !== 'vehicle' && (
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} specific fields will be available soon.
                </Typography>
              </Grid>
            )}
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                📄 Document Upload & Proof of Ownership
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload required documents to verify your business ownership. All documents will be manually reviewed by our admin team.
              </Typography>
              <FormErrorSummary errors={formErrors} />
            </Grid>
            
            {/* CNIC Copy */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                📄 Copy of CNIC (Owner) *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mb: 1 }}
              >
                {formData.cnicCopy ? 'CNIC Copy Uploaded ✓' : 'Upload CNIC Copy'}
                <input
                  hidden
                  accept="image/*,.pdf"
                  type="file"
                  onChange={(e) => handleInputChange('cnicCopy')(e.target.files[0])}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Must match the CNIC number provided above
              </Typography>
            </Grid>

            {/* For hotels - only CNIC and hotel front photo required (simplified) */}
            {selectedType === 'hotel' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  📸 Hotel Front Photo *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {formData.licensePhoto ? 'Hotel Front Photo Uploaded ✓' : 'Upload Hotel Front Photo'}
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) => handleInputChange('licensePhoto')(e.target.files[0])}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Photo of hotel front entrance
                </Typography>
              </Grid>
            )}

            {/* For restaurants - only CNIC and restaurant photos required (simplified) */}
            {selectedType === 'restaurant' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  📸 Restaurant Photos *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {formData.restaurantPhotos && formData.restaurantPhotos.length > 0 ? `${formData.restaurantPhotos.length} Photos Uploaded ✓` : 'Upload Restaurant Photos'}
                  <input
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={(e) => handleInputChange('restaurantPhotos')(Array.from(e.target.files))}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Photos of your restaurant interior, exterior, menu, and food items
                </Typography>
              </Grid>
            )}

            {/* For events - only CNIC and event photos required (simplified) */}
            {selectedType === 'event' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  📸 Event Photos *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {formData.eventPhotos && formData.eventPhotos.length > 0 ? `${formData.eventPhotos.length} Photos Uploaded ✓` : 'Upload Event Photos'}
                  <input
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={(e) => handleInputChange('eventPhotos')(Array.from(e.target.files))}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Photos of your event venue, activities, and participants
                </Typography>
              </Grid>
            )}

            {/* For tours - only CNIC and license photo required (simplified) */}
            {selectedType === 'tour' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  📸 License Display Photo *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {formData.licensePhoto ? 'License Photo Uploaded ✓' : 'Upload License Photo'}
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) => handleInputChange('licensePhoto')(e.target.files[0])}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Photo of business license displayed at property
                </Typography>
              </Grid>
            )}

            {/* For non-hotel, non-vehicle, non-restaurant, non-event, non-tour providers - show all business documents */}
            {selectedType !== 'vehicle' && selectedType !== 'hotel' && selectedType !== 'restaurant' && selectedType !== 'event' && selectedType !== 'tour' && (
              <>
                {/* Ownership Document */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    📄 Lease/Ownership Document *
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.ownershipDocument ? 'Ownership Doc Uploaded ✓' : 'Upload Ownership Document'}
                    <input
                      hidden
                      accept="image/*,.pdf"
                      type="file"
                      onChange={(e) => handleInputChange('ownershipDocument')(e.target.files[0])}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Attested lease agreement or property ownership document
                  </Typography>
                </Grid>

                {/* NTN Certificate File */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    📄 NTN Certificate *
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.ntnCertificateFile ? 'NTN Certificate Uploaded ✓' : 'Upload NTN Certificate'}
                    <input
                      hidden
                      accept="image/*,.pdf"
                      type="file"
                      onChange={(e) => handleInputChange('ntnCertificateFile')(e.target.files[0])}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Official NTN certificate from tax authorities
                  </Typography>
                </Grid>

                {/* Signboard Photo */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    📸 Photos of Signboard + License *
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.signboardPhoto ? 'Signboard Photo Uploaded ✓' : 'Upload Signboard Photo'}
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={(e) => handleInputChange('signboardPhoto')(e.target.files[0])}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Photo showing business signboard at the property
                  </Typography>
                </Grid>

                {/* License Photo */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    📸 License Display Photo *
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.licensePhoto ? 'License Photo Uploaded ✓' : 'Upload License Photo'}
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={(e) => handleInputChange('licensePhoto')(e.target.files[0])}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Photo of business license displayed at property
                  </Typography>
                </Grid>

                {/* Business Photos */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    📸 Additional Business Photos (Optional)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {formData.businessPhotos.length > 0 ? `${formData.businessPhotos.length} Photos Uploaded ✓` : 'Upload Business Photos'}
                    <input
                      hidden
                      accept="image/*"
                      multiple
                      type="file"
                      onChange={(e) => handleInputChange('businessPhotos')(Array.from(e.target.files))}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Additional photos of your business premises (optional)
                  </Typography>
                </Grid>
              </>
            )}

            {/* For vehicles - only CNIC and vehicle photos required (simplified) */}
            {selectedType === 'vehicle' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  📸 Vehicle Photos *
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {formData.vehiclePhotos && formData.vehiclePhotos.length > 0 ? `${formData.vehiclePhotos.length} Photos Uploaded ✓` : 'Upload Vehicle Photos'}
                  <input
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={(e) => handleInputChange('vehiclePhotos')(Array.from(e.target.files))}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Photos of your vehicle interior, exterior, and registration documents
                </Typography>
              </Grid>
            )}
          </Grid>
        );

      case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                📋 Review Your Application
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review your information before submitting. Your application will be manually reviewed by our admin team.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Service Type
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Service Type:</strong> {serviceProviderTypes.find(t => t.value === selectedType)?.label}
                </Typography>
                
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                  Identity Verification
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Name:</strong> {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>CNIC:</strong> {formData.cnic}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Mobile:</strong> {formData.mobileForOTP}
                </Typography>
                {/* Only show email and contact phone for providers that need business details */}
                {/* Business details removed - all providers use simplified registration */}
                
                {/* Service specific review - Show hotel details for hotels */}
                {selectedType === 'hotel' && (
                  <>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                      Hotel Details
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Hotel Name:</strong> {formData.hotelName}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Property Type:</strong> {formData.propertyType}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Hotel Address:</strong> {formData.hotelAddress}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Number of Rooms:</strong> {formData.numberOfRooms}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Star Rating:</strong> {formData.starRating}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Price Range:</strong> ${formData.priceRangeMin} - ${formData.priceRangeMax} per night
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Hotel Contact:</strong> {formData.hotelPhone} | {formData.hotelEmail}
                    </Typography>
                    {formData.amenities && formData.amenities.length > 0 && (
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Amenities:</strong> {formData.amenities.join(', ')}
                      </Typography>
                    )}
                  </>
                )}

                {/* Restaurant specific review */}
                {selectedType === 'restaurant' && (
                  <>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                      Restaurant Details
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Restaurant Name:</strong> {formData.restaurantName}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Address:</strong> {formData.restaurantAddress}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Cuisine Type:</strong> {formData.cuisineType}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Seating Capacity:</strong> {formData.seatingCapacity}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Contact:</strong> {formData.restaurantPhone} | {formData.restaurantEmail}
                    </Typography>
                  </>
                )}

                {/* Event specific review */}
                {selectedType === 'event' && (
                  <>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                      Event Details
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Event Name:</strong> {formData.eventName}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Address:</strong> {formData.eventAddress}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Contact:</strong> {formData.eventPhone} | {formData.eventEmail}
                    </Typography>
                  </>
                )}

                {/* Tour business review (simplified) */}
                {selectedType === 'tour' && (
                  <>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                      Tour Operator Registration (Simplified)
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Registration Type:</strong> Tour Operator
                    </Typography>
                  </>
                )}

                {/* Vehicle rental shop review */}
                {selectedType === 'vehicle' && (
                  <>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                      Vehicle Rental Shop Details
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Shop Name:</strong> {formData.shopName}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Shop Address:</strong> {formData.shopAddress}, {formData.shopCity}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Fleet Size:</strong> {formData.fleetSize} vehicles
                    </Typography>


                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Shop Contact:</strong> {formData.shopPhone}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Description:</strong> {formData.shopDescription}
                    </Typography>
                  </>
                )}

                {/* Documents uploaded summary - Service-specific */}
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                  Documents Uploaded
                </Typography>
                
                {/* Common for all services */}
                <Typography variant="subtitle1" gutterBottom>
                  <strong>CNIC Copy:</strong> {formData.cnicCopy ? '✅ Uploaded' : '❌ Not uploaded'}
                </Typography>
                
                {/* Service-specific documents */}
                {selectedType === 'tour' && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>License Photo:</strong> {formData.licensePhoto ? '✅ Uploaded' : '❌ Not uploaded'}
                  </Typography>
                )}
                
                {selectedType === 'hotel' && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Hotel Front Photo:</strong> {formData.licensePhoto ? '✅ Uploaded' : '❌ Not uploaded'}
                  </Typography>
                )}
                
                {selectedType === 'vehicle' && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Vehicle Photos:</strong> {formData.vehiclePhotos && formData.vehiclePhotos.length > 0 ? `✅ ${formData.vehiclePhotos.length} photos uploaded` : '❌ Not uploaded'}
                  </Typography>
                )}
                
                {selectedType === 'restaurant' && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Restaurant Photos:</strong> {formData.restaurantPhotos && formData.restaurantPhotos.length > 0 ? `✅ ${formData.restaurantPhotos.length} photos uploaded` : '❌ Not uploaded'}
                  </Typography>
                )}
                
                {selectedType === 'event' && (
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Event Photos:</strong> {formData.eventPhotos && formData.eventPhotos.length > 0 ? `✅ ${formData.eventPhotos.length} photos uploaded` : '❌ Not uploaded'}
                  </Typography>
                )}
              </Paper>
            </Grid>
            {success && (
              <Grid item xs={12}>
                <Alert severity="success">
                  <Typography variant="subtitle1" gutterBottom>
                    🎉 Application Submitted Successfully!
                  </Typography>
                  <Typography variant="body2">
                    Your service provider application has been submitted and is now under manual review by our admin team. 
                    We will verify all documents and may contact you for additional verification.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Next Steps:</strong><br/>
                    • Document verification (1-2 days)<br/>
                    • Phone/field verification if required<br/>
                    • Admin approval decision (3-5 business days)<br/>
                    • You'll receive updates at {formData.email}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            color: '#1a365d', 
            fontWeight: 'bold', 
            textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
            mb: 2 
          }}
        >
          Become a Service Provider
        </Typography>
        <Typography 
          variant="body1" 
          align="center" 
          sx={{ 
            mb: 4,
            color: '#2c5282', 
            textShadow: '1px 1px 2px rgba(255,255,255,0.7)',
            fontWeight: 500
          }}
        >
          Join our network of trusted service providers and start growing your business with Travely
        </Typography>

        <Paper 
          sx={{ 
            p: 4, 
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {getStepsForServiceType(selectedType).map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || success}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === 5 ? handleSubmit : handleNext}
              disabled={formLoading || success}
              size="large"
            >
              {formLoading ? 'Submitting...' : activeStep === 5 ? 'Submit Application' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default ServiceProviderRequest; 