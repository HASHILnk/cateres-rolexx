import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import Quotation, QuotationLineItem, AdminUser
from ..schemas import QuotationCreate, QuotationUpdateStatus, QuotationResponse
from ..auth import get_current_admin

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])


@router.get("", response_model=List[QuotationResponse])
def get_quotations(db: Session = Depends(get_db)):
    return (
        db.query(Quotation)
        .options(joinedload(Quotation.items))
        .order_by(Quotation.date.desc())
        .all()
    )


@router.post("", response_model=QuotationResponse, status_code=status.HTTP_201_CREATED)
def create_quotation(
    payload: QuotationCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    q_num = f"QT-2026-{random.randint(100, 999)}"
    q = Quotation(
        quotation_number=q_num,
        client_name=payload.client_name,
        client_phone=payload.client_phone,
        event_title=payload.event_title,
        date=payload.date,
        valid_until=payload.valid_until,
        status=payload.status,
        subtotal=payload.subtotal,
        tax_pct=payload.tax_pct,
        discount_pct=payload.discount_pct,
        total=payload.total,
        notes=payload.notes,
    )
    db.add(q)
    db.commit()
    db.refresh(q)

    for item_data in payload.items:
        line_item = QuotationLineItem(
            quotation_id=q.id,
            description=item_data.description,
            category=item_data.category,
            quantity=item_data.quantity,
            unit_rate=item_data.unit_rate,
            amount=item_data.amount,
        )
        db.add(line_item)

    db.commit()
    db.refresh(q)
    return q


@router.put("/{quotation_id}", response_model=QuotationResponse)
def update_quotation(
    quotation_id: str,
    payload: QuotationCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    q = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")

    q.client_name = payload.client_name
    q.client_phone = payload.client_phone
    q.event_title = payload.event_title
    q.date = payload.date
    q.valid_until = payload.valid_until
    q.status = payload.status
    q.subtotal = payload.subtotal
    q.tax_pct = payload.tax_pct
    q.discount_pct = payload.discount_pct
    q.total = payload.total
    q.notes = payload.notes

    # Replace line items
    db.query(QuotationLineItem).filter(QuotationLineItem.quotation_id == quotation_id).delete()
    for item_data in payload.items:
        line_item = QuotationLineItem(
            quotation_id=q.id,
            description=item_data.description,
            category=item_data.category,
            quantity=item_data.quantity,
            unit_rate=item_data.unit_rate,
            amount=item_data.amount,
        )
        db.add(line_item)

    db.commit()
    db.refresh(q)
    return q


@router.put("/{quotation_id}/status", response_model=QuotationResponse)
def update_quotation_status(
    quotation_id: str,
    payload: QuotationUpdateStatus,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    q = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")

    q.status = payload.status
    db.commit()
    db.refresh(q)
    return q


@router.delete("/{quotation_id}")
def delete_quotation(
    quotation_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    q = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")

    db.delete(q)
    db.commit()
    return {"message": "Quotation deleted successfully"}
