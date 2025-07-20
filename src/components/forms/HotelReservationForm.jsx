import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import api from '../../api/axios';

const HotelReservationForm = ({ isOpen, onClose, onSuccess, hotel }) => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    rooms: 1,
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    cnicNumber: '',
    cnicPhoto: '',
    specialRequests: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          cnicPhoto: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone number is required';
    if (!formData.cnicNumber.trim()) newErrors.cnicNumber = 'CNIC number is required';
    if (!formData.cnicPhoto) newErrors.cnicPhoto = 'CNIC photo is required';
    
    // Date validation
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) {
        newErrors.checkInDate = 'Check-in date cannot be in the past';
      }
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }

    // Numeric validations
    if (formData.guests < 1) newErrors.guests = 'At least 1 guest is required';
    if (formData.rooms < 1) newErrors.rooms = 'At least 1 room is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const days = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    
    const basePrice = hotel?.price || 0;
    return basePrice * days * formData.rooms;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        serviceId: hotel._id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guests: parseInt(formData.guests),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        cnicNumber: formData.cnicNumber,
        cnicPhoto: formData.cnicPhoto,
        rooms: parseInt(formData.rooms),
        specialRequests: formData.specialRequests
      };

      const response = await api.post('/reservations', reservationData);

      if (response.data.success) {
        onSuccess(response.data.data);
        onClose();
        
        // Reset form
        setFormData({
          checkInDate: '',
          checkOutDate: '',
          guests: 1,
          rooms: 1,
          customerName: user?.name || '',
          customerEmail: user?.email || '',
          customerPhone: '',
          cnicNumber: '',
          cnicPhoto: '',
          specialRequests: ''
        });
      }
    } catch (error) {
      console.error('Error creating hotel reservation:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: error.response?.data?.message || 'Failed to create reservation. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Reserve Hotel: {hotel?.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Hotel Information Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{hotel?.name}</h3>
            <p className="text-gray-600 mb-2">{hotel?.location}</p>
            <p className="text-sm text-gray-500">{hotel?.description}</p>
            <p className="text-lg font-semibold text-blue-600 mt-2">
              ${hotel?.price}/night
            </p>
          </div>

          {/* Check-in/Check-out Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date *
              </label>
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.checkInDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.checkInDate && <p className="text-red-500 text-xs mt-1">{errors.checkInDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date *
              </label>
              <input
                type="date"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleInputChange}
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.checkOutDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.checkOutDate && <p className="text-red-500 text-xs mt-1">{errors.checkOutDate}</p>}
            </div>
          </div>

          {/* Room and Guest Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Rooms *
              </label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                min="1"
                max="10"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.rooms ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Number of rooms"
              />
              {errors.rooms && <p className="text-red-500 text-xs mt-1">{errors.rooms}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests *
              </label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleInputChange}
                min="1"
                max="20"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.guests ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Number of guests"
              />
              {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests}</p>}
            </div>
          </div>

          {/* Customer Information */}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNIC Number *
              </label>
              <input
                type="text"
                name="cnicNumber"
                value={formData.cnicNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cnicNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 12345-1234567-1"
              />
              {errors.cnicNumber && <p className="text-red-500 text-xs mt-1">{errors.cnicNumber}</p>}
            </div>
          </div>

          {/* CNIC Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNIC Photo * (For verification purposes)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cnicPhoto ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cnicPhoto && <p className="text-red-500 text-xs mt-1">{errors.cnicPhoto}</p>}
            <p className="text-sm text-gray-500 mt-1">Please upload a clear photo of your CNIC</p>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special requests or preferences (optional)"
            />
          </div>

          {/* Price Summary */}
          {formData.checkInDate && formData.checkOutDate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base price per night:</span>
                  <span>${hotel?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of nights:</span>
                  <span>{Math.max(1, Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24)))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of rooms:</span>
                  <span>{formData.rooms}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>${calculateTotalAmount()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Reservation...' : 'Reserve Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelReservationForm; 