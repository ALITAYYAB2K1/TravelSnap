from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.controllers import post_controller
from app.schemas.post import PostResponse

router = APIRouter()

# 1. Get All
@router.get("/", response_model=List[PostResponse])
def read_all_posts(db: Session = Depends(get_db)):
    return post_controller.get_all_posts(db)

# 2. Get One
@router.get("/{post_id}", response_model=PostResponse)
def read_one_post(post_id: int, db: Session = Depends(get_db)):
    return post_controller.get_post_by_id(db, post_id)

# 3. Create
@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_new_post(
    title: str = Form(...),
    user_uid: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return await post_controller.create_post(db, title, user_uid, file)

# 4. Update (PUT) - Updates Title
@router.put("/{post_id}", response_model=PostResponse)
def update_post_title(
    post_id: int, 
    title: str = Form(...), 
    db: Session = Depends(get_db)
):
    return post_controller.update_post(db, post_id, title)

# 5. Delete
@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    return post_controller.delete_post(db, post_id)