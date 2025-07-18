import React from "react";
import { Link } from "react-router-dom";
import {
  FaWhatsappSquare,
  FaFacebookSquare,
  FaInstagramSquare,
  FaTwitterSquare,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeart,
} from "react-icons/fa";

const Footer = () => {
  const serviceLinks = [
    { name: "Hotels", path: "/hotelhome" },
    { name: "Tour Packages", path: "/tours/home" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Restaurants", path: "/Restaurants" },
    { name: "Events", path: "/events" },
  ];

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Community", path: "/community" },
    { name: "Contact Us", path: "/contactus" },
    { name: "My Bookings", path: "/my-bookings" },
    { name: "Become Provider", path: "/service-provider-request" },
  ];

  const supportLinks = [
    { name: "Help Center", path: "/help" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cancellation Policy", path: "/cancellation" },
    { name: "FAQ", path: "/faq" },
  ];

  const popularDestinations = [
    "Hunza Valley",
    "Skardu",
    "Naran Kaghan",
    "Murree",
    "Swat Valley",
    "Gilgit",
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-[#41A4FF] mb-4">
                Travel Buddy
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Discover Pakistan—Plan, Book, Explore. Your perfect adventure 
                starts here! From the northern mountains to southern beaches, 
                we make your travel dreams come true.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-[#41A4FF]" />
                <span>+92 313 5541485</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-[#41A4FF]" />
                <span>asif.talha2002@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-[#41A4FF]" />
                <span>Islamabad, Pakistan</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <button 
                onClick={() => window.open('https://facebook.com', '_blank')}
                className="text-gray-400 hover:text-[#41A4FF] transition-colors"
                aria-label="Visit our Facebook page"
              >
                <FaFacebookSquare size={28} />
              </button>
              <button 
                onClick={() => window.open('https://instagram.com', '_blank')}
                className="text-gray-400 hover:text-[#41A4FF] transition-colors"
                aria-label="Visit our Instagram page"
              >
                <FaInstagramSquare size={28} />
              </button>
              <button 
                onClick={() => window.open('https://twitter.com', '_blank')}
                className="text-gray-400 hover:text-[#41A4FF] transition-colors"
                aria-label="Visit our Twitter page"
              >
                <FaTwitterSquare size={28} />
              </button>
              <button 
                onClick={() => window.open('https://whatsapp.com', '_blank')}
                className="text-gray-400 hover:text-[#41A4FF] transition-colors"
                aria-label="Contact us on WhatsApp"
              >
                <FaWhatsappSquare size={28} />
              </button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">Our Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#41A4FF] transition-colors duration-200 block py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#41A4FF] transition-colors duration-200 block py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h5 className="text-lg font-semibold text-white mb-4 mt-8">Support</h5>
            <ul className="space-y-2">
              {supportLinks.slice(0, 3).map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#41A4FF] transition-colors duration-200 block py-1 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="text-xl font-semibold text-white mb-6">Popular Destinations</h4>
            <ul className="space-y-3">
              {popularDestinations.map((destination, index) => (
                <li key={index}>
                  <Link
                    to={`/community?search=${destination}`}
                    className="text-gray-400 hover:text-[#41A4FF] transition-colors duration-200 block py-1"
                  >
                    {destination}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-8">
              <h5 className="text-lg font-semibold text-white mb-4">Stay Updated</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#41A4FF] text-white placeholder-gray-400"
                />
                <button className="px-4 py-2 bg-[#41A4FF] text-white rounded-r-md hover:bg-blue-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © 2024 Travel Buddy. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <Link to="/privacy" className="text-gray-400 hover:text-[#41A4FF] text-sm">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-[#41A4FF] text-sm">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-gray-400 hover:text-[#41A4FF] text-sm">
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <FaHeart className="text-red-500" />
              <span>in Pakistan</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
