import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/NotificationToast.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function NotificationToast({ userId }) {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const checkBreaks = async () => {
      try {
        const response = await fetch(`${API_URL}/ai/breaks/${userId}`);
        const data = await response.json();
        if (data.should_break) {
          setNotification(data);
          // Auto-hide after 10 seconds
          setTimeout(() => setNotification(null), 10000);
        }
      } catch (error) {
        console.error('Error checking breaks:', error);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkBreaks, 5 * 60 * 1000);
    checkBreaks(); // Initial check

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div 
          className="notification-toast glass-panel"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
        >
          <div className="notification-icon">🧘‍♂️</div>
          <div className="notification-content">
            <h4>Time to Move!</h4>
            <p>{notification.message}</p>
            <small>{notification.suggestion}</small>
          </div>
          <button className="close-notify" onClick={() => setNotification(null)}>×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationToast;
