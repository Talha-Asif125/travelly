import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { AuthContext } from "../../context/authContext";

const VehicleBookingPage = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const today = new Date().toISOString().slice(0, 10);
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(today);
  const [pickupLocation, setPickupLocation] = useState('');
  const [needDriver, setNeedDriver] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicPhoto, setCnicPhoto] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // Try service API first, then fallback to old vehicle API
        let response;
        try {
          response = await axios.get(`http://localhost:5000/api/services/details/${id}`);
          if (response.data.success) {
            setVehicle({
              ...response.data.data,
              isService: true
            });
            setLoading(false);
            return;
          }
        } catch (serviceError) {
          console.log('Service API failed, trying vehicle API...');
        }

        // Fallback to old vehicle API
        response = await axios.get(`/vehicle/${id}`);
        setVehicle({
          ...response.data,
          name: `${response.data.brand} ${response.data.model}`,
          vehicleBrand: response.data.brand,
          vehicleModel: response.data.model,
          vehicleType: response.data.type,
          seatingCapacity: response.data.capacity,
          isService: false
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        setError("Failed to load vehicle details");
        setLoading(false);
      }
    };

    fetchVehicle();
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

    if (!pickupDate || !returnDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select pickup and return dates',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    if (!pickupLocation.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter pickup location',
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

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const bookingData = {
        serviceId: id,
        checkInDate: pickupDate,
        checkOutDate: returnDate,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: customerPhone || '',
        cnicNumber,
        cnicPhoto,
        vehicleType: vehicle.vehicleType || vehicle.type,
        specialRequests: `${specialRequests}${needDriver ? ' | Driver Required' : ''}${pickupLocation ? ` | Pickup: ${pickupLocation}` : ''}`
      };

      console.log('Submitting vehicle booking:', bookingData);

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
          text: 'Your vehicle reservation has been submitted successfully! Please wait for confirmation from the provider.',
          confirmButtonText: 'View My Bookings',
          confirmButtonColor: '#1976d2'
        }).then(() => {
          navigate('/my-bookings');
        });
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Vehicle booking error:', error);
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
  if (!vehicle) return <div className="flex justify-center items-center h-screen">Vehicle not found</div>;

  const calculateDays = () => {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const driverFee = needDriver ? 700000 : 0;
  const totalCost = (vehicle.price + driverFee) * calculateDays();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Vehicle Header */}
          <div className="bg-green-500 text-white p-6">
            <h1 className="text-3xl font-bold">
              {vehicle.vehicleBrand && vehicle.vehicleModel 
                ? `${vehicle.vehicleYear || ''} ${vehicle.vehicleBrand} ${vehicle.vehicleModel}`.trim()
                : vehicle.name}
            </h1>
            <p className="text-green-100">vehicle • {vehicle.location}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Service Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Service Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Vehicle Type:</span>
                  <span>{vehicle.vehicleType || vehicle.type || 'Car'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Capacity:</span>
                  <span>{vehicle.seatingCapacity || vehicle.capacity} people</span>
                </div>
                {vehicle.transmissionType && (
                  <div className="flex justify-between">
                    <span className="font-medium">Transmission:</span>
                    <span>{vehicle.transmissionType}</span>
                  </div>
                )}
                {vehicle.fuelType && (
                  <div className="flex justify-between">
                    <span className="font-medium">Fuel Type:</span>
                    <span>{vehicle.fuelType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Features:</span>
                  <span>{vehicle.features || 'Standard'}</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{vehicle.description}</p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Price per day:</span>
                  <span className="text-green-600">Rs. {vehicle.price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Driver fee (if needed):</span>
                  <span>Rs. 2,500/day</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Book This Service</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); handleBooking(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={today}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={pickupDate}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter pickup address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Need Driver *
                  </label>
                  <select
                    value={needDriver ? 'Yes' : 'No'}
                    onChange={(e) => setNeedDriver(e.target.value === 'Yes')}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes (+Rs. 2,500/day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{calculateDays()} day(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per day:</span>
                      <span>Rs. {vehicle.price}</span>
                    </div>
                    {needDriver && (
                      <div className="flex justify-between">
                        <span>Driver fee per day:</span>
                        <span>Rs. 700,000</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Pickup location:</span>
                      <span>{pickupLocation || 'Not specified'}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span className="text-green-600">Rs. {totalCost}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

export default VehicleBookingPage; 