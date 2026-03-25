import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/WeeklyChart.css';

function WeeklyChart({ activities }) {
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const daySteps = activities
        .filter(a => new Date(a.logged_at).toDateString() === date.toDateString())
        .reduce((sum, a) => sum + a.steps, 0);

      weekData.push({
        day: dayName,
        steps: daySteps,
        date: date.toLocaleDateString()
      });
    }

    return weekData;
  };

  const data = getWeeklyData();

  return (
    <div className="weekly-chart">
      <h3>📈 Weekly Activity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="steps" fill="#4CAF50" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeeklyChart;