import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { AuthContext } from "./context/authContext";

const TourBookingPage = () => {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const today = new Date().toISOString().slice(0, 10);
  const [travelers, setTravelers] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicPhoto, setCnicPhoto] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await axios.get(`https://travelly-backend-27bn.onrender.com/api/services/details/${id}`);
        if (response.data.success) {
          setTour(response.data.data);
        } else {
          // If no service found, use demo data
          const demoTour = {
            _id: id,
            name: "Private Car Service Demo",
            description: "Professional private car service for your travel needs. Experience luxury travel with our experienced drivers and well-maintained vehicles.",
            price: 500,
            location: "Pakistan",
            duration: "30 minutes",
            category: "private car service",
            availableSeats: 3,
            maxGroupSize: 3
          };
          setTour(demoTour);
        }
      } catch (error) {
        console.error("Error fetching tour:", error);
        // Use demo data as fallback
        const demoTour = {
          _id: id,
          name: "Private Car Service Demo",
          description: "Professional private car service for your travel needs. Experience luxury travel with our experienced drivers and well-maintained vehicles.",
          price: 500,
          location: "Pakistan", 
          duration: "30 minutes",
          category: "private car service",
          availableSeats: 3,
          maxGroupSize: 3
        };
        setTour(demoTour);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  // Initialize customer phone from user data
  useEffect(() => {
    if (user && user.mobile) {
      setCustomerPhone(user.mobile);
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

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const bookingData = {
        serviceId: id,
        checkInDate: tour.tourDate || tour.date || today,
        checkOutDate: tour.tourDate || tour.date || today, // Use tour's set date
        guests: parseInt(travelers),
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: customerPhone || '',
        cnicNumber,
        cnicPhoto,
        specialRequests
      };

      console.log('Submitting tour booking:', bookingData);

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
          text: 'Your tour reservation has been submitted successfully! Please wait for confirmation from the tour operator.',
          confirmButtonText: 'View My Bookings',
          confirmButtonColor: '#1976d2'
        }).then(() => {
          navigate('/my-bookings');
        });
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Tour booking error:', error);
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
  if (!tour) return <div className="flex justify-center items-center h-screen">Tour not found</div>;

  const totalCost = tour.price * travelers;

  return (
    <div className="lg:p-20">
      <div className="flex justify-center items-center w-full flex-col lg:flex-row pt-12 lg:pt-0">
        <div className="w-[320px] md:w-[700px] lg:w-[600px] rounded-lg bg-blue-500 text-white p-6 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">{tour.name}</h2>
          <div className="space-y-3 text-sm md:text-base">
            <div className="flex justify-between">
              <span className="font-semibold">Category:</span>
              <span>{tour.category || 'Private Car Service'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Duration:</span>
              <span>{tour.duration || '30 minutes'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Max Passengers:</span>
              <span>{tour.maxGroupSize || tour.availableSeats || '3'} people</span>
            </div>
            {tour.tourDate && (
              <div className="flex justify-between">
                <span className="font-semibold">Tour Date:</span>
                <span>{new Date(tour.tourDate).toLocaleDateString()}</span>
              </div>
            )}
            {tour.departureTime && (
              <div className="flex justify-between">
                <span className="font-semibold">Departure:</span>
                <span>{tour.departureTime}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold">Price:</span>
              <span className="text-yellow-300 font-bold">Rs. {tour.price}/person</span>
            </div>
          </div>
        </div>

        <div className="lg:px-24">
          <h1 className="text-center lg:text-left py-5 font-bold text-2xl">
            {tour.name}
          </h1>
          <p className="max-w-[320px] md:max-w-[700px] lg:max-w-[600px] text-justify">
            {tour.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="font-bold py-5">Location : </h1>
              <h1 className="px-4">{tour.location || "Pakistan"}</h1>
            </div>
            <div>
              <h1 className="text-[#41A4FF]">Free Cancellation</h1>
            </div>
          </div>

          {tour.tourDate && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Tour Schedule</h3>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Tour Date:</span>
                <span className="font-bold text-blue-900">{new Date(tour.tourDate).toLocaleDateString()}</span>
              </div>
              {tour.departureTime && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-blue-700">Departure Time:</span>
                  <span className="font-bold text-blue-900">{tour.departureTime}</span>
                </div>
              )}
            </div>
          )}

          <form className="" onSubmit={(e) => { e.preventDefault(); handleBooking(); }}>

            <div className="flex justify-between md:flex-row">
              <div className="flex flex-col ">
                <h1 className="font-bold text-left">Number of Travelers :</h1>
                <input 
                  type='number' 
                  required 
                  min="1" 
                  max={tour.maxGroupSize || tour.availableSeats || "20"}
                  value={travelers}
                  className='border rounded-md p-3 w-full' 
                  onChange={(e) => setTravelers(parseInt(e.target.value))} 
                />
              </div>
            </div>

            <div className="pt-4">
              <h1 className="font-bold text-left">Customer Phone :</h1>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="border rounded-md p-3 w-full"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="pt-4">
              <h1 className="font-bold text-left">CNIC Number :</h1>
              <input
                type="text"
                value={cnicNumber}
                onChange={(e) => setCnicNumber(e.target.value)}
                className="border rounded-md p-3 w-full"
                placeholder="e.g., 12345-6789012-3"
                required
              />
            </div>

            <div className="pt-4">
              <h1 className="font-bold text-left">CNIC Photo :</h1>
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*"
                className="border rounded-md p-3 w-full"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Please upload a clear photo of your CNIC</p>
            </div>

            <div className="pt-4">
              <h1 className="font-bold text-left">Special Requests (Optional) :</h1>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows="3"
                className="border rounded-md p-3 w-full"
                placeholder="Any special requirements or requests..."
              />
            </div>
           
            <div className="flex flex-col md:flex-row mt-6 py-2 justify-between lg:items-center">
              <div className="flex items-center">
                <h1 className="font-bold text-2xl">Rs.{tour.price}</h1>
                <h1 className="md:text-1xl">/per person</h1>
              </div>
              
              <button 
                className="bg-[#41A4FF] text-white rounded-md lg:ml-8 font-bold p-3 my-5 lg:my-0 w-full md:w-[350px] md:my-0 lg:w-[300px]" 
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Reserve'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TourBookingPage; 