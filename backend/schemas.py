from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


# ==================================================
# AUTH & ADMIN SCHEMAS
# ==================================================

class Token(BaseModel):
    access_token: str
    token_type: str
    admin: "AdminResponse"


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class AdminCreate(BaseModel):
    username: str
    password: str


class AdminUpdatePassword(BaseModel):
    password: str


class AdminResponse(BaseModel):
    id: str
    username: str
    is_superadmin: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================================================
# CLIENT SCHEMAS
# ==================================================

class ClientBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    vip: bool = False
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    vip: Optional[bool] = None
    notes: Optional[str] = None


class ClientResponse(ClientBase):
    id: str
    total_events: int = 0
    total_spend: float = 0.0
    last_event_date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================================================
# READINESS & MENU & EXPENSE SCHEMAS
# ==================================================

class ReadinessItemBase(BaseModel):
    category: str
    label: str
    is_done: bool = False
    priority: str = "medium"


class ReadinessItemCreate(ReadinessItemBase):
    pass


class ReadinessItemResponse(ReadinessItemBase):
    id: str
    event_id: str

    class Config:
        from_attributes = True


class MenuCourseItemBase(BaseModel):
    category: str
    name: str
    dietary: Optional[str] = None
    notes: Optional[str] = None


class MenuCourseItemCreate(MenuCourseItemBase):
    pass


class MenuCourseItemResponse(MenuCourseItemBase):
    id: str
    event_id: str

    class Config:
        from_attributes = True


class StockAllocationBase(BaseModel):
    stock_item_id: str
    quantity: int


class StockAllocationCreate(StockAllocationBase):
    pass


class StockAllocationResponse(StockAllocationBase):
    id: str
    event_id: str

    class Config:
        from_attributes = True


class EventExpenseBase(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None
    date: str


class EventExpenseCreate(EventExpenseBase):
    pass


class EventExpenseResponse(EventExpenseBase):
    id: str
    event_id: str

    class Config:
        from_attributes = True


# ==================================================
# EVENT SCHEMAS
# ==================================================

class CateringEventBase(BaseModel):
    title: str
    client_name: str
    client_phone: str
    date: str
    time: str
    guest_count: int
    venue: str
    event_type: str = "Wedding"
    status: str = "planning"
    budget: float = 0.0
    advance_paid: float = 0.0
    menu_locked: bool = False
    package_tier: Optional[str] = "Royal Grandeur"
    quotation_id: Optional[str] = None
    menu_courses_json: Optional[str] = None
    stock_allocations_json: Optional[str] = None
    special_instructions: Optional[str] = None


class CateringEventCreate(CateringEventBase):
    pass


class CateringEventUpdate(BaseModel):
    title: Optional[str] = None
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    guest_count: Optional[int] = None
    venue: Optional[str] = None
    event_type: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    advance_paid: Optional[float] = None
    menu_locked: Optional[bool] = None
    package_tier: Optional[str] = None
    quotation_id: Optional[str] = None
    menu_courses_json: Optional[str] = None
    stock_allocations_json: Optional[str] = None
    special_instructions: Optional[str] = None


class CateringEventResponse(CateringEventBase):
    id: str
    created_at: Optional[datetime] = None
    readiness_items: List[ReadinessItemResponse] = []
    menu_items: List[MenuCourseItemResponse] = []
    stock_allocations: List[StockAllocationResponse] = []
    expenses: List[EventExpenseResponse] = []

    class Config:
        from_attributes = True


# ==================================================
# STOCK SCHEMAS
# ==================================================

class StockItemBase(BaseModel):
    name: str
    category: str
    total_qty: int
    unit: str = "nos"
    min_threshold: int = 10
    notes: Optional[str] = None


class StockItemCreate(StockItemBase):
    pass


class StockItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    total_qty: Optional[int] = None
    reserved_qty: Optional[int] = None
    unit: Optional[str] = None
    min_threshold: Optional[int] = None
    notes: Optional[str] = None


class StockItemResponse(StockItemBase):
    id: str
    reserved_qty: int = 0

    class Config:
        from_attributes = True


# ==================================================
# QUOTATION SCHEMAS
# ==================================================

class QuotationLineItemBase(BaseModel):
    description: str
    category: str = "Food & Beverage"
    quantity: int = 1
    unit_rate: float = 0.0
    amount: float = 0.0


class QuotationLineItemCreate(QuotationLineItemBase):
    pass


class QuotationLineItemResponse(QuotationLineItemBase):
    id: str
    quotation_id: str

    class Config:
        from_attributes = True


class QuotationBase(BaseModel):
    client_name: str
    client_phone: str
    event_title: str
    date: str
    valid_until: str
    status: str = "draft"
    subtotal: float = 0.0
    tax_pct: float = 5.0
    discount_pct: float = 0.0
    total: float = 0.0
    notes: Optional[str] = None
    event_id: Optional[str] = None
    sections_json: Optional[str] = None
    venue: Optional[str] = None
    event_date: Optional[str] = None
    event_timing: Optional[str] = None
    guest_count: Optional[int] = None
    service_type: Optional[str] = None


class QuotationCreate(QuotationBase):
    items: List[QuotationLineItemCreate] = []


class QuotationUpdateStatus(BaseModel):
    status: str


class QuotationResponse(QuotationBase):
    id: str
    quotation_number: str
    items: List[QuotationLineItemResponse] = []

    class Config:
        from_attributes = True


# ==================================================
# TRANSACTION SCHEMAS
# ==================================================

class TransactionBase(BaseModel):
    event_id: Optional[str] = None
    type: str  # income or expense
    amount: float
    category: str
    description: str
    date: str
    payment_method: str = "Bank Transfer"
    status: str = "completed"


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: str

    class Config:
        from_attributes = True


# ==================================================
# BUSINESS PROFILE SCHEMAS
# ==================================================

class BusinessProfileBase(BaseModel):
    name: str
    tagline: str
    phone: str
    email: str
    address: str
    gst_number: str
    currency_symbol: str = "₹"
    quotation_terms: List[str] = []
    whatsapp_template: str = ""


class BusinessProfileUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    currency_symbol: Optional[str] = None
    quotation_terms: Optional[List[str]] = None
    whatsapp_template: Optional[str] = None


class BusinessProfileResponse(BusinessProfileBase):
    id: str

    class Config:
        from_attributes = True
