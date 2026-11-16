from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: Optional[str] = None
    provider: str
    is_pro: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserQuota(BaseModel):
    daily_searches_limit: int = 200
    daily_searches_used: int = 0
    daily_searches_remaining: int = 200
    
    daily_keywords_limit: int = 50
    daily_keywords_used: int = 0
    daily_keywords_remaining: int = 50


class UserMeResponse(BaseModel):
    user: UserResponse
    quota: UserQuota
