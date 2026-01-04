import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
# Create the database engine with connection pooling for Neon
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Auto-reconnect dropped connections
    pool_recycle=300,    # Recycle connections every 5 minutes
)
# Create a sessionmaker bound to the engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Create a base class for declarative class definitions
Base = declarative_base()

# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
