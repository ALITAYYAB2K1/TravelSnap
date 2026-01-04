import cloudinary.uploader
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
from app.models.post import Post

# --- 1. CREATE ---
async def create_post(db: Session, title: str, user_uid: str, file: UploadFile):
    try:
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(file.file)
        
        # Get BOTH the URL and the Public ID
        image_url = upload_result.get("secure_url")
        public_id = upload_result.get("public_id") # <--- CRITICAL for deletion

        new_post = Post(
            title=title, 
            user_uid=user_uid, 
            image_url=image_url,
            image_public_id=public_id # <--- Save this to DB
        )
        
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        return new_post
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. GET ALL ---
def get_all_posts(db: Session):
    # Added .order_by so new posts appear first
    return db.query(Post).order_by(Post.id.desc()).all()

# --- 3. GET ONE ---
def get_post_by_id(db: Session, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

# --- 4. UPDATE ---
def update_post(db: Session, post_id: int, title: str):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.title = title
    db.commit()
    db.refresh(post)
    return post

# --- 5. DELETE ---
def delete_post(db: Session, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # 1. Delete from Cloudinary first
    if post.image_public_id:
        try:
            cloudinary.uploader.destroy(post.image_public_id)
            print(f"Deleted image {post.image_public_id} from Cloudinary")
        except Exception as e:
            print(f"Error deleting from Cloudinary: {e}")
            # We continue to delete from DB even if Cloudinary fails
            # otherwise the user gets stuck with a broken post.

    # 2. Delete from Database
    db.delete(post)
    db.commit()
    
    return {"message": "Post and image deleted successfully"}