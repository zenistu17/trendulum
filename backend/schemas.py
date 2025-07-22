from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Creator Profile schemas
class CreatorProfileBase(BaseModel):
    profile_name: str
    niche_description: str
    keywords: List[str]
    brand_voice: Optional[str] = None
    negative_keywords: Optional[List[str]] = None
    social_platform: str
    social_handle: str
    audience_data: str

class CreatorProfileCreate(CreatorProfileBase):
    pass

class CreatorProfile(CreatorProfileBase):
    id: int
    user_id: int
    taste_profile: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Content Idea schemas
class ContentIdeaBase(BaseModel):
    title: str
    concept: str
    content_type: str
    visual_elements: List[str]
    call_to_action: str
    why_it_works: Optional[str] = None

class ContentIdeaCreate(ContentIdeaBase):
    creator_profile_id: int

class ContentIdea(ContentIdeaBase):
    id: int
    user_id: int
    creator_profile_id: int
    is_saved: bool
    generated_at: datetime
    
    class Config:
        from_attributes = True

# Monetization Idea schemas
class MonetizationIdeaBase(BaseModel):
    brand_name: str
    collaboration_type: str
    pitch_angle: str
    taste_alignment: str
    why_it_works: Optional[str] = None

class MonetizationIdeaCreate(MonetizationIdeaBase):
    creator_profile_id: int

class MonetizationIdea(MonetizationIdeaBase):
    id: int
    user_id: int
    creator_profile_id: int
    generated_at: datetime
    
    class Config:
        from_attributes = True

# Analysis schemas
class AudienceAnalysisRequest(BaseModel):
    creator_profile_id: int
    additional_context: Optional[str] = None

class ContentGenerationRequest(BaseModel):
    creator_profile_id: int
    content_type: str
    additional_constraints: Optional[str] = None

class MonetizationGenerationRequest(BaseModel):
    creator_profile_id: int
    collaboration_type: Optional[str] = None

# Response schemas
class AnalysisResponse(BaseModel):
    taste_profile: Dict[str, Any]
    recommendations: List[str]

class ContentGenerationResponse(BaseModel):
    ideas: List[ContentIdea]
    total_generated: int

class MonetizationGenerationResponse(BaseModel):
    ideas: List[MonetizationIdea]
    total_generated: int 