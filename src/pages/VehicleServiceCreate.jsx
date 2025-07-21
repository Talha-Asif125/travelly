import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Swal from 'sweetalert2';
import AdminBackButton from '../components/AdminBackButton';

const VehicleServiceCreate = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { user } = useContext(AuthContext);
  
  // Check if we're in edit mode
  const isEditMode = routeLocation.state?.isEdit || false;
  const editData = routeLocation.state?.service || null;

  // Basic Vehicle Information
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [transmissionType, setTransmissionType] = useState('Automatic');
  const [fuelType, setFuelType] = useState('Petrol');
  const [pricePerDay, setPricePerDay] = useState('');
  const [vehicleLocation, setVehicleLocation] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleImage, setVehicleImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const vehicleTypes = [
    'Hatchback',
    'Sedan', 
    'SUV',
    'Coupe',
    'Convertible',
    'Wagon',
    'Crossover',
    'Pickup Truck',
    'Van',
    'Minivan',
    'Bus',
    'Motorcycle',
    'Scooter'
  ];
  const transmissionTypes = ['Automatic', 'Manual'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

  // Populate form fields when in edit mode
  useEffect(() => {
    console.log('Edit mode:', isEditMode);
    console.log('Edit data:', editData);
    console.log('All available keys in edit data:', editData ? Object.keys(editData) : 'No data');
    
    if (isEditMode && editData) {
      console.log('Populating form fields with:', editData);
      
      // Clear any existing errors when entering edit mode
      setError('');
      
      // Set all form fields with existing data - check all possible field names
      const brand = editData.vehicleBrand || editData.brandName || editData.brand || '';
      const model = editData.vehicleModel || editData.model || '';
      const year = editData.vehicleYear?.toString() || editData.year?.toString() || '';
      const type = editData.vehicleType || editData.type || 'Sedan';
      const number = editData.vehicleNumber || editData.registrationNumber || editData.plateNumber || '';
      const capacity = editData.seatingCapacity?.toString() || editData.capacity?.toString() || editData.numberOfSeats?.toString() || '';
      const transmission = editData.transmissionType || editData.transmission || 'Automatic';
      const fuel = editData.fuelType || editData.fuel || 'Petrol';
      const price = editData.price?.toString() || editData.rentPrice?.toString() || editData.pricePerDay?.toString() || '';
      const location = editData.location || editData.vehicleLocation || '';
      const desc = editData.description || editData.vehicleDescription || '';
      
      console.log('Extracted values:');
      console.log('Brand:', brand);
      console.log('Model:', model);
      console.log('Year:', year);
      console.log('Type:', type);
      console.log('Number:', number);
      console.log('Capacity:', capacity);
      console.log('Transmission:', transmission);
      console.log('Fuel:', fuel);
      console.log('Price:', price);
      console.log('Location:', location);
      console.log('Description:', desc);
      
      setVehicleBrand(brand);
      setVehicleModel(model);
      setVehicleYear(year);
      setVehicleType(type);
      setVehicleNumber(number);
      setSeatingCapacity(capacity);
      setTransmissionType(transmission);
      setFuelType(fuel);
      setPricePerDay(price);
      setVehicleLocation(location);
      setDescription(desc);
      
      // Handle images - show existing image if available
      if (editData.images && editData.images.length > 0) {
        console.log('Setting vehicle image:', editData.images[0]);
        setVehicleImage(editData.images[0]);
      } else if (editData.image) {
        console.log('Setting vehicle image from image field:', editData.image);
        setVehicleImage(editData.image);
      } else if (editData.vehicleMainImg) {
        console.log('Setting vehicle image from vehicleMainImg:', editData.vehicleMainImg);
        setVehicleImage(editData.vehicleMainImg);
      }
      
      console.log('Form fields populated successfully');
    }
  }, [isEditMode, editData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehicleImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!vehicleBrand.trim()) {
      setError('Vehicle brand is required');
      return false;
    }
    if (!vehicleModel.trim()) {
      setError('Vehicle model is required');
      return false;
    }
    if (!vehicleYear.trim()) {
      setError('Vehicle year is required');
      return false;
    }
    if (!vehicleNumber.trim()) {
      setError('Vehicle number is required');
      return false;
    }
    if (!seatingCapacity.trim()) {
      setError('Seating capacity is required');
      return false;
    }
    if (!pricePerDay.trim()) {
      setError('Price per day is required');
      return false;
    }
    if (!vehicleLocation.trim()) {
      setError('Location is required');
      return false;
    }
    if (!description.trim()) {
      setError('Description is required');
      return false;
    }
    // Only require image for new services, not when editing
    if (!vehicleImage && !isEditMode) {
      setError('Vehicle image is required');
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
        name: `${vehicleYear} ${vehicleBrand} ${vehicleModel}`,
        description: description,
        type: 'vehicle',
        price: parseFloat(pricePerDay),
        location: vehicleLocation,
        vehicleBrand,
        vehicleModel,
        vehicleYear: parseInt(vehicleYear),
        vehicleType,
        vehicleNumber: vehicleNumber.toUpperCase(),
        seatingCapacity: parseInt(seatingCapacity),
        capacity: parseInt(seatingCapacity), // Legacy field for backward compatibility
        transmissionType,
        fuelType,
        images: vehicleImage ? [vehicleImage] : (isEditMode ? editData.images : []),
        providerId: user?.id,
        status: 'active'
      };

      const url = isEditMode 
        ? `https://travelly-backend-27bn.onrender.com/api/provider/services/${editData._id}`
        : 'https://travelly-backend-27bn.onrender.com/api/provider/services';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(serviceData)
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Vehicle service ${isEditMode ? 'updated' : 'created'} successfully!`,
          confirmButtonText: 'OK'
        });
        
        navigate('/service-provider-dashboard');
      } else {
        throw new Error(result.message || 'Failed to create vehicle service');
      }
    } catch (error) {
      console.error('Error creating vehicle service:', error);
      setError(error.message || 'Failed to create vehicle service');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to create vehicle service'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminBackButton />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white shadow-lg rounded-lg p-6">
                        <h1 className="text-2xl font-bold text-center mb-6">
                {isEditMode ? 'Edit Vehicle Service' : 'Add Vehicle Service'}
              </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Brand *
                </label>
                <input
                  type="text"
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Honda, Toyota, etc."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Model *
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Civic, Corolla, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2020"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seating Capacity *
                </label>
                <input
                  type="number"
                  value={seatingCapacity}
                  onChange={(e) => setSeatingCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                  min="1"
                  max="50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission Type *
                </label>
                <select
                  value={transmissionType}
                  onChange={(e) => setTransmissionType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {transmissionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type *
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {fuelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC-1234"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Day (PKR) *
                </label>
                <input
                  type="number"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                                  value={vehicleLocation}
                  onChange={(e) => setVehicleLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, Area"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your vehicle and rental terms"
                required
              />
            </div>

                            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isEditMode ? 'Change Vehicle Image (Optional)' : 'Vehicle Image *'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!isEditMode}
                  />
                  {vehicleImage && (
                    <div className="mt-2">
                      <img src={vehicleImage} alt="Vehicle preview" className="w-32 h-24 object-cover rounded" />
                      {isEditMode && <p className="text-sm text-gray-500 mt-1">Current image</p>}
                    </div>
                  )}
                </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading 
                  ? (isEditMode ? 'Updating...' : 'Adding...') 
                  : (isEditMode ? 'Update Vehicle Service' : 'Add Vehicle Service')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default VehicleServiceCreate; 