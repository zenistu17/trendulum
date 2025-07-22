from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from config import settings

SQLALCHEMY_DATABASE_URL = settings.database_url

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    creator_profiles = relationship("CreatorProfile", back_populates="user")
    content_ideas = relationship("ContentIdea", back_populates="user")

class CreatorProfile(Base):
    __tablename__ = "creator_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    profile_name = Column(String, nullable=False)
    niche_description = Column(String, nullable=False)
    keywords = Column(JSON, nullable=False)
    brand_voice = Column(String, nullable=True)
    negative_keywords = Column(JSON, nullable=True)
    social_platform = Column(String, nullable=False)
    social_handle = Column(String, nullable=False)
    audience_data = Column(Text)
    taste_profile = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="creator_profiles")
    content_ideas = relationship("ContentIdea", back_populates="creator_profile")

class ContentIdea(Base):
    __tablename__ = "content_ideas"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    creator_profile_id = Column(Integer, ForeignKey("creator_profiles.id"))
    title = Column(String, index=True)
    concept = Column(Text)
    content_type = Column(String)
    visual_elements = Column(JSON)
    call_to_action = Column(String)
    why_it_works = Column(Text, nullable=True)
    is_saved = Column(Boolean, default=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="content_ideas")
    creator_profile = relationship("CreatorProfile", back_populates="content_ideas")

class MonetizationIdea(Base):
    __tablename__ = "monetization_ideas"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    creator_profile_id = Column(Integer, ForeignKey("creator_profiles.id"))
    brand_name = Column(String)
    collaboration_type = Column(String)
    pitch_angle = Column(Text)
    taste_alignment = Column(Text)
    why_it_works = Column(Text, nullable=True)
    is_saved = Column(Boolean, default=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine) 