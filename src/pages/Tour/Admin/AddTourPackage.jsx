import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';
import Swal from 'sweetalert2';
import AdminBackButton from '../../../components/AdminBackButton';
import axios from "../../../api/axios";
import regularAxios from "axios";

const AddTourPackage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Basic Tour Information
  const [category, setCategory] = useState('');
  const [tourDate, setTourDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [duration, setDuration] = useState('');
  const [durationType, setDurationType] = useState('hours');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [description, setDescription] = useState('');
  
  // Car specific fields
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carImage, setCarImage] = useState(null);
  const [numberPlate, setNumberPlate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const durationTypes = ['minutes', 'hours', 'days'];

  const validateForm = () => {
    if (!category.trim()) {
      setError('Category is required');
      return false;
    }
    if (!tourDate.trim()) {
      setError('Tour date is required');
      return false;
    }
    if (!departureTime.trim()) {
      setError('Departure time is required');
      return false;
    }
    if (!duration.trim()) {
      setError('Duration is required');
      return false;
    }
    if (!pricePerPerson.trim()) {
      setError('Price per person is required');
      return false;
    }
    if (!availableSeats.trim()) {
      setError('Available seats is required');
      return false;
    }
    if (!fromLocation.trim()) {
      setError('From location is required');
      return false;
    }
    if (!toLocation.trim()) {
      setError('To location is required');
      return false;
    }
    if (!description.trim()) {
      setError('Description is required');
      return false;
    }

    // Validate car fields
    if (!carBrand.trim()) {
      setError('Car brand is required');
      return false;
    }
    if (!carModel.trim()) {
      setError('Car model is required');
      return false;
    }
    if (!numberPlate.trim()) {
      setError('Number plate is required');
      return false;
    }
    if (!carImage) {
      setError('Car image is required');
      return false;
    }

    setError('');
    return true;
  };

  const handleCarImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCarImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await Swal.fire({
        title: "Confirm to save details for review",
        showDenyButton: true,
        confirmButtonText: "confirm",
        denyButtonText: `cancel`,
      });

      if (result.isConfirmed) {
        // Upload image to Cloudinary
        const data = new FormData();
        data.append("file", carImage);
        data.append("upload_preset", "upload");
        
        const uploadRes = await regularAxios.post(
          "https://api.cloudinary.com/v1_1/dpgelkpd4/image/upload",
          data
        );

        const { url } = uploadRes.data;
        
        // Create tour data for admin API
        const tourData = {
          currentUser: user.email,
          img: url,
          name: `${carBrand} ${carModel}`,
          category,
          price: parseFloat(pricePerPerson),
          groupCount: parseInt(availableSeats),
          languages: "English, Urdu", // Default for admin
          duration: `${duration} ${durationType}`,
          cities: `${fromLocation} to ${toLocation}`,
          description,
          introduction: description, // Using description as introduction
          carBrand,
          carModel,
          numberPlate,
          tourDate,
          departureTime,
          fromLocation,
          toLocation,
          availableSeats: parseInt(availableSeats)
        };

        const response = await axios.post("/tours", tourData);
        
        Swal.fire(response.data.message, "", "success");
        navigate("/tours");
      } else {
        Swal.fire("Tour adding Cancelled!", "", "error");
      }
    } catch (error) {
      console.error('Error creating tour:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create tour";
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
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
          <h1 className="text-2xl font-bold text-center mb-6">Add Tour & Travel Service</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">--Select Category--</option>
                <option disabled style={{fontWeight: 'bold', backgroundColor: '#f0f0f0'}}>🏖️ TOURS</option>
                <option value="private car service">&nbsp;&nbsp;Private Car Service</option>
                <option value="city to city">&nbsp;&nbsp;City to City</option>
                <option value="wild safari">&nbsp;&nbsp;Wild Safari</option>
                <option value="cultural">&nbsp;&nbsp;Cultural</option>
                <option value="festival">&nbsp;&nbsp;Festival</option>
                <option value="special tours">&nbsp;&nbsp;Special Tours</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  value={tourDate}
                  onChange={(e) => setTourDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Time *
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From *
                </label>
                <input
                  type="text"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lahore"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To *
                </label>
                <input
                  type="text"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Karachi"
                  required
                />
              </div>
            </div>

            {/* Car fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Brand *
                </label>
                <input
                  type="text"
                  value={carBrand}
                  onChange={(e) => setCarBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Toyota, Honda"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Model *
                </label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Corolla, Civic"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number Plate *
                </label>
                <input
                  type="text"
                  value={numberPlate}
                  onChange={(e) => setNumberPlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ABC-123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCarImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {carImage && (
                  <div className="mt-2">
                    <img src={carImage} alt="Car preview" className="w-32 h-24 object-cover rounded" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration Type *
                </label>
                <select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {durationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Seats *
                </label>
                <input
                  type="number"
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3"
                  min="1"
                  max="20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Person (PKR) *
              </label>
              <input
                type="number"
                value={pricePerPerson}
                onChange={(e) => setPricePerPerson(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2500"
                min="0"
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
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what's included in this service, meeting point, what to expect, etc."
                required
              />
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Adding...' : 'Add Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTourPackage;
