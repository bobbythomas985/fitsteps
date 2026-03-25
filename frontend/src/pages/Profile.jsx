import React, { useState, useEffect } from 'react';
import XPProgressBar from '../components/XPProgressBar';
import '../styles/Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Profile({ userId }) {
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      const data = await response.json();
      setUser(data);
    } catch (e) {
      console.error("Error fetching user details:", e);
    }
  };

  const fetchProfileData = async () => {
    try {
      // Fetch badges
      const badgeRes = await fetch(`${API_URL}/badges/${userId}`);
      const badgeData = await badgeRes.json();
      setBadges(badgeData);

      // Fetch analytics for XP and Level
      const analyticsRes = await fetch(`${API_URL}/analytics/${userId}`);
      const analyticsData = await analyticsRes.json();
      setTotalXP(analyticsData.total_xp);
      setLevel(analyticsData.level);
    } catch (e) {
      console.error("Error fetching profile data:", e);
    }
  };

  return (
    <div className="profile-page animate-in">
      <header className="profile-hero glass-panel">
        <div className="profile-header-content">
          <div className="avatar-container">
            <div className="avatar-large">
              {user?.username ? user.username[0].toUpperCase() : '👤'}
            </div>
            <div className="level-badge">{level}</div>
          </div>
          <div className="profile-info">
            <div className="badge-premium">PRO ATHLETE</div>
            <h1>{user?.username || `Athlete #${userId}`}</h1>
            <p className="member-since">
              Member since {user ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2024'}
            </p>
          </div>
        </div>
        
        <div className="profile-quick-stats">
          <div className="stat-item">
            <span className="stat-value">{totalXP.toLocaleString()}</span>
            <span className="stat-label">Total XP</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{badges.length}</span>
            <span className="stat-label">Badges</span>
          </div>
        </div>

        <div className="xp-container-large">
          <XPProgressBar xp={totalXP} level={level} />
        </div>
      </header>

      <div className="profile-content-grid">
        <div className="badges-section glass-panel">
          <h3>🏅 Earned Badges</h3>
          {badges.length === 0 ? (
            <p className="no-badges">Keep moving to earn badges!</p>
          ) : (
            <div className="badges-grid">
              {badges.map(badge => (
                <div key={badge.id} className="badge-card">
                  <div className="badge-icon-bg">🏆</div>
                  <div className="badge-content">
                    <h4>{badge.badge_name}</h4>
                    <p>{badge.badge_description}</p>
                    <span className="badge-xp">+{badge.xp_points} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;