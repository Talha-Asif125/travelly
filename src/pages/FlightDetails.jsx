import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Swal from "sweetalert2";
import api from '../../api/axios';

const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Booking form state
  const today = new Date().toISOString().slice(0, 10);
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(today);
  const [guests, setGuests] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/services/details/${id}`);
        const result = response.data;
        
        if (result.success) {
          setService(result.data);
        } else {
          setError(result.message || 'Service not found');
        }
      } catch (error) {
        console.error('Error fetching service details:', error);
        setError('Failed to load service details');
      } finally {
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
        confirmButtonColor: '#0EA5E9'
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    if (!checkInDate || !checkOutDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select travel dates',
        confirmButtonText: 'OK',
        confirmButtonColor: '#0EA5E9'
      });
      return;
    }

    if (!customerPhone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your phone number',
        confirmButtonText: 'OK',
        confirmButtonColor: '#0EA5E9'
      });
      return;
    }

    if (guests > (service.capacity || 1000)) {
      Swal.fire({
        icon: 'warning',
        title: 'Too Many Passengers',
        text: `Maximum ${service.capacity} passengers allowed for this flight`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#0EA5E9'
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
        customerName: user.name,
        customerEmail: user.email,
        customerPhone,
        specialRequests
      };

      console.log('Submitting flight booking:', bookingData);

      const response = await api.post('/reservations', bookingData);
      const result = response.data;

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Booking Successful!',
          text: 'Your flight booking has been submitted successfully! Please wait for confirmation.',
          confirmButtonText: 'View My Bookings',
          confirmButtonColor: '#0EA5E9'
        }).then(() => {
          navigate('/my-bookings');
        });
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Flight booking error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error.response?.data?.message || error.message || 'Something went wrong with your booking',
        confirmButtonText: 'OK',
        confirmButtonColor: '#0EA5E9'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!service) return <div className="flex justify-center items-center h-screen">Flight not found</div>;

  const calculateDays = () => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalCost = service.price * calculateDays() * guests;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Flight Header */}
          <div className="bg-sky-500 text-white p-6">
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-sky-100">{service.aircraftType} • {service.routes || service.location}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Flight Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Flight Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Aircraft Type:</span>
                  <span>{service.aircraftType || 'Commercial Aircraft'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Routes:</span>
                  <span>{service.routes || service.location || 'Various Routes'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Passenger Capacity:</span>
                  <span>{service.capacity || 'Standard Capacity'}</span>
                </div>
                {service.duration && (
                  <div className="flex justify-between">
                    <span className="font-medium">Flight Duration:</span>
                    <span>{service.duration}</span>
                  </div>
                )}
                {service.amenities && (
                  <div className="flex justify-between">
                    <span className="font-medium">In-Flight Services:</span>
                    <span>{service.amenities}</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Price per ticket per day:</span>
                  <span className="text-sky-600">Rs. {service.price}</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Book Flight Tickets</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); handleBooking(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Date (From)
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={today}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Date (To)
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Passengers
                  </label>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    min="1"
                    max={service.capacity || 1000}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Seat preferences, meal requirements, wheelchair assistance, etc..."
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
                      <span>Passengers:</span>
                      <span>{guests} passenger{guests > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per ticket per day:</span>
                      <span>Rs. {service.price}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className="text-sky-600">Rs. {totalCost}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-sky-500 text-white py-3 px-4 rounded-md hover:bg-sky-600 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Book Flight Tickets'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails; 