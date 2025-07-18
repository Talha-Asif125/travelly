import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { AuthContext } from "../context/authContext";

const ServiceBook = () => {
  const [service, setService] = useState(null);
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
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/services/details/${id}`);
        setService(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching service:", error);
        setError("Failed to load service details");
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Initialize customer phone from user data
  useEffect(() => {
    if (user && user.phone) {
      setCustomerPhone(user.phone);
    }
  }, [user]);

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

    if (!checkInDate || !checkOutDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select check-in and check-out dates',
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

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const bookingData = {
        serviceId: id,
        checkInDate,
        checkOutDate,
        guests,
        rooms: service?.type === 'hotel' ? rooms : undefined,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: customerPhone || '',
        specialRequests
      };

      console.log('Submitting service booking:', bookingData);

      const response = await axios.post('/api/reservations', bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Booking Successful!',
          text: 'Your booking request has been submitted successfully! Please wait for confirmation from the provider.',
          confirmButtonText: 'View My Bookings',
          confirmButtonColor: '#1976d2'
        }).then(() => {
          navigate('/my-bookings');
        });
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Service booking error:', error);
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
  if (!service) return <div className="flex justify-center items-center h-screen">Service not found</div>;

  const calculateDays = () => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalCost = service.price * calculateDays();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Service Header */}
          <div className="bg-blue-500 text-white p-6">
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-blue-100">{service.type} • {service.location}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Service Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Service Details</h2>
              
              {service.type === 'vehicle' && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Vehicle Type:</span>
                    <span>{service.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Capacity:</span>
                    <span>{service.capacity} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Features:</span>
                    <span>{service.features || 'Standard'}</span>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Price per day:</span>
                  <span className="text-blue-600">Rs. {service.price}</span>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {service.type === 'hotel' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Rooms
                    </label>
                    <input
                      type="number"
                      value={rooms}
                      onChange={(e) => setRooms(parseInt(e.target.value))}
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                {/* Cost Summary */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{calculateDays()} day(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests:</span>
                      <span>{guests} guest{guests > 1 ? 's' : ''}</span>
                    </div>
                    {service.type === 'hotel' && (
                      <div className="flex justify-between">
                        <span>Rooms:</span>
                        <span>{rooms} room{rooms > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Price per day:</span>
                      <span>Rs. {service.price}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className="text-blue-600">Rs. {totalCost * (service.type === 'hotel' ? rooms : 1)}</span>
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

export default ServiceBook; 