import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from .database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_superadmin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, index=True)
    phone = Column(String(50), nullable=False, index=True)
    email = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    company = Column(String(100), nullable=True)
    vip = Column(Boolean, default=False)
    total_events = Column(Integer, default=0)
    total_spend = Column(Float, default=0.0)
    last_event_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CateringEvent(Base):
    __tablename__ = "catering_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(150), nullable=False)
    client_name = Column(String(100), nullable=False)
    client_phone = Column(String(50), nullable=False)
    date = Column(String(50), nullable=False)
    time = Column(String(50), nullable=False)
    guest_count = Column(Integer, default=100)
    venue = Column(String(200), nullable=False)
    event_type = Column(String(50), default="Wedding")
    status = Column(String(50), default="planning")
    budget = Column(Float, default=0.0)
    advance_paid = Column(Float, default=0.0)
    menu_locked = Column(Boolean, default=False)
    special_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    readiness_items = relationship(
        "ReadinessItem", back_populates="event", cascade="all, delete-orphan"
    )
    menu_items = relationship(
        "MenuCourseItem", back_populates="event", cascade="all, delete-orphan"
    )
    stock_allocations = relationship(
        "StockAllocation", back_populates="event", cascade="all, delete-orphan"
    )
    expenses = relationship(
        "EventExpense", back_populates="event", cascade="all, delete-orphan"
    )


class ReadinessItem(Base):
    __tablename__ = "readiness_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("catering_events.id"), nullable=False)
    category = Column(String(50), nullable=False)
    label = Column(String(200), nullable=False)
    is_done = Column(Boolean, default=False)
    priority = Column(String(20), default="medium")

    event = relationship("CateringEvent", back_populates="readiness_items")


class MenuCourseItem(Base):
    __tablename__ = "menu_course_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("catering_events.id"), nullable=False)
    category = Column(String(50), nullable=False)
    name = Column(String(150), nullable=False)
    dietary = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)

    event = relationship("CateringEvent", back_populates="menu_items")


class StockItem(Base):
    __tablename__ = "stock_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    total_qty = Column(Integer, default=0)
    reserved_qty = Column(Integer, default=0)
    unit = Column(String(20), default="nos")
    min_threshold = Column(Integer, default=10)
    notes = Column(Text, nullable=True)

    allocations = relationship(
        "StockAllocation", back_populates="stock_item", cascade="all, delete-orphan"
    )


class StockAllocation(Base):
    __tablename__ = "stock_allocations"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("catering_events.id"), nullable=False)
    stock_item_id = Column(String, ForeignKey("stock_items.id"), nullable=False)
    quantity = Column(Integer, default=1)

    event = relationship("CateringEvent", back_populates="stock_allocations")
    stock_item = relationship("StockItem", back_populates="allocations")


class EventExpense(Base):
    __tablename__ = "event_expenses"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("catering_events.id"), nullable=False)
    category = Column(String(50), nullable=False)
    amount = Column(Float, default=0.0)
    description = Column(String(255), nullable=True)
    date = Column(String(50), nullable=False)

    event = relationship("CateringEvent", back_populates="expenses")


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String, primary_key=True, default=generate_uuid)
    quotation_number = Column(String(50), unique=True, nullable=False)
    client_name = Column(String(100), nullable=False)
    client_phone = Column(String(50), nullable=False)
    event_title = Column(String(150), nullable=False)
    date = Column(String(50), nullable=False)
    valid_until = Column(String(50), nullable=False)
    status = Column(String(50), default="draft")
    subtotal = Column(Float, default=0.0)
    tax_pct = Column(Float, default=5.0)
    discount_pct = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    items = relationship(
        "QuotationLineItem", back_populates="quotation", cascade="all, delete-orphan"
    )


class QuotationLineItem(Base):
    __tablename__ = "quotation_line_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    quotation_id = Column(String, ForeignKey("quotations.id"), nullable=False)
    description = Column(String(200), nullable=False)
    category = Column(String(50), default="Food & Beverage")
    quantity = Column(Integer, default=1)
    unit_rate = Column(Float, default=0.0)
    amount = Column(Float, default=0.0)

    quotation = relationship("Quotation", back_populates="items")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, nullable=True)
    type = Column(String(20), nullable=False)  # income or expense
    amount = Column(Float, default=0.0)
    category = Column(String(50), nullable=False)
    description = Column(String(255), nullable=False)
    date = Column(String(50), nullable=False)
    payment_method = Column(String(50), default="Bank Transfer")
    status = Column(String(20), default="completed")


class BusinessProfile(Base):
    __tablename__ = "business_profile"

    id = Column(String, primary_key=True, default="default")
    name = Column(String(100), default="ROLEX Events & Caterers")
    tagline = Column(String(150), default="Exquisite Banquets & Royal Culinary Experiences")
    phone = Column(String(50), default="+91 98470 12345")
    email = Column(String(100), default="operations@rolexcaterers.com")
    address = Column(String(255), default="Rolex Heritage Grand Tower, Calicut Road, Kerala, India")
    gst_number = Column(String(50), default="32AAAAA0000A1Z5")
    currency_symbol = Column(String(10), default="₹")
    quotation_terms = Column(JSON, default=list)
    whatsapp_template = Column(Text, default="")
