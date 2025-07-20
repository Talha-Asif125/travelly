import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPlane, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaSuitcase, FaUtensils, FaWifi } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from '../../api/axios';

const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchFlightDetails();
  }, [id]);
  
  const fetchFlightDetails = async () => {
    try {
      setLoading(true);
      
      // Flight services are no longer supported
      setFlight(null);
      setLoading(false);
      
      Swal.fire({
        icon: 'info',
        title: 'Flight Services Unavailable',
        text: 'Flight details are not available as flight services have been discontinued.'
      });
      
    } catch (error) {
      console.error("Error fetching flight details:", error);
      setFlight(null);
      setLoading(false);
    }
  };
  
  const handleBooking = () => {
    if (!flight) return;
    navigate(`/flight-booking/${id}`, { state: { flight } });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading flight details...</p>
      </div>
    );
  }
  
  if (!flight) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h2 className="text-2xl font-bold text-red-600">Flight Not Found</h2>
        <p className="mt-4">The flight you're looking for doesn't exist or has been removed.</p>
        <Link to="/flights" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back to Flight Search
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-4">
        <Link to="/flights" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Flight Search
        </Link>
      </div>
      
      {/* Flight Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {flight.origin} to {flight.destination}
            </h1>
            <p className="text-gray-600">
              {flight.airline} · Flight {flight.flightNumber}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">PKR {flight.price.toLocaleString()}</p>
            <p className="text-gray-500">per passenger</p>
          </div>
        </div>
      </div>
      
      {/* Flight Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Left Column */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Flight Details</h2>
            
            <div className="flex items-start mb-8">
              <div className="min-w-[80px]">
                <FaPlane className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-bold">Aircraft</h3>
                <p className="text-gray-600">{flight.aircraft}</p>
              </div>
            </div>
            
            <div className="flex items-start mb-8">
              <div className="min-w-[80px]">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-bold">Date</h3>
                <p className="text-gray-600">{flight.departureDate}</p>
              </div>
            </div>
            
            <div className="relative pl-10">
              <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-200"></div>
              
              <div className="relative mb-12">
                <div className="absolute left-[-40px] top-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <FaPlane />
                </div>
                <p className="font-bold text-lg">{flight.departureTime}</p>
                <p className="text-gray-800">{flight.origin}</p>
                <p className="text-gray-600">{flight.terminal}</p>
              </div>
              
              <div className="text-center text-gray-500 mb-6">
                <p>Flight Duration: {flight.duration}</p>
              </div>
              
              <div className="relative">
                <div className="absolute left-[-40px] top-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <FaMapMarkerAlt />
                </div>
                <p className="font-bold text-lg">{flight.arrivalTime}</p>
                <p className="text-gray-800">{flight.destination}</p>
                <p className="text-gray-600">{flight.terminal}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flight.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  {amenity.includes('WiFi') ? <FaWifi className="text-blue-600 mr-2" /> : 
                   amenity.includes('Meals') ? <FaUtensils className="text-blue-600 mr-2" /> : 
                   <FaSuitcase className="text-blue-600 mr-2" />}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Booking Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
            
            <div className="mb-4 pb-4 border-b">
              <p className="text-gray-600 mb-2">Status</p>
              <p className="font-bold text-green-600">{flight.status}</p>
            </div>
            
            <div className="mb-4 pb-4 border-b">
              <p className="text-gray-600 mb-2">Seats Available</p>
              <p className="font-bold">{flight.seatsAvailable}</p>
            </div>
            
            <div className="mb-4 pb-4 border-b">
              <p className="text-gray-600 mb-2">Gate</p>
              <p className="font-bold">{flight.gate}</p>
            </div>
            
            <div className="mb-6 pb-4 border-b">
              <p className="text-gray-600 mb-2">Baggage Allowance</p>
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-sm text-gray-600">Cabin</p>
                  <p className="font-bold">{flight.baggage.cabin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Checked</p>
                  <p className="font-bold">{flight.baggage.checked}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Price</p>
              <p className="text-3xl font-bold text-blue-600">PKR {flight.price.toLocaleString()}</p>
              <p className="text-sm text-gray-500">per passenger, taxes included</p>
            </div>
            
            <button
              onClick={handleBooking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails; 