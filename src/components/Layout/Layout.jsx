import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../footer/Footer";
import Navbar from "../navbar/Navbar";
import RouteTour from "../../router/RouteTour";
import AdminNavbar from "../navbar/AdminNavbar";
import TravelAdvisor from "../chat/TravelAdvisor";
import ChatFloatingButton from "../chat/ChatFloatingButton";

const Layout = () => {
  const location = useLocation();
  const [showNav, setShowNav] = useState(true);
  const [showTravelAdvisor, setShowTravelAdvisor] = useState(false);
  
  const adminPaths = [
    '/admin',
    '/admin-dashboard',
    '/service-provider-dashboard',
    '/service-provider-request',
    '/users',
    '/hotels',
    '/tours',
    '/vehicle',
    '/adduser',
    '/userpage',
    '/update',
    '/addrestaurants',
    '/admin/restaurants',
    '/restaurant-reservations',
    '/reservations',
    '/event-management',
    '/tourreservation/all',
    '/vehiclereservation',
    '/adminTrain/reviewPanel',
    '/finance',
    '/finance/salary',
    '/finance/employee',
    '/finance/salarySheet',
    '/finance/FinanceHealth',
    '/finance/refund',
    '/finance/addRefund',
    '/pending-reservations',
    '/flight-reservations',
    '/contact-messages'
  ];

  // Function to check if path is in admin paths
  const isAdminPath = (path) => {
    // Exclude specific user paths that should not show admin navbar
    if (path === '/tours/home' || path.startsWith('/tours/home/')) {
      console.log("Tours home path detected, using regular navbar");
      return false;
    }
    
    // Exclude user tour detail pages (e.g., /tours/123456)
    // These should show user navbar, not admin navbar
    if (path.startsWith('/tours/') && path !== '/tours') {
      // Check if it's a tour detail page (path has an ID after /tours/)
      const tourIdPart = path.split('/tours/')[1];
      if (tourIdPart && !tourIdPart.includes('/')) {
        // It's likely a tour detail page with an ID, show user navbar
        console.log("Tour detail page detected, using regular navbar");
        return false;
      }
    }
    
    return adminPaths.some(adminPath => 
      path === adminPath || (path.startsWith(adminPath + '/') && adminPath !== '/tours')
    );
  };

  // to render the alternative Navbar or the default Navbar
  const showAdminNavbar = isAdminPath(location.pathname);

  // Don't show chat components on certain pages
  const hideChatOnPaths = ['/chat', '/chat-hub', '/login', '/register'];
  const shouldShowChat = !showAdminNavbar && !hideChatOnPaths.includes(location.pathname);

  const handleAIChat = () => {
    setShowTravelAdvisor(true);
  };

  useEffect(() => {
    // Just to ensure we don't have any duplication
    setShowNav(true);
  }, [location.pathname]);

  return (
    <div>
      {showNav && (
        showAdminNavbar ? <AdminNavbar /> : <Navbar />
      )}
      <RouteTour />
      {!showAdminNavbar && <Footer />}
      
      {/* Chat Components */}
      {shouldShowChat && (
        <>
          <TravelAdvisor />
          <ChatFloatingButton onAIChat={handleAIChat} />
        </>
      )}

      {/* Travel Advisor Modal */}
      {showTravelAdvisor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setShowTravelAdvisor(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <TravelAdvisor isModal={true} onClose={() => setShowTravelAdvisor(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
