from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AdminUser
from ..schemas import LoginRequest, Token, AdminResponse
from ..auth import verify_password, create_access_token, get_current_admin

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Support case-insensitive matching for admin usernames
    admin = (
        db.query(AdminUser)
        .filter(AdminUser.username.ilike(request.username.strip()))
        .first()
    )

    if not admin or not verify_password(request.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": admin.username})
    return Token(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse.model_validate(admin),
    )


@router.get("/me", response_model=AdminResponse)
def get_me(current_admin: AdminUser = Depends(get_current_admin)):
    return current_admin
