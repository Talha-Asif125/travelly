import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Swal from 'sweetalert2';
import AdminBackButton from '../components/AdminBackButton';

const EventServiceCreate = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Basic Event Information
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [venueType, setVenueType] = useState('Indoor');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceType, setPriceType] = useState('per_person');
  const [eventDuration, setEventDuration] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState('');
  const [eventImage, setEventImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const eventTypes = [
    'Wedding', 'Corporate Event', 'Birthday Party', 'Anniversary', 
    'Conference', 'Seminar', 'Workshop', 'Exhibition', 'Concert',
    'Cultural Event', 'Religious Event', 'Sports Event', 'Graduation',
    'Baby Shower', 'Engagement', 'Reception', 'Product Launch'
  ];

  const venueTypes = [
    'Indoor', 'Outdoor', 'Both Indoor & Outdoor', 'Banquet Hall',
    'Garden', 'Rooftop', 'Beach', 'Farmhouse', 'Hotel', 'Convention Center'
  ];

  const priceTypes = [
    { value: 'per_person', label: 'Per Person' },
    { value: 'per_group', label: 'Per Group' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!eventName.trim()) {
      setError('Event venue name is required');
      return false;
    }
    if (!city.trim()) {
      setError('City is required');
      return false;
    }
    if (!address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!maxCapacity.trim()) {
      setError('Maximum capacity is required');
      return false;
    }
    if (!minCapacity.trim()) {
      setError('Minimum capacity is required');
      return false;
    }
    if (!basePrice.trim()) {
      setError('Base price is required');
      return false;
    }
    if (!eventDuration.trim()) {
      setError('Event duration is required');
      return false;
    }
    if (!eventDate.trim()) {
      setError('Event date is required');
      return false;
    }
    if (!startTime.trim()) {
      setError('Start time is required');
      return false;
    }
    if (!endTime.trim()) {
      setError('End time is required');
      return false;
    }
    if (!eventImage) {
      setError('Event venue image is required');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const serviceData = {
        name: eventName,
        description: description,
        type: 'event',
        price: parseFloat(basePrice),
        location: city,
        address: address,
        eventType,
        venueType,
        maxCapacity: parseInt(maxCapacity),
        minCapacity: parseInt(minCapacity),
        priceType,
        eventDuration: parseInt(eventDuration),
        eventDate,
        startTime,
        endTime,
        services,
        images: [eventImage],
        providerId: user?.id,
        status: 'active'
      };

      console.log("Creating event service with data:", serviceData);

      const response = await fetch('http://localhost:5000/api/provider/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(serviceData)
      });

      const result = await response.json();
      console.log("Event service creation result:", result);

      if (result.success) {
        console.log("Event service created successfully:", result.data);
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${eventName} event venue created successfully!`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6'
        });
        
        navigate('/service-provider-dashboard');
      } else {
        console.error("Event service creation failed:", result);
        throw new Error(result.message || 'Failed to create event service');
      }
    } catch (error) {
      console.error('Error creating event service:', error);
      setError(error.message || 'Failed to create event service');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to create event service'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminBackButton />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-center mb-6">Add Event Service</h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Venue Name *
                    </label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Grand Banquet Hall"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Lahore, Karachi, Islamabad"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Complete address with landmarks"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type *
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Type *
                    </label>
                    <select
                      value={venueType}
                      onChange={(e) => setVenueType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {venueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Capacity *
                    </label>
                    <input
                      type="number"
                      value={minCapacity}
                      onChange={(e) => setMinCapacity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Capacity *
                    </label>
                    <input
                      type="number"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pricing Type *
                    </label>
                    <select
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {priceTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price (PKR) *
                    </label>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Duration (Hours) *
                    </label>
                    <input
                      type="number"
                      value={eventDuration}
                      onChange={(e) => setEventDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="6"
                      min="1"
                      max="24"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Services
                  </label>
                  <textarea
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Photography, videography, entertainment, DJ services..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Venue Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your event venue, ambiance, special features, unique selling points..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Venue Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {eventImage && (
                    <div className="mt-2">
                      <img src={eventImage} alt="Event venue preview" className="w-32 h-24 object-cover rounded" />
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding Event Service...' : 'Add Event Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventServiceCreate; 