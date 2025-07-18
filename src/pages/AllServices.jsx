import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import ProviderBadge from '../components/ui/ProviderBadge';
import { 
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TruckIcon,
  BuildingOfficeIcon,
  AirplaneIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AllServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  const serviceTypes = [
    { value: 'all', label: 'All Services', icon: BuildingOfficeIcon },
    { value: 'hotel', label: 'Hotels', icon: BuildingOfficeIcon },
    { value: 'tour', label: 'Tours', icon: MapPinIcon },
    { value: 'restaurant', label: 'Restaurants', icon: BuildingOfficeIcon },
    { value: 'vehicle', label: 'Vehicles', icon: TruckIcon },
    { value: 'train', label: 'Trains', icon: TruckIcon },
    { value: 'flight', label: 'Flights', icon: AirplaneIcon },
    { value: 'event', label: 'Events', icon: CalendarIcon }
  ];

  useEffect(() => {
    fetchServices();
  }, [selectedType]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedType === 'all') {
        // Fetch all services
        response = await api.get('/services/search');
      } else {
        // Fetch services by type
        response = await api.get(`/services/${selectedType}`);
      }
      
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (type) => {
    const serviceType = serviceTypes.find(st => st.value === type);
    return serviceType ? serviceType.icon : BuildingOfficeIcon;
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? `Rs. ${price.toLocaleString()}` : price;
  };

  const ServiceCard = ({ service }) => {
    const IconComponent = getServiceIcon(service.type);
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative">
          {service.images && service.images.length > 0 ? (
            <div className="h-48 bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url(${service.images[0]})` }}>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <IconComponent className="h-16 w-16 text-white opacity-80" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-800 shadow-sm">
              {service.type}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{service.name}</h3>
            <div className="flex items-center ml-2">
              <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">4.8</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-green-600">{formatPrice(service.price)}</span>
            </div>
            
            {service.location && (
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 truncate">{service.location}</span>
              </div>
            )}

            {(service.from && service.to) && (
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{service.from} → {service.to}</span>
              </div>
            )}

            {(service.departureTime && service.arrivalTime) && (
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {service.departureTime} - {service.arrivalTime}
                </span>
              </div>
            )}

            {service.availableSeats && (
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{service.availableSeats} seats available</span>
              </div>
            )}

            {(service.trainNumber || service.flightNumber) && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-600">
                  {service.trainNumber || service.flightNumber}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {service.providerId?.name?.charAt(0) || 'P'}
                </span>
              </div>
              <span className="text-sm text-gray-600">{service.providerId?.name || 'Provider'}</span>
              <ProviderBadge user={service.providerId} size="sm" showText={false} />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Book Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover Amazing
              <span className="text-yellow-300"> Services</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              From hotels and tours to trains and flights - find everything you need for your perfect trip
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Type Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {serviceTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No services found</h3>
            <p className="text-gray-600 text-lg">
              {selectedType === 'all' 
                ? "No services are currently available."
                : `No ${selectedType} services found. Try a different category.`
              }
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedType === 'all' ? 'All Services' : `${serviceTypes.find(t => t.value === selectedType)?.label || selectedType}`}
              </h2>
              <span className="text-gray-600">
                {services.length} service{services.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllServices; 