export type EventType =
  | "Wedding"
  | "Reception"
  | "Corporate Gala"
  | "Executive Dinner"
  | "Birthday / Jubilee"
  | "Banquet"
  | "Other";

export type EventStatus =
  | "draft"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PackageTier =
  | "Royal Grandeur"
  | "Imperial Gold"
  | "Classic Elegance"
  | "Custom Executive";

export interface ReadinessItem {
  id: string;
  label: string;
  category: "client" | "menu" | "stock" | "staff" | "logistics" | "payment";
  completed: boolean;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  isVeg: boolean;
  estimatedPortions?: number;
}

export interface MenuCourse {
  category:
    | "Welcome Drinks"
    | "Starters & Appetizers"
    | "Main Course"
    | "Desserts & Sweets"
    | "Live Counters"
    | "Beverages & Accompaniments";
  items: MenuItem[];
}

export interface StockAllocation {
  stockItemId: string;
  stockItemName: string;
  quantity: number;
  status: "reserved" | "shortage" | "returned";
  shortageQty?: number;
}

export interface StaffAssignment {
  id: string;
  name: string;
  role:
    | "Lead Chef"
    | "Sous Chef"
    | "Banquet Manager"
    | "Floor Supervisor"
    | "Server Team Lead"
    | "Logistics Driver";
  phone: string;
}

export interface QuotationLineItem {
  id: string;
  description: string;
  category?: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  eventId?: string | undefined;
  eventTitle: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | undefined;
  date: string;
  validUntil: string;
  items: QuotationLineItem[];
  subtotal: number;
  discountPercentage: number;
  taxPercentage: number;
  total: number;
  status: "draft" | "sent" | "approved" | "rejected";
  notes?: string | undefined;
  venue?: string | undefined;
  eventDate?: string | undefined;
  eventTiming?: string | undefined;
  guestCount?: number | undefined;
  serviceType?: string | undefined;
}

export interface Expense {
  id: string;
  eventId?: string | undefined;
  eventTitle?: string | undefined;
  date: string;
  category:
    | "Raw Materials & Groceries"
    | "Staff Wages"
    | "Equipment & Fuel"
    | "Transport & Logistics"
    | "Decor & Miscellaneous";
  description: string;
  amount: number;
  paidTo: string;
  paymentMethod: "UPI" | "Bank Transfer" | "Cash";
}

export interface CateringEvent {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | undefined;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:00 AM - 04:00 PM"
  venue: string;
  guestCount: number;
  eventType: EventType;
  status: EventStatus;
  packageTier: PackageTier;
  budget: number;
  advancePaid: number;
  readinessChecklist: ReadinessItem[];
  menuCourses: MenuCourse[];
  stockAllocations: StockAllocation[];
  quotationId?: string | undefined;
  expenses: Expense[];
  staffAssigned: StaffAssignment[];
  vehicleDetails?: {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    departureTime: string;
  } | undefined;
  specialInstructions?: string | undefined;
  createdAt: string;
}

export type StockCategory =
  | "Chafing Dishes"
  | "Silverware & Cutlery"
  | "Crockery & Glassware"
  | "Live Cooking Counters"
  | "Linens & Tableware"
  | "Warmers & Transport";

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  totalQty: number;
  reservedQty: number;
  unit: string;
  location: string;
  minThreshold: number;
  condition: "Excellent" | "Good" | "Maintenance Required";
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  company?: string | undefined;
  vip: boolean;
  totalEvents: number;
  totalSpend: number;
  lastEventDate?: string | undefined;
  notes?: string | undefined;
}

export interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  eventId?: string | undefined;
  eventTitle?: string | undefined;
  clientName?: string | undefined;
  paymentMethod: "UPI" | "Bank Transfer" | "Cash";
  status: "completed" | "pending";
}

export interface BusinessProfile {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  currencySymbol: string;
  quotationTerms: string[];
  whatsappTemplate: string;
}
