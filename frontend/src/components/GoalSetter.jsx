import React, { useState } from 'react';
import '../styles/GoalSetter.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function GoalSetter({ userId }) {
  const [showForm, setShowForm] = useState(false);
  const [goalData, setGoalData] = useState({
    goal_type: 'daily_steps',
    target_value: 10000,
    frequency: 'daily',
    start_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/goals/?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });
      setShowForm(false);
      alert('Goal created successfully! 🎯');
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  return (
    <div className="goal-setter">
      <div className="goal-header">
        <h3>🎯 Your Goals</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-small">
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label>Goal Type</label>
            <select 
              value={goalData.goal_type}
              onChange={e => setGoalData({...goalData, goal_type: e.target.value})}
            >
              <option value="daily_steps">Daily Steps</option>
              <option value="active_minutes">Active Minutes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Value</label>
            <input 
              type="number" 
              value={goalData.target_value}
              onChange={e => setGoalData({...goalData, target_value: parseInt(e.target.value)})}
            />
          </div>

          <div className="form-group">
            <label>Frequency</label>
            <select 
              value={goalData.frequency}
              onChange={e => setGoalData({...goalData, frequency: e.target.value})}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">Create Goal</button>
        </form>
      )}
    </div>
  );
}

export default GoalSetter;