from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AdminUser
from ..schemas import AdminCreate, AdminUpdatePassword, AdminResponse
from ..auth import hash_password, get_current_admin

router = APIRouter(prefix="/api/admins", tags=["Administrator Management"])


@router.get("", response_model=List[AdminResponse])
def list_admins(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    return db.query(AdminUser).order_by(AdminUser.created_at.desc()).all()


@router.post("", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin(
    payload: AdminCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    clean_username = payload.username.strip()
    if not clean_username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    if not payload.password:
        raise HTTPException(status_code=400, detail="Password cannot be empty")

    existing = (
        db.query(AdminUser)
        .filter(AdminUser.username.ilike(clean_username))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Administrator with username '{clean_username}' already exists.",
        )

    new_admin = AdminUser(
        username=clean_username,
        hashed_password=hash_password(payload.password),
        is_superadmin=False,
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin


@router.put("/{admin_id}/password", response_model=AdminResponse)
def update_admin_password(
    admin_id: str,
    payload: AdminUpdatePassword,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrator not found")
    if not payload.password:
        raise HTTPException(status_code=400, detail="New password cannot be empty")

    admin.hashed_password = hash_password(payload.password)
    db.commit()
    db.refresh(admin)
    return admin


@router.delete("/{admin_id}")
def delete_admin(
    admin_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Administrator not found")

    total_admins = db.query(AdminUser).count()
    if total_admins <= 1:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete the only remaining administrator account.",
        )

    db.delete(admin)
    db.commit()
    return {"message": f"Administrator '{admin.username}' removed successfully"}
