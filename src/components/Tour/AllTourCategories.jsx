import React, { useEffect, useState } from "react";
import NavigatedMenu from "../navbar/NavigatedMenu";
import TourNav from "../navbar/TourNav";
import HeroTour from "../../pages/Tour/HeroTour";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Beach = () => {
  const location = useLocation();
  const path = location.pathname;
  const title = path.split("/").pop();
  console.log("Category title from URL:", title);

  const [filteredTours, setTour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTours();
  }, [title]); // Add dependency to re-fetch when title changes

  const getTours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new category-specific API endpoint
      const response = await axios.get(`/api/tours/category/${title}`);
      console.log("API Response:", response.data);
      
      if (response.data.status === "Success") {
        setTour(response.data.data || []);
      } else {
        setTour([]);
      }
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError(err.message);
      setTour([]);
    } finally {
      setLoading(false);
    }
  };

  // Get display name for the category
  const getCategoryDisplayName = (categoryKey) => {
    const categoryMap = {
      'hikingandtrekking': 'Hiking and Trekking',
      'sunandbeach': 'Sun and Beach',
      'wildsafari': 'Wild Safari',
      'safaries': 'Safaries',
      'cultural': 'Cultural',
      'special': 'Special',
      'festival': 'Festival'
    };
    return categoryMap[categoryKey] || categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
  };

  return (
    <div>
      <HeroTour />
      <NavigatedMenu />
      <TourNav />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          {getCategoryDisplayName(title)} Tours
        </h1>

        {loading ? (
          <div className="text-center text-lg">
            <div className="inline-block h-8 w-8 animate-[spinner-grow_0.75s_linear_infinite] rounded-full bg-current align-[-0.125em] opacity-0 motion-reduce:animate-[spinner-grow_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mb-20">
            <p>Error loading tours: {error}</p>
            <button 
              onClick={getTours}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            {filteredTours.length !== 0 ? (
              <div className="bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 lg:px-36 mb-20">
                {filteredTours.map((tours) => (
                  <div key={tours._id} className="group relative rounded-t-3xl shadow-2xl rounded-b-xl border-2 hover:shadow-3xl transition-shadow duration-300">
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
                            <span aria-hidden="true" className="absolute inset-0 rounded-t-3xl" />
                            {tours.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Duration: {tours.duration}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Cities: {tours.cities}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Group Size: {tours.groupCount}
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
                ))}
              </div>
            ) : (
              <div className="text-center text-lg mb-20">
                <div className="bg-gray-100 rounded-lg p-8">
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    No {getCategoryDisplayName(title)} Tours Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any tours in this category at the moment.
                  </p>
                  <Link 
                    to="/tours/home"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse All Categories
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Beach;
