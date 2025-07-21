import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiPlane } from "react-icons/bi";
import { MdLocationOn, MdFlight } from "react-icons/md";

const FlightList = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoute, setFilterRoute] = useState("");

  // Fetch flight services
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://travelly-backend-27bn.onrender.com/api/services/flight');
        const result = await response.json();
        
        if (result.success) {
          const flightServices = result.data || [];
          setFlights(flightServices);
          setFilteredFlights(flightServices);
        } else {
          setError(result.message || 'Failed to load flights');
        }
      } catch (err) {
        console.error("Error fetching flights:", err);
        setError('Failed to load flights');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  // Filter flights based on search term and route
  useEffect(() => {
    let result = flights;
    
    if (searchTerm) {
      result = result.filter(flight => 
        flight.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.aircraftType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterRoute) {
      result = result.filter(flight => 
        flight.routes?.toLowerCase().includes(filterRoute.toLowerCase()) ||
        flight.location?.toLowerCase().includes(filterRoute.toLowerCase())
      );
    }
    
    setFilteredFlights(result);
  }, [searchTerm, filterRoute, flights]);

  // Get unique routes for filter
  const routes = [...new Set(flights.filter(f => f.routes || f.location).map(flight => flight.routes || flight.location))];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle route filter change
  const handleRouteChange = (e) => {
    setFilterRoute(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-sky-600 mb-4">
          <BiPlane className="inline-block mr-2" />
          Discover Flight Services
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Travel fast and comfortably with our premium flight services. 
          Book your tickets for domestic and international routes.
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search airlines or aircraft types..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex-1 max-w-md">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={filterRoute}
            onChange={handleRouteChange}
          >
            <option value="">All Routes</option>
            {routes.map((route, index) => (
              <option key={index} value={route}>
                {route}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading flights...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">
          <p>{error}</p>
        </div>
      ) : filteredFlights.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No flights found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFlights.map((flight) => (
            <div 
              key={flight._id} 
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={flight.images?.[0] || "https://via.placeholder.com/400x200?text=Flight"} 
                  alt={flight.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-800">{flight.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MdFlight className="inline-block mr-1" />
                  {flight.aircraftType || "Commercial Aircraft"}
                </p>
                <p className="text-gray-600 text-sm mb-3 flex items-center">
                  <MdLocationOn className="inline-block mr-1" />
                  {flight.routes || flight.location || "Routes Available"}
                </p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {flight.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Rs. {flight.price}/ticket
                  </span>
                  <span className="text-sm text-gray-600">
                    Capacity: {flight.capacity || "N/A"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link 
                    to={`/flight-details/${flight._id}`} 
                    className="flex-1 text-center bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/flight-details/${flight._id}`} 
                    className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightList; 