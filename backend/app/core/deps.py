from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import User

security = HTTPBearer(auto_error=False)

def get_current_user(
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not auth_credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="សូមចូលគណនីជាមុនសិន ដើម្បីបន្ត (Please log in to continue)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="សុពលភាពនៃគណនីបានផុតកំណត់ សូមចូលគណនីម្តងទៀត (Token expired or invalid)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ព័ត៌មានគណនីមិនត្រឹមត្រូវ (Invalid account details)",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="រកមិនឃើញគណនីអ្នកប្រើប្រាស់នេះទេ (User not found)",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="គណនីត្រូវបានផ្អាកដំណើរការ (Account suspended)",
        )
    return user

def get_optional_user(
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not auth_credentials:
        return None
    try:
        token = auth_credentials.credentials
        payload = decode_access_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id, User.is_active == True).first()
    except Exception:
        return None

def require_teacher_or_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="អ្នកមិនមានសិទ្ធិចូលកាន់ផ្នែកគ្រូបង្រៀនឡើយ (Teacher or Admin access required)",
        )
    return current_user
