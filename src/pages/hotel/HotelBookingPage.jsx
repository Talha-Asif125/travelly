import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Swal from 'sweetalert2';
import { AuthContext } from "../../context/authContext";
import { bookHotel } from '../../services/hotelService';

const HotelBookingPage = () => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const today = new Date().toISOString().slice(0, 10);
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(today);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);

  const [customerPhone, setCustomerPhone] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicPhoto, setCnicPhoto] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');

  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      let response;
      try {
        // Try service API first
        try {
          response = await axios.get(`/api/provider/services/${id}`);
          if (response.data && response.data._id) {
            setHotel({
              ...response.data,
              isService: true
            });
            setLoading(false);
            return;
          }
        } catch (serviceError) {
          console.log('Service API failed, trying hotel API...');
        }
        // Fallback to old hotel API
        response = await axios.get(`/api/hotelreservation/${id}`);
        setHotel({
          ...response.data,
          price: response.data.cheapestPrice,
          location: response.data.city,
          isService: false
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hotel:", error);
        setError("Failed to load hotel details");
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  // Initialize customer phone from user data
  useEffect(() => {
    if (user && user.phone) {
      setCustomerPhone(user.phone);
    }
  }, [user]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCnicPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await bookHotel({
        hotelId: hotel._id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        rooms: bookingData.rooms
      });
      
      if (response.success) {
        setBookingSuccess(true);
        setBookingData({
          checkIn: '',
          checkOut: '',
          guests: 1,
          rooms: 1
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to book hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!hotel) return <div className="flex justify-center items-center h-screen">Hotel not found</div>;

  const calculateDays = () => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalCost = hotel.price * calculateDays() * rooms;



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hotel Header */}
          <div className="bg-blue-500 text-white p-6">
            <h1 className="text-3xl font-bold">{hotel.name}</h1>
            <p className="text-blue-100">hotel • {hotel.location}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Service Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Service Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Hotel Type:</span>
                  <span>{hotel.starRating ? `${hotel.starRating} Star` : 'Hotel'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Available Rooms:</span>
                  <span>{hotel.availableRooms || 'Available'}</span>
                </div>
                {hotel.roomType && (
                  <div className="flex justify-between">
                    <span className="font-medium">Room Type:</span>
                    <span>{hotel.roomType}</span>
                  </div>
                )}
                {hotel.facilities && (
                  <div className="flex justify-between">
                    <span className="font-medium">Facilities:</span>
                    <span>{hotel.facilities}</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{hotel.description}</p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Price per night:</span>
                  <span className="text-blue-600">Rs. {hotel.price}</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Book This Service</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); handleBooking(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={today}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      min="1"
                      max="20"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of guests"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rooms
                    </label>
                    <input
                      type="number"
                      value={rooms}
                      onChange={(e) => setRooms(parseInt(e.target.value))}
                      min="1"
                      max="10"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of rooms"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNIC Number
                  </label>
                  <input
                    type="text"
                    value={cnicNumber}
                    onChange={(e) => setCnicNumber(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your CNIC number (e.g., 12345-1234567-1)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNIC Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload a clear photo of your CNIC for verification</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{calculateDays()} night(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per night:</span>
                      <span>Rs. {hotel.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of rooms:</span>
                      <span>{rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of guests:</span>
                      <span>{guests}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className="text-blue-600">Rs. {totalCost}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Book Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBookingPage; 
