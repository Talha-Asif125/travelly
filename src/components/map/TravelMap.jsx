import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">📍</div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

// Pakistan tourist destinations data
const pakistanDestinations = [
  {
    id: 1,
    name: "Hunza Valley",
    position: [36.3167, 74.6500],
    type: "Mountain Valley",
    description: "Famous for its stunning mountain scenery, ancient forts, and apricot blossoms.",
    bestTime: "April to October",
    activities: ["Trekking", "Photography", "Cultural Tours"],
    rating: 4.8,
    color: "#22C55E"
  },
  {
    id: 2,
    name: "Skardu",
    position: [35.2833, 75.6333],
    type: "Adventure Hub",
    description: "Gateway to K2 and base camp for several peaks in the Karakoram range.",
    bestTime: "May to September",
    activities: ["Mountaineering", "Trekking", "Camping"],
    rating: 4.7,
    color: "#3B82F6"
  },
  {
    id: 3,
    name: "Naran Kaghan",
    position: [34.9045, 73.6553],
    type: "Hill Station",
    description: "Beautiful valley with pristine lakes, lush meadows, and snow-capped peaks.",
    bestTime: "June to September",
    activities: ["Lake Tours", "Horse Riding", "Camping"],
    rating: 4.6,
    color: "#8B5CF6"
  },
  {
    id: 4,
    name: "Swat Valley",
    position: [35.2227, 72.4258],
    type: "Switzerland of Pakistan",
    description: "Green valleys, crystal-clear rivers, and rich cultural heritage.",
    bestTime: "April to October",
    activities: ["River Rafting", "Cultural Tours", "Hiking"],
    rating: 4.5,
    color: "#10B981"
  },
  {
    id: 5,
    name: "Murree",
    position: [33.9062, 73.3903],
    type: "Hill Station",
    description: "Popular hill station near Islamabad with colonial-era architecture.",
    bestTime: "March to November",
    activities: ["Mall Road", "Chair Lift", "Nature Walks"],
    rating: 4.2,
    color: "#F59E0B"
  },
  {
    id: 6,
    name: "Gilgit",
    position: [35.9197, 74.3078],
    type: "Gateway City",
    description: "Strategic location connecting major mountain ranges and trade routes.",
    bestTime: "April to October",
    activities: ["Cultural Tours", "Bazaar Shopping", "Day Trips"],
    rating: 4.3,
    color: "#EF4444"
  },
  {
    id: 7,
    name: "Fairy Meadows",
    position: [35.4167, 74.6000],
    type: "Alpine Meadow",
    description: "Spectacular views of Nanga Parbat, accessible only by foot.",
    bestTime: "June to September",
    activities: ["Trekking", "Camping", "Photography"],
    rating: 4.9,
    color: "#EC4899"
  },
  {
    id: 8,
    name: "Lahore",
    position: [31.5804, 74.3587],
    type: "Cultural Capital",
    description: "Rich history, Mughal architecture, and vibrant food culture.",
    bestTime: "October to March",
    activities: ["Historical Tours", "Food Tours", "Shopping"],
    rating: 4.4,
    color: "#F97316"
  }
];

const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const TravelMap = ({ selectedDestination, height = "500px", interactive = true }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  // Pakistan center coordinates
  const pakistanCenter = [30.3753, 69.3451];
  const defaultZoom = 6;
  
  // If a specific destination is selected, center on it
  const mapCenter = selectedDestination 
    ? pakistanDestinations.find(d => d.name === selectedDestination)?.position || pakistanCenter
    : pakistanCenter;
  const mapZoom = selectedDestination ? 10 : defaultZoom;

  const handleMarkerClick = (destination) => {
    setSelectedMarker(destination);
  };

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          🗺️ Pakistan Travel Destinations
        </h3>
        <p className="text-sm text-gray-600">
          Discover amazing places across Pakistan. Click on markers to learn more!
        </p>
      </div>
      
      <div style={{ height: height }}>
        <MapContainer
          center={pakistanCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={interactive}
          zoomControl={interactive}
          dragging={interactive}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {pakistanDestinations.map((destination) => (
            <Marker
              key={destination.id}
              position={destination.position}
              icon={createCustomIcon(destination.color)}
              eventHandlers={{
                click: () => handleMarkerClick(destination),
              }}
            >
              <Popup>
                <div className="p-2 max-w-xs">
                  <h4 className="font-bold text-lg text-gray-800 mb-2">
                    {destination.name}
                  </h4>
                  <div className="mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {destination.type}
                    </span>
                    <span className="ml-2 text-yellow-500">
                      ⭐ {destination.rating}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {destination.description}
                  </p>
                  <div className="mb-2">
                    <strong className="text-sm text-gray-700">Best Time:</strong>
                    <span className="text-sm text-gray-600 ml-1">
                      {destination.bestTime}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong className="text-sm text-gray-700">Activities:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {destination.activities.map((activity, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`/community?search=${destination.name}`, '_blank')}
                    className="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Community Posts
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Mountain Valleys</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Adventure Hubs</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
            <span>Hill Stations</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>Cultural Sites</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelMap; 