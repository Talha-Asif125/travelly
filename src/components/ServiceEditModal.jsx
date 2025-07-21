import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const ServiceEditModal = ({ isOpen, onClose, service, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (service) {
      setFormData(service);
    }
  }, [service]);

  if (!isOpen) return null;

  const getServiceIcon = (type) => {
    const icons = {
      hotel: '🏨',
      vehicle: '🚗',
      tour: '🗺️',
      restaurant: '🍽️',
      event: '🎉'
    };
    return icons[type] || '🏢';
  };

  const getServiceFields = (type) => {
    const commonFields = [
      { key: 'name', label: 'Service Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'price', label: 'Price', type: 'number', required: true }
    ];

    const typeSpecificFields = {
      hotel: [
        { key: 'availableRooms', label: 'Available Rooms', type: 'number' },
        { key: 'checkInTime', label: 'Check-in Time', type: 'time' },
        { key: 'checkOutTime', label: 'Check-out Time', type: 'time' }
      ],
      vehicle: [
        { key: 'vehicleType', label: 'Vehicle Type', type: 'select', required: true, options: ['Hatchback', 'Sedan', 'SUV', 'Coupe', 'Convertible', 'Wagon', 'Crossover', 'Pickup Truck', 'Van', 'Minivan', 'Bus', 'Motorcycle', 'Scooter'] },
        { key: 'capacity', label: 'Seating Capacity', type: 'number', required: true },
        { key: 'vehicleNumber', label: 'Vehicle Number', type: 'text', required: true },
        { key: 'location', label: 'Location', type: 'text', required: true },
        { key: 'transmissionType', label: 'Transmission Type', type: 'select', options: ['Automatic', 'Manual'] },
        { key: 'fuelType', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] }
      ],
      tour: [
        { key: 'category', label: 'Tour Category', type: 'select', required: true, options: ['private car service', 'city to city', 'wild safari', 'cultural', 'festival', 'special tours'] },
        { key: 'tourDate', label: 'Service Date', type: 'date', required: true },
        { key: 'departureTime', label: 'Departure Time', type: 'time', required: true },
        { key: 'fromLocation', label: 'From', type: 'text', required: true },
        { key: 'toLocation', label: 'To', type: 'text', required: true },
        { key: 'duration', label: 'Duration', type: 'number', required: true },
        { key: 'durationType', label: 'Duration Type', type: 'select', options: ['hours', 'days', 'minutes'] },
        { key: 'availableSeats', label: 'Available Seats', type: 'number', required: true }
      ],
      restaurant: [
        { key: 'cuisineType', label: 'Cuisine Type', type: 'select', required: true, options: ['Pakistani', 'Chinese', 'Italian', 'Continental', 'Fast Food', 'BBQ & Grill', 'Seafood', 'Indian', 'Arabic', 'Desi'] },
        { key: 'location', label: 'City', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'text', required: true },
        { key: 'capacity', label: 'Seating Capacity', type: 'number', required: true },
        { key: 'totalTables', label: 'Total Tables', type: 'number' },
        { key: 'maxTableSize', label: 'Maximum People per Table', type: 'number' },
        { key: 'openingHours', label: 'Opening Hours', type: 'time' },
        { key: 'closingHours', label: 'Closing Hours', type: 'time' },
        { key: 'specialties', label: 'Specialties & Signature Dishes', type: 'textarea' }
      ],
      event: [
        { key: 'eventType', label: 'Event Type', type: 'select', required: true, options: ['Wedding', 'Corporate Event', 'Birthday Party', 'Anniversary', 'Conference', 'Seminar', 'Workshop', 'Exhibition', 'Concert', 'Cultural Event', 'Religious Event', 'Sports Event', 'Graduation', 'Baby Shower', 'Engagement', 'Reception', 'Product Launch'] },
        { key: 'venueType', label: 'Venue Type', type: 'select', required: true, options: ['Indoor', 'Outdoor', 'Both Indoor & Outdoor', 'Banquet Hall', 'Garden', 'Rooftop', 'Beach', 'Farmhouse', 'Hotel', 'Convention Center'] },
        { key: 'location', label: 'City', type: 'text', required: true },
        { key: 'address', label: 'Address', type: 'text', required: true },
        { key: 'minCapacity', label: 'Minimum Capacity', type: 'number', required: true },
        { key: 'maxCapacity', label: 'Maximum Capacity', type: 'number', required: true },
        { key: 'priceType', label: 'Pricing Type', type: 'select', options: ['per_person', 'per_group'] },
        { key: 'eventDuration', label: 'Event Duration (Hours)', type: 'number' },
        { key: 'eventDate', label: 'Event Date', type: 'date' },
        { key: 'startTime', label: 'Start Time', type: 'time' },
        { key: 'endTime', label: 'End Time', type: 'time' },
        { key: 'services', label: 'Additional Services', type: 'textarea' }
      ]
    };

    return [...commonFields, ...(typeSpecificFields[type] || [])];
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fields = getServiceFields(service.type);
    
    fields.forEach(field => {
      if (field.required && (!formData[field.key] || formData[field.key].toString().trim() === '')) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://travelly-backend-27bn.onrender.com/api/provider/services/${service._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Service updated successfully!',
          timer: 2000,
          showConfirmButton: false,
          background: '#f8f9fa',
          color: '#333'
        });
        onSave(result.data);
        onClose();
      } else {
        throw new Error(result.message || 'Failed to update service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update service',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.key] || '';
    const hasError = errors[field.key];

    const baseClasses = `w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
      hasError 
        ? 'border-red-500 bg-red-50 focus:border-red-500' 
        : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white'
    }`;

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={`${baseClasses} min-h-[100px] resize-none`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={4}
          />
          {hasError && <p className="text-red-500 text-xs">{hasError}</p>}
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.key} className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={baseClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && <p className="text-red-500 text-xs">{hasError}</p>}
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={field.type}
          value={value}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          className={baseClasses}
          placeholder={field.type !== 'date' && field.type !== 'time' ? `Enter ${field.label.toLowerCase()}` : ''}
        />
        {hasError && <p className="text-red-500 text-xs">{hasError}</p>}
      </div>
    );
  };

  const fields = getServiceFields(service?.type);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{getServiceIcon(service?.type)}</div>
              <div>
                <h2 className="text-2xl font-bold">Edit {service?.type?.charAt(0).toUpperCase() + service?.type?.slice(1)} Service</h2>
                <p className="text-blue-100">Update your service information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(field => renderField(field))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Update Service</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceEditModal; 