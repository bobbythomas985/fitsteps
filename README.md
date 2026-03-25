# 👟 FitSteps - Full-Stack Gamified Activity Tracker

A beautifully crafted full-stack application designed to encourage daily movement and build healthy habits. Featuring a premium dark-mode glassmorphism UI, AI-powered motivation, and historically detailed analytics.

## 🚀 Features

### Core Features
- ✅ **Premium Glassmorphism Design**: A sleek, modern user interface featuring blurred panels, vibrant gradients, and dynamic hover effects.
- ✅ **Profile Management**: Complete user registration (`/users/`) and dashboard selection with a gamified XP and Badge progress system.
- ✅ **Goal Management**: Create and track step/activity goals (e.g., daily steps, active minutes) with target values.
- ✅ **Detailed Analytics**: Comprehensive dashboard to track weekly averages, best days, streak completion percentages, and an interactive **Recharts** bar chart to visualize the last 7 days of activity.
- ✅ **Daily Check-ins**: Track progress with mood updates, short notes, and identification of personal barriers.
- ✅ **Export Data**: Instantly download your activity history as beautifully formatted PDF or CSV reports.

### AI Features
- 🤖 **Micro-Goals**: Intelligent, dynamically generated daily targets based on your recent activity trends.
- 💡 **Contextual Motivation**: AI-driven analysis generating personalized insights and motivational banners depending on your check-in notes and historical data.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend  | React 18 + framer-motion + recharts + jsPDF |
| Backend   | Python FastAPI + SQLAlchemy + Uvicorn |
| Database  | SQLite (Easily swappable with PostgreSQL) |
| Styling   | Vanilla CSS (Custom Glassmorphic Design System) |

## 📋 Fast Setup Instructions

### 1. Backend Setup (FastAPI)
Ensure you have Python 3.9+ installed.

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python -m uvicorn main:app --reload --port 8000
```
> The backend server will automatically configure the SQLite database (`fitsteps.db`) and expose Swagger API documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup (React)
Ensure you have Node.js 18+ installed.

```bash
cd frontend

# Install all required npm packages
npm install

# Run the development server
npm start
```
> The frontend application will start and be accessible at `http://localhost:3000`. It expects the backend to be running concurrently on port 8000.
