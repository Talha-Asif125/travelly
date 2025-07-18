import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import AdminBackButton from "../../components/AdminBackButton";
import { FaPlane, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const FlightView = () => {
  const { id } = useParams();
  const location = useLocation();
  const [flight, setFlight] = useState(location.state || {});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoading(true);
      // In a real app, this would be an API call
      // For demo purposes, we're using mock data
      const mockFlight = {
        id: parseInt(id),
        flightNumber: 'PK' + (300 + parseInt(id)),
        airline: ['PIA', 'Airblue', 'SereneAir'][parseInt(id) % 3],
        origin: ['Islamabad', 'Lahore', 'Karachi'][parseInt(id) % 3],
        destination: ['Karachi', 'Dubai', 'Peshawar'][parseInt(id) % 3],
        departureDate: '2023-12-' + (24 + parseInt(id)),
        departureTime: ['09:00', '14:30', '18:45'][parseInt(id) % 3],
        arrivalTime: ['11:00', '17:30', '20:15'][parseInt(id) % 3],
        duration: ['2h', '3h', '1h 30m'][parseInt(id) % 3],
        price: 10000 + parseInt(id) * 8000,
        status: 'On Time',
        seatsAvailable: 20 + parseInt(id) * 10,
        aircraft: 'Boeing 737-800',
        amenities: ['In-flight Entertainment', 'WiFi', 'Meals', 'USB Charging'],
        baggage: {
          cabin: '7 kg',
          checked: '20 kg'
        },
        gate: 'A' + (parseInt(id) + 1),
        terminal: 'International Terminal',
        flightClass: 'Economy',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setTimeout(() => {
        setFlight(mockFlight);
        setLoading(false);
      }, 500); // Simulate API delay
    }
  }, [id]);

  const handleDeleteFlight = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real app, this would be an API call
        // For demo, just navigate back
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The flight has been deleted successfully.',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate('/airplane-travel');
        });
      }
    });
  };
  
  const handleEditFlight = () => {
    // For a real app, navigate to an edit page
    // For demo, show a modal similar to the one in AirplaneTravel
    
    Swal.fire({
      title: 'Edit Flight',
      html: `
        <input id="flightNumber" class="swal2-input" placeholder="Flight Number" value="${flight.flightNumber}">
        <input id="airline" class="swal2-input" placeholder="Airline" value="${flight.airline}">
        <input id="origin" class="swal2-input" placeholder="Origin" value="${flight.origin}">
        <input id="destination" class="swal2-input" placeholder="Destination" value="${flight.destination}">
        <input id="departureTime" class="swal2-input" placeholder="Departure Time (HH:MM)" value="${flight.departureTime}">
        <input id="arrivalTime" class="swal2-input" placeholder="Arrival Time (HH:MM)" value="${flight.arrivalTime}">
        <input id="price" class="swal2-input" placeholder="Price (PKR)" value="${flight.price}">
        <select id="status" class="swal2-input">
          <option value="On Time" ${flight.status === 'On Time' ? 'selected' : ''}>On Time</option>
          <option value="Delayed" ${flight.status === 'Delayed' ? 'selected' : ''}>Delayed</option>
          <option value="Cancelled" ${flight.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save',
      preConfirm: () => {
        const flightNumber = document.getElementById('flightNumber').value;
        const airline = document.getElementById('airline').value;
        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;
        const departureTime = document.getElementById('departureTime').value;
        const arrivalTime = document.getElementById('arrivalTime').value;
        const price = document.getElementById('price').value;
        const status = document.getElementById('status').value;
        
        if (!flightNumber || !airline || !origin || !destination || !departureTime || !arrivalTime || !price) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        
        return {
          ...flight,
          flightNumber,
          airline,
          origin,
          destination,
          departureTime,
          arrivalTime,
          price: Number(price),
          status,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Update the flight in state
        setFlight(result.value);
        
        Swal.fire({
          icon: 'success',
          title: 'Flight Updated',
          text: 'The flight has been successfully updated'
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading flight details...</p>
      </div>
    );
  }

  return (
    <>
      <AdminBackButton />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">{flight.airline} Flight {flight.flightNumber}</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Flight details */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Flight Details</h2>
                <div className={`px-3 py-1 rounded-full ${
                  flight.status === 'On Time' ? 'bg-green-100 text-green-800' : 
                  flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {flight.status}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Flight Number</p>
                  <p className="font-bold">{flight.flightNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Airline</p>
                  <p className="font-bold">{flight.airline}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Aircraft</p>
                  <p className="font-bold">{flight.aircraft}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Class</p>
                  <p className="font-bold">{flight.flightClass}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="font-bold mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" /> Schedule
                </h3>
                
                <div className="relative pl-10">
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-200"></div>
                  
                  <div className="relative mb-12">
                    <div className="absolute left-[-40px] top-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <FaPlane />
                    </div>
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-bold text-lg">{flight.departureTime}</p>
                        <p className="text-gray-800">{flight.origin}</p>
                        <p className="text-gray-600">{flight.terminal}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">{flight.departureDate}</p>
                        <p className="text-gray-600">Gate: {flight.gate}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center text-gray-500 mb-6">
                    <p>Flight Duration: {flight.duration}</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-[-40px] top-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-bold text-lg">{flight.arrivalTime}</p>
                        <p className="text-gray-800">{flight.destination}</p>
                        <p className="text-gray-600">{flight.terminal}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">{flight.departureDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold mb-4">Baggage Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Cabin Baggage</p>
                    <p className="font-bold">{flight.baggage.cabin}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Checked Baggage</p>
                    <p className="font-bold">{flight.baggage.checked}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                {flight.amenities && flight.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center bg-gray-50 p-3 rounded">
                    <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right side - Actions and summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Actions</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handleEditFlight}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                >
                  Edit Flight
                </button>
                <button
                  onClick={handleDeleteFlight}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
                >
                  Delete Flight
                </button>
              </div>
              
              <Link 
                to="/airplane-travel"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-center font-bold py-3 rounded-lg"
              >
                Back to Flights
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Flight Summary</h2>
              
              <div className="mb-4 pb-4 border-b">
                <p className="text-gray-600 mb-2">Ticket Price</p>
                <p className="text-3xl font-bold text-blue-600">PKR {flight.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">per passenger</p>
              </div>
              
              <div className="mb-4 pb-4 border-b">
                <p className="text-gray-600 mb-2">Available Seats</p>
                <p className="font-bold">{flight.seatsAvailable}</p>
              </div>
              
              <div>
                <p className="text-gray-600 mb-2">Flight Info</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">Created:</p>
                  <p className="text-right">{flight.createdAt}</p>
                  
                  <p className="text-gray-600">Last Updated:</p>
                  <p className="text-right">{flight.updatedAt}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Booking Statistics</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-center text-gray-600">This feature will be available in the next update.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlightView; 