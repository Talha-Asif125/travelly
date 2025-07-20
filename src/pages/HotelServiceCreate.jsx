import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Swal from 'sweetalert2';
import AdminBackButton from '../components/AdminBackButton';

const HotelServiceCreate = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Basic Hotel Information
  const [hotelName, setHotelName] = useState('');

  const [starRating, setStarRating] = useState('3');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [totalRooms, setTotalRooms] = useState('');
  const [availableRooms, setAvailableRooms] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState('');
  const [hotelImage, setHotelImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const starRatings = ['1', '2', '3', '4', '5'];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHotelImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!hotelName.trim()) {
      setError('Hotel name is required');
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
    if (!totalRooms.trim()) {
      setError('Total rooms is required');
      return false;
    }
    if (!availableRooms.trim()) {
      setError('Available rooms is required');
      return false;
    }
    if (!pricePerNight.trim()) {
      setError('Price per night is required');
      return false;
    }
    if (!description.trim()) {
      setError('Hotel description is required');
      return false;
    }
    if (!hotelImage) {
      setError('Hotel image is required');
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
        name: hotelName,
        description: description,
        type: 'hotel',
        price: parseFloat(pricePerNight),
        location: city,
        address: address,
        starRating: parseInt(starRating),
        totalRooms: parseInt(totalRooms),
        availableRooms: parseInt(availableRooms),
        checkInTime,
        checkOutTime,
        facilities,
        images: [hotelImage],
        providerId: user?.id,
        status: 'active'
      };

      console.log("Creating hotel service with data:", serviceData);

      const response = await fetch('http://localhost:5000/api/provider/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(serviceData)
      });

      const result = await response.json();
      console.log("Hotel service creation result:", result);

      if (result.success) {
        console.log("Hotel service created successfully:", result.data);
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${hotelName} hotel service created successfully!`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6'
        });
        
        navigate('/service-provider-dashboard');
      } else {
        console.error("Hotel service creation failed:", result);
        throw new Error(result.message || 'Failed to create hotel service');
      }
    } catch (error) {
      console.error('Error creating hotel service:', error);
      setError(error.message || 'Failed to create hotel service');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to create hotel service'
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
              <h1 className="text-2xl font-bold text-center mb-6">Add Hotel Service</h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel Name *
                    </label>
                    <input
                      type="text"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Grand Palace Hotel"
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
                      Star Rating *
                    </label>
                    <select
                      value={starRating}
                      onChange={(e) => setStarRating(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {starRatings.map(rating => (
                        <option key={rating} value={rating}>{rating} Star{rating !== '1' ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Night (PKR) *
                    </label>
                    <input
                      type="number"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Rooms *
                    </label>
                    <input
                      type="number"
                      value={totalRooms}
                      onChange={(e) => setTotalRooms(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Rooms *
                    </label>
                    <input
                      type="number"
                      value={availableRooms}
                      onChange={(e) => setAvailableRooms(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="45"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Time *
                    </label>
                    <input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Time *
                    </label>
                    <input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facilities & Amenities
                  </label>
                  <textarea
                    value={facilities}
                    onChange={(e) => setFacilities(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="WiFi, Restaurant, Swimming Pool, Gym, Parking..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your hotel, location benefits, special features, services..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {hotelImage && (
                    <div className="mt-2">
                      <img src={hotelImage} alt="Hotel preview" className="w-32 h-24 object-cover rounded" />
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding Hotel Service...' : 'Add Hotel Service'}
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

export default HotelServiceCreate; 