from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ActivityBase(BaseModel):
    activity_type: str
    steps: int = 0
    duration_minutes: int = 0
    calories_burned: float = 0
    notes: Optional[str] = None
    is_manual: bool = False

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int
    user_id: int
    logged_at: datetime
    
    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    goal_type: str
    target_value: int
    frequency: str
    start_date: datetime
    end_date: Optional[datetime] = None

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class CheckInBase(BaseModel):
    mood: Optional[str] = None
    barriers: Optional[str] = None
    notes: Optional[str] = None

class CheckInCreate(CheckInBase):
    pass

class CheckInResponse(CheckInBase):
    id: int
    user_id: int
    date: datetime
    
    class Config:
        from_attributes = True

class AnalyticsResponse(BaseModel):
    weekly_step_average: float
    best_days: List[str]
    goal_completion_rate: float
    current_streak: int
    total_activities: int
    total_steps: int
    total_xp: int
    level: int
    current_goal: int

class LeaderboardEntry(BaseModel):
    username: str
    total_steps: int
    total_xp: int
    rank: int

class BadgeResponse(BaseModel):
    id: int
    badge_name: str
    badge_description: str
    earned_at: datetime
    xp_points: int
    
    class Config:
        from_attributes = True