import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { useState, useEffect } from "react";

const HotelCard = () => {
  const { data: existingHotels, loading: hotelsLoading, error: hotelsError } = useFetch(`/hotels`);
  const [newServices, setNewServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [imgError, setImgError] = useState({});
  
  // Fetch new hotel services from provider dashboard
  useEffect(() => {
    const fetchNewHotelServices = async () => {
      try {
        setServicesLoading(true);
        const response = await fetch('http://localhost:5000/api/services/hotel');
        const result = await response.json();
        
        if (result.success) {
          setNewServices(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching new hotel services:', error);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchNewHotelServices();
  }, []);

  // Combine existing hotels and new services
  const allHotels = [
    ...(existingHotels || []),
    ...newServices.map(service => ({
      _id: service._id,
      name: service.name,
      city: service.location || service.city || 'Location not specified',
      cheapestPrice: service.price,
      HotelImgs: service.images || [],
      description: service.description,
      roomType: service.roomType,
      availableRooms: service.availableRooms,
      rating: service.rating?.average || 4.0,
      isNewService: true, // Flag to distinguish new services
      providerId: service.providerId
    }))
  ];

  const loading = hotelsLoading || servicesLoading;
  const error = hotelsError;
  
  // Handle image loading errors
  const handleImageError = (itemId) => {
    setImgError(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }
    
    return stars;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Available Hotels</h2>
        <p className="text-gray-600">Discover comfortable accommodations for your stay</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {allHotels && allHotels.length > 0 ? (
              allHotels.map((item) => (
                <div
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
                  key={item._id || item.id}
                >
                  {/* Show badge for new services */}
                  {item.isNewService && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                        New
                      </span>
                    </div>
                  )}
                  
                  {/* Image handling for both old and new services */}
                  <div className="relative h-48 overflow-hidden">
                    {!imgError[item._id || item.id] && 
                     ((item.HotelImgs && item.HotelImgs.length > 0) || (item.images && item.images.length > 0)) ? (
                      <img
                        src={
                          item.isNewService 
                            ? (item.images?.[0] || "https://via.placeholder.com/400x250?text=Hotel+Image")
                            : `http://localhost:5000/api/hotels/images/${item.HotelImgs[0]}`
                        }
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={() => handleImageError(item._id || item.id)}
                      />
                    ) : (
                      <img
                        src="https://via.placeholder.com/400x250?text=Hotel+Image"
                        alt="Placeholder"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex items-center ml-2">
                        {renderStars(item.rating || 4.0)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {item.city}
                    </p>
                    
                    {item.roomType && (
                      <p className="text-gray-500 text-sm mb-1">
                        Room Type: {item.roomType}
                      </p>
                    )}
                    
                    {item.availableRooms && (
                      <p className="text-gray-500 text-sm mb-3">
                        Available Rooms: {item.availableRooms}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-600">Starting from</span>
                        <p className="font-bold text-blue-600 text-lg">
                          Rs.{item.cheapestPrice?.toLocaleString()}
                        </p>
                        <span className="text-xs text-gray-500">per night</span>
                      </div>
                      
                      <Link to={`/hotel-book/${item._id || item.id}`}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm">
                          Book Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Hotels Available</h3>
                <p className="text-gray-500">No hotels found at the moment. Please check back later or try a different search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HotelCard;
