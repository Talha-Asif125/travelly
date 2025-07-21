import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BiRestaurant } from "react-icons/bi";
import { MdLocationOn, MdRestaurantMenu, MdPhone, MdPeople, MdTableRestaurant } from "react-icons/md";
import api from '../api/axios';

const RestaurantAdminDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.post('/restaurant/find-resturent-by-id', { id });
        const result = response.data;
        
        if (result && (Array.isArray(result) ? result.length > 0 : result._id)) {
          const restaurantData = Array.isArray(result) ? result[0] : result;
          setRestaurant(restaurantData);
        } else {
          setError('Restaurant not found');
        }
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        setError('Failed to load restaurant details');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const handleContactCall = () => {
    if (restaurant.mobileNo || restaurant.contactNo) {
      window.open(`tel:${restaurant.mobileNo || restaurant.contactNo}`);
    }
  };

  const handleContactSMS = () => {
    if (restaurant.mobileNo || restaurant.contactNo) {
      window.open(`sms:${restaurant.mobileNo || restaurant.contactNo}`);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!restaurant) return <div className="flex justify-center items-center h-screen">Restaurant not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Restaurant Header */}
          <div className="bg-green-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <BiRestaurant className="mr-2" />
                  {restaurant.name}
                </h1>
                <p className="text-green-100 mt-2">
                  <MdLocationOn className="inline mr-1" />
                  {restaurant.address}
                </p>
                {restaurant.district && (
                  <p className="text-green-100">
                    District: {restaurant.district}
                  </p>
                )}
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                Admin Added
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Restaurant Images */}
            {restaurant.resturentImages && restaurant.resturentImages.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Restaurant Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurant.resturentImages.map((image, index) => (
                    <div key={index} className="h-48 overflow-hidden rounded-lg">
                      <img 
                        src={image || "https://via.placeholder.com/400x200?text=Restaurant"} 
                        alt={`${restaurant.name} - Image ${index + 1}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Restaurant Details */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Restaurant Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MdTableRestaurant className="text-green-600 mr-2" />
                      <span className="font-medium">Table Count:</span>
                    </div>
                    <span>{restaurant.tableCount || 'Not specified'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MdPeople className="text-green-600 mr-2" />
                      <span className="font-medium">Staff Amount:</span>
                    </div>
                    <span>{restaurant.staffAmount || 'Not specified'}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MdRestaurantMenu className="text-green-600 mr-2" />
                      <span className="font-medium">Cuisine Type:</span>
                    </div>
                    <span>{restaurant.cuisineType || 'Mixed'}</span>
                  </div>

                  {restaurant.description && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="font-medium">Description:</span>
                      </div>
                      <p className="text-gray-600">{restaurant.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                
                {restaurant.mobileNo || restaurant.contactNo ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center mb-3">
                        <MdPhone className="text-green-600 mr-2" />
                        <span className="font-medium">Phone Number:</span>
                      </div>
                      <p className="text-lg font-semibold text-green-700 mb-3">
                        {restaurant.mobileNo || restaurant.contactNo}
                      </p>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={handleContactCall}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center"
                        >
                          <MdPhone className="mr-2" />
                          Call
                        </button>
                        <button
                          onClick={handleContactSMS}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                        >
                          SMS
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-800 mb-2">How to make a reservation:</h3>
                      <ol className="text-sm text-yellow-700 space-y-1">
                        <li>1. Call the restaurant using the phone number above</li>
                        <li>2. Speak with the restaurant staff about availability</li>
                        <li>3. Provide your details and preferred date/time</li>
                        <li>4. Confirm your reservation with the restaurant</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700">Contact information not available for this restaurant.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/restaurant-list')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition duration-300"
              >
                Back to Restaurant List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantAdminDetails; 
