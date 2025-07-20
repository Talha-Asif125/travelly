import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import api from '../../api/axios';

const VehicleReservationForm = ({ isOpen, onClose, onSuccess, vehicle }) => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    needDriver: false,
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!formData.returnDate) newErrors.returnDate = 'Return date is required';
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone number is required';
    if (!formData.cnicNumber.trim()) newErrors.cnicNumber = 'CNIC number is required';
    if (!formData.cnicPhoto) newErrors.cnicPhoto = 'CNIC photo is required';
    
    // Date validation
    if (formData.pickupDate && formData.returnDate) {
      const pickup = new Date(formData.pickupDate);
      const returnDate = new Date(formData.returnDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (pickup < today) {
        newErrors.pickupDate = 'Pickup date cannot be in the past';
      }
      if (returnDate <= pickup) {
        newErrors.returnDate = 'Return date must be after pickup date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    if (!formData.pickupDate || !formData.returnDate) return 0;
    
    const pickup = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    const days = Math.max(1, Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24)));
    
    const basePrice = vehicle?.price || 0;
    const driverFee = formData.needDriver ? 700000 : 0; // Static driver fee per day (PKR)
    return (basePrice + driverFee) * days;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        serviceId: vehicle._id,
        checkInDate: formData.pickupDate,
        checkOutDate: formData.returnDate,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        cnicNumber: formData.cnicNumber,
        cnicPhoto: formData.cnicPhoto,
        vehicleType: vehicle.vehicleType || vehicle.type,
        specialRequests: `${formData.specialRequests}${formData.needDriver ? ' | Driver Required' : ''}${formData.pickupLocation ? ` | Pickup: ${formData.pickupLocation}` : ''}`
      };

      const response = await api.post('/reservations', reservationData);

      if (response.data.success) {
        onSuccess(response.data.data);
        onClose();
        
        // Reset form
        setFormData({
          pickupDate: '',
          returnDate: '',
          pickupLocation: '',
          needDriver: false,
          customerName: user?.name || '',
          customerEmail: user?.email || '',
          customerPhone: '',
          cnicNumber: '',
          cnicPhoto: '',
          specialRequests: ''
        });
      }
    } catch (error) {
      console.error('Error creating vehicle reservation:', error);
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
              Reserve Vehicle: {vehicle?.vehicleBrand} {vehicle?.vehicleModel}
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
          {/* Vehicle Information Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {vehicle?.vehicleBrand} {vehicle?.vehicleModel} {vehicle?.vehicleYear}
            </h3>
            <p className="text-gray-600 mb-2">{vehicle?.vehicleType} • {vehicle?.seatingCapacity} seats</p>
            <p className="text-sm text-gray-500">{vehicle?.description}</p>
            <p className="text-lg font-semibold text-blue-600 mt-2">
              ${vehicle?.price}/day
            </p>
          </div>

          {/* Pickup/Return Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Date *
              </label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.pickupDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pickupDate && <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Date *
              </label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.returnDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.returnDate && <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>}
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location *
            </label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.pickupLocation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter pickup address"
            />
            {errors.pickupLocation && <p className="text-red-500 text-xs mt-1">{errors.pickupLocation}</p>}
          </div>

          {/* Driver Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Need Driver *
            </label>
            <select
              name="needDriver"
              value={formData.needDriver ? 'Yes' : 'No'}
              onChange={(e) => handleInputChange({ target: { name: 'needDriver', type: 'select', value: e.target.value === 'Yes' } })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.needDriver ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="No">No</option>
              <option value="Yes">Yes (+Rs. 700,000/day)</option>
            </select>
            {errors.needDriver && <p className="text-red-500 text-xs mt-1">{errors.needDriver}</p>}
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
          {formData.pickupDate && formData.returnDate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base price per day:</span>
                  <span>Rs. {vehicle?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of days:</span>
                  <span>{Math.max(1, Math.ceil((new Date(formData.returnDate) - new Date(formData.pickupDate)) / (1000 * 60 * 60 * 24)))}</span>
                </div>
                {formData.needDriver && (
                  <div className="flex justify-between">
                    <span>Driver fee per day:</span>
                    <span>Rs. 700,000</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>Rs. {calculateTotalAmount()}</span>
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
              {loading ? 'Creating Reservation...' : 'Reserve Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleReservationForm; 