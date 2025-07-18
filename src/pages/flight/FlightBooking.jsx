import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { FaPlane, FaUser, FaIdCard, FaPhone, FaEnvelope, FaMars, FaVenus } from 'react-icons/fa';
import { AuthContext } from '../../context/authContext';
import Swal from 'sweetalert2';

const FlightBooking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [flight, setFlight] = useState(null);
  const [passengers, setPassengers] = useState([
    {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      gender: '',
      dob: '',
      nationality: 'Pakistani',
      passportNumber: '',
      email: user?.email || '',
      phone: ''
    }
  ]);
  const [contactDetails, setContactDetails] = useState({
    email: user?.email || '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Get flight data from location state or fetch it
    if (location.state?.flight) {
      setFlight(location.state.flight);
    } else {
      // In a real app, fetch flight data if not in location state
      fetchFlightDetails();
    }
  }, [id, location]);
  
  const fetchFlightDetails = async () => {
    try {
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
        price: 10000 + parseInt(id) * 8000,
        status: 'On Time'
      };
      
      setFlight(mockFlight);
    } catch (error) {
      console.error("Error fetching flight details:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load flight details. Please try again later.'
      });
    }
  };
  
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };
  
  const handleAddPassenger = () => {
    setPassengers([
      ...passengers,
      {
        firstName: '',
        lastName: '',
        gender: '',
        dob: '',
        nationality: 'Pakistani',
        passportNumber: '',
        email: '',
        phone: ''
      }
    ]);
  };
  
  const handleRemovePassenger = (index) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(updatedPassengers);
    }
  };
  
  const handleContactChange = (field, value) => {
    setContactDetails({
      ...contactDetails,
      [field]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    const invalidPassengers = passengers.filter(p => 
      !p.firstName || !p.lastName || !p.gender || !p.dob || !p.nationality || !p.passportNumber
    );
    
    if (invalidPassengers.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all passenger details'
      });
      setIsSubmitting(false);
      return;
    }
    
    if (!contactDetails.email || !contactDetails.phone) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please provide contact details'
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      // Create booking data
      const bookingData = {
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        passengers,
        contactDetails,
        totalPrice: flight.price * passengers.length,
        bookingDate: new Date().toISOString(),
        status: 'Pending Payment'
      };
      
      // Store in session storage for payment page
      sessionStorage.setItem('flightBooking', JSON.stringify(bookingData));
      
      setIsSubmitting(false);
      navigate('/flight-payment');
    }, 1000);
  };
  
  if (!flight) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading flight booking...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-4">
        <Link to={`/flights/${id}`} className="text-blue-600 hover:text-blue-800">
          &larr; Back to Flight Details
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-center mb-8">Flight Booking</h1>
      
      {/* Flight Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Flight Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Flight</p>
            <p className="font-bold">{flight.airline} {flight.flightNumber}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Route</p>
            <p className="font-bold">{flight.origin} → {flight.destination}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Date & Time</p>
            <p className="font-bold">{flight.departureDate}, {flight.departureTime}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Price</p>
            <p className="font-bold text-blue-600">PKR {flight.price.toLocaleString()} per passenger</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Passenger Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Passenger Information</h2>
          
          {passengers.map((passenger, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  <FaUser className="inline-block mr-2 text-blue-600" />
                  Passenger {index + 1}
                </h3>
                
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePassenger(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Gender</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`gender-${index}`}
                        value="Male"
                        checked={passenger.gender === 'Male'}
                        onChange={() => handlePassengerChange(index, 'gender', 'Male')}
                        className="mr-2"
                        required
                      />
                      <FaMars className="text-blue-600 mr-1" /> Male
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`gender-${index}`}
                        value="Female"
                        checked={passenger.gender === 'Female'}
                        onChange={() => handlePassengerChange(index, 'gender', 'Female')}
                        className="mr-2"
                        required
                      />
                      <FaVenus className="text-pink-600 mr-1" /> Female
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={passenger.dob}
                    onChange={(e) => handlePassengerChange(index, 'dob', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={passenger.nationality}
                    onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Passport / ID Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={passenger.passportNumber}
                      onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                      className="w-full p-2 pl-8 border rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <FaIdCard className="absolute left-2 top-2.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddPassenger}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            + Add Another Passenger
          </button>
        </div>
        
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={contactDetails.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="w-full p-2 pl-8 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                <FaEnvelope className="absolute left-2 top-2.5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Booking confirmation will be sent to this email</p>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={contactDetails.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="w-full p-2 pl-8 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                <FaPhone className="absolute left-2 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Price Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Price Summary</h2>
          
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between mb-2">
              <p>Base Fare ({passengers.length} {passengers.length === 1 ? 'passenger' : 'passengers'})</p>
              <p>PKR {(flight.price * passengers.length).toLocaleString()}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Taxes & Fees</p>
              <p>Included</p>
            </div>
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <p>Total</p>
            <p className="text-blue-600">PKR {(flight.price * passengers.length).toLocaleString()}</p>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlightBooking; 