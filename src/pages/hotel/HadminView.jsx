import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import AdminBackButton from "../../components/AdminBackButton";

const HadminView = () => {
  const { state } = useLocation();
  const [data, setData] = useState(state || {});
  const [loading, setLoading] = useState(false);
  const id = state?._id;
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoading(true);
      console.log("Fetching hotel with ID:", id);
      console.log("Request URL:", `/hotels/find/${id}`);
      
      axios
        .get(`/hotels/find/${id}`)
        .then((response) => {
          console.log("Hotel data received:", response.data);
          setData(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching hotel data:", err);
          console.error("Error details:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            url: err.config?.url
          });
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: "Error loading hotel",
            text: err.message || "Failed to load hotel details",
            footer: err.response?.data ? `Server response: ${JSON.stringify(err.response?.data)}` : "No server response"
          });
        });
    }
  }, [id]);

  const hotelDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete this hotel!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`/hotels/${id}`)
          .then((res) => {
            Swal.fire("Deleted!", "Hotel deleted successfully", "success");
            navigate("/hotels");
          })
          .catch((err) => {
            console.error("Error deleting hotel:", err);
            Swal.fire("Not Deleted!", err.message || "An error occurred while deleting", "error");
          });
      }
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!data || !id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">Hotel data not found</h1>
        <Link to="/hotels" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back to Hotels
        </Link>
      </div>
    );
  }

  // Get the main image from the HotelImgs array
  const mainImage = data.HotelImgs && data.HotelImgs.length > 0 ? data.HotelImgs[0] : null;

  return (
    <div>
      <AdminBackButton />
      <div className="lg:p-24 p-6">
        <h1 className="text-center lg:text-left py-5 font-bold text-3xl">
          {data.name} {data.type && `(${data.type})`}
        </h1>
        <div className="flex justify-center items-center w-full flex-col lg:flex-row pt-12 lg:pt-0">
          <div className="lg:w-1/2">
            {mainImage && (
              <img
                src={`http://localhost:5000/api/hotels/images/${mainImage}`}
                alt="Hotel"
                className="w-full rounded-lg mb-10 shadow-lg max-h-[500px] object-cover"
              />
            )}
            
            {/* Hotel images */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4">Hotel Images</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.HotelImgs && data.HotelImgs.map((image, index) => (
                  <img
                    src={`http://localhost:5000/api/hotels/images/${image}`}
                    alt={`Hotel ${index + 1}`}
                    key={index}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 lg:pl-12 flex flex-col">
            <div className="flex gap-2 mb-6">
              <Link to={`/hotels/update/${id}`} className="bg-blue-500 text-white rounded-md font-bold py-3 px-6 flex-1 text-center">
                Update Hotel
              </Link>
              <button onClick={hotelDelete} className="bg-red-500 text-white rounded-md font-bold py-3 px-6 flex-1">
                Delete Hotel
              </button>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
              <h2 className="font-bold text-xl mb-4">{data.title}</h2>
              <p className="text-gray-700 mb-4">{data.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Location</h3>
                  <p>{data.city}, {data.province}</p>
                  <p>{data.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Contact</h3>
                  <p>{data.contactName}</p>
                  <p>{data.contactNo}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                  <span className="font-bold text-2xl text-blue-600">Rs.{data.cheapestPrice}</span>
                  <span className="ml-2 text-gray-600">/night</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Rating:</span>
                  <span className="bg-blue-100 text-blue-800 font-bold py-1 px-3 rounded-full">
                    {data.rating ? `${data.rating}/5` : 'No ratings'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="font-bold text-xl mb-4">Hotel Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${data.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  <span className="font-semibold">Featured:</span> {data.featured ? 'Yes' : 'No'}
                </div>
                <div className={`p-3 rounded-lg ${data.sustainability ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  <span className="font-semibold">Sustainability:</span> {data.sustainability ? 'Yes' : 'No'}
                </div>
                <div className={`p-3 rounded-lg ${data.availableWork ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  <span className="font-semibold">Work Space:</span> {data.availableWork ? 'Yes' : 'No'}
                </div>
                <div className={`p-3 rounded-lg ${data.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <span className="font-semibold">Status:</span> {data.isApproved ? 'Approved' : 'Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HadminView;
