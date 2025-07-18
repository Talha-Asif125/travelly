import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceCreateForm from '../../components/forms/ServiceCreateForm';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TruckIcon,
  BuildingOfficeIcon,
  AirplaneIcon
} from '@heroicons/react/24/outline';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

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
      const params = selectedType !== 'all' ? { type: selectedType } : {};
      const response = await axios.get('http://localhost:5000/api/provider/services', { params });
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`http://localhost:5000/api/provider/services/${serviceId}`);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
      }
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
      <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconComponent className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {service.type}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingService(service)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteService(service._id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">{formatPrice(service.price)}</span>
            </div>
            
            {service.location && (
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 truncate">{service.location}</span>
              </div>
            )}

            {(service.from && service.to) && (
              <div className="col-span-2 flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{service.from} → {service.to}</span>
              </div>
            )}

            {(service.departureTime && service.arrivalTime) && (
              <div className="col-span-2 flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {service.departureTime} - {service.arrivalTime}
                </span>
              </div>
            )}

            {service.availableSeats && (
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{service.availableSeats} seats</span>
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

          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              service.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {service.status}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(service.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
              <p className="text-gray-600 mt-1">Manage all your services in one place</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Service
            </button>
          </div>
        </div>

        {/* Service Type Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Service Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {serviceTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-6">
              {selectedType === 'all' 
                ? "You haven't created any services yet."
                : `No ${selectedType} services found.`
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}

        {/* Service Create/Edit Modal */}
        <ServiceCreateForm
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingService(null);
          }}
          onSuccess={(newService) => {
            fetchServices();
            setShowCreateModal(false);
            setEditingService(null);
          }}
          editingService={editingService}
        />

        {editingService && (
          <ServiceCreateForm
            isOpen={!!editingService}
            onClose={() => setEditingService(null)}
            onSuccess={() => {
              fetchServices();
              setEditingService(null);
            }}
            editingService={editingService}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceManagement; 