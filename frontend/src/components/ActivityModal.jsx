import React, { useState } from 'react';
import '../styles/ActivityModal.css';

function ActivityModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    activity_type: 'walking',
    steps: 0,
    duration_minutes: 0,
    calories_burned: 0,
    notes: '',
    is_manual: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>📝 Log Activity</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Activity Type</label>
            <select 
              value={formData.activity_type}
              onChange={e => setFormData({...formData, activity_type: e.target.value})}
            >
              <option value="walking">🚶 Walking</option>
              <option value="running">🏃 Running</option>
              <option value="cycling">🚴 Cycling</option>
              <option value="workout">💪 Workout</option>
            </select>
          </div>

          <div className="form-group">
            <label>Steps</label>
            <input 
              type="number" 
              value={formData.steps}
              onChange={e => setFormData({...formData, steps: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input 
              type="number" 
              value={formData.duration_minutes}
              onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Calories Burned</label>
            <input 
              type="number" 
              value={formData.calories_burned}
              onChange={e => setFormData({...formData, calories_burned: parseFloat(e.target.value) || 0})}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="How did you feel? Any barriers?"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">Save Activity</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActivityModal;