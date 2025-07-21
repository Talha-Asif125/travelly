import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from "../context/authContext";
import { ChatContext } from "../context/ChatContext";
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import UserSearch from '../components/chat/UserSearch';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const socket = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    // TODO: Move socket URL to environment variable
    socket.current = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://travelly-backend-27bn.onrender.com');
    socket.current.emit('setup', user);

    // Fetch user's chats
    fetchChats();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user, navigate]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/chat', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setChats(data);
    } catch (error) {
      toast.error('Failed to fetch chats');
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/message/${chatId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessages(data);
      socket.current.emit('join chat', chatId);
    } catch (error) {
      toast.error('Failed to fetch messages');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data } = await axios.post(
        '/api/message',
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setMessages([...messages, data]);
      setNewMessage('');
      socket.current.emit('new message', data);
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const handleUserSelect = (chat) => {
    setSelectedChat(chat);
    if (!chats.find(c => c._id === chat._id)) {
      setChats([chat, ...chats]);
    }
    fetchMessages(chat._id);
  };

  const getOtherUser = (chatUsers) => {
    return chatUsers?.find(chatUser => chatUser._id !== user._id);
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on('message received', (newMessage) => {
        if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
          // Notification logic here
        } else {
          setMessages([...messages, newMessage]);
        }
      });
    }
  }, [messages, selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat List Sidebar */}
      <div className="w-1/4 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Messages</h2>
            <button
              onClick={() => setShowUserSearch(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
              title="Start new chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Connect with fellow travelers</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : chats.length > 0 ? (
            chats.map((chat) => {
              const otherUser = getOtherUser(chat.users);
              return (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {otherUser?.img ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={otherUser.img}
                          alt={otherUser.name}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {otherUser?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.latestMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {chat.latestMessage && (
                        <span className="text-xs text-gray-400">
                          {new Date(chat.latestMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-sm text-gray-500 mb-4">Start chatting with fellow travelers!</p>
              <button
                onClick={() => setShowUserSearch(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Find People to Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center">
                {(() => {
                  const otherUser = getOtherUser(selectedChat.users);
                  return (
                    <>
                      <div className="flex-shrink-0">
                        {otherUser?.img ? (
                          <img
                            className="w-10 h-10 rounded-full object-cover"
                            src={otherUser.img}
                            alt={otherUser.name}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{otherUser?.name || 'Unknown User'}</h3>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          <p className="text-sm text-gray-500">Online</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender._id === user._id ? 'justify-end' : 'justify-start'
                  } mb-4`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                      message.sender._id === user._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender._id === user._id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none transition-colors"
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Select a chat to start messaging
              </h3>
              <p className="mt-2 text-sm text-gray-500 mb-6">
                Choose from your existing conversations or find new people to chat with
              </p>
              <button
                onClick={() => setShowUserSearch(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                🔍 Find People to Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearch
          onUserSelect={handleUserSelect}
          onClose={() => setShowUserSearch(false)}
        />
      )}
    </div>
  );
};

export default Chat; 
