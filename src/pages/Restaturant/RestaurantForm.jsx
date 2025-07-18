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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to ${isEditMode ? 'update' : 'add'} restaurant: ${error.response?.data?.message || error.response?.statusText || error.message || "Unknown error occurred"}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminBackButton />
      <div className="max-w-3xl mx-auto mt-10 mb-10">
        <p className="block text-blue-500 font-bold mb-6 text-center text-3xl">
          {isEditMode ? "Update Restaurant" : "Add Restaurant"}
        </p>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="name"
            >
              Restaurant Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Restaurant name"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="staff-amount"
            >
              Staff Amount
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="staffAmount"
              value={staffAmount}
              onChange={handleStaffAmountChange}
              required
            >
              <option value="">Select Staff Amount</option>
              <option value="4-7">4-7</option>
              <option value="7-10">7-10</option>
              <option value="10-15">10-15</option>
              <option value="15-30">15-30</option>
              <option value="30-50">30-50</option>
              <option value="50-70">50-70</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="restaurant-capacity"
            >
              Restaurant Capacity
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="capacity"
              value={capacity}
              onChange={handleCapacityChange}
              required
            >
              <option value="">Select Capacity</option>
              <option value="20-30">20-30</option>
              <option value="30-50">30-50</option>
              <option value="50-70">50-70</option>
              <option value="70-100">70-100</option>
              <option value="100-150">100-150</option>
              <option value="150-200">150-200</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="uploadResimage"
            >
              Upload Restaurant Images
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
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="district"
            >
              District
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="city"
              value={city}
              onChange={handleDistrictChange}
              required
            >
              <option value="">Select District</option>
              <option value="islamabad">Islamabad</option>
              <option value="lahore">Lahore</option>
              <option value="karachi">Karachi</option>
              <option value="peshawar">Peshawar</option>
              <option value="quetta">Quetta</option>
              <option value="faisalabad">Faisalabad</option>
              <option value="rawalpindi">Rawalpindi</option>
              <option value="multan">Multan</option>
              <option value="gujranwala">Gujranwala</option>
              <option value="sialkot">Sialkot</option>
              <option value="bahawalpur">Bahawalpur</option>
              <option value="sargodha">Sargodha</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="abbottabad">Abbottabad</option>
              <option value="sukkur">Sukkur</option>
              <option value="larkana">Larkana</option>
              <option value="sheikhupura">Sheikhupura</option>
              <option value="mirpur">Mirpur</option>
              <option value="jhang">Jhang</option>
              <option value="rahim-yar-khan">Rahim Yar Khan</option>
              <option value="mardan">Mardan</option>
              <option value="kasur">Kasur</option>
              <option value="gujrat">Gujrat</option>
              <option value="okara">Okara</option>
              <option value="mingora">Mingora</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="Address"
            >
              Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="Address"
              type="text"
              placeholder="Address"
              value={address}
              onChange={handleAddressChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="contactNo"
            >
              Contact Number
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="contactNo"
              type="text"
              placeholder="Contact Number"
              value={contactNo}
              onChange={handleContactNoChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="uploadRegimage"
            >
              Upload Restaurant Certificate
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
          </div>
          <div className="flex justify-center">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : (isEditMode ? "Update Restaurant" : "Add Restaurant")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RestaurantForm;
