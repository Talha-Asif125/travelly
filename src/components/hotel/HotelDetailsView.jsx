import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import HotelReservationForm from "../forms/HotelReservationForm";
import ReservationSuccessModal from "../ui/ReservationSuccessModal";
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar, 
  FaWifi, 
  FaCar, 
  FaUtensils, 
  FaDumbbell,
  FaSwimmingPool,
  FaCoffee,
  FaConciergeBell,
  FaParking,
  FaBaby,
  FaTv,
  FaSnowflake,
  FaWheelchair,
  FaBan,
  FaLanguage,
  FaMusic,
  FaBath,
  FaBed,
  FaUsers,
  FaExpand,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock
} from 'react-icons/fa';

const HotelDetailsView = () => {
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [openReservationForm, setOpenReservationForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationData, setReservationData] = useState(null);

  const location = useLocation();
  const dates = location.state;
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const checkInDate = dates ? new Date(dates.checkInDate) : new Date();
  const checkOutDate = dates ? new Date(dates.checkOutDate) : new Date(Date.now() + 86400000);

  const dayDifference = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  // Comprehensive amenities data
  const amenityCategories = {
    popular: {
      title: "Popular amenities",
      items: [
        { id: 'front-desk', name: '24/7 front desk', icon: FaConciergeBell },
        { id: 'air-conditioning', name: 'Air conditioning', icon: FaSnowflake },
        { id: 'laundry', name: 'Laundry', icon: FaConciergeBell },
        { id: 'restaurant', name: 'Restaurant', icon: FaUtensils },
        { id: 'free-wifi', name: 'Free WiFi', icon: FaWifi },
      ]
    },
    parking: {
      title: "Parking and transportation",
      items: [
        { id: 'no-parking', name: 'No onsite parking available', icon: FaBan }
      ]
    },
    food: {
      title: "Food and drink",
      items: [
        { id: 'restaurant', name: 'A restaurant', icon: FaUtensils }
      ]
    },
    internet: {
      title: "Internet",
      items: [
        { id: 'wifi-all-rooms', name: 'Available in all rooms: Free WiFi', icon: FaWifi },
        { id: 'wifi-speed', name: 'In-room WiFi speed: 25+ Mbps', icon: FaWifi }
      ]
    },
    family: {
      title: "Family friendly",
      items: [
        { id: 'laundry-facilities', name: 'Laundry facilities', icon: FaConciergeBell }
      ]
    },
    conveniences: {
      title: "Conveniences",
      items: [
        { id: 'front-desk-24', name: '24-hour front desk', icon: FaClock },
        { id: 'laundry-facilities-2', name: 'Laundry facilities', icon: FaConciergeBell }
      ]
    },
    guest: {
      title: "Guest services",
      items: [
        { id: 'dry-cleaning', name: 'Dry cleaning/laundry service', icon: FaConciergeBell },
        { id: 'housekeeping', name: 'Housekeeping (on request)', icon: FaConciergeBell }
      ]
    },
    accessibility: {
      title: "Accessibility",
      items: [
        { id: 'accessibility-note', name: 'If you have requests for specific accessibility needs, please contact the property using the information on the reservation confirmation received after booking.', icon: FaWheelchair },
        { id: 'upper-floors', name: 'Upper floors accessible by stairs only', icon: FaWheelchair },
        { id: 'wheelchair-accessible', name: 'Wheelchair accessible (may have limitations)', icon: FaWheelchair },
        { id: 'registration-desk', name: 'Wheelchair-accessible registration desk', icon: FaWheelchair }
      ]
    },
    languages: {
      title: "Languages spoken",
      items: [
        { id: 'english', name: 'English', icon: FaLanguage },
        { id: 'urdu', name: 'Urdu', icon: FaLanguage }
      ]
    },
    more: {
      title: "More",
      items: [
        { id: 'no-smoking', name: 'Smoking not allowed', icon: FaBan }
      ]
    }
  };

  // Room data will be fetched from hotel service or database
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => {
    fetchHotelData();
  }, [id]);

  const fetchHotelData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from hotels API first
      let response;
      try {
        response = await axios.get(`/hotels/find/${id}`);
        if (response.data) {
          setHotelData({
            ...response.data,
            isService: false
          });
        }
      } catch (error) {
        // If hotel not found, try services API
        try {
          response = await axios.get(`https://travelly-backend-27bn.onrender.com/api/services/details/${id}`);
          if (response.data.success) {
            setHotelData({
              ...response.data.data,
              isService: true,
              name: response.data.data.name,
              city: response.data.data.location || 'Location not specified',
              cheapestPrice: response.data.data.price,
              HotelImgs: response.data.data.images || [],
              rating: 4.0 // Default rating for services
            });
          }
        } catch (serviceError) {
          throw new Error('Hotel not found in either hotels or services');
        }
      }
    } catch (err) {
      setError('Failed to load hotel details');
      console.error('Error fetching hotel:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return stars;
  };

  const handleBooking = () => {
    if (user) {
      setOpenReservationForm(true);
    } else {
      navigate("/login");
    }
  };

  const handleReservationSuccess = (reservation) => {
    setReservationData(reservation);
    setShowSuccessModal(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setReservationData(null);
  };

  const showRoomDetails = (room) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !hotelData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hotel Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const images = hotelData.HotelImgs && hotelData.HotelImgs.length > 0 
    ? hotelData.HotelImgs.map(img => 
        hotelData.isService 
          ? img 
          : `https://travelly-backend-27bn.onrender.com/api/hotels/images/${img}`
      )
    : ['https://via.placeholder.com/800x600?text=Hotel+Image'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {hotelData.name}
              </h1>
              <div className="flex items-center gap-1">
                {renderStars(hotelData.rating || 4.0)}
              </div>
            </div>
            <p className="text-gray-600 mb-2">
              Hotel in {hotelData.city} with a 24-hour front desk and a restaurant
            </p>
            <div className="flex items-center text-gray-500">
              <FaMapMarkerAlt className="mr-1" />
              <span>{hotelData.address || hotelData.city}</span>
            </div>
          </div>

          {/* Date Selection Bar */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Where to?</label>
              <input 
                type="text" 
                value={hotelData.name}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dates</label>
              <input 
                type="text" 
                value={`${checkInDate.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
              <input 
                type="text" 
                value="2 travelers, 1 room"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-2 mb-6 h-80">
          <div className="col-span-2 relative cursor-pointer" onClick={() => setShowImageGallery(true)}>
            <img 
              src={images[0]} 
              alt="Hotel main view"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="grid grid-rows-2 gap-2">
            {images.slice(1, 3).map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`Hotel view ${index + 2}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowImageGallery(true)}
              />
            ))}
          </div>
          <div className="grid grid-rows-2 gap-2">
            {images.slice(3, 5).map((img, index) => (
              <img 
                key={index}
                src={img || 'https://via.placeholder.com/400x250?text=Hotel+Image'} 
                alt={`Hotel view ${index + 4}`}
                className="w-full h-full object-cover cursor-pointer rounded-r-lg"
                onClick={() => setShowImageGallery(true)}
              />
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hotel Details */}
          <div className="lg:col-span-2">
            {/* Popular Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Popular amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {amenityCategories.popular.items.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-3">
                    <amenity.icon className="text-gray-600" />
                    <span className="text-gray-800">{amenity.name}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowAmenitiesModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                See all →
              </button>
            </div>

            {/* Hotel Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">About this property</h3>
              <p className="text-gray-700 leading-relaxed">
                {hotelData.description || `Experience comfort and convenience at ${hotelData.name}. Our hotel offers modern amenities and excellent service in the heart of ${hotelData.city}.`}
              </p>
            </div>

            {/* Room Options */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Room options</h3>
              <div className="space-y-4">
                {roomTypes.map((room) => (
                  <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{room.name}</h4>
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <FaUsers />
                            <span>Sleeps {room.sleeps}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaBed />
                            <span>{room.beds}</span>
                          </div>
                        </div>
                        
                        {/* Room Highlights */}
                        <div className="mb-3">
                          <div className="flex items-center gap-1 mb-2">
                            <FaStar className="text-yellow-400 text-sm" />
                            <span className="font-medium text-sm">Highlights</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                            {room.highlights.slice(0, 6).map((highlight, index) => (
                              <div key={index}>{highlight}</div>
                            ))}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => showRoomDetails(room)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          More details →
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          Rs.{(room.pricePerNight * dayDifference).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          total for {dayDifference} night{dayDifference > 1 ? 's' : ''}
                        </div>
                        <Link to={`/hotel-book/${id}`}>
                          <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700">
                            Reserve
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  Rs.{(hotelData.cheapestPrice * dayDifference).toLocaleString()}
                </div>
                <div className="text-gray-600">
                  total for {dayDifference} night{dayDifference > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {checkInDate.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {checkOutDate.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    2 travelers, 1 room
                  </div>
                </div>
              </div>

              <Link to={`/hotel-book/${id}`}>
                <button className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 mb-4">
                  Reserve now
                </button>
              </Link>

              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">Perfect for a {dayDifference}-night stay!</p>
                <p>Excellent location in {hotelData.city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Amenities Modal */}
      {showAmenitiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Property amenities</h2>
              <button 
                onClick={() => setShowAmenitiesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-6">
              {Object.entries(amenityCategories).map(([key, category]) => (
                <div key={key} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">{category.title}</h3>
                  <div className="space-y-3">
                    {category.items.map((amenity) => (
                      <div key={amenity.id} className="flex items-start gap-3">
                        <amenity.icon className="text-gray-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-800">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Room Information Modal */}
      {showRoomModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Room information</h2>
              <button 
                onClick={() => setShowRoomModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            {/* Room Images */}
            <div className="p-6">
              <div className="mb-6">
                <img 
                  src={selectedRoom.images[0]} 
                  alt={selectedRoom.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{selectedRoom.name}</h3>
                
                {/* Room Highlights */}
                <div className="mb-6">
                  <div className="flex items-center gap-1 mb-3">
                    <FaStar className="text-yellow-400" />
                    <span className="font-medium">Highlights</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    {selectedRoom.highlights.map((highlight, index) => (
                      <div key={index}>{highlight}</div>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaUsers />
                      <span>Sleeps {selectedRoom.sleeps}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaBed />
                      <span>{selectedRoom.beds}</span>
                    </div>
                  </div>
                </div>

                {/* Room Amenities */}
                <div>
                  <h4 className="font-semibold text-lg mb-4">Room amenities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(selectedRoom.amenities).map(([category, items]) => (
                      <div key={category}>
                        <h5 className="font-medium mb-3 capitalize flex items-center gap-2">
                          {category === 'parking' && <FaParking />}
                          {category === 'food' && <FaUtensils />}
                          {category === 'internet' && <FaWifi />}
                          {category === 'family' && <FaBaby />}
                          {category === 'conveniences' && <FaConciergeBell />}
                          {category === 'guest' && <FaConciergeBell />}
                          {category === 'accessibility' && <FaWheelchair />}
                          {category === 'languages' && <FaLanguage />}
                          {category === 'entertainment' && <FaTv />}
                          {category === 'bathroom' && <FaBath />}
                          {category === 'more' && <FaSnowflake />}
                          {category.replace('-', ' ')}
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {items.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setShowImageGallery(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <FaTimes size={24} />
            </button>
            
            <img 
              src={images[currentImageIndex]} 
              alt="Hotel gallery"
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="absolute left-4 text-white hover:text-gray-300"
                >
                  <FaChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 text-white hover:text-gray-300"
                >
                  <FaChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {/* New Standardized Reservation Form */}
      <HotelReservationForm
        isOpen={openReservationForm}
        onClose={() => setOpenReservationForm(false)}
        onSuccess={handleReservationSuccess}
        hotel={hotelData}
      />

      {/* Success Modal */}
      <ReservationSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        reservationData={reservationData}
      />
    </div>
  );
};

export default HotelDetailsView; 