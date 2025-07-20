import React, { useState } from "react";
import axios from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import AdminBackButton from "../../components/AdminBackButton";

export const AddHotel = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Hotel");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("Punjab");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [cheapestPrice, setPrice] = useState("");
  const [rating, setRating] = useState("");
  const [hotelImgs, setHotelImgs] = useState([]);
  const [featured, setFeatured] = useState(true);
  const [sustainability, setSustainability] = useState(false);
  const [availableWork, setAvailableWork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const hotelTypes = [
    { value: "Hotel", label: "Hotel" },
    { value: "apartment", label: "Apartment" },
    { value: "resort", label: "Resort" },
    { value: "villa", label: "Villa" },
    { value: "cabin", label: "Cabin" }
  ];

  const provinces = [
    { value: "Federal", label: "Federal" },
    { value: "Punjab", label: "Punjab" },
    { value: "Khyber Pakhtunkhwa", label: "Khyber Pakhtunkhwa(KPK)" },
    { value: "Sindh", label: "Sindh" },
    { value: "Gilgit Baltistan", label: "Gilgit Baltistan" },
    { value: "Kashmir", label: "Kashmir" },
    { value: "Balochistan", label: "Balochistan" }
  ];

  const starRatings = ['1', '2', '3', '4', '5'];

  function sendData(e) {
    e.preventDefault();

    // More comprehensive validation
    if (!name || !title || !type || !city || !province || !address || !zip || !contactName || !contactNo || !description || !cheapestPrice || !rating) {
      setError("Please fill in all required fields");
      return;
    }

    if (isNaN(zip)) {
      setError("Please enter a valid zip code");
      return;
    }
    if (contactNo.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (hotelImgs.length === 0) {
      setError("Please upload at least one hotel image");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();

    formData.append("name", name);
    formData.append("title", title);
    formData.append("type", type);
    formData.append("city", city);
    formData.append("province", province);
    formData.append("address", address);
    formData.append("zip", zip);
    formData.append("contactName", contactName);
    formData.append("contactNo", contactNo);
    formData.append("description", description);
    formData.append("cheapestPrice", cheapestPrice);
    formData.append("rating", rating);
    formData.append("featured", featured);
    formData.append("sustainability", sustainability);
    formData.append("availableWork", availableWork);

    for (let i = 0; i < hotelImgs.length; i++) {
      formData.append("HotelImgs", hotelImgs[i]);
    }

    // Log form data for debugging
    console.log("Submitting hotel with name:", name);
    console.log("Image count:", hotelImgs.length);

    axios
      .post("/hotels", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Hotel added successfully',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/hotels");
          }
        });
      })
      .catch((err) => {
        console.error("Hotel add error:", err);
        let errorMessage = "Something went wrong while adding the hotel";
        
        if (err.response) {
          errorMessage = err.response.data.message || errorMessage;
        } else if (err.request) {
          errorMessage = "Could not connect to the server. Please check your network connection.";
        } else {
          errorMessage = err.message || errorMessage;
        }
        
        setError(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  }

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

              <form onSubmit={sendData} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your Hotel name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title for your Hotel"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hotel Type *
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {hotelTypes.map(hotelType => (
                        <option key={hotelType.value} value={hotelType.value}>
                          {hotelType.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Star Rating *
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Rating</option>
                      {starRatings.map(rating => (
                        <option key={rating} value={rating}>{rating} Star{rating !== '1' ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value.toLowerCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Lahore, Karachi, Islamabad"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {provinces.map(province => (
                        <option key={province.value} value={province.value}>
                          {province.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="44000"
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
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact person name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Night (PKR) *
                  </label>
                  <input
                    type="number"
                    value={cheapestPrice}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                    min="0"
                    required
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
                    Additional Features
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">Featured</span>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={sustainability}
                        onChange={(e) => setSustainability(e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">Sustainability</span>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={availableWork}
                        onChange={(e) => setAvailableWork(e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">Available Work</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Hotel Images *
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
                      setHotelImgs(images);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload up to 5 images</p>
                </div>

                <div className="flex justify-center pt-4 space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding Hotel...' : 'Add Hotel'}
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

export default AddHotel;
