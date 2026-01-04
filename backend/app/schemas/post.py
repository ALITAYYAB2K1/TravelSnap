from pydantic import BaseModel

# Input Schema
class PostCreate(BaseModel):
    title: str
    user_uid: str

# Output Schema
class PostResponse(BaseModel):
    id: int
    title: str
    user_uid: str
    image_url: str

    class Config:
        from_attributes = True # Allows Pydantic to read SQLAlchemy objects