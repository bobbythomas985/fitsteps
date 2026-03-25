import React, { useState, useEffect } from 'react';
import '../styles/Leaderboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Leaderboard({ userId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/leaderboard/`);
      const data = await response.json();
      setLeaderboard(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-page">
      <header className="page-header">
        <h1>🏆 Global Ranks</h1>
        <p>See how you stack up against the community</p>
      </header>

      <div className="leaderboard-container glass-panel">
        {loading ? (
          <div className="loading">Loading champions...</div>
        ) : (
          <div className="ranks-list">
            {leaderboard.map((user, index) => (
              <div key={index} className={`rank-card ${index < 3 ? 'top-tier' : ''}`}>
                <div className="rank-number">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${user.rank}`}
                </div>
                <div className="user-info">
                  <span className="username">{user.username}</span>
                  <span className="user-stats">{user.total_steps.toLocaleString()} steps</span>
                </div>
                <div className="xp-badge">
                  {user.total_xp} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
