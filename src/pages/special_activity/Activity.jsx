import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/authContext";
import ProviderBadge from '../../components/ui/ProviderBadge';

const Activity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicPhoto, setCnicPhoto] = useState('');
  useEffect(() => {
    const getActivity = async () => {
      console.log('Trying to fetch activity with ID:', id);
      setLoading(true);
      
      try {
        // First try to get from activities API
        const response = await axios.get(`/activities/${id}`);
        console.log('Activity API response:', response.data);
        
        if (response.data && response.data._id) {
          setActivity(response.data);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Activity API failed, trying services API...');
      }
      
      // If not found in activities API, try services API
      try {
        // Add auth headers in case they're needed
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const serviceResponse = await axios.get(`/services/details/${id}`, { headers });
        console.log('Services API response:', serviceResponse.data);
        
        if (serviceResponse.data.success && serviceResponse.data.data) {
          // Format service data to match activity structure
          const service = serviceResponse.data.data;
          console.log('Raw service data:', service);
          console.log('Service keys:', Object.keys(service));
          
          // Create appropriate time and date ranges based on service type
          let defaultTimeRange = { startTime: '09:00', endTime: '17:00' };
          let defaultDateRange = {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          };
          
          // Adjust defaults based on service type
          if (service.type === 'restaurant') {
            defaultTimeRange = { startTime: '10:00', endTime: '22:00' };
          } else if (service.type === 'event') {
            defaultTimeRange = { startTime: '18:00', endTime: '23:00' };
          } else if (service.type === 'tour') {
            defaultTimeRange = { startTime: '08:00', endTime: '18:00' };
          }
          
          const formattedActivity = {
            _id: service._id,
            name: service.name || 'Unnamed Activity',
            description: service.description || 'No description available',
            location: service.location || service.venue || 'Location TBD',
            type: service.eventType || service.type || 'event',
            timeRange: {
              startTime: service.startTime || service.eventStartTime || service.availableStartTime || defaultTimeRange.startTime,
              endTime: service.endTime || service.eventEndTime || service.availableEndTime || defaultTimeRange.endTime
            },
            dateRange: {
              startDate: service.availableFrom || service.eventDate || service.startDate || defaultDateRange.startDate,
              endDate: service.availableTo || service.eventEndDate || service.endDate || defaultDateRange.endDate
            },
            image: service.images?.[0] || service.image || service.thumbnail || 'https://via.placeholder.com/600x400?text=Activity+Image',
            status: 'APPROVED',
            isServiceActivity: true,
            price: service.price || 'Contact for pricing',
            providerId: service.providerId
          };
          
          console.log('Formatted activity data:', formattedActivity);
          
          // Additional validation to ensure we have the minimum required data
          if (formattedActivity.name && formattedActivity._id) {
            setActivity(formattedActivity);
            setLoading(false);
            return;
          } else {
            console.log('Service data missing required fields:', formattedActivity);
          }
        } else {
          console.log('Service API returned unsuccessful response:', serviceResponse.data);
        }
      } catch (serviceError) {
        console.log('Error fetching from services API:', serviceError.response?.status, serviceError.response?.data);
        console.log('Full service error:', serviceError);
      }
      
      setLoading(false);
    };
    getActivity();
  }, [id]);

  // Initialize customer phone from user data
  useEffect(() => {
    if (user && user.phone) {
      setCustomerPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'You need to login to book tickets',
        confirmButtonText: 'Login',
        confirmButtonColor: '#3B82F6'
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
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    if (!cnicNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your CNIC number',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    if (!cnicPhoto) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please upload your CNIC photo',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    try {
      console.log(id);
      
      // Use different API endpoint based on activity type
      let response;
      if (activity.isServiceActivity) {
        // For service activities, use the reservations API
        response = await axios.post(`/reservations`, {
          serviceId: id,
          checkInDate: activity?.eventDate || activity?.dateRange?.startDate || new Date().toISOString(),
          checkOutDate: activity?.eventDate || activity?.dateRange?.startDate || new Date().toISOString(),
          guests: tickets,
          customerName: user?.name || 'Guest',
          customerEmail: user?.email || 'guest@example.com',
          customerPhone,
          cnicNumber,
          cnicPhoto,
          specialRequests: `Activity ticket booking for ${tickets} ticket(s)`
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // For regular activities, use the activities reservation API
        response = await axios.post(`/activity-reservations/create`, {
          activity_id: id,
          tickets: tickets,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone,
          cnicNumber,
          cnicPhoto,
          activityDate: activity?.eventDate || activity?.dateRange?.startDate || new Date().toISOString(),
          user_id: user?._id || 'guest'
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log(response.data);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${tickets} ticket(s) purchased successfully!`,
      });

      // Reset form
      setTickets(1);
      setCustomerPhone('');
      setCnicNumber('');
      setCnicPhoto('');
      navigate("/my-bookings");
    } catch (error) {
      console.log(error);
      let errorMessage = "Failed to make reservation";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: "error",
        title: "Reservation Failed",
        text: errorMessage,
      });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Discover Amazing
              <span className="text-yellow-300"> Activities</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Find the perfect special activity for your next adventure and create unforgettable memories
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-xl text-gray-600">Loading activity details...</div>
              </div>
            </div>
          ) : !activity ? (
            <div className="flex justify-center items-center py-32">
              <div className="text-center bg-white rounded-lg shadow-lg p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Activity Not Found</h3>
                <p className="text-gray-600 mb-4">We couldn't find the activity you're looking for.</p>
                <p className="text-sm text-gray-500 mb-6">ID: {id}</p>
                <div className="space-x-3">
                  <button 
                    onClick={async () => {
                      console.log('Testing direct service API call...');
                      try {
                        const testResponse = await axios.get(`/services/details/${id}`);
                        console.log('Direct fetch test:', testResponse.status, testResponse.data);
                      } catch (err) {
                        console.log('Direct fetch error:', err);
                      }
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Test API
                  </button>
                  <button 
                    onClick={() => navigate(-1)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Activity Details */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Activity Image */}
                  <div className="relative h-64 md:h-80 bg-gray-200">
                    <img
                      src={activity.image}
                      alt={activity.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400?text=Activity+Image';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Available
                      </span>
                    </div>
                  </div>

                  {/* Activity Info */}
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {activity.name}
                        </h1>
                        <div className="flex items-center text-gray-600 mb-2">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          {activity.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {activity.type}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 4h12m-7 4h2"></path>
                          </svg>
                          <h3 className="font-semibold text-gray-900">Available Dates</h3>
                        </div>
                        <p className="text-gray-700">
                          {new Date(activity.dateRange.startDate).toLocaleDateString()} - {new Date(activity.dateRange.endDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <h3 className="font-semibold text-gray-900">Available Time</h3>
                        </div>
                        <p className="text-gray-700">
                          {activity.timeRange?.startTime || '09:00'} - {activity.timeRange?.endTime || '17:00'}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                          </svg>
                          <h3 className="font-semibold text-gray-900">Price</h3>
                        </div>
                        <p className="text-gray-700 font-medium">
                          {activity.price && typeof activity.price === 'number' ? `Rs. ${activity.price.toLocaleString()}` : activity.price || 'Contact for pricing'}
                        </p>
                      </div>

                      {activity.providerId && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <h3 className="font-semibold text-gray-900">Provider</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-gray-700">
                              {activity.providerId.businessName || activity.providerId.name || 'Service Provider'}
                            </p>
                            <ProviderBadge user={activity.providerId} size="sm" showText={false} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Form */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Buy Tickets</h2>
                    <p className="text-gray-600">Get your tickets for this amazing activity</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Tickets
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={tickets}
                        onChange={(e) => setTickets(parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Each ticket admits one person to the activity</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC Number
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        type="text"
                        required
                        value={cnicNumber}
                        onChange={(e) => setCnicNumber(e.target.value)}
                        placeholder="e.g., 12345-1234567-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC Photo
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => setCnicPhoto(e.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload a clear photo of your CNIC (front side)</p>
                    </div>

                    <button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      type="submit"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 4h12m-7 4h2"></path>
                        </svg>
                        Buy Tickets
                      </div>
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Secure booking • Instant ticket confirmation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Activity;
