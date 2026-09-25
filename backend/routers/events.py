from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import (
    CateringEvent,
    ReadinessItem,
    MenuCourseItem,
    StockItem,
    StockAllocation,
    EventExpense,
    AdminUser,
)
from ..schemas import (
    CateringEventCreate,
    CateringEventUpdate,
    CateringEventResponse,
    ReadinessItemCreate,
    ReadinessItemResponse,
    MenuCourseItemCreate,
    MenuCourseItemResponse,
    StockAllocationCreate,
    StockAllocationResponse,
    EventExpenseCreate,
    EventExpenseResponse,
)
from ..auth import get_current_admin

router = APIRouter(prefix="/api/events", tags=["Catering Events"])


@router.get("", response_model=List[CateringEventResponse])
def get_events(db: Session = Depends(get_db)):
    return (
        db.query(CateringEvent)
        .options(
            joinedload(CateringEvent.readiness_items),
            joinedload(CateringEvent.menu_items),
            joinedload(CateringEvent.stock_allocations),
            joinedload(CateringEvent.expenses),
        )
        .order_by(CateringEvent.date.asc())
        .all()
    )


@router.get("/{event_id}", response_model=CateringEventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    ev = (
        db.query(CateringEvent)
        .options(
            joinedload(CateringEvent.readiness_items),
            joinedload(CateringEvent.menu_items),
            joinedload(CateringEvent.stock_allocations),
            joinedload(CateringEvent.expenses),
        )
        .filter(CateringEvent.id == event_id)
        .first()
    )
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    return ev


@router.post("", response_model=CateringEventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: CateringEventCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    ev = CateringEvent(
        title=payload.title,
        client_name=payload.client_name,
        client_phone=payload.client_phone,
        date=payload.date,
        time=payload.time,
        guest_count=payload.guest_count,
        venue=payload.venue,
        event_type=payload.event_type,
        status=payload.status,
        budget=payload.budget,
        advance_paid=payload.advance_paid,
        menu_locked=payload.menu_locked,
        package_tier=payload.package_tier or "Royal Grandeur",
        quotation_id=payload.quotation_id,
        menu_courses_json=payload.menu_courses_json,
        stock_allocations_json=payload.stock_allocations_json,
        special_instructions=payload.special_instructions,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)

    # Initialize default operational readiness checklist
    default_readiness = [
        ("Catering Crew", "Executive Head Chef & Sous Chef Assigned", False, "high"),
        ("Catering Crew", "Uniformed Banquet Captain & Steward Roster", False, "medium"),
        ("Live Counters", "Copper Chafing Handi & Live Grills Verified", False, "high"),
        ("Beverage Station", "Welcome Mocktails & Ice Box Setup", False, "medium"),
        ("Logistics", "Delivery Vehicle & Buffet Warmers Dispatched", False, "high"),
        ("Client Coordination", "Final Guest Count & Dietary Preferences Locked", False, "high"),
    ]
    for cat, label, is_done, prio in default_readiness:
        r_item = ReadinessItem(
            event_id=ev.id,
            category=cat,
            label=label,
            is_done=is_done,
            priority=prio,
        )
        db.add(r_item)

    db.commit()
    return get_event(ev.id, db)


@router.put("/{event_id}", response_model=CateringEventResponse)
def update_event(
    event_id: str,
    payload: CateringEventUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    ev = db.query(CateringEvent).filter(CateringEvent.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(ev, field, val)

    db.commit()
    return get_event(ev.id, db)


@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    ev = db.query(CateringEvent).filter(CateringEvent.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(ev)
    db.commit()
    return {"message": "Event deleted successfully"}


# ==================================================
# READINESS ITEMS
# ==================================================

@router.post("/{event_id}/readiness", response_model=ReadinessItemResponse)
def add_readiness_item(
    event_id: str,
    payload: ReadinessItemCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = ReadinessItem(
        event_id=event_id,
        category=payload.category,
        label=payload.label,
        is_done=payload.is_done,
        priority=payload.priority,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{event_id}/readiness/{item_id}/toggle", response_model=ReadinessItemResponse)
def toggle_readiness_item(
    event_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = (
        db.query(ReadinessItem)
        .filter(ReadinessItem.id == item_id, ReadinessItem.event_id == event_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Readiness item not found")

    item.is_done = not item.is_done
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{event_id}/readiness/{item_id}")
def delete_readiness_item(
    event_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = (
        db.query(ReadinessItem)
        .filter(ReadinessItem.id == item_id, ReadinessItem.event_id == event_id)
        .first()
    )
    if not item:
        item = db.query(ReadinessItem).filter(ReadinessItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Readiness item deleted"}


# ==================================================
# MENU ITEMS
# ==================================================

@router.post("/{event_id}/menu", response_model=MenuCourseItemResponse)
def add_menu_item(
    event_id: str,
    payload: MenuCourseItemCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = MenuCourseItem(
        event_id=event_id,
        category=payload.category,
        name=payload.name,
        dietary=payload.dietary,
        notes=payload.notes,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{event_id}/menu/{item_id}")
def delete_menu_item(
    event_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    item = (
        db.query(MenuCourseItem)
        .filter(MenuCourseItem.id == item_id, MenuCourseItem.event_id == event_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Menu course item not found")

    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted"}


# ==================================================
# STOCK ALLOCATIONS
# ==================================================

@router.post("/{event_id}/stock", response_model=StockAllocationResponse)
def allocate_stock(
    event_id: str,
    payload: StockAllocationCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    stock_item = db.query(StockItem).filter(StockItem.id == payload.stock_item_id).first()
    if not stock_item:
        raise HTTPException(status_code=404, detail="Stock item not found")

    existing_alloc = (
        db.query(StockAllocation)
        .filter(
            StockAllocation.event_id == event_id,
            StockAllocation.stock_item_id == payload.stock_item_id,
        )
        .first()
    )

    if existing_alloc:
        diff = payload.quantity - existing_alloc.quantity
        existing_alloc.quantity = payload.quantity
        stock_item.reserved_qty = max(0, stock_item.reserved_qty + diff)
        db.commit()
        db.refresh(existing_alloc)
        return existing_alloc
    else:
        alloc = StockAllocation(
            event_id=event_id,
            stock_item_id=payload.stock_item_id,
            quantity=payload.quantity,
        )
        stock_item.reserved_qty = max(0, stock_item.reserved_qty + payload.quantity)
        db.add(alloc)
        db.commit()
        db.refresh(alloc)
        return alloc


@router.delete("/{event_id}/stock/{stock_item_id}")
def remove_stock_allocation(
    event_id: str,
    stock_item_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    alloc = (
        db.query(StockAllocation)
        .filter(
            StockAllocation.event_id == event_id,
            StockAllocation.stock_item_id == stock_item_id,
        )
        .first()
    )
    if not alloc:
        raise HTTPException(status_code=404, detail="Stock allocation not found")

    stock_item = db.query(StockItem).filter(StockItem.id == stock_item_id).first()
    if stock_item:
        stock_item.reserved_qty = max(0, stock_item.reserved_qty - alloc.quantity)

    db.delete(alloc)
    db.commit()
    return {"message": "Stock allocation removed"}


# ==================================================
# EVENT EXPENSES
# ==================================================

@router.post("/{event_id}/expenses", response_model=EventExpenseResponse)
def log_event_expense(
    event_id: str,
    payload: EventExpenseCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    exp = EventExpense(
        event_id=event_id,
        category=payload.category,
        amount=payload.amount,
        description=payload.description,
        date=payload.date,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp
