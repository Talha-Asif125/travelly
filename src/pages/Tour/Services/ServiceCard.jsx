import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AiOutlineCalendar, AiOutlineUser } from "react-icons/ai";

const ServiceCard = () => {
  const [allTours, setTour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTours = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/api/tours");
        console.log("Tours API Response:", response.data);
        setTour(response.data || []);
      } catch (err) {
        console.error("Error fetching tours:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getTours();
  }, []);

  if (loading) {
    return (
      <div className="bg-white text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2">Loading tours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white text-center py-8">
        <p className="text-red-500">Error loading tours: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {allTours.length > 0 ? (
          allTours.map((tours) => (
            <div
              key={tours._id}
              className="group relative rounded-t-3xl shadow-2xl rounded-b-xl border-2 hover:shadow-3xl transition-shadow duration-300"
            >
              <div className="min-h-80 aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-3xl bg-gray-200 lg:aspect-none group-hover:opacity-40 lg:h-80">
                <img
                  src={tours.img}
                  alt={tours.name}
                  className="h-full w-full object-cover object-center rounded-3xl lg:h-full lg:w-full"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              </div>
              <div className="mt-4 flex justify-between p-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    <Link to={`/tours/${tours._id}`}>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-t-3xl"
                      />
                      {tours.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Duration: {tours.duration}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Category: {tours.category}
                  </p>
                </div>
              </div>
              <div className="flex flex-row mr-2 space-x-3 justify-between items-center p-3">
                <p className="text-lg font-bold text-blue-600">
                  From ${tours.price}
                </p>
                <Link
                  to={`/tours/${tours._id}`}
                  className="inline-block rounded bg-blue-600 px-4 py-2 text-xs font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No tours available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
