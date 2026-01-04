# app/main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.core.config import setup_cloudinary
from app.routers import post

# 1. Create Tables in Neon DB (Auto-Migration)
# This will fail if your .env is empty! Make sure DATABASE_URL is set.
Base.metadata.create_all(bind=engine)

# 2. Config Cloudinary
setup_cloudinary()

app = FastAPI(title="TravelSnap API")

# 3. Security (CORS) - Allow your React Native app to talk to this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Register the Routes
app.include_router(post.router, prefix="/posts", tags=["Posts"])

@app.get("/")
def health_check():
    return {"status": "TravelSnap API is operational"}