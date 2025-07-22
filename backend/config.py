
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = Field(default_factory=lambda: os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/trendulum"))
    
    # Security
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API Keys
    qloo_api_key: str = Field(..., alias="QLOO_API_KEY")
    openai_api_key: str = Field(..., alias="OPENAI_API_KEY")
    
    # App Settings
    app_name: str = "Trendulum"
    debug: bool = True
    allowed_hosts: List[str] = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings() 