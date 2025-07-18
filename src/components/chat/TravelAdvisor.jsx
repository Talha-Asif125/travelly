import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import { toast } from 'react-toastify';
import { getAIResponse } from '../../services/aiService';

const TravelAdvisor = ({ isModal = false, onClose = null }) => {
  const [isOpen, setIsOpen] = useState(isModal);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: '👋 Hi! I\'m your AI Travel Buddy assistant for Pakistan! How can I help you plan your perfect trip?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Quick action buttons for common queries
  const quickActions = [
    { icon: '🏔️', text: 'Best places to visit', query: 'What are the best places to visit in Pakistan?' },
    { icon: '🏨', text: 'Hotels & Accommodation', query: 'Tell me about hotels and accommodation options' },
    { icon: '🌤️', text: 'Weather & Best time', query: 'What is the best time to visit Pakistan and weather information?' },
    { icon: '🍽️', text: 'Food & Restaurants', query: 'Tell me about Pakistani food and best restaurants' },
    { icon: '🚗', text: 'Transportation', query: 'What are the transportation options in Pakistan?' },
    { icon: '💰', text: 'Budget & Costs', query: 'How much budget do I need for traveling in Pakistan?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (query) => {
    handleSendMessage(null, query);
  };

  const handleSendMessage = async (e, quickQuery = null) => {
    if (e) e.preventDefault();
    const messageToSend = quickQuery || inputMessage;
    if (!messageToSend.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI response
      const response = await getAIResponse(messageToSend);
      
      // Simulate typing delay for better UX
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: response,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    } catch (error) {
      toast.error('Failed to get response from AI assistant');
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment. 🔄',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isModal) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-[600px] max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Travel Advisor</h3>
                <p className="text-blue-100 text-sm">Your smart travel companion for Pakistan</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-100">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 font-medium">Quick questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.slice(0, 4).map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.query)}
                  className="flex items-center p-3 text-left text-sm bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <span className="mr-2">{action.icon}</span>
                  <span className="text-gray-700">{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about travel in Pakistan..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-3 hover:from-blue-600 hover:to-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Enhanced Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-4 shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
      >
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">AI</span>
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
        
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 transform group-hover:rotate-180 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 transform group-hover:scale-110 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Travel Advisor</h3>
                  <p className="text-blue-100 text-xs">Ask me anything about Pakistan!</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-100">Online</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2 font-medium">Quick questions:</p>
              <div className="grid grid-cols-1 gap-1">
                {quickActions.slice(0, 3).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.query)}
                    className="flex items-center p-2 text-left text-xs bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <span className="mr-2">{action.icon}</span>
                    <span className="text-gray-700">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about travel in Pakistan..."
                className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-2 hover:from-blue-600 hover:to-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TravelAdvisor; 