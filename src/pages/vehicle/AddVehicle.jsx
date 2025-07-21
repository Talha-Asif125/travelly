import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Swal from 'sweetalert2'
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import AdminBackButton from "../../components/AdminBackButton";

const AddVehicle = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const countWords = (description) => {
    return description.trim().split(/./g).length;
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateVehicleNumber = () => {
    // More generic validation - accepts various formats including letters, numbers, and common separators
    const regex = /^[A-Z0-9]{1,10}[-\s]?[A-Z0-9]{1,10}$/i;
    
    console.log("Validating vehicle number:", vehicleNumber);
    
    if (!vehicleNumber) {
      console.error("Vehicle number is empty");
      setError('Vehicle number cannot be empty');
      return false;
    }
    
    if (!regex.test(vehicleNumber)) {
      console.error("Invalid vehicle number format:", vehicleNumber);
      setError('Please enter a valid vehicle registration number.');
      return false;
    }
    
    console.log("Vehicle number is valid");
    setError('');
    return true;
  };

  const [ownerName, setOwnerName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [model, setModel] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [numberOfSeats, setNumberOfSeats] = useState('');
  const [transmissionType, setTransmissionType] = useState('Auto');
  const [fuelType, setFuelType] = useState('Petrol');
  const [rentPrice, setRentPrice] = useState('');
  const [insuranceImgs, setInsuranceImgs] = useState([]); // [img1, img2, img3]
  const [vehicleMainImg, setVehicleMainImg] = useState('');
  const [vehicleImgs, setVehicleImgs] = useState([]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const vehicleTypes = [
    { value: 'Car', label: 'Car' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Van', label: 'Van' },
    { value: 'Motor Bike', label: 'Motor Bike' },
    { value: 'Bus', label: 'Bus' }
  ];

  const transmissionTypes = [
    { value: 'Auto', label: 'Automatic' },
    { value: 'Manual', label: 'Manual' }
  ];

  const fuelTypes = [
    { value: 'Petrol', label: 'Petrol' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Electric', label: 'Electric' }
  ];

  const cities = [
    'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Gujranwala', 'Peshawar', 'Quetta', 'Sialkot',
    'Bahawalpur', 'Sargodha', 'Hyderabad', 'Abbottabad', 'Sukkur'
  ];

  console.log(model)
  console.log(fuelType)
  
  async function sendData(e){
    e.preventDefault();

    if (!validateVehicleNumber()) {
      return;
    }

    setLoading(true);
    setError('');
  
    const formData = new FormData();

    formData.append('ownerName', ownerName);
    formData.append('brand', brandName);
    formData.append('model', model);
    formData.append('vehicleType', vehicleType);
    formData.append('userId', user._id);
    formData.append('vehicleNumber', vehicleNumber);
    formData.append('capacity', numberOfSeats);
    formData.append('transmissionType', transmissionType);
    formData.append('fuelType', fuelType);
    formData.append('price', rentPrice);
    formData.append('description', description);

    for(let i = 0; i < insuranceImgs.length; i++){
      formData.append('insuranceImgs', insuranceImgs[i]);
    }

    formData.append('vehicleMainImg', vehicleMainImg);

    for(let i = 0; i < vehicleImgs.length; i++){
      formData.append('vehicleImgs', vehicleImgs[i]);
    }

    formData.append('location', location);

    console.log("Submitting vehicle data with image count:", insuranceImgs.length, vehicleImgs.length);
    console.log("Vehicle details:", { ownerName, brandName, model, vehicleType, vehicleNumber, numberOfSeats });
    
    try {
      const response = await axios.post('/vehicle', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("Success response:", response);
      
      Swal.fire({
        icon: 'success',
        title: 'Vehicle Added Successfully',
        showConfirmButton: true,
        timer: 1500
      }).then(() => {
        // Navigate to vehicle list
        navigate("/vehicle");
      });
    } catch (err) {
      console.error("Error:", err);
      console.error("Error details:", err.response ? err.response.data : "No response data");
      console.error("Error status:", err.response ? err.response.status : "No status");
      
      const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminBackButton />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-center mb-6">Add Vehicle Service</h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={sendData} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Owner's Name *
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Owner's full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Brand *
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Honda, Toyota, Suzuki"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Model *
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Civic, Corolla, Swift"
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
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ABC-1234"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Seats *
                    </label>
                    <input
                      type="number"
                      value={numberOfSeats}
                      onChange={(e) => setNumberOfSeats(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
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
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rent Price (per day) *
                    </label>
                    <input
                      type="number"
                      value={rentPrice}
                      onChange={(e) => setRentPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1500"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      list="city"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter city or location"
                      required
                    />
                    <datalist id="city">
                      {cities.map(city => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Description *
                  </label>
                  <textarea
                    rows={4}
                    maxLength={299}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your vehicle, features, condition, special amenities..."
                    required
                  />
                  <div className="text-sm text-blue-600 mt-1">{countWords(description)}/300</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Images *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      const images = [];
                      for (let i = 0; i < files.length; i++) {
                        images.push(files[i]);
                      }
                      setInsuranceImgs(images);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload vehicle registration documents</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Cover Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVehicleMainImg(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload main vehicle photo</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Images *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      const images = [];
                      for (let i = 0; i < files.length; i++) {
                        images.push(files[i]);
                      }
                      setVehicleImgs(images);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload additional vehicle photos</p>
                </div>

                <div className="flex justify-center pt-4 space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
                  </button>
                  <button
                    type="reset"
                    className="bg-gray-500 text-white px-8 py-3 rounded-md font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddVehicle


