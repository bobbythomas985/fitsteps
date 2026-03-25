import React, { useState } from 'react';
import '../styles/CheckInModal.css';

function CheckInModal({ onClose, onSubmit }) {
  const [mood, setMood] = useState('good');
  const [notes, setNotes] = useState('');
  const [barriers, setBarriers] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ mood, notes, barriers });
  };

  const moods = [
    { id: 'energized', icon: '⚡', label: 'Energized' },
    { id: 'good', icon: '😊', label: 'Good' },
    { id: 'tired', icon: '😴', label: 'Tired' },
    { id: 'stressed', icon: '😫', label: 'Stressed' },
    { id: 'struggled', icon: '😕', label: 'Struggled' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-in">
        <header className="modal-header">
          <h2>📝 Daily Check-in</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>How are you feeling today?</label>
            <div className="mood-selector">
              {moods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`mood-btn ${mood === m.id ? 'active' : ''}`}
                  onClick={() => setMood(m.id)}
                >
                  <span className="mood-icon">{m.icon}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Any notes on your progress?</label>
            <textarea
              placeholder="How did your activities go? What felt good?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Any barriers or challenges?</label>
            <input
              type="text"
              placeholder="e.g. Rainy weather, busy schedule"
              value={barriers}
              onChange={(e) => setBarriers(e.target.value)}
            />
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Check-in</button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default CheckInModal;
