import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip
} from '@mui/material';
import { Hotel, DirectionsCar, Tour, Restaurant, Event } from '@mui/icons-material';
import ValidatedInput, { ValidatedTextarea, ValidatedSelect, FormErrorSummary } from '../components/form/ValidatedInput';
import { validateForm, validateField, CommonSchemas, ValidationTypes, focusOnField } from '../utils/formValidation';
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
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const steps = ['Select Service Type', 'Identity Verification', 'Business Details', 'Service Details', 'Document Upload', 'Submit Request'];

// Enhanced validation schema with specific rules for each step
const getValidationSchema = (step, serviceType) => {
  switch (step) {
    case 1: // Identity Verification
      return {
        firstName: [{ type: ValidationTypes.REQUIRED }],
        lastName: [{ type: ValidationTypes.REQUIRED }],
        email: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.EMAIL }
        ],
        phone: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.PATTERN, param: /^(\+92|92|0)?[0-9]{2,3}[0-9]{7,8}$/ }
        ],
        cnic: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.PATTERN, param: /^\d{5}-\d{7}-\d{1}$/ }
        ],
        mobileForOTP: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.PATTERN, param: /^(\+92|92|0)?3[0-9]{2}[0-9]{7}$/ }
        ]
      };
    
    case 2: // Business Details  
      return {
        businessName: [{ type: ValidationTypes.REQUIRED }],
        businessPhone: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.PATTERN, param: /^(\+92|92|0)?[0-9]{2,3}[0-9]{7,8}$/ }
        ],
        businessEmail: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.EMAIL }
        ],
        experience: [
          { type: ValidationTypes.REQUIRED },
          { type: ValidationTypes.POSITIVE_NUMBER }
        ],
        ntnCertificate: [{ type: ValidationTypes.REQUIRED }],
        businessRegistrationNumber: [{ type: ValidationTypes.REQUIRED }]
      };
    
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
            { type: ValidationTypes.PATTERN, param: /^(\+92|92|0)?[0-9]{2,3}[0-9]{7,8}$/ }
          ],
          hotelEmail: [
            { type: ValidationTypes.REQUIRED },
            { type: ValidationTypes.EMAIL }
          ]
        };
      }
      // Add other service types here in the future
      return {};
    
    case 4: // Document Upload
      return {
        cnicCopy: [{ type: ValidationTypes.REQUIRED }],
        ownershipDocument: [{ type: ValidationTypes.REQUIRED }],
        ntnCertificateFile: [{ type: ValidationTypes.REQUIRED }],
        signboardPhoto: [{ type: ValidationTypes.REQUIRED }],
        licensePhoto: [{ type: ValidationTypes.REQUIRED }]
      };
    
    default:
      return {};
  }
};

const ServiceProviderRequestEnhanced = () => {
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
    
    // Business Details
    businessName: '',
    businessPhone: '',
    businessEmail: '',
    experience: '',
    
    // Required Business Documents
    ntnCertificate: '',
    businessRegistrationNumber: '',
    
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
    cuisineType: '',
    seatingCapacity: '',
    
    // Tour Specific Fields (for future)
    tourTypes: [],
    maxGroupSize: '',
    
    // Event Specific Fields (for future)
    eventTypes: [],
    venueCapacity: '',
    
    // Document Uploads for Verification
    cnicCopy: null,
    ownershipDocument: null,
    ntnCertificateFile: null,
    businessPhotos: [],
    signboardPhoto: null,
    licensePhoto: null,
    
    // Common Fields
    additionalInfo: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
    if (activeStep === 0 && !selectedType) {
      setError('Please select a service type to continue');
      return;
    }
    
    if (activeStep > 0) {
      const isValid = validateCurrentStep();
      if (!isValid) {
        setError('Please fix the validation errors below before continuing');
        return;
      }
    }
    
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    // Validate all steps
    let hasErrors = false;
    const allErrors = {};
    
    for (let step = 1; step <= 3; step++) {
      const validationSchema = getValidationSchema(step);
      const validation = validateForm(formData, validationSchema);
      
      if (!validation.isValid) {
        hasErrors = true;
        Object.assign(allErrors, validation.errors);
      }
    }
    
    if (hasErrors) {
      setFormErrors(allErrors);
      setError('Please fix all validation errors before submitting');
      
      // Go back to first step with errors
      for (let step = 1; step <= 3; step++) {
        const validationSchema = getValidationSchema(step);
        const hasStepErrors = Object.keys(validationSchema).some(field => allErrors[field]);
        if (hasStepErrors) {
          setActiveStep(step);
          break;
        }
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Map our form fields to backend expected format
      const requestData = {
        ...formData,
        providerType: selectedType,
        status: 'pending',
        // Map renamed fields for backend compatibility
        registrationNumber: formData.businessRegistrationNumber,
        licenseNumber: formData.ntnCertificate,
        taxId: formData.ntnCertificate, // Using same NTN for both license and tax ID
        // Add required business address fields (using hotel address for hotels)
        businessAddress: formData.hotelAddress || formData.businessName || 'Not specified',
        businessCity: formData.hotelCity || 'Not specified', 
        businessState: formData.hotelState || 'Not specified',
        businessZip: formData.hotelZip || '00000',
        // Add required service details
        serviceDetails: `${selectedType} service provider with ${formData.experience} years of experience`,
        // Ensure experience is a number
        experience: parseInt(formData.experience) || 0
      };

      // API call to submit service provider request
      const response = await api.post('/service-provider-requests', requestData);
      const result = response.data;

      if (result.success) {
        setSuccess(true);
        
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
        throw new Error(result.message || 'Failed to submit request');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return touchedFields[fieldName] ? formErrors[fieldName] : null;
  };

  const renderStepContent = () => {
    switch (activeStep) {
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
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                🏢 Business Information & Registration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Provide your business details and registration information. All numbers will be verified against official records.
              </Typography>
              <FormErrorSummary errors={formErrors} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="businessName"
                label="Business Name"
                value={formData.businessName}
                onChange={handleInputChange('businessName')}
                onBlur={() => handleFieldBlur('businessName')}
                error={getFieldError('businessName')}
                required
                placeholder="Enter your business name"
                helperText="Must match official registration"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="businessRegistrationNumber"
                label="Business Registration Number"
                value={formData.businessRegistrationNumber}
                onChange={handleInputChange('businessRegistrationNumber')}
                onBlur={() => handleFieldBlur('businessRegistrationNumber')}
                error={getFieldError('businessRegistrationNumber')}
                required
                placeholder="Enter business registration number"
                helperText="As per official business registration certificate"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="ntnCertificate"
                label="NTN Certificate Number"
                value={formData.ntnCertificate}
                onChange={handleInputChange('ntnCertificate')}
                onBlur={() => handleFieldBlur('ntnCertificate')}
                error={getFieldError('ntnCertificate')}
                required
                placeholder="Enter NTN certificate number"
                helperText="National Tax Number - Required for verification"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="experience"
                type="number"
                label="Years of Experience"
                value={formData.experience}
                onChange={handleInputChange('experience')}
                onBlur={() => handleFieldBlur('experience')}
                error={getFieldError('experience')}
                required
                placeholder="Enter years of experience"
                min="0"
                max="50"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="businessPhone"
                type="tel"
                label="Pakistani Business Phone"
                value={formData.businessPhone}
                onChange={handleInputChange('businessPhone')}
                onBlur={() => handleFieldBlur('businessPhone')}
                error={getFieldError('businessPhone')}
                required
                placeholder="0XX-XXXXXXX or +92 XX XXXXXXX"
                helperText="We may call this Pakistani number for verification"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValidatedInput
                name="businessEmail"
                type="email"
                label="Business Email"
                value={formData.businessEmail}
                onChange={handleInputChange('businessEmail')}
                onBlur={() => handleFieldBlur('businessEmail')}
                error={getFieldError('businessEmail')}
                required
                placeholder="Enter your business email"
              />
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
                    label="Pakistani Hotel Contact Phone"
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
            
            {/* Placeholder for other service types */}
            {selectedType !== 'hotel' && (
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
                Review Your Application
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review your information before submitting your application.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Service Type:</strong> {serviceProviderTypes.find(t => t.value === selectedType)?.label}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Personal Details:</strong> {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Email:</strong> {formData.email}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Phone:</strong> {formData.phone}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Business Name:</strong> {formData.businessName}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Business Email:</strong> {formData.businessEmail}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Experience:</strong> {formData.experience}
                </Typography>
                
                {/* Hotel specific review */}
                {selectedType === 'hotel' && (
                  <>
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
                    {formData.amenities.length > 0 && (
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>Amenities:</strong> {formData.amenities.join(', ')}
                      </Typography>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
            {success && (
              <Grid item xs={12}>
                <Alert severity="success">
                  Your application has been submitted successfully! We will review it and get back to you within 3-5 business days.
                  You will receive a confirmation email shortly at {formData.email}.
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
            {steps.map((label) => (
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
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={loading || success}
              size="large"
            >
              {loading ? 'Submitting...' : activeStep === steps.length - 1 ? 'Submit Application' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default ServiceProviderRequestEnhanced; 