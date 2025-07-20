import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Swal from 'sweetalert2';
import AdminBackButton from '../components/AdminBackButton';

const RestaurantServiceCreate = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Basic Restaurant Information
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisineType, setCuisineType] = useState('Pakistani');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [maxTableSize, setMaxTableSize] = useState('');
  const [totalTables, setTotalTables] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [description, setDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [closingHours, setClosingHours] = useState('');
  const [restaurantImage, setRestaurantImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cuisineTypes = [
    'Pakistani', 'Chinese', 'Italian', 'Continental', 'Fast Food', 
    'BBQ & Grill', 'Seafood', 'Indian', 'Arabic', 'Desi'
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRestaurantImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!restaurantName.trim()) {
      setError('Restaurant name is required');
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
    if (!seatingCapacity.trim()) {
      setError('Seating capacity is required');
      return false;
    }
    if (!totalTables.trim()) {
      setError('Total number of tables is required');
      return false;
    }
    if (!maxTableSize.trim()) {
      setError('Maximum people per table is required');
      return false;
    }
    if (!basePrice.trim()) {
      setError('Base price per table is required');
      return false;
    }
    if (!openingHours.trim()) {
      setError('Opening hours are required');
      return false;
    }
    if (!closingHours.trim()) {
      setError('Closing hours are required');
      return false;
    }
    if (!description.trim()) {
      setError('Restaurant description is required');
      return false;
    }
    if (!restaurantImage) {
      setError('Restaurant image is required');
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
        name: restaurantName,
        description: description,
        type: 'restaurant',
        price: parseFloat(basePrice),
        location: city,
        address: address,
        cuisineType,
        specialties,
        seatingCapacity: parseInt(seatingCapacity),
        totalTables: parseInt(totalTables),
        maxTableSize: parseInt(maxTableSize),
        operatingHours: {
          opening: openingHours,
          closing: closingHours
        },
        images: [restaurantImage],
        providerId: user?.id,
        status: 'active'
      };

      console.log("Creating restaurant service with data:", serviceData);

      const response = await fetch('http://localhost:5000/api/provider/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(serviceData)
      });

      const result = await response.json();
      console.log("Restaurant service creation result:", result);

      if (result.success) {
        console.log("Restaurant service created successfully:", result.data);
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${restaurantName} service created successfully!`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6'
        });
        
        navigate('/service-provider-dashboard');
      } else {
        console.error("Restaurant service creation failed:", result);
        throw new Error(result.message || 'Failed to create restaurant service');
      }
    } catch (error) {
      console.error('Error creating restaurant service:', error);
      setError(error.message || 'Failed to create restaurant service');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to create restaurant service'
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
              <h1 className="text-2xl font-bold text-center mb-6">Add Restaurant Service</h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Amazing Restaurant"
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
                    placeholder="Street address, building name, floor"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuisine Type *
                    </label>
                    <select
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {cuisineTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Tables *
                    </label>
                    <input
                      type="number"
                      value={totalTables}
                      onChange={(e) => setTotalTables(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="15"
                      min="1"
                      max="200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seating Capacity *
                    </label>
                    <input
                      type="number"
                      value={seatingCapacity}
                      onChange={(e) => setSeatingCapacity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                      min="1"
                      max="1000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum People per Table *
                  </label>
                  <input
                    type="number"
                    value={maxTableSize}
                    onChange={(e) => setMaxTableSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8"
                    min="1"
                    max="20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price per Table (PKR) *
                  </label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                    min="0"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">This is a base price for table reservation. Final pricing can be customized during booking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Hours *
                    </label>
                    <input
                      type="time"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Hours *
                    </label>
                    <input
                      type="time"
                      value={closingHours}
                      onChange={(e) => setClosingHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialties & Signature Dishes
                  </label>
                  <textarea
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Famous dishes, specialties, unique offerings..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your restaurant, ambiance, special features, dining experience..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {restaurantImage && (
                    <div className="mt-2">
                      <img src={restaurantImage} alt="Restaurant preview" className="w-32 h-24 object-cover rounded" />
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding Restaurant Service...' : 'Add Restaurant Service'}
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

export default RestaurantServiceCreate; 