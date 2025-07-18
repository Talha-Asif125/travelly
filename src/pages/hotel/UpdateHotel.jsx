import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import AdminBackButton from "../../components/AdminBackButton";

export const UpdateHotel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.pathname.split("/")[3];
  
  console.log("Updating hotel with ID:", id);
  console.log("Fetch URL:", `/hotels/find/${id}`);
  
  const { data, loading, error } = useFetch(`/hotels/find/${id}`);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [cheapestPrice, setPrice] = useState("");
  const [rating, setRating] = useState("");
  const [featured, setFeatured] = useState(true);
  const [sustainability, setSustainability] = useState(false);
  const [availableWork, setAvailableWork] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setTitle(data.title || "");
      setType(data.type || "");
      setCity(data.city || "");
      setProvince(data.province || "");
      setAddress(data.address || "");
      setZip(data.zip || "");
      setDescription(data.description || "");
      setContactName(data.contactName || "");
      setContactNo(data.contactNo || "");
      setPrice(data.cheapestPrice || "");
      setRating(data.rating || "");
      setFeatured(data.featured || true);
      setSustainability(data.sustainability || false);
      setAvailableWork(data.availableWork || false);
    }
  }, [data]);

  function sendData(e) {
    e.preventDefault();

    const updateHotel = {
      name,
      title,
      type,
      city,
      province,
      address,
      zip,
      description,
      contactName,
      contactNo,
      cheapestPrice: cheapestPrice,
      rating,
      featured,
      sustainability,
      availableWork
    };

    axios
      .put(`/hotels/${id}`, updateHotel) 
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your hotel has been updated successfully',
          confirmButtonText: 'OK',
          confirmButtonColor: '#41A4FF'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/hotels`);
          }
        });
      })
      .catch((err) => {
        console.error("Error updating hotel:", err);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: err.message || 'Something went wrong while updating the hotel',
          confirmButtonText: 'OK',
          confirmButtonColor: '#41A4FF'
        });
      });
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error loading hotel data: {typeof error === 'string' ? error : 'An error occurred'}</div>;
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
          <h1 className="text-2xl font-bold mb-8 mt-8">Update <span className="text-[#41A4FF]">Hotel</span> Details</h1>
          
          <div className="flex flex-wrap -mx-3 mb-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Hotel name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                value={name}
                type="text"
                placeholder="Enter your Hotel name"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 ">
            <div className="w-full  px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Title
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                value={title}
                type="text"
                placeholder="Enter title for your Hotel"
                required
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3  md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Select your Hotel Type
              </label>
              <select
                value={type}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                onChange={(e) => setType(e.target.value)}
              >
                <option>Hotel</option>
                <option>Apartment</option>
                <option>Resort</option>
                <option>Villa</option>
                <option>Cabin</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-2">
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                City
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={city}
                type="text"
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Province
              </label>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                >
                  <option>SOUTHERN PROVINCE</option>
                  <option>WESTERN PROVINCE</option>
                  <option>CENTRAL PROVINCE</option>
                  <option>SABARAGAMUWA PROVINCE</option>
                  <option>EASTERN PROVINCE</option>
                  <option>UVA PROVINCE</option>
                  <option>NORTH WESTERN PROVINCE</option>
                  <option>NORTH CENTRAL PROVINCE</option>
                  <option>NORTHERN PROVINCE</option>
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
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Zip
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={zip}
                type="text"
                onChange={(e) => setZip(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Address
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                value={address}
                type="text"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Contact Name
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                value={contactName}
                type="text"
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Contact Number
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                value={contactNo}
                type="tel"
                onChange={(e) => setContactNo(e.target.value)}
              />
            </div>
          </div>


          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Description
              </label>
              <textarea
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Cheapest price
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                value={cheapestPrice}
                type="number"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              >
                Rating (0-5)
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                value={rating}
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
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Featured</span>
              </div>
              <div className="flex items-center mb-2">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={sustainability}
                  onChange={(e) => setSustainability(e.target.checked)}
                />
                <span>Sustainability</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={availableWork}
                  onChange={(e) => setAvailableWork(e.target.checked)}
                />
                <span>Available Work</span>
              </div>
            </div>
          </div>

          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-8">
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateHotel;