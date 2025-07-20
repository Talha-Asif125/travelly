import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import backgroundImage from '../../assets/images/bg.jpg';
import { FaPlane, FaSearch, FaCalendarAlt } from 'react-icons/fa';

const FlightHome = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1
  });
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      
      // Note: Flight services are no longer supported. This page shows empty results.
      setFlights([]);
      setFilteredFlights([]);
      setLoading(false);
      
    } catch (error) {
      console.error("Error fetching flights:", error);
      setFlights([]);
      setFilteredFlights([]);
      Swal.fire({
        icon: 'info',
        title: 'Flight Services Unavailable',
        text: 'Flight booking services are currently not available.'
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria({
      ...searchCriteria,
      [name]: value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Simple client-side filtering
    const filtered = flights.filter(flight => {
      const originMatch = !searchCriteria.origin || 
        flight.origin.toLowerCase().includes(searchCriteria.origin.toLowerCase());
      
      const destinationMatch = !searchCriteria.destination || 
        flight.destination.toLowerCase().includes(searchCriteria.destination.toLowerCase());
      
      const dateMatch = !searchCriteria.date || 
        flight.departureDate === searchCriteria.date;
      
      return originMatch && destinationMatch && dateMatch;
    });
    
    setFilteredFlights(filtered);
    setSearched(true);
    
    if (filtered.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Flights Found',
        text: 'No flights match your search criteria. Please try different dates or destinations.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with Search Form */}
      <div 
        className="bg-cover bg-center h-96 flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
            <FaPlane className="inline-block mr-2" /> Find Your Flight
          </h1>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">From</label>
                <div className="relative">
                  <input
                    type="text"
                    name="origin"
                    placeholder="Origin City"
                    value={searchCriteria.origin}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 pl-10"
                  />
                  <FaPlane className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">To</label>
                <div className="relative">
                  <input
                    type="text"
                    name="destination"
                    placeholder="Destination City"
                    value={searchCriteria.destination}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 pl-10"
                  />
                  <FaPlane className="absolute left-3 top-3.5 text-gray-400 transform rotate-90" />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Departure Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={searchCriteria.date}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 pl-10"
                  />
                  <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Passengers</label>
                <div className="relative">
                  <select
                    name="passengers"
                    value={searchCriteria.passengers}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full flex items-center justify-center mx-auto"
              >
                <FaSearch className="mr-2" /> Search Flights
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Flight List Section */}
      <div className="container mx-auto py-10 px-4">
        {searched && (
          <h2 className="text-2xl font-bold mb-6">
            {filteredFlights.length} {filteredFlights.length === 1 ? 'Flight' : 'Flights'} Found
          </h2>
        )}
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading flights...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredFlights.map(flight => (
              <div key={flight.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-wrap justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-xl font-bold text-gray-800">{flight.airline}</h3>
                    <p className="text-gray-500">Flight {flight.flightNumber}</p>
                  </div>
                  
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="text-center mr-8">
                      <p className="text-lg font-bold">{flight.departureTime}</p>
                      <p className="text-sm text-gray-500">{flight.origin}</p>
                    </div>
                    
                    <div className="w-24 h-px bg-gray-300 relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    
                    <div className="text-center ml-8">
                      <p className="text-lg font-bold">{flight.arrivalTime}</p>
                      <p className="text-sm text-gray-500">{flight.destination}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <p className="text-2xl font-bold text-blue-600">PKR {flight.price.toLocaleString()}</p>
                    <Link
                      to={`/flights/${flight.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-2"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded mr-2">
                      {flight.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {flight.seatsAvailable} seats available
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Date: {flight.departureDate}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightHome; 