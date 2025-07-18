import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';

const ChatFloatingButton = ({ onAIChat }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleUserChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/chat');
  };

  const handleChatHub = () => {
    navigate('/chat-hub');
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Expanded Options */}
      {isExpanded && (
        <div className="absolute bottom-16 left-0 space-y-3 animate-in slide-in-from-bottom-5 duration-300">
          {/* Chat Hub Option */}
          <div className="flex items-center group">
            <button
              onClick={handleChatHub}
              className="bg-white text-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border border-gray-200"
              title="Chat Hub - Choose your chat type"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
            <div className="ml-3 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Chat Hub
            </div>
          </div>

          {/* AI Chat Option */}
          <div className="flex items-center group">
            <button
              onClick={onAIChat}
              className="bg-blue-500 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
              title="AI Travel Advisor"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <div className="ml-3 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              AI Travel Advisor
            </div>
          </div>

          {/* User Chat Option */}
          <div className="flex items-center group">
            <button
              onClick={handleUserChat}
              className="bg-green-500 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
              title={user ? "User Messages" : "Login to chat with users"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
              </svg>
            </button>
            <div className="ml-3 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {user ? 'User Messages' : 'Login to Chat'}
            </div>
          </div>
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={toggleExpanded}
        className={`group relative bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 ${
          isExpanded ? 'rotate-45 scale-110' : 'hover:scale-110'
        }`}
      >
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20"></div>
        
        {/* Badge */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">💬</span>
        </div>

        {isExpanded ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transform group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Help text that appears on first visit */}
      {!isExpanded && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Quick Chat Access
        </div>
      )}
    </div>
  );
};

export default ChatFloatingButton; 