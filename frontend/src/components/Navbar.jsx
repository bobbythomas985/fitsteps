import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar({ onLogout }) {
  return (
    <nav className="navbar glass-panel">
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Home</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">📊</span>
          <span className="nav-text">Stats</span>
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">🏆</span>
          <span className="nav-text">Ranks</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-icon">👤</span>
          <span className="nav-text">Profile</span>
        </NavLink>
        <button onClick={onLogout} className="nav-item logout-btn">
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Exit</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
