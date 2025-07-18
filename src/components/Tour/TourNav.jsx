import React from 'react';
import { Link } from 'react-router-dom';

const TourNav = () => {
  return (
    <div className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex space-x-4">
            <Link to="/tours" className="px-3 py-2 text-blue-600 hover:text-blue-800">
              All Tours
            </Link>
            <Link to="/tours?category=sun%20and%20beach" className="px-3 py-2 text-gray-700 hover:text-blue-600">
              Beach Tours
            </Link>
            <Link to="/tours?category=hiking%20and%20trekking" className="px-3 py-2 text-gray-700 hover:text-blue-600">
              Hiking
            </Link>
            <Link to="/tours?category=wild%20safari" className="px-3 py-2 text-gray-700 hover:text-blue-600">
              Safari
            </Link>
            <Link to="/tours?category=cultural" className="px-3 py-2 text-gray-700 hover:text-blue-600">
              Cultural
            </Link>
          </div>
          <div>
            <Link to="/tours/custom" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Custom Tour
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourNav; 