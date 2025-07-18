import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Link, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const HotelOverview = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState({});

  const { id } = useParams();

  // Handle image loading errors
  const handleImageError = (imageId) => {
    setImgError(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  useEffect(() => {
    const fetchHotelData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/hotels/find/${id}`, { timeout: 10000 });
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hotel data:", err);
        setError(err.message || "Failed to load hotel details");
        setLoading(false);
        
        Swal.fire({
          icon: 'error',
          title: 'Failed to load hotel details',
          text: `Error: ${err.message || "Unknown error"}`,
          footer: 'Please make sure the server is running',
          confirmButtonText: 'OK'
        });
      }
    };

    fetchHotelData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <p className="mt-2">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="lg:p-24 ">
        <h1 className="ml-18 md:ml-20 lg:ml-20 text-center lg:text-left py-5 font-bold text-3xl">
              {data.name} {data.type}
            </h1>
        <div className="flex justify-center items-center w-full flex-col lg:flex-row pt-12 lg:pt-0">
          {!imgError.main && data.HotelImg ? (
            <img
              src={`http://localhost:5000/api/hotels/images/${data.HotelImg}`}
              alt={data.name || "Hotel Image"}
              className="w-[320px] md:w-[700px] lg:w-[800px] rounded-lg mb-10"
              onError={() => handleImageError('main')}
            />
          ) : (
            <img
              src="https://via.placeholder.com/800x600?text=Hotel+Image"
              alt="Placeholder"
              className="w-[320px] md:w-[700px] lg:w-[800px] rounded-lg mb-10"
            />
          )}

          <div className="lg:px-24">
            
            <h1 className="text-center md:text-left py-5 font-bold text-1.5xl">
              {data.title}
            </h1>
            <p className="max-w-[320px] md:max-w-[700px] lg:max-w-[600px] text-justify">
              {data.description}
            </p>
            <div className="flex items-center">
              <h1 className="font-bold py-5">City : </h1>
              <h1 className="px-4">{data.city}</h1>
            </div>

            <div className="flex flex-col md:flex-row py-4">
              <h1 className="text-[#41A4FF]">Free Cancellation available</h1>
            </div>

            <div className="flex flex-col md:flex-row py-4">
              <h1 className="text-[#636363]">
                {" "}
                Excellent location – {data.distance} Km from {data.city}
              </h1>
            </div>

            <div className="flex"></div>

            <div className="flex flex-col md:flex-row py-4 justify-between lg:items-center">
              <div className="flex items-center">
                <h1 className="font-bold text-2xl">
                  Book a stay over Rs.{data.cheapestPrice}
                </h1>
                <h1 className="ml-3 md:text-1xl">/per day</h1>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
      <h1 className="text-center lg:text-left py-5 font-bold text-2xl ml-10">
              Images of our hotel
            </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10 px-10">
        {data.HotelImgs && data.HotelImgs.length > 0 ? (
          data.HotelImgs.map((image, index) => (
            !imgError[image] ? (
              <img
                src={`http://localhost:5000/api/hotels/images/${image}`}
                alt={`Hotel Image ${index}`}
                key={index}
                className="w-full h-64 object-cover rounded-lg mb-2"
                onError={() => handleImageError(image)}
              />
            ) : (
              <img
                src="https://via.placeholder.com/250x250?text=Image+Not+Available"
                alt={`Placeholder ${index}`}
                key={index}
                className="w-full h-64 object-cover rounded-lg mb-2"
              />
            )
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No additional images available</p>
          </div>
        )}
      </div>
    </div>
  );
}; 

export default HotelOverview;