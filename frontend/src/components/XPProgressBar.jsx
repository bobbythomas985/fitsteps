import React from 'react';
import '../styles/XPProgressBar.css';

function XPProgressBar({ xp, level }) {
  const nextLevelXP = Math.pow(level, 2) * 100;
  const currentLevelXP = Math.pow(level - 1, 2) * 100;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="xp-container">
      <div className="level-info">
        <span className="current-level">Level {level}</span>
        <span className="xp-text">{xp} / {nextLevelXP} XP</span>
      </div>
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
        >
          <div className="progress-shimmer"></div>
        </div>
      </div>
      <div className="next-level-target">
        {nextLevelXP - xp} XP to Level {level + 1}
      </div>
    </div>
  );
}

export default XPProgressBar;
