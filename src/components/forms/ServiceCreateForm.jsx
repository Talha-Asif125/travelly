import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ServiceCreateForm = ({ isOpen, onClose, onSuccess, editingService = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'hotel',
    price: '',
    location: '',
    images: [],
    // Hotel fields
    roomType: '',
    availableRooms: '',
    // Tour fields
    duration: '',
    maxGroupSize: '',
    // Vehicle fields
    ownerName: '',
    brandName: '',
    model: '',
    vehicleType: 'Car',
    vehicleNumber: '',
    numberOfSeats: '',
    transmissionType: 'Auto',
    fuelType: 'Petrol',
    rentPrice: '',
    vehicleDescription: '',
    vehicleLocation: '',
    // Restaurant fields
    cuisineType: '',
    specialties: '',
    // Train fields
    from: '',
    to: '',
    trainNumber: '',
    departureTime: '',
    arrivalTime: '',
    classType: '',
    availableSeats: '',
    maxBaggage: '',
    cancelCharges: '',
    trainAmenities: '',  // Changed from 'amenities' to 'trainAmenities'
    scheduleDate: '',
    // Flight fields
    flightNumber: '',
    airline: '',
    aircraftType: '',
    // Event fields
    eventType: '',
    maxAttendees: '',
    venue: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const serviceTypes = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'tour', label: 'Tour' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'train', label: 'Train' },
    { value: 'flight', label: 'Flight' },
    { value: 'event', label: 'Event' }
  ];

  useEffect(() => {
    if (editingService) {
      setFormData({ ...editingService });
    }
  }, [editingService]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    // Type-specific validations
    if (formData.type === 'train' || formData.type === 'flight') {
      if (!formData.from.trim()) newErrors.from = 'Origin is required';
      if (!formData.to.trim()) newErrors.to = 'Destination is required';
      if (!formData.departureTime) newErrors.departureTime = 'Departure time is required';
      if (!formData.arrivalTime) newErrors.arrivalTime = 'Arrival time is required';
      
      if (formData.type === 'train') {
        if (!formData.trainNumber.trim()) newErrors.trainNumber = 'Train number is required';
      } else if (formData.type === 'flight') {
        if (!formData.flightNumber.trim()) newErrors.flightNumber = 'Flight number is required';
        if (!formData.airline.trim()) newErrors.airline = 'Airline is required';
      }
    } else if (formData.type === 'hotel') {
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        price: Number(formData.price),
        availableRooms: formData.availableRooms ? Number(formData.availableRooms) : undefined,
        maxGroupSize: formData.maxGroupSize ? Number(formData.maxGroupSize) : undefined,
        capacity: formData.capacity ? Number(formData.capacity) : undefined,
        availableSeats: formData.availableSeats ? Number(formData.availableSeats) : undefined,
        maxAttendees: formData.maxAttendees ? Number(formData.maxAttendees) : undefined
      };

      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      let response;
      if (editingService) {
        response = await api.put(`/provider/services/${editingService._id}`, submitData);
      } else {
        response = await api.post('/provider/services', submitData);
      }

      onSuccess(response.data.data);
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Failed to save service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'hotel':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Hotel location"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <input
                type="text"
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Deluxe, Standard, Suite"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Rooms
              </label>
              <input
                type="number"
                name="availableRooms"
                value={formData.availableRooms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Number of available rooms"
              />
            </div>
          </>
        );

      case 'train':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From (Origin) *
                </label>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.from ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Colombo"
                />
                {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To (Destination) *
                </label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.to ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Kandy"
                />
                {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Train Number *
              </label>
              <input
                type="text"
                name="trainNumber"
                value={formData.trainNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.trainNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., EXP001"
              />
              {errors.trainNumber && <p className="text-red-500 text-xs mt-1">{errors.trainNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Time *
                </label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.departureTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.departureTime && <p className="text-red-500 text-xs mt-1">{errors.departureTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Time *
                </label>
                <input
                  type="time"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.arrivalTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.arrivalTime && <p className="text-red-500 text-xs mt-1">{errors.arrivalTime}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Type
                </label>
                <select
                  name="classType"
                  value={formData.classType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select class</option>
                  <option value="First Class">First Class</option>
                  <option value="Business">Business</option>
                  <option value="Economy">Economy</option>
                  <option value="Sleeper">Sleeper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Seats
                </label>
                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of available seats"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenities
              </label>
              <input
                type="text"
                name="trainAmenities"
                value={formData.trainAmenities}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., AC, WiFi, Meals"
              />
            </div>
          </>
        );

      case 'flight':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From (Airport) *
                </label>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.from ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Colombo (CMB)"
                />
                {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To (Airport) *
                </label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.to ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Dubai (DXB)"
                />
                {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flight Number *
                </label>
                <input
                  type="text"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.flightNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., UL225"
                />
                {errors.flightNumber && <p className="text-red-500 text-xs mt-1">{errors.flightNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Airline *
                </label>
                <input
                  type="text"
                  name="airline"
                  value={formData.airline}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.airline ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., SriLankan Airlines"
                />
                {errors.airline && <p className="text-red-500 text-xs mt-1">{errors.airline}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Time *
                </label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.departureTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.departureTime && <p className="text-red-500 text-xs mt-1">{errors.departureTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Time *
                </label>
                <input
                  type="time"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.arrivalTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.arrivalTime && <p className="text-red-500 text-xs mt-1">{errors.arrivalTime}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aircraft Type
              </label>
              <input
                type="text"
                name="aircraftType"
                value={formData.aircraftType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Boeing 737, Airbus A330"
              />
            </div>
          </>
        );

      case 'vehicle':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Owner's Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.ownerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Name"
                />
                {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Brand Name *
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.brandName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Honda"
                />
                {errors.brandName && <p className="text-red-500 text-xs mt-1">{errors.brandName}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Civic"
                />
                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vehicleType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Motor Bike">Motor Bike</option>
                  <option value="Bus">Bus</option>
                </select>
                {errors.vehicleType && <p className="text-red-500 text-xs mt-1">{errors.vehicleType}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Registration Number *
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ABC-1234"
                />
                {errors.vehicleNumber && <p className="text-red-500 text-xs mt-1">{errors.vehicleNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats *
                </label>
                <input
                  type="number"
                  name="numberOfSeats"
                  value={formData.numberOfSeats}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.numberOfSeats ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="04"
                  min="1"
                  max="50"
                />
                {errors.numberOfSeats && <p className="text-red-500 text-xs mt-1">{errors.numberOfSeats}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission Type *
                </label>
                <select
                  name="transmissionType"
                  value={formData.transmissionType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.transmissionType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Auto">Auto</option>
                  <option value="Manual">Manual</option>
                </select>
                {errors.transmissionType && <p className="text-red-500 text-xs mt-1">{errors.transmissionType}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type *
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.fuelType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
                {errors.fuelType && <p className="text-red-500 text-xs mt-1">{errors.fuelType}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent Price (per day) *
              </label>
              <input
                type="number"
                name="rentPrice"
                value={formData.rentPrice}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.rentPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="150"
                min="1"
              />
              {errors.rentPrice && <p className="text-red-500 text-xs mt-1">{errors.rentPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="vehicleLocation"
                value={formData.vehicleLocation}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vehicleLocation ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city or location"
                list="cities"
              />
              <datalist id="cities">
                <option value="New York" />
                <option value="Los Angeles" />
                <option value="Chicago" />
                <option value="Houston" />
                <option value="Phoenix" />
                <option value="Philadelphia" />
                <option value="San Antonio" />
                <option value="San Diego" />
              </datalist>
              {errors.vehicleLocation && <p className="text-red-500 text-xs mt-1">{errors.vehicleLocation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="vehicleDescription"
                value={formData.vehicleDescription}
                onChange={handleInputChange}
                rows={4}
                maxLength={300}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vehicleDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Add your description here"
              />
              {errors.vehicleDescription && <p className="text-red-500 text-xs mt-1">{errors.vehicleDescription}</p>}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingService ? 'Edit Service' : 'Create New Service'}
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
          {/* Basic Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={editingService} // Don't allow changing type when editing
            >
              {serviceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter service name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your service"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter price"
              min="0"
              step="0.01"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Type-specific fields */}
          {renderTypeSpecificFields()}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceCreateForm; 