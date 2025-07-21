import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './authContext';
import axios from 'axios';
import { io } from 'socket.io-client';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const newSocket = io('https://travelly-backend-27bn.onrender.com');
      setSocket(newSocket);

      newSocket.emit('setup', user);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('message received', (newMessage) => {
        if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
          // Notification logic here
        } else {
          setMessages([...messages, newMessage]);
        }
      });
    }
  }, [socket, messages, selectedChat]);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get('/api/chat', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await axios.get(`/api/message/${chatId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessages(data);
      socket?.emit('join chat', chatId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content, chatId) => {
    try {
      const { data } = await axios.post(
        '/api/message',
        {
          content,
          chatId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setMessages([...messages, data]);
      socket?.emit('new message', data);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await axios.post(
        '/api/chat',
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      return data;
    } catch (error) {
      console.error('Error accessing chat:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        messages,
        setMessages,
        fetchChats,
        fetchMessages,
        sendMessage,
        accessChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 