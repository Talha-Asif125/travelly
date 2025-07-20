import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Swal from "sweetalert2";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Booking form state for event tickets
  const [tickets, setTickets] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicPhoto, setCnicPhoto] = useState('');

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
        confirmButtonColor: '#8B5CF6'
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    if (!customerPhone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your phone number',
        confirmButtonText: 'OK',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    if (!cnicNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your CNIC number',
        confirmButtonText: 'OK',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    if (!cnicPhoto) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please upload your CNIC photo',
        confirmButtonText: 'OK',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    if (tickets > (service.maxAttendees || service.capacity || 1000)) {
      Swal.fire({
        icon: 'warning',
        title: 'Too Many Tickets',
        text: `Maximum ${service.maxAttendees || service.capacity} tickets available for this event`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // For events, we use a simplified booking structure
      const eventDate = service.eventDate || service.scheduleDate || new Date().toISOString();
      const bookingData = {
        serviceId: id,
        checkInDate: eventDate,
        checkOutDate: eventDate,
        guests: tickets,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone,
        cnicNumber,
        cnicPhoto,
        specialRequests: `Event ticket booking for ${tickets} ticket(s)`
      };

      console.log('Submitting event booking:', bookingData);

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
          text: 'Your event booking has been submitted successfully! Please wait for confirmation from the event organizer.',
          confirmButtonText: 'View My Bookings',
          confirmButtonColor: '#8B5CF6'
        }).then(() => {
          navigate('/my-bookings');
        });
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Event booking error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error.response?.data?.message || error.message || 'Something went wrong with your booking',
        confirmButtonText: 'OK',
        confirmButtonColor: '#8B5CF6'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!service) return <div className="flex justify-center items-center h-screen">Event not found</div>;



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Event Header */}
          <div className="bg-purple-500 text-white p-6">
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-purple-100">{service.eventType} • {service.venue || service.location}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Event Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Event Type:</span>
                  <span>{service.eventType || 'General Event'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Venue:</span>
                  <span>{service.venue || service.location || 'TBA'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Max Attendees:</span>
                  <span>{service.maxAttendees || service.capacity || 'Unlimited'}</span>
                </div>
                {service.duration && (
                  <div className="flex justify-between">
                    <span className="font-medium">Duration:</span>
                    <span>{service.duration} hours</span>
                  </div>
                )}
                {service.amenities && (
                  <div className="flex justify-between">
                    <span className="font-medium">Amenities:</span>
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
                  <span>Price per person per day:</span>
                  <span className="text-purple-600">Rs. {service.price}</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Buy Tickets</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); handleBooking(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Tickets
                  </label>
                  <input
                    type="number"
                    value={tickets}
                    onChange={(e) => setTickets(parseInt(e.target.value))}
                    min="1"
                    max={service.maxAttendees || service.capacity || 100}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Each ticket admits one person to the event</p>
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    placeholder="e.g., 12345-1234567-1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => setCnicPhoto(e.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a clear photo of your CNIC (front side)</p>
                </div>

                {/* Ticket Summary */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Ticket Summary</h3>
                  <div className="space-y-1 text-sm">
                    {service.eventDate && (
                      <div className="flex justify-between">
                        <span>Event Date:</span>
                        <span>{new Date(service.eventDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {service.startTime && (
                      <div className="flex justify-between">
                        <span>Event Time:</span>
                        <span>{service.startTime} {service.endTime ? `- ${service.endTime}` : ''}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tickets:</span>
                      <span>{tickets} ticket{tickets > 1 ? 's' : ''}</span>
                    </div>
                    {customerPhone && (
                      <div className="flex justify-between">
                        <span>Contact:</span>
                        <span>{customerPhone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Price per ticket:</span>
                      <span>Rs. {service?.price || 0}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className="text-purple-600">Rs. {(service?.price || 0) * tickets}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Buy Tickets'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 