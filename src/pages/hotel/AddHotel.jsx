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
  
  function sendData(e) {
    e.preventDefault();

    // More comprehensive validation
    if (!name || !title || !type || !city || !province || !address || !zip || !contactName || !contactNo || !description || !cheapestPrice || !rating) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please fill in all required fields",
        confirmButtonText: 'OK',
        confirmButtonColor: '#41A4FF'
      });
      return;
    }

    if (isNaN(zip)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Please enter a valid zip code",
        confirmButtonText: 'OK',
        confirmButtonColor: '#41A4FF'
      });
      return;
    }
    if (contactNo.length !== 10) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Please enter a valid 10-digit mobile number",
        confirmButtonText: 'OK',
        confirmButtonColor: '#41A4FF'
      });
      return;
    }

    if (hotelImgs.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Missing Images",
        text: "Please upload at least one hotel image",
        confirmButtonText: 'OK',
        confirmButtonColor: '#41A4FF'
      });
      return;
    }

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
    console.log("Form data summary:", {
      name,
      title,
      type,
      city,
      province,
      address,
      zip,
      contactName,
      contactNo: contactNo.length, // Don't log the full number
      description: description.substring(0, 20) + "...", // Just log the start
      cheapestPrice,
      rating,
      featured,
      sustainability,
      availableWork
    });

    Swal.fire({
      title: 'Adding hotel...',
      text: 'Please wait while we process your request',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

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
          confirmButtonColor: '#41A4FF'
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
          // The server responded with an error
          errorMessage = err.response.data.message || errorMessage;
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage = "Could not connect to the server. Please check your network connection.";
        } else {
          // Something else caused the error
          errorMessage = err.message || errorMessage;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Adding Failed',
          text: errorMessage,
          confirmButtonText: 'OK',
          confirmButtonColor: '#41A4FF'
        });
      });
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <AdminBackButton />
      </div>
      
      <div className="flex justify-center">
        <form
          className="w-full max-w-lg"
          onSubmit={sendData}
          encType="multipart/form-data"
        >
          <h1 className="text-2xl font-bold mb-8 mt-8">
            List Your <span className="text-[#41A4FF]">Hotel</span> and{" "}
            <span className="text-[#41A4FF]">Join</span> with us
          </h1>
          
          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Hotel name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                type="text"
                placeholder="Enter your Hotel name"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Title
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                type="text"
                placeholder="Enter title for your Hotel"
                required
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Select your Hotel Type
              </label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                onChange={(e) => setType(e.target.value)}
                defaultValue="Hotel"
                required
              >
                <option value="">Select hotel type</option>
                <option value="Hotel">Hotel</option>
                <option value="apartment">Apartment</option>
                <option value="resort">Resort</option>
                <option value="villa">Villa</option>
                <option value="cabin">Cabin</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-2">
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                City
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                type="text"
                onChange={(e) => setCity(e.target.value.toLowerCase())}
              />
            </div>
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Province
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  onChange={(e) => setProvince(e.target.value)}
                  defaultValue="Punjab"
                  required
                >
                  <option value="">Select Province</option>
                  <option value="Federal">Federal</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa(KPK)</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Gilgit Baltistan">Gilgit Baltistan</option>
                  <option value="Kashmir">Kashmir</option>
                  <option value="Balochistan">Balochistan</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Zip
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                type="text"
                placeholder="44000"
                onChange={(e) => setZip(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Address
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                type="text"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Contact Name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                type="text"
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Contact Number
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                type="tel"
                onChange={(e) => setContactNo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Description
              </label>
              <textarea
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Cheapest Price (Rs)
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                type="number"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Rating (0-5)
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                type="number"
                min="0"
                max="5"
                step="0.1"
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Additional Features
              </label>
              <div className="flex items-center mb-2">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  defaultChecked
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Featured</span>
              </div>
              <div className="flex items-center mb-2">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  onChange={(e) => setSustainability(e.target.checked)}
                />
                <span>Sustainability</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  onChange={(e) => setAvailableWork(e.target.checked)}
                />
                <span>Available Work</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                Upload hotel images (upload up to 5 images)
              </label>
              <input
                type="file"
                className="bg-gray-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                multiple
                required
                onChange={(e) => {
                  const files = e.target.files;
                  const images = [];
                  for (let i = 0; i < files.length; i++) {
                    images.push(files[i]);
                  }
                  setHotelImgs(images);
                }}
              />
            </div>
          </div>

          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-8">
            SUBMIT
          </button>
          <input 
            className="bg-[#787878] hover:bg-[#474747] text-white font-bold py-2 px-4 rounded-full ml-5" 
            type="reset" 
            value="Reset" 
          />
        </form>
      </div>
    </div>
  );
};

export default AddHotel;
