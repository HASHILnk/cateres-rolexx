import React, { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "../../components/layout/AppShell";
import { useOperations } from "../../lib/store";
import { ReadinessDisplay } from "../../components/events/ReadinessDisplay";
import { QuotationPreviewModal } from "../../components/quotations/QuotationPreviewModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  MessageCircle,
  ChefHat,
  Boxes,
  FileText,
  DollarSign,
  UserCheck,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Quotation, QuotationLineItem } from "../../lib/types";

export const Route = createFileRoute("/events/$id")({
  component: EventWorkspacePage,
});

function EventWorkspacePage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const {
    events,
    stock,
    quotations,
    updateEvent,
    toggleReadinessItem,
    addReadinessItem,
    addMenuCourseItem,
    removeMenuCourseItem,
    allocateStockToEvent,
    removeStockFromEvent,
    logEventExpense,
    createQuotation,
  } = useOperations();

  const event = events.find((e) => e.id === id);

  // Modals state
  const [quotationPreviewOpen, setQuotationPreviewOpen] = useState(false);
  const [addDishModalOpen, setAddDishModalOpen] = useState(false);
  const [selectedCourseCategory, setSelectedCourseCategory] = useState("Main Course");
  const [dishName, setDishName] = useState("");
  const [dishDesc, setDishDesc] = useState("");
  const [isVeg, setIsVeg] = useState(false);

  // Stock allocation state
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState("");
  const [allocQty, setAllocQty] = useState(1);

  // Expense modal state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<any>("Raw Materials & Groceries");
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState(0);
  const [expPaidTo, setExpPaidTo] = useState("");

  if (!event) {
    return (
      <AppShell>
        <div className="p-12 text-center">
          <h2 className="text-xl font-bold">Event Not Found</h2>
          <p className="text-xs text-muted-foreground mt-1">
            The event workspace you requested does not exist or was removed.
          </p>
          <Button
            onClick={() => router.navigate({ href: "/events" })}
            className="mt-4"
          >
            Back to Events
          </Button>
        </div>
      </AppShell>
    );
  }

  // Linked quotation or fallback
  const quotation = quotations.find(
    (q) => q.id === event.quotationId || q.eventId === event.id
  );

  // Financial calculations
  const totalExpenses = event.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = (event.budget || 0) - totalExpenses;
  const profitMargin =
    event.budget > 0 ? Math.round((netProfit / event.budget) * 100) : 0;
  const balancePending = Math.max(0, event.budget - event.advancePaid);

  // Handlers
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;
    addMenuCourseItem(event.id, selectedCourseCategory, {
      name: dishName,
      description: dishDesc,
      isVeg,
      estimatedPortions: event.guestCount,
    });
    setDishName("");
    setDishDesc("");
    setAddDishModalOpen(false);
    toast.success(`Added "${dishName}" to ${selectedCourseCategory}`);
  };

  const handleAllocateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockId || allocQty <= 0) return;
    allocateStockToEvent(event.id, selectedStockId, allocQty);
    setSelectedStockId("");
    setAllocQty(1);
    setAllocModalOpen(false);
    toast.success("Equipment successfully reserved for this banquet");
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim() || expAmount <= 0) return;
    logEventExpense(event.id, {
      eventId: event.id,
      eventTitle: event.title,
      date: new Date().toISOString().split("T")[0] ?? "2026-09-23",
      category: expCategory,
      description: expDesc,
      amount: expAmount,
      paidTo: expPaidTo || "Supplier / Vendor",
      paymentMethod: "Bank Transfer",
    });
    setExpDesc("");
    setExpAmount(0);
    setExpPaidTo("");
    setExpenseModalOpen(false);
    toast.success("Expense logged to event ledger");
  };

  const handleCreateQuotationForEvent = () => {
    const defaultItems: QuotationLineItem[] = [
      {
        id: `qi-${Date.now()}-1`,
        description: `${event.packageTier} Catering Feast (${event.guestCount} Guests)`,
        category: "Food & Beverage",
        qty: event.guestCount,
        unitPrice: Math.round((event.budget * 0.8) / event.guestCount),
        amount: Math.round(event.budget * 0.8),
      },
      {
        id: `qi-${Date.now()}-2`,
        description: "Chafing Dish, Crockery & Silverware Service Setup",
        category: "Tableware",
        qty: 1,
        unitPrice: Math.round(event.budget * 0.1),
        amount: Math.round(event.budget * 0.1),
      },
      {
        id: `qi-${Date.now()}-3`,
        description: "Hospitality Staff & Logistics Transport",
        category: "Service",
        qty: 1,
        unitPrice: Math.round(event.budget * 0.1),
        amount: Math.round(event.budget * 0.1),
      },
    ];

    const subtotal = defaultItems.reduce((sum, i) => sum + i.amount, 0);
    const tax = Math.round(subtotal * 0.18);

    const newQ = createQuotation({
      eventId: event.id,
      eventTitle: event.title,
      clientName: event.clientName,
      clientPhone: event.clientPhone,
      clientEmail: event.clientEmail || undefined,
      date: event.date,
      validUntil: event.date,
      items: defaultItems,
      subtotal,
      discountPercentage: 0,
      taxPercentage: 18,
      total: subtotal + tax,
      status: "draft",
    });

    toast.success(`Generated official quotation ${newQ.quotationNumber}!`);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* BACK BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events Directory
          </Link>

          <Badge
            variant="outline"
            className="text-xs uppercase font-semibold text-[#8F702F] dark:text-[#E0BA6E] border-[#C5A059]/40"
          >
            {event.eventType} • {event.packageTier}
          </Badge>
        </div>

        {/* WORKSPACE BANNER */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18191D] via-[#1F2228] to-[#121316] text-[#FDFBF7] border border-[#C5A059]/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">
                Live Operations Workspace
              </span>
            </div>

            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#FDFBF7]">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#A1A5B0]">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#C5A059]" /> {event.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C5A059]" /> {event.time}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#C5A059]" /> {event.guestCount}{" "}
                Pax
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 line-clamp-1">
                <MapPin className="w-4 h-4 text-[#C5A059]" /> {event.venue}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${event.clientPhone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Client
            </a>

            {quotation ? (
              <Button
                onClick={() => setQuotationPreviewOpen(true)}
                className="bg-gradient-to-r from-[#C5A059] to-[#9A7B38] text-black font-semibold text-xs gap-1.5"
              >
                <FileText className="w-4 h-4" /> View Quotation
              </Button>
            ) : (
              <Button
                onClick={handleCreateQuotationForEvent}
                className="bg-gradient-to-r from-[#C5A059] to-[#9A7B38] text-black font-semibold text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Quotation
              </Button>
            )}
          </div>
        </div>

        {/* WORKSPACE TABS */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto bg-card border border-border/80 p-1 rounded-xl h-auto">
            <TabsTrigger value="overview" className="text-xs py-2 px-3.5 gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Overview & Readiness
            </TabsTrigger>
            <TabsTrigger value="menu" className="text-xs py-2 px-3.5 gap-1.5">
              <ChefHat className="w-3.5 h-3.5" /> Menu Planner
            </TabsTrigger>
            <TabsTrigger value="stock" className="text-xs py-2 px-3.5 gap-1.5">
              <Boxes className="w-3.5 h-3.5" /> Stock & Equipment
            </TabsTrigger>
            <TabsTrigger value="quotation" className="text-xs py-2 px-3.5 gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Quotation & Billing
            </TabsTrigger>
            <TabsTrigger value="money" className="text-xs py-2 px-3.5 gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Money & Expenses
            </TabsTrigger>
            <TabsTrigger value="staff" className="text-xs py-2 px-3.5 gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Staff & Logistics
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW & READINESS */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Readiness Card */}
              <Card className="lg:col-span-2 border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="font-serif text-lg font-bold">
                    Event Readiness Milestones
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Deterministic checklist calculated across client, menu,
                    equipment, staff, logistics, and payment verification.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReadinessDisplay
                    checklist={event.readinessChecklist}
                    onToggleItem={(itemId) =>
                      toggleReadinessItem(event.id, itemId)
                    }
                  />
                </CardContent>
              </Card>

              {/* Financial Quick Glance */}
              <div className="space-y-4">
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Contract & Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Total Budget</span>
                      <span className="font-bold text-sm text-foreground font-serif">
                        ₹{event.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Advance Collected</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{event.advancePaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-foreground">
                      <span className="text-muted-foreground">Pending Balance</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        ₹{balancePending.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Info Card */}
                <Card className="border-border/80 shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Client Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="font-bold text-sm text-foreground">
                      {event.clientName}
                    </div>
                    <div className="text-muted-foreground">{event.clientPhone}</div>
                    {event.clientEmail && (
                      <div className="text-muted-foreground">
                        {event.clientEmail}
                      </div>
                    )}
                    {event.specialInstructions && (
                      <div className="p-3 bg-muted/40 rounded-lg border border-border/60 text-[11px] mt-2 text-foreground">
                        <strong>Special Instructions:</strong>{" "}
                        {event.specialInstructions}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: MENU PLANNER */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold">
                  Bespoke Banquet Menu
                </h2>
                <p className="text-xs text-muted-foreground">
                  Customized dishes and estimated guest portions for{" "}
                  {event.guestCount} diners.
                </p>
              </div>

              <Button
                onClick={() => setAddDishModalOpen(true)}
                className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Menu Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.menuCourses.map((course) => (
                <Card key={course.category} className="border-border/80 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-base font-bold text-[#8F702F] dark:text-[#E0BA6E]">
                        {course.category}
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px]">
                        {course.items.length} items
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {course.items.length === 0 && (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No dishes added yet for this course.
                      </p>
                    )}

                    {course.items.map((dish) => (
                      <div
                        key={dish.id}
                        className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-card border border-border/50 hover:border-[#C5A059]/40 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                dish.isVeg ? "bg-emerald-500" : "bg-red-500"
                              }`}
                              title={dish.isVeg ? "Vegetarian" : "Non-Veg"}
                            />
                            <span className="font-semibold text-xs text-foreground">
                              {dish.name}
                            </span>
                          </div>
                          {dish.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {dish.description}
                            </p>
                          )}
                          <div className="text-[10px] text-[#C5A059] font-medium">
                            Estimated: {dish.estimatedPortions || event.guestCount}{" "}
                            Portions
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-500"
                          onClick={() =>
                            removeMenuCourseItem(
                              event.id,
                              course.category,
                              dish.id
                            )
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: STOCK & EQUIPMENT */}
          <TabsContent value="stock" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold">
                  Equipment Allocation & Shortages
                </h2>
                <p className="text-xs text-muted-foreground">
                  Reserved chafing units, live cooking stalls, and cutlery for
                  this function.
                </p>
              </div>

              <Button
                onClick={() => setAllocModalOpen(true)}
                className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" /> Allocate Equipment
              </Button>
            </div>

            {/* Allocation List */}
            <div className="border border-border/80 rounded-xl bg-card overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/60">
                  <tr>
                    <th className="p-3.5">Equipment / Serving Ware</th>
                    <th className="p-3.5 text-right">Quantity Reserved</th>
                    <th className="p-3.5">Warehouse Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {event.stockAllocations.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-6 text-center text-muted-foreground italic"
                      >
                        No equipment currently allocated. Click &quot;Allocate
                        Equipment&quot; to reserve chafing dishes, silver ware,
                        or live stalls.
                      </td>
                    </tr>
                  )}

                  {event.stockAllocations.map((alloc) => {
                    const stockItem = stock.find(
                      (s) => s.id === alloc.stockItemId
                    );
                    const isShortage = alloc.status === "shortage";

                    return (
                      <tr key={alloc.stockItemId} className="hover:bg-muted/30">
                        <td className="p-3.5">
                          <div className="font-semibold text-foreground text-sm">
                            {alloc.stockItemName}
                          </div>
                          {stockItem && (
                            <div className="text-muted-foreground text-[11px]">
                              {stockItem.category} • Location:{" "}
                              {stockItem.location}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-bold text-sm">
                          {alloc.quantity} {stockItem?.unit || "units"}
                        </td>
                        <td className="p-3.5">
                          {isShortage ? (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-300 font-semibold gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" /> Shortage
                              Detected
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 font-semibold gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Covered
                            </Badge>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                            onClick={() =>
                              removeStockFromEvent(event.id, alloc.stockItemId)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 4: QUOTATION & BILLING */}
          <TabsContent value="quotation" className="space-y-6">
            {quotation ? (
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                  <div>
                    <CardTitle className="font-serif text-lg font-bold">
                      Quotation #{quotation.quotationNumber}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Issued on {quotation.date} • Valid until{" "}
                      {quotation.validUntil}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="capitalize font-semibold text-xs"
                    >
                      Status: {quotation.status}
                    </Badge>
                    <Button
                      onClick={() => setQuotationPreviewOpen(true)}
                      className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs"
                    >
                      Open Branded Preview
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div className="border border-border/60 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/60">
                        <tr>
                          <th className="p-3">Line Item</th>
                          <th className="p-3 text-right">Qty</th>
                          <th className="p-3 text-right">Rate</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {quotation.items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3 font-medium text-foreground">
                              {item.description}
                            </td>
                            <td className="p-3 text-right">{item.qty}</td>
                            <td className="p-3 text-right">
                              ₹{item.unitPrice.toLocaleString()}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              ₹{item.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2 text-xs">
                    <div className="w-64 space-y-1.5 p-3 rounded-lg bg-muted/40">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{quotation.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          GST ({quotation.taxPercentage}%)
                        </span>
                        <span>
                          ₹
                          {(
                            (quotation.subtotal * quotation.taxPercentage) /
                            100
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm border-t border-border/40 pt-1 text-foreground">
                        <span>Grand Total</span>
                        <span className="text-[#8F702F] dark:text-[#E0BA6E]">
                          ₹{quotation.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border/80 space-y-3">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
                <h3 className="font-bold text-base">No Quotation Generated</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Generate a luxury itemized estimate for {event.clientName} to
                  share via WhatsApp or print.
                </p>
                <Button
                  onClick={handleCreateQuotationForEvent}
                  className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Generate Official Quotation
                </Button>
              </div>
            )}
          </TabsContent>

          {/* TAB 5: MONEY & EXPENSES */}
          <TabsContent value="money" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-border/80 shadow-xs p-4">
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  Event Contract Price
                </span>
                <div className="text-2xl font-bold font-serif mt-1">
                  ₹{event.budget.toLocaleString()}
                </div>
              </Card>

              <Card className="border-border/80 shadow-xs p-4">
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  Total Logged Expenses
                </span>
                <div className="text-2xl font-bold font-serif mt-1 text-red-600 dark:text-red-400">
                  ₹{totalExpenses.toLocaleString()}
                </div>
              </Card>

              <Card className="border-border/80 shadow-xs p-4">
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  Calculated Net Margin
                </span>
                <div className="text-2xl font-bold font-serif mt-1 text-emerald-600 dark:text-emerald-400">
                  ₹{netProfit.toLocaleString()} ({profitMargin}%)
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold">
                  Event Expense Ledger
                </h2>
                <p className="text-xs text-muted-foreground">
                  Purchases, wages, and raw materials logged against this event.
                </p>
              </div>

              <Button
                onClick={() => setExpenseModalOpen(true)}
                className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" /> Log Event Expense
              </Button>
            </div>

            <div className="border border-border/80 rounded-xl bg-card overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/60">
                  <tr>
                    <th className="p-3.5">Expense Description</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Paid To</th>
                    <th className="p-3.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {event.expenses.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-6 text-center text-muted-foreground italic"
                      >
                        No expenses logged for this event yet.
                      </td>
                    </tr>
                  )}
                  {event.expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="p-3.5 font-medium text-foreground">
                        {exp.description}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {exp.category}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {exp.paidTo}
                      </td>
                      <td className="p-3.5 text-right font-bold text-red-600 dark:text-red-400">
                        ₹{exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 6: STAFF & LOGISTICS */}
          <TabsContent value="staff" className="space-y-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="font-serif text-lg font-bold">
                  Assigned Banquet Crew & Supervisors
                </CardTitle>
                <CardDescription className="text-xs">
                  Key kitchen and hospitality personnel responsible for this
                  function.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.staffAssigned.length === 0 && (
                  <p className="text-xs text-muted-foreground italic py-3">
                    No dedicated staff assigned yet. Staff scheduling is
                    conducted 48 hours prior to banquet setup.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {event.staffAssigned.map((st) => (
                    <div
                      key={st.id}
                      className="p-3.5 rounded-lg border border-border/60 bg-muted/20 space-y-1"
                    >
                      <Badge variant="outline" className="text-[10px]">
                        {st.role}
                      </Badge>
                      <div className="font-bold text-sm text-foreground pt-1">
                        {st.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        📞 {st.phone}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL 1: ADD MENU DISH */}
      <Dialog open={addDishModalOpen} onOpenChange={setAddDishModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">
              Add Dish to Menu
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDish} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Course Category</Label>
              <Select
                value={selectedCourseCategory}
                onValueChange={setSelectedCourseCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Welcome Drinks">Welcome Drinks</SelectItem>
                  <SelectItem value="Starters & Appetizers">
                    Starters & Appetizers
                  </SelectItem>
                  <SelectItem value="Main Course">Main Course</SelectItem>
                  <SelectItem value="Desserts & Sweets">
                    Desserts & Sweets
                  </SelectItem>
                  <SelectItem value="Live Counters">Live Counters</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="dishName" className="text-xs">
                Dish Name *
              </Label>
              <Input
                id="dishName"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="e.g. Kashmiri Zafrani Pulao"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dishDesc" className="text-xs">
                Description / Ingredients
              </Label>
              <Input
                id="dishDesc"
                value={dishDesc}
                onChange={(e) => setDishDesc(e.target.value)}
                placeholder="e.g. Saffron infused basmati with dry fruits"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isVeg"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="rounded border-border text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="isVeg" className="text-xs font-normal">
                100% Vegetarian Preparation
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-black text-white text-xs">
                Add to Menu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: ALLOCATE STOCK */}
      <Dialog open={allocModalOpen} onOpenChange={setAllocModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">
              Allocate Equipment / Ware
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAllocateStock} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Select Equipment Item *</Label>
              <Select
                value={selectedStockId}
                onValueChange={setSelectedStockId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose item from warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {stock.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.totalQty - item.reservedQty}{" "}
                      available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="allocQty" className="text-xs">
                Quantity to Reserve *
              </Label>
              <Input
                id="allocQty"
                type="number"
                min={1}
                value={allocQty}
                onChange={(e) => setAllocQty(Number(e.target.value))}
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-black text-white text-xs">
                Confirm Reservation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: LOG EXPENSE */}
      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">
              Log Event Expense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Expense Category</Label>
              <Select value={expCategory} onValueChange={setExpCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Raw Materials & Groceries">
                    Raw Materials & Groceries
                  </SelectItem>
                  <SelectItem value="Staff Wages">Staff Wages</SelectItem>
                  <SelectItem value="Equipment & Fuel">
                    Equipment & Fuel
                  </SelectItem>
                  <SelectItem value="Transport & Logistics">
                    Transport & Logistics
                  </SelectItem>
                  <SelectItem value="Decor & Miscellaneous">
                    Decor & Miscellaneous
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="expDesc" className="text-xs">
                Description / Purpose *
              </Label>
              <Input
                id="expDesc"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder="e.g. 50kg Fresh Mutton from Market"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="expAmount" className="text-xs">
                Amount (₹) *
              </Label>
              <Input
                id="expAmount"
                type="number"
                min={1}
                value={expAmount}
                onChange={(e) => setExpAmount(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="expPaidTo" className="text-xs">
                Paid To (Vendor / Staff)
              </Label>
              <Input
                id="expPaidTo"
                value={expPaidTo}
                onChange={(e) => setExpPaidTo(e.target.value)}
                placeholder="e.g. City Meat Suppliers"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-black text-white text-xs">
                Record Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QUOTATION PREVIEW MODAL */}
      <QuotationPreviewModal
        quotation={quotation || null}
        open={quotationPreviewOpen}
        onOpenChange={setQuotationPreviewOpen}
      />
    </AppShell>
  );
}
