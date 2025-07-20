import React, { useState, useEffect, useContext } from "react";
import FileBase from "react-file-base64";
import axios from "../../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import AdminBackButton from "../../components/AdminBackButton";
import { AuthContext } from "../../context/authContext";

const RestaurantForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.edit || false;
  const editData = location.state?.data || null;
  const { user } = useContext(AuthContext);
  
  const [name, setName] = useState("");
  const [staffAmount, setStaffAmount] = useState("");
  const [capacity, setCapacity] = useState("");
  const [city, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [uploadResimage, setImage] = useState("");
  const [uploadRegimage, setImg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const staffAmountOptions = [
    { value: "4-7", label: "4-7 Staff" },
    { value: "7-10", label: "7-10 Staff" },
    { value: "10-15", label: "10-15 Staff" },
    { value: "15-30", label: "15-30 Staff" },
    { value: "30-50", label: "30-50 Staff" },
    { value: "50-70", label: "50-70 Staff" }
  ];

  const capacityOptions = [
    { value: "20-30", label: "20-30 People" },
    { value: "30-50", label: "30-50 People" },
    { value: "50-70", label: "50-70 People" },
    { value: "70-100", label: "70-100 People" },
    { value: "100-150", label: "100-150 People" },
    { value: "150-200", label: "150-200 People" }
  ];

  const districtOptions = [
    { value: "islamabad", label: "Islamabad" },
    { value: "lahore", label: "Lahore" },
    { value: "karachi", label: "Karachi" },
    { value: "peshawar", label: "Peshawar" },
    { value: "quetta", label: "Quetta" },
    { value: "faisalabad", label: "Faisalabad" },
    { value: "rawalpindi", label: "Rawalpindi" },
    { value: "multan", label: "Multan" },
    { value: "gujranwala", label: "Gujranwala" },
    { value: "sialkot", label: "Sialkot" },
    { value: "bahawalpur", label: "Bahawalpur" },
    { value: "sargodha", label: "Sargodha" },
    { value: "hyderabad", label: "Hyderabad" },
    { value: "abbottabad", label: "Abbottabad" },
    { value: "sukkur", label: "Sukkur" },
    { value: "larkana", label: "Larkana" },
    { value: "sheikhupura", label: "Sheikhupura" },
    { value: "mirpur", label: "Mirpur" },
    { value: "jhang", label: "Jhang" },
    { value: "rahim-yar-khan", label: "Rahim Yar Khan" },
    { value: "mardan", label: "Mardan" },
    { value: "kasur", label: "Kasur" },
    { value: "gujrat", label: "Gujrat" },
    { value: "okara", label: "Okara" },
    { value: "mingora", label: "Mingora" }
  ];

  // If in edit mode, populate the form with the existing data
  useEffect(() => {
    if (isEditMode && editData) {
      setName(editData.name || "");
      setStaffAmount(editData.staffAmount || "");
      setCapacity(editData.capacity || "");
      setDistrict(editData.city || "");
      setAddress(editData.address || "");
      setContactNo(editData.contactNo || "");
      setImage(editData.uploadResimage || "");
      setImg(editData.uploadRegimage || "");
    }
  }, [isEditMode, editData]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleStaffAmountChange = (e) => {
    setStaffAmount(e.target.value);
  };

  const handleCapacityChange = (e) => {
    setCapacity(e.target.value);
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleContactNoChange = (e) => {
    setContactNo(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    // Extract the table count from the capacity value (e.g., "20-30" -> 25)
    const tableCountValue = capacity.split('-').reduce((a, b) => (parseInt(a) + parseInt(b)) / 2, 0);
    
    // Create restaurant data object
    const restaurantData = {
      name: name,
      address: address,
      mobileNo: contactNo,
      staffAmount: parseInt(staffAmount.split('-')[0]), // Convert to a number
      tableCount: tableCountValue,
      resturentImages: [uploadResimage], // Convert to array as expected by schema
      registrationImages: [uploadRegimage], // Convert to array as expected by schema
      district: "64d9d7aae9ac3353628b49e4", // Use a valid district ID
      user: user._id, // Add the user ID from context
    };
    
    // Log the data being sent for debugging
    console.log("Submitting restaurant data:", restaurantData);
    
    try {
      if (isEditMode && editData) {
        console.log("Updating restaurant with ID:", editData._id);
        // Update existing restaurant
        await axios.put(`/restaurant/${editData._id}`, restaurantData);
        
        Swal.fire({
          icon: "success",
          title: "Restaurant Updated",
          text: "The restaurant has been updated successfully!"
        });
      } else {
        // Create new restaurant
        const response = await axios.post("/restaurant", restaurantData);
        console.log("Restaurant created:", response.data);
        
        Swal.fire({
          icon: "success",
          title: "Restaurant Added",
          text: "The restaurant has been added successfully!"
        });
      }
      
      navigate("/admin/restaurants");
    } catch (error) {
      console.error("Error details:", error);
      const errorMessage = error.response?.data?.message || error.response?.statusText || error.message || "Unknown error occurred";
      setError(`Failed to ${isEditMode ? 'update' : 'add'} restaurant: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminBackButton />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-center mb-6">
                {isEditMode ? "Update Restaurant" : "Add Restaurant Service"}
              </h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Restaurant name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Amount *
                    </label>
                    <select
                      value={staffAmount}
                      onChange={handleStaffAmountChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Staff Amount</option>
                      {staffAmountOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Capacity *
                    </label>
                    <select
                      value={capacity}
                      onChange={handleCapacityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Capacity</option>
                      {capacityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District *
                    </label>
                    <select
                      value={city}
                      onChange={handleDistrictChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select District</option>
                      {districtOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="text"
                      value={contactNo}
                      onChange={handleContactNoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact Number"
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
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Complete address with landmarks"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Restaurant Images *
                  </label>
                  {isEditMode && uploadResimage && (
                    <div className="mb-2">
                      <img 
                        src={uploadResimage} 
                        alt="Current restaurant" 
                        className="w-32 h-32 object-cover rounded mb-2" 
                      />
                      <p className="text-sm text-gray-500">Current image</p>
                    </div>
                  )}
                  <FileBase
                    type="file"
                    multiple={false}
                    onDone={({ base64 }) => setImage(base64)}
                    required={!isEditMode}
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload restaurant photos</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Restaurant Certificate *
                  </label>
                  {isEditMode && uploadRegimage && (
                    <div className="mb-2">
                      <img 
                        src={uploadRegimage} 
                        alt="Restaurant certificate" 
                        className="w-32 h-32 object-cover rounded mb-2" 
                      />
                      <p className="text-sm text-gray-500">Current certificate</p>
                    </div>
                  )}
                  <FileBase
                    type="file"
                    multiple={false}
                    onDone={({ base64 }) => setImg(base64)}
                    required={!isEditMode}
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload restaurant registration certificate</p>
                </div>

                <div className="flex justify-center pt-4 space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : (isEditMode ? "Update Restaurant" : "Add Restaurant")}
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
  );
};

export default RestaurantForm;
