import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Swal from 'sweetalert2';
import { AuthContext } from "../../context/authContext";

const RestaurantBookingPage = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const today = new Date().toISOString().slice(0, 10);
  const [reservationDate, setReservationDate] = useState(today);
  const [fromHour, setFromHour] = useState('');
  const [fromMinute, setFromMinute] = useState('');
  const [fromPeriod, setFromPeriod] = useState('AM');
  const [toHour, setToHour] = useState('');
  const [toMinute, setToMinute] = useState('');
  const [toPeriod, setToPeriod] = useState('AM');
  const [guests, setGuests] = useState(1);
  const [tables, setTables] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicPhoto, setCnicPhoto] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');

  // Define reservationTime as a computed value
  const reservationTime = fromHour && fromMinute && toHour && toMinute 
    ? `${fromHour}:${fromMinute} ${fromPeriod} - ${toHour}:${toMinute} ${toPeriod}`
    : '';

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(`/services/details/${id}`);
        if (response.data.success) {
          setRestaurant(response.data.data);
          setLoading(false);
        } else {
          setError("Restaurant not found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
        setError("Failed to load restaurant details");
        setLoading(false);
      }
    };

    fetchRestaurant();
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

  const handleBooking = async () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Please Login',
        text: 'You need to login to make a booking',
        confirmButtonText: 'Login',
        confirmButtonColor: '#1976d2'
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    if (!reservationDate || !reservationTime) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select reservation date and time',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    if (!customerPhone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your phone number',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    if (!cnicNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your CNIC number',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    if (!cnicPhoto) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please upload your CNIC photo',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    const fromTime = `${fromHour}:${fromMinute} ${fromPeriod}`;
    const toTime = `${toHour}:${toMinute} ${toPeriod}`;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const bookingData = {
        serviceId: id,
        checkInDate: reservationDate,
        checkOutDate: reservationDate, // Same day for restaurant
        guests: parseInt(guests),
        tables: parseInt(tables),
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: customerPhone || '',
        cnicNumber,
        cnicPhoto,
        fromTime,
        toTime,
        specialRequests
      };

      console.log('Submitting restaurant booking:', bookingData);

      const response = await axios.post('/api/restaurantReservation/create', bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Add logging to see the response
      console.log('Booking response:', response.data);

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Reservation Successful!',
          text: 'Your restaurant reservation has been submitted successfully! Please wait for confirmation from the restaurant.',
          confirmButtonText: 'View My Bookings',
          confirmButtonColor: '#1976d2'
        }).then(() => {
          navigate('/my-bookings');
        });
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Restaurant booking error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error.response?.data?.message || error.message || 'Something went wrong with your booking',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!restaurant) return <div className="flex justify-center items-center h-screen">Restaurant not found</div>;

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  const totalCost = restaurant.price * guests;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Restaurant Header */}
          <div className="bg-green-500 text-white p-6">
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-green-100">{restaurant.cuisineType} • {restaurant.location}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Restaurant Details */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Restaurant Details</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Cuisine Type:</span>
                    <span className="ml-2">{restaurant.cuisineType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Seating Capacity:</span>
                    <span className="ml-2">{restaurant.capacity} people</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Specialities:</span>
                    <span className="ml-2">{restaurant.specialties}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Description:</span>
                    <p className="mt-1 text-gray-700">{restaurant.description}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Price per person per day:</span>
                    <span className="ml-2 text-green-600 font-semibold">Rs. {restaurant.price}</span>
                  </div>
                </div>
              </div>

              {/* Make Reservation */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Make Reservation</h2>
                
                <form onSubmit={(e) => { e.preventDefault(); handleBooking(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                      Reservation Date
                    </label>
                    <input
                      type="date"
                      value={reservationDate}
                      onChange={(e) => setReservationDate(e.target.value)}
                      min={today}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                      From Time
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Hour"
                        value={fromHour}
                        onChange={(e) => setFromHour(e.target.value)}
                        className="w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Min"
                        value={fromMinute}
                        onChange={(e) => setFromMinute(e.target.value)}
                        className="w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <select
                        value={fromPeriod}
                        onChange={(e) => setFromPeriod(e.target.value)}
                        className="w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                      To Time
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="Hour"
                        value={toHour}
                        onChange={(e) => setToHour(e.target.value)}
                        className="w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Min"
                        value={toMinute}
                        onChange={(e) => setToMinute(e.target.value)}
                        className="w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <select
                        value={toPeriod}
                        onChange={(e) => setToPeriod(e.target.value)}
                        className="w-1/3 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter number of guests"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                      Number of Tables
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tables}
                      onChange={(e) => setTables(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter number of tables"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                      CNIC Number
                    </label>
                    <input
                      type="text"
                      value={cnicNumber}
                      onChange={(e) => setCnicNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your CNIC number (e.g., 12345-1234567-1)"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                      CNIC Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Upload a clear photo of your CNIC (front side)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Dietary restrictions, special occasions, table preferences..."
                    />
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Booking Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(reservationDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{reservationTime || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Number of guests:</span>
                        <span>{guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per person:</span>
                        <span>Rs. {restaurant.price}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total Cost:</span>
                        <span className="text-orange-600">Rs. {totalCost}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Processing...' : 'Book Now'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBookingPage; 
