import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import TravelAdvisor from '../components/chat/TravelAdvisor';

const ChatHub = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showTravelAdvisor, setShowTravelAdvisor] = useState(false);

  const handleUserChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/chat');
  };

  const handleAIChat = () => {
    setShowTravelAdvisor(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to Travel Buddy Chat
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose how you'd like to get help with your travel plans
          </p>
        </div>

        {/* Chat Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* AI Travel Advisor Card */}
          <div 
            onClick={handleAIChat}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-4 group-hover:text-blue-600 transition-colors">
                🤖 AI Travel Advisor
              </h3>
              
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                Get instant answers about destinations, weather, hotels, and travel tips from our intelligent AI assistant trained on Pakistan travel.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Available 24/7 - No login required
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Expert knowledge about Pakistan destinations
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Instant responses with travel tips
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 group-hover:scale-105">
                Start AI Chat
              </button>
            </div>
          </div>

          {/* User Messages Card */}
          <div 
            onClick={handleUserChat}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-4 group-hover:text-green-600 transition-colors">
                💬 User Messages
              </h3>
              
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                Connect with other travelers, share experiences, ask for recommendations, and get real-time help from our community.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  {user ? 'Chat with other travelers' : 'Login required'}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Real-time messaging & notifications
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Share photos and experiences
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-300 group-hover:scale-105">
                {user ? 'Open Messages' : 'Login to Chat'}
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Why Use Travel Buddy Chat?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Instant Responses</h3>
              <p className="text-gray-600 text-sm">Get immediate help whether from AI or real people</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Expert Knowledge</h3>
              <p className="text-gray-600 text-sm">Access verified information about Pakistan travel</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Community Support</h3>
              <p className="text-gray-600 text-sm">Connect with fellow travelers and locals</p>
            </div>
          </div>
        </div>
      </div>

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

export default ChatHub; 