import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import SessionService from '../services/sessionService';

const SessionStatus = () => {
  const { user } = useContext(AuthContext);
  const [remainingTime, setRemainingTime] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    const updateTimer = () => {
      const remaining = SessionService.getRemainingTime();
      const formatted = SessionService.formatRemainingTime();
      setRemainingTime(formatted);
      
      // Show warning when less than 10 minutes remain
      setIsVisible(remaining <= 10 * 60 * 1000 && remaining > 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [user]);

  if (!user || !isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#ff9800',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      Session expires in: {remainingTime}
    </div>
  );
};

export default SessionStatus; 