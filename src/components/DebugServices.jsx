import React, { useState } from 'react';
import axios from 'axios';

const DebugServices = () => {
  const [tourServices, setTourServices] = useState([]);
  const [vehicleServices, setVehicleServices] = useState([]);
  const [allProviderServices, setAllProviderServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const testTourServices = async () => {
    setLoading(true);
    try {
      console.log("Testing tour services API...");
      const response = await axios.get("http://localhost:5000/api/provider/services?type=tour");
      console.log("Tour services response:", response.data);
      setTourServices(response.data.data || []);
    } catch (error) {
      console.error("Tour services error:", error);
      setTourServices([]);
    }
    setLoading(false);
  };

  const testVehicleServices = async () => {
    setLoading(true);
    try {
      console.log("Testing vehicle services API...");
      const response = await axios.get("http://localhost:5000/api/provider/services?type=vehicle");
      console.log("Vehicle services response:", response.data);
      setVehicleServices(response.data.data || []);
    } catch (error) {
      console.error("Vehicle services error:", error);
      setVehicleServices([]);
    }
    setLoading(false);
  };

  const testAllProviderServices = async () => {
    setLoading(true);
    try {
      console.log("Testing all provider services API...");
      const response = await axios.get("http://localhost:5000/api/provider/services");
      console.log("All provider services response:", response.data);
      setAllProviderServices(response.data.data || []);
    } catch (error) {
      console.error("All provider services error:", error);
      setAllProviderServices([]);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Debug Services</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testTourServices}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Tour Services API
        </button>
        
        <button 
          onClick={testVehicleServices}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Vehicle Services API
        </button>
        
        <button 
          onClick={testAllProviderServices}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test All Provider Services API
        </button>
      </div>

      {loading && <p className="mt-4 text-blue-600">Loading...</p>}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Tour Services ({tourServices.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tourServices.map(service => (
              <div key={service._id} className="border p-2 rounded text-sm">
                <p><strong>Name:</strong> {service.name}</p>
                <p><strong>Category:</strong> {service.category}</p>
                <p><strong>Type:</strong> {service.type}</p>
                <p><strong>Price:</strong> {service.price}</p>
                <p><strong>ID:</strong> {service._id}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Vehicle Services ({vehicleServices.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {vehicleServices.map(service => (
              <div key={service._id} className="border p-2 rounded text-sm">
                <p><strong>Name:</strong> {service.name}</p>
                <p><strong>Category:</strong> {service.category}</p>
                <p><strong>Type:</strong> {service.type}</p>
                <p><strong>Price:</strong> {service.price}</p>
                <p><strong>ID:</strong> {service._id}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">All Provider Services ({allProviderServices.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allProviderServices.map(service => (
              <div key={service._id} className="border p-2 rounded text-sm">
                <p><strong>Name:</strong> {service.name}</p>
                <p><strong>Category:</strong> {service.category}</p>
                <p><strong>Type:</strong> {service.type}</p>
                <p><strong>Price:</strong> {service.price}</p>
                <p><strong>Provider:</strong> {service.providerId}</p>
                <p><strong>ID:</strong> {service._id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugServices; 