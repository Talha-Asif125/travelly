import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiRestaurant } from "react-icons/bi";
import { MdLocationOn, MdRestaurantMenu } from "react-icons/md";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  // Fetch restaurant services
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let allRestaurants = [];
        
        // Fetch owner-added restaurants from services API
        try {
          const serviceResponse = await fetch('http://localhost:5000/api/services/restaurant');
          const serviceResult = await serviceResponse.json();
          
          if (serviceResult.success && serviceResult.data) {
            allRestaurants = [...allRestaurants, ...serviceResult.data];
            console.log('Successfully loaded owner restaurants:', serviceResult.data.length);
          }
        } catch (serviceError) {
          console.warn('Failed to load owner restaurants:', serviceError);
        }
        
        // Fetch admin-added restaurants using multiple approaches
        try {
          let adminRestaurants = [];
          
          // Try to get all restaurants first (if there's an endpoint for it)
          try {
            const allAdminResponse = await fetch('http://localhost:5000/api/restaurant', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (allAdminResponse.ok) {
              const allAdminResult = await allAdminResponse.json();
              if (Array.isArray(allAdminResult)) {
                adminRestaurants = allAdminResult;
                console.log('Loaded all admin restaurants via GET:', adminRestaurants.length);
              }
            }
          } catch (getAllError) {
            console.log('GET all restaurants not available, trying limited endpoint');
          }
          
          // If we didn't get restaurants from the GET endpoint, try the limited one
          if (adminRestaurants.length === 0) {
            try {
              const adminResponse = await fetch('http://localhost:5000/api/restaurant/find-first-five-resturents', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
              });
              const adminResult = await adminResponse.json();
              
              // Handle different response structures
              if (Array.isArray(adminResult)) {
                adminRestaurants = adminResult;
              } else if (adminResult.restaurants && Array.isArray(adminResult.restaurants)) {
                adminRestaurants = adminResult.restaurants;
              } else if (adminResult.data && Array.isArray(adminResult.data)) {
                adminRestaurants = adminResult.data;
              }
              
              console.log('Loaded first 5 admin restaurants:', adminRestaurants.length);
            } catch (limitedError) {
              console.warn('Failed to load admin restaurants via limited endpoint:', limitedError);
            }
          }
          
          // Format admin restaurants
          if (adminRestaurants.length > 0) {
            const formattedAdminRestaurants = adminRestaurants.map(restaurant => ({
              _id: restaurant._id,
              name: restaurant.name,
              type: 'restaurant',
              cuisineType: restaurant.cuisineType || 'Mixed',
              location: restaurant.address || restaurant.location,
              description: restaurant.description || `Restaurant with ${restaurant.staffAmount || 'N/A'} staff members and ${restaurant.tableCount || 'N/A'} tables.`,
              capacity: restaurant.tableCount || restaurant.capacity || 'N/A',
              price: restaurant.price || 0,
              images: restaurant.resturentImages || restaurant.images || [],
              isAdminAdded: true,
              staffAmount: restaurant.staffAmount,
              contactNo: restaurant.mobileNo || restaurant.contactNo,
              district: restaurant.district
            }));
            allRestaurants = [...allRestaurants, ...formattedAdminRestaurants];
            console.log('Successfully loaded admin restaurants:', formattedAdminRestaurants.length);
          }
        } catch (adminError) {
          console.warn('Failed to load admin restaurants:', adminError);
        }
        
        setRestaurants(allRestaurants);
        setFilteredRestaurants(allRestaurants);
        
        if (allRestaurants.length === 0) {
          setError('No restaurants available at the moment');
        } else {
          console.log('Total restaurants loaded:', allRestaurants.length);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError('Failed to load restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter restaurants based on search term and location
  useEffect(() => {
    let result = restaurants;
    
    if (searchTerm) {
      result = result.filter(restaurant => 
        restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisineType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterLocation) {
      result = result.filter(restaurant => 
        restaurant.location?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    setFilteredRestaurants(result);
  }, [searchTerm, filterLocation, restaurants]);

  // Get unique locations for filter
  const locations = [...new Set(restaurants.filter(r => r.location).map(restaurant => restaurant.location))];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle location filter change
  const handleLocationChange = (e) => {
    setFilterLocation(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          <BiRestaurant className="inline-block mr-2" />
          Discover Amazing Restaurants
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore the finest dining experiences across the country. 
          Make reservations at top restaurants and enjoy authentic cuisines.
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search restaurants or cuisine..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex-1 max-w-md">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filterLocation}
            onChange={handleLocationChange}
          >
            <option value="">All Locations</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Debug info */}
      {!loading && !error && (
        <div className="mb-4 text-center text-sm text-gray-500">
          Showing {filteredRestaurants.length} of {restaurants.length} restaurants
          {restaurants.some(r => r.isAdminAdded) && ` • ${restaurants.filter(r => r.isAdminAdded).length} admin-added`}
          {restaurants.some(r => !r.isAdminAdded) && ` • ${restaurants.filter(r => !r.isAdminAdded).length} owner-added`}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading restaurants...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No restaurants found matching your criteria.</p>
          {(searchTerm || filterLocation) && (
            <button 
              onClick={() => {
                setSearchTerm("");
                setFilterLocation("");
              }}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRestaurants.map((restaurant) => (
            <div 
              key={restaurant._id} 
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={restaurant.images?.[0] || "https://via.placeholder.com/400x200?text=Restaurant"} 
                  alt={restaurant.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-800">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MdRestaurantMenu className="inline-block mr-1" />
                  {restaurant.cuisineType || "Mixed"} Cuisine
                </p>
                <p className="text-gray-600 text-sm mb-3 flex items-center">
                  <MdLocationOn className="inline-block mr-1" />
                  {restaurant.location}
                </p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {restaurant.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {restaurant.price > 0 ? `Rs. ${restaurant.price}/person` : 'Contact for pricing'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Capacity: {restaurant.capacity || "N/A"}
                  </span>
                </div>
                <Link 
                  to={`/restaurant-book/${restaurant._id}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm text-center"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList; 