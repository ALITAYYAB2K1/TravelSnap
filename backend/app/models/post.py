from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text, nullable=True) # Good to have a body/description for the blog
    
    # Cloudinary Data
    image_url = Column(String)
    image_public_id = Column(String) # <--- CRITICAL for deletion

    # Metadata
    user_uid = Column(String, index=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now()) # <--- CRITICAL for sorting