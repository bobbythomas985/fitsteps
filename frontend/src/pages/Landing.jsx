import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserCreationModal from '../components/UserCreationModal';
import '../styles/Landing.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Landing({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/leaderboard/`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([
        { username: 'FitnessChamp', total_xp: 1200, total_steps: 15430, userId: 1 },
        { username: 'bobbythomas985', total_xp: 950, total_steps: 12100, userId: 2 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = (newUser) => {
    // Refresh list or add the new user locally
    fetchUsers();
  };

  return (
    <div className="landing-container">
      <section className="hero">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <div className="badge-premium">PREMIUM EDITION</div>
          <h1>Track. Move. <span className="text-gradient">Thrive.</span></h1>
          <p>The ultimate pedometer and micro-habit builder for active lifestyles. Experience fitness with glassmorphism aesthetics and AI-driven motivation.</p>
        </motion.div>
      </section>

      <section className="user-selection">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Select Your Profile
        </motion.h2>

        <div className="users-grid">
          {loading ? (
            <div className="loader">Initializing ecosystem...</div>
          ) : (
            <>
              {users.map((user, index) => (
                <motion.div
                  key={user.username}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="user-card glass-panel"
                  onClick={() => onUserSelect(index + 1)} // Demo matching
                >
                  <div className="user-avatar">{user.username[0]}</div>
                  <h3>{user.username}</h3>
                  <div className="user-stats">
                    <span>Level {Math.floor(Math.sqrt(user.total_xp / 100)) + 1}</span>
                    <span className="dot">•</span>
                    <span>{user.total_steps.toLocaleString()} steps</span>
                  </div>
                  <button className="btn-select">Select Profile</button>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="user-card add-user-card glass-panel"
                onClick={() => setShowModal(true)}
              >
                <div className="add-icon">+</div>
                <h3>New Profile</h3>
                <p>Start your journey today</p>
                <button className="btn-add">Create Profile</button>
              </motion.div>
            </>
          )}
        </div>
      </section>

      <div className="features-preview">
        <div className="feature-pill">🤖 AI Micro-Goals</div>
        <div className="feature-pill">🔥 14-Day Streaks</div>
        <div className="feature-pill">📄 PDF Export</div>
        <div className="feature-pill">🏆 Leaderboard</div>
      </div>

      <UserCreationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}

export default Landing;
