import React, { useState } from 'react';
import TravelMap from '../components/map/TravelMap';
import { FaSearch, FaMapMarkerAlt, FaStar, FaClock } from 'react-icons/fa';

const MapPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);

  const destinations = [
    { name: "Hunza Valley", type: "Mountain Valley", rating: 4.8 },
    { name: "Skardu", type: "Adventure Hub", rating: 4.7 },
    { name: "Naran Kaghan", type: "Hill Station", rating: 4.6 },
    { name: "Swat Valley", type: "Switzerland of Pakistan", rating: 4.5 },
    { name: "Murree", type: "Hill Station", rating: 4.2 },
    { name: "Gilgit", type: "Gateway City", rating: 4.3 },
    { name: "Fairy Meadows", type: "Alpine Meadow", rating: 4.9 },
    { name: "Lahore", type: "Cultural Capital", rating: 4.4 },
  ];

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDestinationSelect = (destinationName) => {
    setSelectedDestination(destinationName);
    setSearchTerm('');
  };

  const clearSelection = () => {
    setSelectedDestination(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🗺️ Explore Pakistan
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Discover breathtaking destinations across the country
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 bg-white mt-2 rounded-lg shadow-lg border border-gray-200 z-10">
                  {filteredDestinations.length > 0 ? (
                    filteredDestinations.map((dest, index) => (
                      <button
                        key={index}
                        onClick={() => handleDestinationSelect(dest.name)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{dest.name}</div>
                            <div className="text-sm text-gray-500">{dest.type}</div>
                          </div>
                          <div className="flex items-center text-yellow-500">
                            <FaStar className="mr-1" />
                            <span className="text-sm">{dest.rating}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No destinations found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Destination Info */}
      {selectedDestination && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-blue-600 mr-3" />
              <div>
                <span className="font-medium text-blue-800">
                  Viewing: {selectedDestination}
                </span>
                <p className="text-sm text-blue-600">
                  Click on the map marker for detailed information
                </p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View All Destinations
            </button>
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <TravelMap 
          selectedDestination={selectedDestination} 
          height="600px" 
          interactive={true}
        />
      </div>

      {/* Destination Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Popular Destinations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleDestinationSelect(dest.name)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{dest.name}</h3>
                  <div className="flex items-center text-yellow-500">
                    <FaStar className="mr-1" />
                    <span className="text-sm font-medium">{dest.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{dest.type}</p>
                
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  View on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Tips Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Travel Tips for Pakistan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-bold text-lg mb-3">Best Time to Visit</h3>
              <p className="text-gray-600">
                April to October is ideal for northern areas, while October to March is perfect for southern regions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="text-green-600 text-2xl" />
              </div>
              <h3 className="font-bold text-lg mb-3">Plan Your Route</h3>
              <p className="text-gray-600">
                Northern circuit covers Hunza-Skardu, while the cultural circuit includes Lahore-Multan-Karachi.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-purple-600 text-2xl" />
              </div>
              <h3 className="font-bold text-lg mb-3">Must-Try Experiences</h3>
              <p className="text-gray-600">
                Mountain trekking, cultural tours, local cuisine, and traditional craft shopping are highly recommended.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage; 