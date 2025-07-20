# Standardized Reservation Form Template

This document provides a template for creating consistent reservation forms across all services following the same design pattern as the service creation forms.

## Design Principles

All reservation forms should follow these design principles:

1. **Consistent Modal Structure**: Same modal layout with header, scrollable content, and actions
2. **Uniform Styling**: Same Tailwind CSS classes and patterns
3. **Standard Form Fields**: Common fields like customer info, dates, CNIC verification
4. **Service-Specific Fields**: Unique fields for each service type
5. **Real-time Validation**: Immediate error feedback
6. **Price Summary**: Dynamic calculation display
7. **Success Feedback**: Consistent success modal

## Template Structure

### 1. Component Setup
```jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import api from '../../api/axios';

const [ServiceType]ReservationForm = ({ isOpen, onClose, onSuccess, service }) => {
  const { user } = useContext(AuthContext);
  
  // State management
  const [formData, setFormData] = useState({
    // Common fields
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    cnicNumber: '',
    cnicPhoto: '',
    specialRequests: '',
    
    // Service-specific fields
    // Add fields specific to your service type
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // ... rest of component
};
```

### 2. Modal Structure
```jsx
return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Reserve [Service Type]: {service?.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            {/* Close icon */}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Service info display */}
        {/* Service-specific fields */}
        {/* Common customer fields */}
        {/* Price summary */}
        {/* Actions */}
      </form>
    </div>
  </div>
);
```

### 3. Common Form Sections

#### Service Information Display
```jsx
<div className="bg-gray-50 p-4 rounded-lg">
  <h3 className="text-lg font-medium text-gray-900 mb-2">{service?.name}</h3>
  <p className="text-gray-600 mb-2">{service?.location}</p>
  <p className="text-sm text-gray-500">{service?.description}</p>
  <p className="text-lg font-semibold text-blue-600 mt-2">
    ${service?.price}/[unit]
  </p>
</div>
```

#### Customer Information Fields
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Full Name *
    </label>
    <input
      type="text"
      name="customerName"
      value={formData.customerName}
      onChange={handleInputChange}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        errors.customerName ? 'border-red-500' : 'border-gray-300'
      }`}
      placeholder="Enter your full name"
    />
    {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
  </div>
  {/* Email, Phone, CNIC fields follow same pattern */}
</div>
```

#### Price Summary
```jsx
{/* Show when dates are selected */}
{formData.startDate && formData.endDate && (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span>Base price per [unit]:</span>
        <span>Rs. {service?.price}</span>
      </div>
      <div className="flex justify-between">
        <span>Duration:</span>
        <span>{duration} [units]</span>
      </div>
      <div className="border-t pt-2 flex justify-between font-semibold">
        <span>Total Amount:</span>
        <span>Rs. {calculateTotalAmount()}</span>
      </div>
    </div>
  </div>
)}
```

## Service-Specific Implementations

### Hotel Reservations
- **Dates**: Check-in/Check-out dates
- **Specific Fields**: Number of rooms, guests, room type
- **Unit**: per night

### Vehicle Reservations  
- **Dates**: Pickup/Return dates
- **Specific Fields**: Pickup location, driver needed
- **Unit**: per day

### Restaurant Reservations
- **Dates**: Reservation date/time
- **Specific Fields**: Number of diners, table preference, meal type
- **Unit**: per person or flat rate

### Tour Reservations
- **Dates**: Tour date
- **Specific Fields**: Number of participants, group size
- **Unit**: per person

### Train/Flight Reservations
- **Dates**: Travel date
- **Specific Fields**: Number of passengers, class type, seat preferences
- **Unit**: per passenger

### Event Reservations
- **Dates**: Event date/time
- **Specific Fields**: Number of attendees, event type, duration
- **Unit**: per person or flat rate

## Implementation Steps

1. **Copy Template**: Use HotelReservationForm.jsx as your starting template
2. **Customize Fields**: Replace hotel-specific fields with your service fields
3. **Update Validation**: Modify validation rules for your service
4. **Adjust Calculations**: Update price calculation logic
5. **Update Labels**: Change all text to match your service type
6. **Test Integration**: Connect to your service details page
7. **Add Success Modal**: Use ReservationSuccessModal.jsx

## Integration Example

```jsx
// In your service details component
import [ServiceType]ReservationForm from '../forms/[ServiceType]ReservationForm';
import ReservationSuccessModal from '../ui/ReservationSuccessModal';

const [ServiceType]Details = () => {
  const [openReservationForm, setOpenReservationForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationData, setReservationData] = useState(null);

  const handleReservationSuccess = (reservation) => {
    setReservationData(reservation);
    setShowSuccessModal(true);
  };

  return (
    <div>
      {/* Service details content */}
      
      <button onClick={() => setOpenReservationForm(true)}>
        Reserve Now
      </button>

      {/* Reservation Form */}
      <[ServiceType]ReservationForm
        isOpen={openReservationForm}
        onClose={() => setOpenReservationForm(false)}
        onSuccess={handleReservationSuccess}
        service={serviceData}
      />

      {/* Success Modal */}
      <ReservationSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        reservationData={reservationData}
      />
    </div>
  );
};
```

## Benefits of This Approach

1. **Consistent User Experience**: All reservation forms look and behave the same
2. **Easy Maintenance**: Changes to the design pattern can be applied across all forms
3. **Reduced Development Time**: Copy and customize instead of building from scratch
4. **Better User Trust**: Professional, consistent interface builds confidence
5. **Accessibility**: Standard form patterns ensure better accessibility
6. **Mobile Responsive**: All forms work well on all device sizes

## Next Steps

Apply this pattern to create reservation forms for:
- ✅ Hotels (completed)
- ✅ Vehicles (completed)  
- ⏳ Restaurants
- ⏳ Tours
- ⏳ Trains
- ⏳ Flights
- ⏳ Events

Each implementation should take 2-3 hours and result in a professional, consistent reservation experience for users. 