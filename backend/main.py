print("MAIN.PY LOADED")

import logging
logging.basicConfig(level=logging.DEBUG)
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import uvicorn

from database import get_db, create_tables, User, CreatorProfile, ContentIdea, MonetizationIdea
from schemas import (
    UserCreate, User as UserSchema, UserLogin, Token,
    CreatorProfileCreate, CreatorProfile as CreatorProfileSchema,
    ContentIdeaCreate, ContentIdea as ContentIdeaSchema,
    MonetizationIdeaCreate, MonetizationIdea as MonetizationIdeaSchema,
    AudienceAnalysisRequest, ContentGenerationRequest, MonetizationGenerationRequest,
    AnalysisResponse, ContentGenerationResponse, MonetizationGenerationResponse
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_active_user
)
from config import settings
from services.qloo_service import QlooService
from services.openai_service import OpenAIService

# Initialize services
qloo_service = QlooService()
openai_service = OpenAIService()

# Create FastAPI app (ONLY ONCE)
app = FastAPI(
    title="Trendulum API",
    description="Taste Architect for Creators - AI-powered content strategy platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
create_tables()

# Print all registered routes on startup
@app.on_event("startup")
async def startup_event():
    print("\n=== REGISTERED ROUTES ===")
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            print(f"{list(route.methods)} {route.path}")
    print("=========================")

# Simple test endpoint to verify routing
@app.delete("/test-delete/{item_id}")
async def test_delete(item_id: int):
    print(f"[DEBUG] Test delete endpoint reached with item_id: {item_id}")
    return {"message": f"Test delete reached for item {item_id}"}

# Authenticated test delete endpoint
@app.delete("/test-delete-auth/{item_id}")
async def test_delete_auth(
    item_id: int,
    current_user: User = Depends(get_current_active_user)
):
    print(f"[DEBUG] Authenticated test delete endpoint reached with item_id: {item_id}, user: {current_user.email}")
    return {"message": f"Authenticated test delete reached for item {item_id}, user: {current_user.email}"}

@app.get("/")
async def root():
    return {
        "message": "Welcome to Trendulum API",
        "version": "1.0.0",
        "description": "Taste Architect for Creators"
    }

@app.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token"""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@app.post("/creator-profiles", response_model=CreatorProfileSchema)
async def create_creator_profile(
    profile: CreatorProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new creator profile"""
    db_profile = CreatorProfile(
        user_id=current_user.id,
        profile_name=profile.profile_name,
        niche_description=profile.niche_description,
        keywords=profile.keywords,
        brand_voice=profile.brand_voice,
        negative_keywords=profile.negative_keywords,
        social_platform=profile.social_platform,
        social_handle=profile.social_handle,
        audience_data=profile.audience_data
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@app.get("/creator-profiles", response_model=list[CreatorProfileSchema])
async def get_creator_profiles(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all creator profiles for current user"""
    profiles = db.query(CreatorProfile).filter(CreatorProfile.user_id == current_user.id).all()
    return profiles

@app.get("/creator-profiles/{profile_id}", response_model=CreatorProfileSchema)
async def get_creator_profile(
    profile_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific creator profile"""
    profile = db.query(CreatorProfile).filter(
        CreatorProfile.id == profile_id,
        CreatorProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    return profile

@app.delete("/creator-profiles/{profile_id}", response_model=dict)
async def delete_creator_profile(
    profile_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a creator profile"""
    profile = db.query(CreatorProfile).filter(
        CreatorProfile.id == profile_id,
        CreatorProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    db.delete(profile)
    db.commit()
    return {"success": True, "message": "Profile deleted"}

@app.put("/creator-profiles/{profile_id}", response_model=CreatorProfileSchema)
async def update_creator_profile(
    profile_id: int,
    profile_update: CreatorProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a creator profile"""
    profile = db.query(CreatorProfile).filter(
        CreatorProfile.id == profile_id,
        CreatorProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    for field, value in profile_update.dict().items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile

@app.post("/analyze-audience", response_model=AnalysisResponse)
async def analyze_audience(
    request: AudienceAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Analyze audience using Qloo's Taste AI™"""
    # Get creator profile
    profile = db.query(CreatorProfile).filter(
        CreatorProfile.id == request.creator_profile_id,
        CreatorProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    
    # Analyze audience taste
    analysis_result = qloo_service.analyze_audience_taste(
        audience_data=profile.audience_data,
        keywords=profile.keywords
    )
    
    # Update profile with taste analysis
    profile.taste_profile = analysis_result
    db.commit()

    # The check below was too strict and caused failures on partial successes.
    # It is being removed to allow the application to proceed with incomplete data.
    # if not analysis_result.get("taste_profile") or any("error" in domain_result for domain_result in analysis_result["taste_profile"].values()):
    #     raise HTTPException(
    #         status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
    #         detail="Could not retrieve a complete taste profile from the analysis service. Please try again later."
    #     )

    # For the new structure, insights are embedded in the taste profile.
    # We can provide some generic, high-level recommendations.
    recommendations = [
        "Leverage cross-domain interests for unique content mashups.",
        "Align brand partnerships with the top taste affinities for authenticity.",
        "Use the identified taste patterns to refine your content's aesthetic and tone."
    ]
    
    return AnalysisResponse(
        taste_profile=analysis_result,
        recommendations=recommendations
    )

@app.post("/generate-content", response_model=ContentGenerationResponse)
async def generate_content_ideas(
    request: ContentGenerationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate personalized content ideas"""
    # Get creator profile
    profile = db.query(CreatorProfile).filter(
        CreatorProfile.id == request.creator_profile_id,
        CreatorProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    
    if not profile.taste_profile:
        raise HTTPException(status_code=400, detail="Please analyze your audience first")
    
    # Generate content ideas
    # Pass the user's prompt (from additional_constraints) to the LLM
    user_prompt = request.additional_constraints or ""
    ideas_data = openai_service.generate_content_ideas(
        niche_description=profile.niche_description,
        taste_profile=profile.taste_profile,
        content_type=request.content_type,
        brand_voice=profile.brand_voice,
        negative_keywords=profile.negative_keywords,
        additional_constraints=request.additional_constraints or "",
        user_prompt=user_prompt
    )
    # If OpenAI returns an error, propagate it to the frontend
    if isinstance(ideas_data, dict) and ideas_data.get("error"):
        raise HTTPException(status_code=503, detail=f"Content generation failed: {ideas_data['error']}")
    if not ideas_data:
        raise HTTPException(status_code=503, detail="Content generation failed: No ideas returned. Please try again later.")
    # Save ideas to database
    ideas = []
    for idea_data in ideas_data:
        # Ensure visual_elements is always a list
        visual_elements = idea_data.get("visual_elements", [])
        if isinstance(visual_elements, str):
            # If the LLM returns a string, wrap it in a list
            visual_elements = [visual_elements] if visual_elements else []
        elif not isinstance(visual_elements, list):
            visual_elements = []
        db_idea = ContentIdea(
            user_id=current_user.id,
            creator_profile_id=profile.id,
            title=idea_data.get("title", ""),
            concept=idea_data.get("concept", ""),
            content_type=request.content_type,
            visual_elements=visual_elements,
            call_to_action=idea_data.get("call_to_action", ""),
            why_it_works=idea_data.get("why_it_works", "")
        )
        db.add(db_idea)
        ideas.append(db_idea)
    db.commit()
    # Refresh to get IDs
    for idea in ideas:
        db.refresh(idea)
    return ContentGenerationResponse(
        ideas=ideas,
        total_generated=len(ideas)
    )

@app.post("/generate-monetization", response_model=MonetizationGenerationResponse)
async def generate_monetization_ideas(
    request: MonetizationGenerationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate monetization ideas"""
    # Get creator profile
    profile = db.query(CreatorProfile).filter(
        CreatorProfile.id == request.creator_profile_id,
        CreatorProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    
    if not profile.taste_profile:
        raise HTTPException(status_code=400, detail="Please analyze your audience first")
    
    # Generate monetization ideas
    ideas_data = openai_service.generate_monetization_ideas(
        niche_description=profile.niche_description,
        taste_profile=profile.taste_profile,
        collaboration_type=request.collaboration_type or "sponsorship",
        brand_voice=profile.brand_voice,
        negative_keywords=profile.negative_keywords
    )
    # If OpenAI returns an error, propagate it to the frontend
    if isinstance(ideas_data, dict) and ideas_data.get("error"):
        raise HTTPException(status_code=503, detail=f"Monetization generation failed: {ideas_data['error']}")
    if not ideas_data:
        raise HTTPException(status_code=503, detail="Monetization generation failed: No ideas returned. Please try again later.")
    # Save ideas to database
    ideas = []
    for idea_data in ideas_data:
        db_idea = MonetizationIdea(
            user_id=current_user.id,
            creator_profile_id=profile.id,
            brand_name=idea_data["brand_name"],
            collaboration_type=idea_data["collaboration_type"],
            pitch_angle=idea_data["pitch_angle"],
            taste_alignment=idea_data["taste_alignment"],
            why_it_works=idea_data.get("why_it_works")
        )
        db.add(db_idea)
        ideas.append(db_idea)
    db.commit()
    # Refresh to get IDs
    for idea in ideas:
        db.refresh(idea)
    return MonetizationGenerationResponse(
        ideas=ideas,
        total_generated=len(ideas)
    )

@app.get("/content-ideas", response_model=list[ContentIdeaSchema])
async def get_content_ideas(
    saved: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all content ideas, with an option to filter for only saved ideas"""
    query = db.query(ContentIdea).filter(ContentIdea.user_id == current_user.id)
    if saved:
        query = query.filter(ContentIdea.is_saved == True)
    
    ideas = query.order_by(ContentIdea.generated_at.desc()).all()
    # Defensive: ensure visual_elements is always a list for each idea
    for idea in ideas:
        if not isinstance(idea.visual_elements, list):
            if isinstance(idea.visual_elements, str):
                # If it's an empty string or string, set to []
                idea.visual_elements = []
            elif idea.visual_elements is None:
                idea.visual_elements = []
            else:
                try:
                    # Try to coerce to list if possible
                    idea.visual_elements = list(idea.visual_elements)
                except Exception:
                    idea.visual_elements = []
    return ideas

@app.put("/content-ideas/{idea_id}/save")
async def save_content_idea(
    idea_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save/unsave a content idea"""
    idea = db.query(ContentIdea).filter(
        ContentIdea.id == idea_id,
        ContentIdea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Content idea not found")
    
    idea.is_saved = not idea.is_saved
    db.commit()
    return {"message": f"Idea {'saved' if idea.is_saved else 'unsaved'} successfully"}

@app.delete("/content-ideas/{idea_id}", response_model=dict)
async def delete_content_idea(
    idea_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a content idea"""
    idea = db.query(ContentIdea).filter(
        ContentIdea.id == idea_id,
        ContentIdea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Content idea not found")
    
    db.delete(idea)
    db.commit()
    return {"success": True, "message": "Content idea deleted successfully"}

@app.get("/monetization-ideas", response_model=list[MonetizationIdeaSchema])
async def get_monetization_ideas(
    saved: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all monetization ideas, with an option to filter for only saved ideas"""
    query = db.query(MonetizationIdea).filter(MonetizationIdea.user_id == current_user.id)
    if saved:
        query = query.filter(MonetizationIdea.is_saved == True)

    ideas = query.order_by(MonetizationIdea.generated_at.desc()).all()
    return ideas

@app.put("/monetization-ideas/{idea_id}/save")
async def save_monetization_idea(
    idea_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Save/unsave a monetization idea"""
    idea = db.query(MonetizationIdea).filter(
        MonetizationIdea.id == idea_id,
        MonetizationIdea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Monetization idea not found")
    
    idea.is_saved = not idea.is_saved
    db.commit()
    return {"message": f"Idea {'saved' if idea.is_saved else 'unsaved'} successfully"}

@app.delete("/monetization-ideas/{idea_id}", response_model=dict)
async def delete_monetization_idea(
    idea_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a monetization idea"""
    idea = db.query(MonetizationIdea).filter(
        MonetizationIdea.id == idea_id,
        MonetizationIdea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Monetization idea not found")
    
    db.delete(idea)
    db.commit()
    return {"success": True, "message": "Monetization idea deleted successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)