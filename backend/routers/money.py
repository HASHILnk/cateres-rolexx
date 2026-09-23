from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Transaction, AdminUser
from ..schemas import TransactionCreate, TransactionResponse
from ..auth import get_current_admin

router = APIRouter(prefix="/api/transactions", tags=["Money & Transactions"])


@router.get("", response_model=List[TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(Transaction.date.desc()).all()


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    txn = Transaction(
        event_id=payload.event_id,
        type=payload.type,
        amount=payload.amount,
        category=payload.category,
        description=payload.description,
        date=payload.date,
        payment_method=payload.payment_method,
        status=payload.status,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn
