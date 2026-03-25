import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard';
import WeeklyChart from '../components/WeeklyChart';
import ActivityModal from '../components/ActivityModal';
import CheckInModal from '../components/CheckInModal';
import GoalSetter from '../components/GoalSetter';
import NotificationToast from '../components/NotificationToast';
import '../styles/Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Home({ userId }) {
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchActivities();
    fetchAnalytics();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/activities/?user_id=${userId}`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/analytics/${userId}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleAddActivity = async (activityData) => {
    try {
      await fetch(`${API_URL}/activities/?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      });
      fetchActivities();
      fetchAnalytics();
      setShowModal(false);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleCheckIn = async (checkInData) => {
    try {
      await fetch(`${API_URL}/checkins/?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkInData)
      });
      fetchAnalytics();
      setShowCheckIn(false);
      alert('Check-in saved! Keep it up!');
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
  };

  return (
    <div className="home-page">
      <NotificationToast userId={userId} />
      <header className="page-header">
        <h1>👟 Welcome to FitSteps</h1>
        <p>Track your daily movement & build healthy habits</p>
        <button className="btn-checkin-top" onClick={() => setShowCheckIn(true)}>
          📝 Daily Check-in
        </button>
      </header>

      <Dashboard 
        activities={activities} 
        analytics={analytics}
        onAddActivity={() => setShowModal(true)}
      />

      <WeeklyChart activities={activities} />

      <GoalSetter userId={userId} />

      <button className="fab-add" onClick={() => setShowModal(true)}>
        + Add Activity
      </button>

      {showModal && (
        <ActivityModal 
          onClose={() => setShowModal(false)}
          onSubmit={handleAddActivity}
        />
      )}

      {showCheckIn && (
        <CheckInModal
          onClose={() => setShowCheckIn(false)}
          onSubmit={handleCheckIn}
        />
      )}
    </div>
  );
}

export default Home;