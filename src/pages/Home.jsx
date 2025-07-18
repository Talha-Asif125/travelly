import React from "react";
// import { useContext } from "react";
// import { AuthContext } from "../context/authContext";

import Aboutus from "../components/aboutus/Aboutus";
import Hero2 from "../components/hero2/Hero2";
import Services from "../components/services/Services";
import Hero3 from "../components/hero2/Hero3";
import TravelMap from "../components/map/TravelMap";
import { Link } from "react-router-dom";

const Home = () => {
  // const { user } = useContext(AuthContext);

  return (
    <div>
      <Hero2 />
      <Aboutus />
      <div id="services-section" className="smooth-scroll-target">
        <Services />
      </div>
      
      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Explore Pakistan's Beautiful Destinations
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Discover amazing places across the country with our interactive map
            </p>
            <Link
              to="/map"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              🗺️ View Full Map
            </Link>
          </div>
          
          <div className="mb-8">
            <TravelMap height="400px" interactive={false} />
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Click on the map markers to learn more about each destination!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="font-semibold text-green-600">🏔️ Mountain Valleys</div>
                <div className="text-gray-600">Hunza, Fairy Meadows</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="font-semibold text-blue-600">⛰️ Adventure Hubs</div>
                <div className="text-gray-600">Skardu, Gilgit</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="font-semibold text-purple-600">🏔️ Hill Stations</div>
                <div className="text-gray-600">Murree, Naran Kaghan</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="font-semibold text-orange-600">🏛️ Cultural Sites</div>
                <div className="text-gray-600">Lahore, Swat</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Hero3 />
    </div>
  );
};

export default Home;
