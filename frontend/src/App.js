import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Landing from './pages/Landing';
import Navbar from './components/Navbar';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('fitsteps_user_id') ? parseInt(localStorage.getItem('fitsteps_user_id')) : null;
  });

  const handleUserSelect = (id) => {
    setUserId(id);
    localStorage.setItem('fitsteps_user_id', id);
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('fitsteps_user_id');
  };

  if (!userId) {
    return <Landing onUserSelect={handleUserSelect} />;
  }
  
  return (
    <div className="App" style={{ paddingBottom: '100px' }}>
      <Navbar userId={userId} onLogout={handleLogout} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home userId={userId} /></PageWrapper>} />
          <Route path="/analytics" element={<PageWrapper><Analytics userId={userId} /></PageWrapper>} />
          <Route path="/leaderboard" element={<PageWrapper><Leaderboard userId={userId} /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile userId={userId} /></PageWrapper>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
