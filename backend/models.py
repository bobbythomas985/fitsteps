from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    activities = relationship("Activity", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    checkins = relationship("CheckIn", back_populates="user")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_type = Column(String)  # walking, running, cycling, workout
    steps = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=0)
    calories_burned = Column(Float, default=0)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)
    is_manual = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="activities")

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    goal_type = Column(String)  # daily_steps, active_minutes
    target_value = Column(Integer)
    frequency = Column(String)  # daily, weekly
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="goals")

class CheckIn(Base):
    __tablename__ = "checkins"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.utcnow)
    mood = Column(String, nullable=True)
    barriers = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="checkins")

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    badge_name = Column(String)
    badge_description = Column(String)
    earned_at = Column(DateTime, default=datetime.utcnow)
    xp_points = Column(Integer, default=0)