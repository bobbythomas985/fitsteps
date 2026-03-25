import React from 'react';
import '../styles/Dashboard.css';

function Dashboard({ activities, analytics, onAddActivity }) {
  const todaySteps = activities
    .filter(a => new Date(a.logged_at).toDateString() === new Date().toDateString())
    .reduce((sum, a) => sum + a.steps, 0);

  const goal = analytics?.current_goal || 10000;
  const progress = Math.min((todaySteps / goal) * 100, 100);

  return (
    <div className="dashboard">
      <div className="level-banner glass-panel">
        <div className="level-info">
          <span className="level-badge">LEVEL {analytics?.level || 1}</span>
          <div className="xp-container">
            <div className="xp-label">
              <span>XP Progress</span>
              <span>{analytics?.total_xp || 0} XP</span>
            </div>
            <div className="xp-bar-bg">
              {(() => {
                const level = analytics?.level || 1;
                const currentXP = analytics?.total_xp || 0;
                const minXP = Math.pow(level - 1, 2) * 100;
                const nextXP = Math.pow(level, 2) * 100;
                const progress = Math.min(100, Math.max(0, ((currentXP - minXP) / (nextXP - minXP)) * 100));
                return (
                  <div 
                    className="xp-bar-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>Today's Steps</h3>
          <div className="stat-value">{todaySteps.toLocaleString()}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="goal-text">{goal.toLocaleString()} goal</p>
        </div>

        <div className="stat-card">
          <h3>Weekly Avg</h3>
          <div className="stat-value">
            {analytics?.weekly_step_average?.toFixed(0) || 0}
          </div>
          <p>steps/day</p>
        </div>

        <div className="stat-card">
          <h3>Current Streak</h3>
          <div className="stat-value">🔥 {analytics?.current_streak || 0}</div>
          <p>days</p>
        </div>

        <div className="stat-card">
          <h3>Goal Rate</h3>
          <div className="stat-value">{analytics?.goal_completion_rate?.toFixed(0) || 0}%</div>
          <p>completed</p>
        </div>
      </div>

      <div className="quick-actions">
        <button onClick={onAddActivity} className="btn-primary">
          📝 Log Activity
        </button>
        <button className="btn-secondary">
          📊 View Analytics
        </button>
      </div>
    </div>
  );
}

export default Dashboard;