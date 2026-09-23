from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import StockItem, AdminUser
from ..schemas import StockItemCreate, StockItemUpdate, StockItemResponse
from ..auth import get_current_admin

router = APIRouter(prefix="/api/stock", tags=["Stock & Equipment"])


@router.get("", response_model=List[StockItemResponse])
def get_stock(db: Session = Depends(get_db)):
    return db.query(StockItem).order_by(StockItem.name.asc()).all()


@router.post("", response_model=StockItemResponse, status_code=status.HTTP_201_CREATED)
def create_stock_item(
    payload: StockItemCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = StockItem(
        name=payload.name,
        category=payload.category,
        total_qty=payload.total_qty,
        reserved_qty=0,
        unit=payload.unit,
        min_threshold=payload.min_threshold,
        notes=payload.notes,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=StockItemResponse)
def update_stock_item(
    item_id: str,
    payload: StockItemUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Stock item not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_stock_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Stock item not found")

    db.delete(item)
    db.commit()
    return {"message": "Stock item deleted successfully"}
