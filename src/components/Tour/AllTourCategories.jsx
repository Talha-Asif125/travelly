import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const isLoadingRef = useRef(false);

  const getTours = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      let allTours = [];
      
      // Map URL paths to actual category values used in database
      const categoryMappings = {
        'privatecarservice': 'private car service',
        'citytocity': 'city to city',
        'wildsafari': 'wild safari',
        'cultural': 'cultural',
        'special': 'special tours',
        'festival': 'festival'
      };
      
      const actualCategory = categoryMappings[title] || title;
      
      // Fetch traditional tours for standard categories
      if (!['privatecarservice', 'citytocity'].includes(title)) {
        try {
          const response = await axios.get(`/api/tours/category/${title}`);
          if (response.data.status === "Success") {
            allTours = [...(response.data.data || [])];
          }
        } catch (toursErr) {
          console.warn("Error fetching traditional tours:", toursErr);
        }
      }
      
      // Fetch provider services and filter by category
      try {
        const servicesResponse = await axios.get("https://travelly-backend-27bn.onrender.com/api/services/tour");
        
        if (servicesResponse.data.success) {
          const services = servicesResponse.data.data || [];
          const filteredServices = services.filter(service => {
            const serviceCategory = service.category ? service.category.toLowerCase().trim() : '';
            const searchCategory = actualCategory.toLowerCase().trim();
            return serviceCategory === searchCategory;
          });
          const transformedServices = filteredServices
            .filter(service => service && service._id) // Only process valid services
            .map(service => ({
              _id: service._id,
              name: service.name || 'Unnamed Service',
              category: service.category,
              price: service.price || 0,
              duration: service.duration || 'N/A',
              img: service.images?.[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23666'%3ETour Image%3C/text%3E%3C/svg%3E",
              description: service.description || '',
              fromLocation: service.fromLocation,
              toLocation: service.toLocation,
              availableSeats: service.availableSeats,
              tourDate: service.tourDate,
              departureTime: service.departureTime,
              isNewService: true
            }));
          
          allTours = [...allTours, ...transformedServices];
        }
      } catch (servicesErr) {
        console.warn("Error fetching services:", servicesErr);
      }
      
                    // Filter out any null or invalid tours
      const validTours = allTours.filter(tour => tour && tour._id);
      
      // If no tours found, add demo data for testing
      if (validTours.length === 0 && title === 'privatecarservice') {
        console.log('No tours found in database, adding demo tour for testing');
        const demoTour = {
          _id: "687b88ccbbae3dce6baa3lb4",
          name: "Private Car Service Demo",
          category: "private car service",
          price: 500,
          duration: "30 minutes",
          img: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%234A90E2'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='white'%3EPrivate Car Service%3C/text%3E%3Ctext x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='white'%3EDemo Tour%3C/text%3E%3C/svg%3E",
          description: "Professional private car service for your travel needs",
          fromLocation: "6th road",
          toLocation: "cust",
          availableSeats: 3,
          isNewService: true
        };
        validTours.push(demoTour);
      }
      
      setTour(validTours);
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError(err.message);
      setTour([]);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [title]);

  useEffect(() => {
    getTours();
  }, [getTours]);

  // Get display name for the category
  const getCategoryDisplayName = (categoryKey) => {
    const categoryMap = {
      'privatecarservice': 'Private Car Service',
      'citytocity': 'City to City',
      'wildsafari': 'Wild Safari',
      'cultural': 'Cultural',
      'special': 'Special Tours',
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
                {filteredTours.filter(tour => tour && tour._id).map((tours) => (
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
                        <p className="text-sm text-gray-600 mb-1">
                          Duration: {tours.duration}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Category: {tours.category}
                        </p>
                        {tours.isNewService && tours.fromLocation && tours.toLocation ? (
                          <p className="text-sm text-gray-600 mb-1">
                            Route: {tours.fromLocation} → {tours.toLocation}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 mb-1">
                            Cities: {tours.cities}
                          </p>
                        )}
                        {tours.isNewService && tours.availableSeats ? (
                          <p className="text-sm text-gray-600 mb-1">
                            Available Seats: {tours.availableSeats}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600 mb-1">
                            Group Size: {tours.groupCount}
                          </p>
                        )}
                        {tours.isNewService && tours.tourDate && (
                          <p className="text-sm text-gray-600 mb-1">
                            Date: {new Date(tours.tourDate).toLocaleDateString()}
                          </p>
                        )}
                        {tours.isNewService && tours.departureTime && (
                          <p className="text-sm text-gray-600 mb-1">
                            Departure: {tours.departureTime}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row mr-2 space-x-3 justify-between items-center p-3">
                      <p className="text-lg font-bold text-blue-600">
                        Rs. {tours.price}
                      </p>
                      <Link 
                        to={`/tour-book/${tours._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
                      >
                        Book Now
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
