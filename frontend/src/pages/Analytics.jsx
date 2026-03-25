import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import '../styles/Analytics.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Analytics({ userId }) {
  const [analytics, setAnalytics] = useState(null);
  const [motivation, setMotivation] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchMotivation();
    fetchSuggestions();
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/activities/?user_id=${userId}`);
      const data = await response.json();
      setActivities(data);
    } catch (e) {
      console.error("Error fetching activities:", e);
    }
  };

  const fetchAnalytics = async () => {
    const response = await fetch(`${API_URL}/analytics/${userId}`);
    const data = await response.json();
    setAnalytics(data);
  };

  const fetchMotivation = async () => {
    const response = await fetch(`${API_URL}/ai/motivation/${userId}`);
    const data = await response.json();
    setMotivation(data);
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`${API_URL}/ai/suggest-goals/${userId}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (e) {
      console.error("Error fetching suggestions:", e);
    }
  };

  const chartData = useMemo(() => {
    return activities
      .slice(-7)
      .map(activity => ({
        date: new Date(activity.logged_at).toLocaleDateString([], { weekday: 'short' }),
        steps: activity.steps,
      }));
  }, [activities]);

  const handleExportCSV = async () => {
    window.location.href = `${API_URL}/export/${userId}/csv`;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('FitSteps Activity Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`User ID: ${userId} | Date: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Date", "Type", "Steps", "Duration (min)", "Calories"];
    const tableRows = [];

    activities.forEach(activity => {
      const activityData = [
        new Date(activity.logged_at).toLocaleDateString(),
        activity.activity_type,
        activity.steps,
        activity.duration_minutes,
        activity.calories_burned
      ];
      tableRows.push(activityData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 40 });
    doc.save(`fitsteps_report_${new Date().getTime()}.pdf`);
  };

  if (!analytics) return <div className="loader">Analyzing your progress...</div>;

  return (
    <div className="analytics-page">
      <header className="page-header">
        <h1>📊 Analytics <span className="text-gradient">Insights</span></h1>
      </header>

      <section className="insight-hero glass-panel">
        <div className="insight-icon">💡</div>
        <div className="insight-text">
          <h3>Daily Motivation</h3>
          <p>{motivation?.motivation_message || "Every step counts toward your legacy. Keep moving! 💪"}</p>
        </div>
      </section>

      <div className="analytics-grid">
        <div className="stat-card glass-panel">
          <h4>Weekly Average</h4>
          <p className="stat-value">{analytics.weekly_step_average.toFixed(0)}</p>
          <span className="stat-label">steps/day</span>
        </div>

        <div className="stat-card glass-panel">
          <h4>Best Days</h4>
          <p className="stat-value text-stat">{analytics.best_days?.join(', ') || 'N/A'}</p>
          <span className="stat-label">peak activity</span>
        </div>

        <div className="stat-card glass-panel">
          <h4>Completion</h4>
          <p className="stat-value">{analytics.goal_completion_rate.toFixed(0)}%</p>
          <span className="stat-label">goals reached</span>
        </div>

        <div className="stat-card glass-panel">
          <h4>Streak</h4>
          <p className="stat-value">🔥 {analytics.current_streak}</p>
          <span className="stat-label">active days</span>
        </div>
      </div>

      <section className="chart-section glass-panel">
        <h3>Activity Trends (Last 7 Sessions)</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white'
                }}
              />
              <Bar 
                dataKey="steps" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#barGradient)`} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {suggestions && (
        <section className="ai-suggestions-section">
          <h3>🤖 AI Micro-Goals</h3>
          <div className="suggestions-grid">
            {suggestions.suggested_goals.map((goal, index) => (
              <div key={index} className="suggestion-card glass-panel">
                <div className="suggestion-icon">🎯</div>
                <p>{goal}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="export-actions">
        <button onClick={handleExportCSV} className="btn-action glass-panel">
          <span className="icon">📥</span> Export CSV
        </button>
        <button onClick={handleExportPDF} className="btn-action glass-panel secondary">
          <span className="icon">📄</span> Download PDF
        </button>
      </footer>
    </div>
  );
}

export default Analytics;