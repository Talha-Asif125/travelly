import { TbPhotoPlus } from "react-icons/tb";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Ripple, initTE } from "tw-elements";
import Swal from "sweetalert2";
import axios from "../../../api/axios";
import regularAxios from "axios";
import { AuthContext } from "../../../context/authContext";

const AddTourPackage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const currentUser = user?.email || '';
  
  // State variables
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [languages, setLanguages] = useState("");
  const [duration, setDuration] = useState("");
  const [cities, setCities] = useState("");
  const [description, setDesc] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [loading, setLoading] = useState(true);
  const [tourData, setTourData] = useState(null);
  const [error, setError] = useState(null);

  // Initialize TW elements
  useEffect(() => {
    initTE({ Ripple });
  }, []);

  // Load tour data
  useEffect(() => {
    if (!location.state || !location.state.data || !location.state.data.oneTour) {
      setError("Tour data not found");
      setLoading(false);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Tour data not found.",
        confirmButtonText: "Go Back"
      }).then(() => {
        navigate("/tours");
      });
      return;
    }
    
    const tourDetails = location.state.data.oneTour;
    setTourData(tourDetails);
    
    // Set form values
    setName(tourDetails.name || "");
    setCategory(tourDetails.category || "");
    setPrice(tourDetails.price || 0);
    setGroupCount(tourDetails.groupCount || 0);
    setLanguages(tourDetails.languages || "");
    setDuration(tourDetails.duration || "");
    setCities(tourDetails.cities || "");
    setDesc(tourDetails.description || "");
    setIntroduction(tourDetails.introduction || "");
    setLoading(false);
    
    console.log("Tour details loaded:", tourDetails);
  }, [location.state, navigate]);

  // Handle submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!tourData) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No tour data available to update.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure you want to update?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Update it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        let imageUrl = tourData.img;
        
        if (file) {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "upload");
          console.log("Uploading image to Cloudinary...");
          
          const uploadRes = await regularAxios.post(
            "https://api.cloudinary.com/v1_1/dpgelkpd4/image/upload",
            data
          );

          imageUrl = uploadRes.data.url;
          console.log("Image uploaded, URL:", imageUrl);
        }
        
        console.log("Updating tour with ID:", tourData._id);
        const response = await axios.patch(
          `/tours/${tourData._id}`,
          {
            currentUser,
            img: imageUrl,
            name,
            category,
            price,
            groupCount,
            languages,
            duration,
            cities,
            description,
            introduction,
          }
        );
        console.log("Tour update response:", response.data);

        Swal.fire("Tour updated successfully!", "", "success");
        navigate("/tours");
      } catch (error) {
        console.error("Error updating tour:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url
        });
        
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.message || "Something went wrong!",
          footer: error.response?.data ? `Server response: ${JSON.stringify(error.response.data)}` : "No server response"
        });
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        <button 
          onClick={() => navigate("/tours")}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Tours
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          {/* basic details */}
          <div>
            <h2 className="text-3xl font-semibold leading-7 text-[#41A4FF] text-center">
              Update Tour Package
            </h2>
            <p className="mt-3 text-red-500 text-lg leading-6 text-center">
              This information will be displayed publicly so be careful what you share.
            </p>
            {/* photo add */}
            <div>
              <label
                htmlFor="photo"
                className="block text-lg font-medium leading-6 text-gray-900 mt-10"
              >
                Tour Cover Photo
              </label>
              <div className="mt-10 flex flex-row">
                <div className="basis-1/3"></div>
                <div className="basis-2/3">
                  <img
                    className="w-[610px] h-[400px] rounded-3xl object-cover"
                    src={file ? URL.createObjectURL(file) : tourData?.img}
                    alt="Tour cover"
                  />
                </div>
                <div className="basis-1/3"></div>
              </div>
              <div className="mb-6 flex flex-row justify-center items-center text-center mt-12">
                <label htmlFor="file">
                  Click icon to change cover photo:{" "}
                  <TbPhotoPlus
                    className="mx-auto h-12 w-12 text-gray-300 cursor-pointer hover:text-gray-500"
                    aria-hidden="true"
                  />
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    console.log("File selected:", e.target.files[0]?.name);
                  }}
                />
              </div>
            </div>
            {/* name and category */}
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* add name */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="name"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Package Name
                </label>
                <div className="mt-2">
                  <input
                    value={name}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Tour package name"
                    className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              {/* select category */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="category"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Tour Category
                </label>
                <div className="mt-2">
                  <select
                    value={category}
                    id="category"
                    name="category"
                    className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">--Select one--</option>
                    <option value="private car service">Private Car Service</option>
                    <option value="city to city">City to City</option>
                    <option value="wild safari">Wild Safari</option>
                    <option value="cultural">Cultural</option>
                    <option value="festival">Festival</option>
                    <option value="special tours">Special Tours</option>
                  </select>
                </div>
              </div>
              {/* price and group size*/}

              {/* add price*/}
              <div className="sm:col-span-3">
                <label
                  htmlFor="price"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Per Person Price
                </label>
                <div className="mt-2">
                  <input
                    value={price}
                    type="number"
                    name="price"
                    id="price"
                    placeholder="Price per person"
                    className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              {/* select group size */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="maxsize"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Maximum Group Size
                </label>
                <div className="mt-2">
                  <input
                    value={groupCount}
                    type="number"
                    id="maxsize"
                    name="maxsize"
                    className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={(e) => setGroupCount(e.target.value)}
                  />
                </div>
              </div>
              {/* languages and duration */}

              {/* add languages */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="languages"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Languages
                </label>
                <p className="text-sm">(English, French, German etc..)</p>
                <div className="mt-2">
                  <input
                    value={languages}
                    type="text"
                    name="languages"
                    id="languages"
                    placeholder="Available languages"
                    className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={(e) => setLanguages(e.target.value)}
                  />
                </div>
              </div>

              {/* select duration */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="duration"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Tour Duration
                </label>
                <p className="text-sm">(In days)</p>
                <div className="mt-2">
                  <select
                    value={duration}
                    id="duration"
                    name="duration"
                    className="block w-full px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="">--Select One--</option>
                    <option value="1">1 Day</option>
                    <option value="2">2 Days</option>
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                    <option value="9">9 Days</option>
                    <option value="12">12 Days</option>
                    <option value="15">15 Days</option>
                  </select>
                </div>
              </div>

              {/* add cities */}
              <div className="col-span-full">
                <label
                  htmlFor="places"
                  className="block text-lg font-medium leading-6 text-gray-900"
                >
                  Cities Included in Package
                </label>
                <p className="text-sm">
                  (Type cities in visiting order, e.g., "Colombo, Galle")
                </p>
                <div className="mt-2">
                  <input
                    value={cities}
                    type="text"
                    name="places"
                    id="places"
                    className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Cities included in tour"
                    onChange={(e) => setCities(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* add description */}
          <div className="col-span-full">
            <label
              htmlFor="description"
              className="block text-lg font-medium leading-6 text-gray-900"
            >
              Tour Description
            </label>
            <p className="text-sm">
              (This will appear as the overall description of the tour)
            </p>
            <div className="mt-2">
              <textarea
                value={description}
                rows={10}
                name="description"
                id="description"
                className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Tour description"
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>

          {/* add Introduction */}
          <div className="col-span-full">
            <label
              htmlFor="intro"
              className="block text-lg font-medium leading-6 text-gray-900"
            >
              Tour Introduction
            </label>
            <p className="text-sm">
              (Introductory information about destinations and activities)
            </p>
            <div className="mt-2">
              <textarea
                value={introduction}
                rows={10}
                name="intro"
                id="intro"
                className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Tour introduction"
                onChange={(e) => setIntroduction(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* buttons */}
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => navigate("/tours")}
            className="text-lg font-semibold leading-6 text-red-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-black px-3 py-2 text-lg font-semibold text-white shadow-sm hover:bg-[#41A4FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Update Tour
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTourPackage;
