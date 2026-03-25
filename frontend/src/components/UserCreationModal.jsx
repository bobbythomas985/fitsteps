import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/UserCreationModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function UserCreationModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create profile');
      }

      const newUser = await response.json();
      onUserCreated(newUser);
      onClose();
      setFormData({ username: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="modal-content glass-panel"
          >
            <div className="modal-header">
              <h2>✨ Create New Profile</h2>
              <button className="btn-close" onClick={onClose}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="creation-form">
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. FitnessGuru"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? 'Creating Ecosystem...' : 'Join FitSteps'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default UserCreationModal;
