import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Swal from "sweetalert2";

const TrainDetails = () => {
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
        const response = await fetch(`/api/services/details/${id}`);
        const result = await response.json();
        
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
        confirmButtonColor: '#3B82F6'
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
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    if (!customerPhone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your phone number',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    if (guests > (service.capacity || 1000)) {
      Swal.fire({
        icon: 'warning',
        title: 'Too Many Passengers',
        text: `Maximum ${service.capacity} passengers allowed for this train`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
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

      console.log('Submitting train booking:', bookingData);

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Booking Successful!',
          text: 'Your train ticket booking has been submitted successfully! Please wait for confirmation.',
          confirmButtonText: 'View My Bookings',
          confirmButtonColor: '#3B82F6'
        }).then(() => {
          navigate('/my-bookings');
        });
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Train booking error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error.response?.data?.message || error.message || 'Something went wrong with your booking',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!service) return <div className="flex justify-center items-center h-screen">Train not found</div>;

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
          {/* Train Header */}
          <div className="bg-blue-500 text-white p-6">
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-blue-100">{service.trainType} • {service.route}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Train Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Train Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Train Type:</span>
                  <span>{service.trainType || 'Standard Train'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Route:</span>
                  <span>{service.route || 'Route Information'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Seating Capacity:</span>
                  <span>{service.capacity || 'Standard Capacity'}</span>
                </div>
                {service.duration && (
                  <div className="flex justify-between">
                    <span className="font-medium">Journey Duration:</span>
                    <span>{service.duration}</span>
                  </div>
                )}
                {service.trainAmenities && (
                  <div className="flex items-start space-x-2">
                    <span className="font-medium">Amenities:</span>
                    <span>{service.trainAmenities}</span>
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
                  <span className="text-blue-600">Rs. {service.price}</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Book Train Tickets</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); handleBooking(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Date (From)
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
                    Travel Date (To)
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
                    Number of Passengers
                  </label>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    min="1"
                    max={service.capacity || 1000}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    placeholder="Seat preferences, dietary requirements, etc..."
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
                      <span className="text-blue-600">Rs. {totalCost}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Book Train Tickets'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainDetails; 