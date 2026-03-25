from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database import engine, get_db, Base
from models import User, Activity, Goal, CheckIn, Badge
from schemas import (
    UserCreate, UserResponse, ActivityCreate, ActivityResponse,
    GoalCreate, GoalResponse, CheckInCreate, CheckInResponse,
    AnalyticsResponse, BadgeResponse, LeaderboardEntry
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FitSteps API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


import csv
import io
from fastapi.responses import StreamingResponse

# ============ DATABASE SEEDING ============
def seed_db(db: Session):
    """Seed the database with multiple users and realistic activity history"""
    # Check if we already have users
    if db.query(User).count() > 0:
        return
    
    # Create demo users
    user_data = [
        {"email": "demo@fitsteps.com", "username": "FitnessChamp"},
        {"email": "bobbythomasthomas23@gmail.com", "username": "bobbythomas985"},
        {"email": "jane@fitsteps.com", "username": "RunnerJane"},
        {"email": "bob@fitsteps.com", "username": "BobTheWalker"},
    ]
    
    users = []
    for ud in user_data:
        user = User(email=ud["email"], username=ud["username"], hashed_password="password123")
        db.add(user)
        users.append(user)
    
    db.commit()
    for u in users: db.refresh(u)
    
    # Add varying data for each user
    import random
    for i, user in enumerate(users):
        # Goal set
        goal_target = 8000 + (i * 2000)
        goal = Goal(user_id=user.id, goal_type="daily_steps", target_value=goal_target, frequency="daily", start_date=datetime.utcnow() - timedelta(days=30))
        db.add(goal)
        
        # Historical activities (last 14 days)
        for d in range(14):
            # Give Bob a lower step count to show variety in leaderboard
            base_steps = 7000 if user.username != "BobTheWalker" else 4000
            steps = base_steps + random.randint(-2000, 3000)
            
            date = datetime.utcnow() - timedelta(days=d)
            db.add(Activity(
                user_id=user.id,
                activity_type="walking" if d % 3 != 0 else "running",
                steps=steps,
                duration_minutes=30 + random.randint(0, 30),
                calories_burned=200 + random.randint(0, 200),
                logged_at=date
            ))
            
            # Random check-ins
            if d % 2 == 0:
                moods = ["energized", "tired", "happy", "focused"]
                db.add(CheckIn(
                    user_id=user.id,
                    mood=random.choice(moods),
                    notes=f"Day {d} feeling {random.choice(['good', 'ok', 'great'])}",
                    date=date
                ))
    
    db.commit()

# Initialize tables and seed
Base.metadata.create_all(bind=engine)
with next(get_db()) as db:
    seed_db(db)


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ============ ACTIVITY ROUTES ============
@app.post("/activities/", response_model=ActivityResponse)
def create_activity(activity: ActivityCreate, user_id: int, db: Session = Depends(get_db)):
    db_activity = Activity(**activity.dict(), user_id=user_id)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    
    # Check for badges
    check_badges(db, user_id)
    
    return db_activity

@app.get("/activities/", response_model=List[ActivityResponse])
def get_activities(user_id: int, db: Session = Depends(get_db)):
    return db.query(Activity).filter(Activity.user_id == user_id).all()

@app.get("/activities/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

# ============ GOAL ROUTES ============
@app.post("/goals/", response_model=GoalResponse)
def create_goal(goal: GoalCreate, user_id: int, db: Session = Depends(get_db)):
    db_goal = Goal(**goal.dict(), user_id=user_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/goals/", response_model=List[GoalResponse])
def get_goals(user_id: int, db: Session = Depends(get_db)):
    return db.query(Goal).filter(Goal.user_id == user_id).all()

@app.put("/goals/{goal_id}/toggle")
def toggle_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.is_active = not goal.is_active
    db.commit()
    return {"message": "Goal toggled", "is_active": goal.is_active}

# ============ CHECK-IN ROUTES ============
@app.post("/checkins/", response_model=CheckInResponse)
def create_checkin(checkin: CheckInCreate, user_id: int, db: Session = Depends(get_db)):
    db_checkin = CheckIn(**checkin.dict(), user_id=user_id)
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

@app.get("/checkins/", response_model=List[CheckInResponse])
def get_checkins(user_id: int, db: Session = Depends(get_db)):
    return db.query(CheckIn).filter(CheckIn.user_id == user_id).all()

# ============ ANALYTICS ROUTES ============
@app.get("/analytics/{user_id}", response_model=AnalyticsResponse)
def get_analytics(user_id: int, db: Session = Depends(get_db)):
    """
    Calculate and return comprehensive user analytics.
    
    Includes:
    - Weekly step average
    - Best days of the week
    - Goal completion rates (last 7 days)
    - Current daily streak
    - XP and Leveling progress
    """
    activities = db.query(Activity).filter(Activity.user_id == user_id).all()
    goals = db.query(Goal).filter(Goal.user_id == user_id, Goal.is_active == True).all()
    
    # Calculate weekly average
    week_ago = datetime.utcnow() - timedelta(days=7)
    week_activities = [a for a in activities if a.logged_at >= week_ago]
    weekly_avg = sum(a.steps for a in week_activities) / 7 if week_activities else 0
    
    # Best days
    day_steps = {}
    for activity in activities:
        day = activity.logged_at.strftime("%A")
        day_steps[day] = day_steps.get(day, 0) + activity.steps
    best_days = sorted(day_steps.keys(), key=lambda x: day_steps[x], reverse=True)[:3]
    
    # Goal completion rate (Actual achievement in last 7 days)
    total_checks = 0
    satisfied_checks = 0
    
    for i in range(7):
        target_date = (datetime.utcnow() - timedelta(days=i)).date()
        day_activities = [a for a in activities if a.logged_at.date() == target_date]
        
        day_steps = sum(a.steps for a in day_activities)
        day_minutes = sum(a.duration_minutes for a in day_activities)
        
        for goal in goals:
            total_checks += 1
            if goal.goal_type == "daily_steps":
                if day_steps >= goal.target_value:
                    satisfied_checks += 1
            elif goal.goal_type == "active_minutes":
                if day_minutes >= goal.target_value:
                    satisfied_checks += 1
                    
    completion_rate = (satisfied_checks / total_checks * 100) if total_checks > 0 else 0
    
    # Streak calculation
    streak = calculate_streak(activities)
    
    # Calculate XP
    badges = db.query(Badge).filter(Badge.user_id == user_id).all()
    total_xp = sum(b.xp_points for b in badges)
    # Plus 10 XP for every activity
    total_xp += len(activities) * 10
    
    # Level calculation: Level = floor(sqrt(total_xp/100)) + 1
    import math
    level = math.floor(math.sqrt(total_xp / 100)) + 1 if total_xp > 0 else 1
    
    return AnalyticsResponse(
        weekly_step_average=weekly_avg,
        best_days=best_days,
        goal_completion_rate=completion_rate,
        current_streak=streak,
        total_activities=len(activities),
        total_steps=sum(a.steps for a in activities),
        total_xp=total_xp,
        level=level
    )

def calculate_streak(activities: List[Activity]) -> int:
    if not activities:
        return 0
    
    dates = sorted(set(a.logged_at.date() for a in activities), reverse=True)
    today = datetime.utcnow().date()
    
    # If the most recent activity wasn't today or yesterday, streak is zero
    if (today - dates[0]).days > 1:
        return 0
    
    streak = 1
    for i in range(len(dates) - 1):
        if (dates[i] - dates[i+1]).days == 1:
            streak += 1
        else:
            break
    
    return streak

def check_badges(db: Session, user_id: int):
    """Check and award badges based on achievements"""
    activities = db.query(Activity).filter(Activity.user_id == user_id).all()
    total_steps = sum(a.steps for a in activities)
    
    badges_to_check = [
        (10000, "First Steps", "Reached 10,000 total steps", 100),
        (50000, "Walking Pro", "Reached 50,000 total steps", 250),
        (100000, "Step Master", "Reached 100,000 total steps", 500),
    ]
    
    existing_badges = db.query(Badge).filter(Badge.user_id == user_id).all()
    existing_names = [b.badge_name for b in existing_badges]
    
    for threshold, name, desc, xp in badges_to_check:
        if total_steps >= threshold and name not in existing_names:
            badge = Badge(
                user_id=user_id,
                badge_name=name,
                badge_description=desc,
                xp_points=xp
            )
            db.add(badge)
    
    db.commit()

@app.get("/badges/{user_id}", response_model=List[BadgeResponse])
def get_badges(user_id: int, db: Session = Depends(get_db)):
    return db.query(Badge).filter(Badge.user_id == user_id).all()

# ============ AI FEATURES (Optional) ============
@app.get("/ai/suggest-goals/{user_id}")
def suggest_micro_goals(user_id: int, db: Session = Depends(get_db)):
    """
    AI-driven micro-goal generator.
    Analyzes historical step averages and suggests 10% incremental improvements
    along with contextual movement habits.
    """
    activities = db.query(Activity).filter(Activity.user_id == user_id).all()
    
    if not activities:
        return {"suggested_goals": ["Start with 1000 steps today", "Take a 5-minute walk"]}
    
    avg_steps = sum(a.steps for a in activities) / len(activities)
    
    suggestions = [
        f"Target {int(avg_steps * 1.1)} steps today (10% increase)",
        "Take a 5-min walk after every 2 hours of sitting",
        "Try 10 minutes of stretching in the morning"
    ]
    
    return {"suggested_goals": suggestions}

@app.get("/ai/motivation/{user_id}")
def get_motivation(user_id: int, db: Session = Depends(get_db)):
    """
    Sentiment-based motivation engine.
    Analyzes check-in notes and moods using keyword mapping to determine 
    user morale and provide context-aware encouragement.
    """
    checkins = db.query(CheckIn).filter(CheckIn.user_id == user_id).all()
    
    positive_words = ["great", "good", "awesome", "energized", "happy", "accomplished"]
    negative_words = ["tired", "difficult", "hard", "struggled", "busy", "stressed"]
    
    positive_count = 0
    negative_count = 0
    
    for checkin in checkins:
        # Check notes
        if checkin.notes:
            notes_lower = checkin.notes.lower()
            positive_count += sum(1 for word in positive_words if word in notes_lower)
            negative_count += sum(1 for word in negative_words if word in notes_lower)
        
        # Check mood field (new)
        if checkin.mood:
            if checkin.mood in ["good", "energized", "accomplished"]:
                positive_count += 2  # Mood is a strong indicator
            elif checkin.mood in ["tired", "stressed", "struggled"]:
                negative_count += 2
    
    if positive_count > negative_count:
        message = "You're doing great! Keep up the momentum! 🔥"
    elif negative_count > positive_count:
        message = "Every step counts! Don't give up, you've got this! 💪"
    else:
        message = "Consistency is key! Keep moving forward! 🚀"
    
    return {"motivation_message": message, "trend": "positive" if positive_count > negative_count else "needs_support"}

# ============ NEW UPGRADE 2.0 FEATURES ============
@app.get("/leaderboard/", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    """Get global rankings based on steps and XP"""
    users = db.query(User).all()
    board = []
    
    for user in users:
        activities = db.query(Activity).filter(Activity.user_id == user.id).all()
        badges = db.query(Badge).filter(Badge.user_id == user.id).all()
        
        total_steps = sum(a.steps for a in activities)
        total_xp = sum(b.xp_points for b in badges) + (len(activities) * 10)
        
        board.append({
            "username": user.username,
            "total_steps": total_steps,
            "total_xp": total_xp
        })
    
    # Sort by XP then steps
    ranked = sorted(board, key=lambda x: (x['total_xp'], x['total_steps']), reverse=True)
    
    for i, entry in enumerate(ranked):
        entry['rank'] = i + 1
        
    return ranked[:10]  # Top 10

@app.get("/ai/breaks/{user_id}")
def suggest_breaks(user_id: int, db: Session = Depends(get_db)):
    """Recommend movement if sitting for too long"""
    # Find most recent activity
    last_activity = db.query(Activity).filter(Activity.user_id == user_id).order_by(Activity.logged_at.desc()).first()
    
    if not last_activity or (datetime.utcnow() - last_activity.logged_at) > timedelta(hours=2):
        return {
            "should_break": True,
            "message": "You've been inactive for over 2 hours. Time for a 5-minute stretch! 🧘‍♂️",
            "suggestion": "Try 10 leg raises and a quick walk to the kitchen."
        }
    
    return {"should_break": False, "message": "You're doing great! Keep it up!"}

# ============ EXPORT ROUTES ============
@app.get("/export/{user_id}/csv")
def export_csv(user_id: int, db: Session = Depends(get_db)):
    activities = db.query(Activity).filter(Activity.user_id == user_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Date", "Activity Type", "Steps", "Duration (min)", "Calories", "Notes"])
    
    # Data
    for activity in activities:
        writer.writerow([
            activity.logged_at.strftime("%Y-%m-%d %H:%M:%S"),
            activity.activity_type,
            activity.steps,
            activity.duration_minutes,
            activity.calories_burned,
            activity.notes or ""
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=fitsteps_export_{user_id}.csv"}
    )

# Root endpoint updated for healthcheck
@app.get("/")
def read_root():
    return {"message": "Welcome to FitSteps API!", "version": "1.0.0"}

@app.post("/users/", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(email=user.email, username=user.username, hashed_password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)