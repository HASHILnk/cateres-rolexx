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
  Printer,
  Edit2,
  Truck,
  Phone,
  ClipboardCheck,
  ShieldCheck,
  CheckCheck,
  Star,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { Quotation, QuotationLineItem, PostEventTask } from "../../lib/types";

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
    deleteReadinessItem,
    addMenuCourseItem,
    removeMenuCourseItem,
    allocateStockToEvent,
    removeStockFromEvent,
    logEventExpense,
    assignStaffToEvent,
    removeStaffFromEvent,
    updateVehicleDetails,
    togglePostEventTask,
    addPostEventTask,
    deletePostEventTask,
    resetPostEventTasks,
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

  // Staff modal state
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("Executive Head Chef");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffNotes, setStaffNotes] = useState("");

  // Logistics & Dispatch modal state
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [vehicleNotes, setVehicleNotes] = useState("");

  // Post-Event Wrap-up state
  const [postEventModalOpen, setPostEventModalOpen] = useState(false);
  const [newPostTaskTitle, setNewPostTaskTitle] = useState("");
  const [newPostTaskCategory, setNewPostTaskCategory] = useState<PostEventTask["category"]>("equipment");
  const [newPostTaskAssigned, setNewPostTaskAssigned] = useState("");
  const [newPostTaskNotes, setNewPostTaskNotes] = useState("");
  const [postTaskFilter, setPostTaskFilter] = useState<string>("all");

  const DEFAULT_POST_EVENT_TASKS: Omit<PostEventTask, "id">[] = [
    {
      category: "equipment",
      title: "Verify all chafing units, live burners & serving ware loaded into return van",
      completed: false,
      assignedTo: "Logistics Driver / Lead Steward",
      notes: "Cross-check count against warehouse dispatch sheet",
    },
    {
      category: "equipment",
      title: "Inspect returned chinaware, cutlery & glassware for breakages or shortages",
      completed: false,
      assignedTo: "Warehouse Stores Manager",
      notes: "Log any damaged items to stock inventory",
    },
    {
      category: "handover",
      title: "Package & label leftover food & desserts for client family handover",
      completed: false,
      assignedTo: "Banquet Captain / Head Chef",
      notes: "Thermal packaging with food safety advisory",
    },
    {
      category: "hygiene",
      title: "Complete kitchen & buffet stall cleaning with hall manager sign-off",
      completed: false,
      assignedTo: "Service Stewards",
      notes: "Leave venue pantry in spotless condition",
    },
    {
      category: "finance",
      title: "Collect remaining pending balance from client & issue settlement receipt",
      completed: false,
      assignedTo: "Event Operations Manager",
      notes: "Verify via Bank Transfer, Cash, or UPI",
    },
    {
      category: "finance",
      title: "Disburse daily allowances & wages to service stewards and drivers",
      completed: false,
      assignedTo: "Accounts / Captain",
      notes: "Record in Money & Expenses ledger",
    },
    {
      category: "finance",
      title: "Reconcile emergency transport & grocery receipts into expense ledger",
      completed: false,
      assignedTo: "Accounts In-charge",
      notes: "Ensure all bills have tax receipts",
    },
    {
      category: "feedback",
      title: "Send official thank-you note & review request to client via WhatsApp",
      completed: false,
      assignedTo: "Client Relations",
      notes: "Request Google / Social media review",
    },
    {
      category: "feedback",
      title: "Conduct culinary & hospitality debrief with Executive Head Chef",
      completed: false,
      assignedTo: "Executive Head Chef & Management",
      notes: "Review portion estimates vs actual consumption",
    },
  ];

  const handleAddPostTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !newPostTaskTitle.trim()) return;
    addPostEventTask(event.id, {
      title: newPostTaskTitle.trim(),
      category: newPostTaskCategory,
      completed: false,
      assignedTo: newPostTaskAssigned.trim() || undefined,
      notes: newPostTaskNotes.trim() || undefined,
    });
    setNewPostTaskTitle("");
    setNewPostTaskAssigned("");
    setNewPostTaskNotes("");
    setPostEventModalOpen(false);
    toast.success("Wrap-up task added to checklist!");
  };

  const handleLoadDefaultPostTasks = () => {
    if (!event) return;
    for (const t of DEFAULT_POST_EVENT_TASKS) {
      addPostEventTask(event.id, t);
    }
    toast.success("Standard post-event wrap-up checklist loaded!", {
      description: "Added 9 operational closure and audit checkpoints.",
    });
  };

  const handleSettleFullBalance = () => {
    if (!event) return;
    updateEvent(event.id, { advancePaid: event.budget });
    toast.success("Balance marked as fully collected & settled!");
  };

  const handleToggleEventCompletion = () => {
    if (!event) return;
    const newStatus = event.status === "completed" ? "planning" : "completed";
    updateEvent(event.id, { status: newStatus });
    if (newStatus === "completed") {
      toast.success("🎉 Banquet officially marked as Completed!");
    } else {
      toast.info("Event status marked as active / in-progress");
    }
  };

  const openVehicleModal = () => {
    setVehicleNumber(event?.vehicleDetails?.vehicleNumber || "");
    setDriverName(event?.vehicleDetails?.driverName || "");
    setDriverPhone(event?.vehicleDetails?.driverPhone || "");
    setDepartureTime(event?.vehicleDetails?.departureTime || "");
    setVehicleNotes(event?.vehicleDetails?.notes || "");
    setVehicleModalOpen(true);
  };

  const handleSaveVehicleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    updateVehicleDetails(event.id, {
      vehicleNumber: vehicleNumber.trim() || "KL-55-AB-9847",
      driverName: driverName.trim() || "Shamsudheen K.",
      driverPhone: driverPhone.trim() || "+91 98470 54321",
      departureTime: departureTime.trim() || "03:30 PM",
      notes: vehicleNotes.trim(),
    });
    setVehicleModalOpen(false);
    toast.success("Logistics & Dispatch details saved!");
  };

  const handleAssignStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !staffName.trim()) return;
    assignStaffToEvent(event.id, {
      name: staffName.trim(),
      role: staffRole,
      phone: staffPhone.trim() || "+91 98470 00000",
      notes: staffNotes.trim(),
    });
    setStaffName("");
    setStaffPhone("");
    setStaffNotes("");
    setStaffModalOpen(false);
    toast.success(`Assigned ${staffName} as ${staffRole}`);
  };

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

  // Match linked quotation by quotationId, eventId, eventTitle, or client info (always prioritizing approved quotations)
  const quotation = React.useMemo(() => {
    if (event.quotationId) {
      const q = quotations.find((it) => it.id === event.quotationId);
      if (q) return q;
    }
    const directMatches = quotations.filter((it) => it.eventId === event.id);
    if (directMatches.length > 0) {
      return directMatches.find((it) => it.status === "approved") || directMatches[0];
    }
    const titleMatches = quotations.filter(
      (it) => it.eventTitle && event.title && it.eventTitle.trim().toLowerCase() === event.title.trim().toLowerCase()
    );
    if (titleMatches.length > 0) {
      return titleMatches.find((it) => it.status === "approved") || titleMatches[0];
    }
    const clientMatches = quotations.filter(
      (it) =>
        (it.clientPhone && event.clientPhone && it.clientPhone.replace(/\D/g, "") === event.clientPhone.replace(/\D/g, "")) ||
        (it.clientName && event.clientName && it.clientName.trim().toLowerCase() === event.clientName.trim().toLowerCase())
    );
    if (clientMatches.length > 0) {
      return clientMatches.find((it) => it.status === "approved") || clientMatches[0];
    }
    return null;
  }, [event, quotations]);

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

  const DEFAULT_ROYAL_COURSES = [
    {
      category: "Warm Welcome with Soft Sip",
      items: [
        { id: `m-${Date.now()}-1`, name: "Watermelon Breeze", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-2`, name: "Pineapple Fizz", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-3`, name: "Grape Galaxy", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-4`, name: "Pacha Manga", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-5`, name: "Orange Punch", isVeg: true, estimatedPortions: event.guestCount },
      ],
    },
    {
      category: "Mojito Jar",
      items: [
        { id: `m-${Date.now()}-6`, name: "Green Apple Mojito", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-7`, name: "Blue Lagoon Sparkler", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-8`, name: "Passionfruit Fizz", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-9`, name: "Mint Lemon Cooler", isVeg: true, estimatedPortions: event.guestCount },
      ],
    },
    {
      category: "Celebration with Rice",
      items: [
        { id: `m-${Date.now()}-10`, name: "Thalassery Mutton Dum Biryani", isVeg: false, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-11`, name: "Fragrant Kaima Ghee Rice", isVeg: true, estimatedPortions: event.guestCount },
      ],
    },
    {
      category: "Flat Breads",
      items: [
        { id: `m-${Date.now()}-12`, name: "Butter Naan", isVeg: true, estimatedPortions: event.guestCount * 2 },
        { id: `m-${Date.now()}-13`, name: "Kerala Malabar Parotta", isVeg: true, estimatedPortions: event.guestCount * 2 },
        { id: `m-${Date.now()}-14`, name: "Rumali Roti", isVeg: true, estimatedPortions: event.guestCount },
      ],
    },
    {
      category: "Celebration with Gravy",
      items: [
        { id: `m-${Date.now()}-15`, name: "Chicken Mughlai Butter Masala", isVeg: false, estimatedPortions: event.guestCount },
      ],
    },
    {
      category: "Celebration with Dry",
      items: [
        { id: `m-${Date.now()}-16`, name: "Crispy Chicken 65", isVeg: false, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-17`, name: "Charcoal Grilled Al Faham", isVeg: false, estimatedPortions: event.guestCount },
      ],
    },
    {
      category: "Meals & Accompaniments",
      items: [
        { id: `m-${Date.now()}-18`, name: "Avial", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-19`, name: "Kerala Sambar", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-20`, name: "Pineapple Pachadi", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-21`, name: "Cabbage Thoran", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-22`, name: "Crispy Pappadam", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-23`, name: "Mango Pickle", isVeg: true, estimatedPortions: event.guestCount },
      ],
    },
    {
      category: "Garden Fresh Salads & Pickles",
      items: [
        { id: `m-${Date.now()}-24`, name: "Russian Salad", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-25`, name: "Tossed Mediterranean Green Salad", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-26`, name: "Beetroot Carpaccio", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-27`, name: "Arabic Pickles", isVeg: true, estimatedPortions: event.guestCount },
      ],
    },
    {
      category: "Sweet Memories & Desserts",
      items: [
        { id: `m-${Date.now()}-28`, name: "Royal Saffron Falooda with Dry Fruits", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-29`, name: "Hot Gulab Jamun with Vanilla Bean Ice Cream", isVeg: true, estimatedPortions: event.guestCount },
        { id: `m-${Date.now()}-30`, name: "Ada Pradhaman Payasam", isVeg: true, estimatedPortions: event.guestCount },
      ],
    },
    {
      category: "Hotspot Live Counter",
      items: [
        { id: `m-${Date.now()}-31`, name: "Live Spiced Sulaimani & Karak Tea Counter", isVeg: true, estimatedPortions: event.guestCount },
      ],
    },
  ];

  const handleSyncQuotationMenu = () => {
    let coursesToSync = DEFAULT_ROYAL_COURSES;
    if (quotation?.sections && quotation.sections.length > 0) {
      coursesToSync = quotation.sections.map((sec, idx) => ({
        category: sec.name || sec.category || `Course ${idx + 1}`,
        items: sec.items.map((itemName, iIdx) => ({
          id: `m-${Date.now()}-${idx}-${iIdx}`,
          name: itemName,
          description: "",
          isVeg: !itemName.toLowerCase().includes("chicken") &&
                 !itemName.toLowerCase().includes("mutton") &&
                 !itemName.toLowerCase().includes("beef") &&
                 !itemName.toLowerCase().includes("fish") &&
                 !itemName.toLowerCase().includes("chemmeen"),
          estimatedPortions: event.guestCount,
        })),
      }));
    }
    updateEvent(event.id, { menuCourses: coursesToSync });
    toast.success("Banquet Menu synced from Quotation!", {
      description: `Loaded ${coursesToSync.length} courses with portion calculations for ${event.guestCount} diners.`,
    });
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

            <div className="flex items-center gap-2">
              {quotation && (
                <Button
                  size="sm"
                  onClick={() => router.navigate({ href: `/quotations?action=create&id=${quotation.id}` })}
                  className="border border-[#C5A059] bg-[#22242C] hover:bg-[#2F323D] text-[#FDFBF7] hover:text-[#C5A059] text-xs font-semibold gap-1.5 shadow-sm transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Edit / Revise Quotation</span>
                </Button>
              )}
              <Button
                onClick={() => {
                  if (quotation) {
                    setQuotationPreviewOpen(true);
                  } else {
                    router.navigate({ href: `/quotations` });
                  }
                }}
                className="bg-gradient-to-r from-[#C5A059] to-[#9A7B38] text-black font-semibold text-xs gap-1.5 shadow-sm"
              >
                <FileText className="w-4 h-4" /> View Official Quotation
              </Button>
            </div>
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
            <TabsTrigger value="postevent" className="text-xs py-2 px-3.5 gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-[#C5A059]" /> Post-Event Wrap-up
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
                    onAddItem={(item) => {
                      addReadinessItem(event.id, item);
                      toast.success(`Added task: ${item.label}`);
                    }}
                    onDeleteItem={(itemId) => {
                      deleteReadinessItem(event.id, itemId);
                      toast.success("Milestone task removed");
                    }}
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

          {/* TAB 2: KITCHEN PRODUCTION & MENU SHEET */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold">
                    Kitchen Production & Menu Sheet
                  </h2>
                  <Badge variant="outline" className="bg-[#FAF5ED] text-[#8C6D37] border-[#E8DEC8] text-[10px] font-bold">
                    Head Chef & Dispatch
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Official banquet menu approved by client for {event.guestCount} diners. Used by the culinary team for kitchen ingredient prep, live counter cooking, and dispatch.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {quotation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.navigate({ href: `/quotations?action=create&id=${quotation.id}` })}
                    className="text-xs border-[#E8E4DC] hover:border-[#C9A45C] text-[#8C7443] gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Dishes in Quotation</span>
                  </Button>
                )}
                {event.menuCourses.length > 0 ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="text-xs border-[#E8E4DC] hover:border-[#C9A45C] gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Kitchen Slip (KOT)</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncQuotationMenu}
                      className="text-xs border-[#E8E4DC] hover:border-[#C9A45C] gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                      <span>Re-sync Menu</span>
                    </Button>
                    <Button
                      onClick={() => setAddDishModalOpen(true)}
                      className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Custom Item
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleSyncQuotationMenu}
                    className="bg-[#C5A059] hover:bg-[#B58E45] text-white font-semibold text-xs gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sync Menu from Quotation</span>
                  </Button>
                )}
              </div>
            </div>

            {event.menuCourses.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-white dark:bg-card rounded-2xl border border-dashed border-[#C5A059]/60 space-y-4 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-[#FAF5ED] border border-[#E8DEC8] flex items-center justify-center mx-auto text-[#8C6D37]">
                  <ChefHat className="w-7 h-7 text-[#C5A059]" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Sync Approved Menu from Quotation
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You already selected the complete banquet menu during the Quotation proposal. Click below to automatically pull all 10 royal courses and calculate kitchen portion estimates for <strong>{event.guestCount} guests</strong>.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button
                    onClick={handleSyncQuotationMenu}
                    className="bg-[#C5A059] hover:bg-[#B58E45] text-white font-semibold text-xs px-5 py-2.5 h-auto gap-2 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sync Approved Menu from Quotation</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAddDishModalOpen(true)}
                    className="text-xs h-auto py-2.5 border-border"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item Manually</span>
                  </Button>
                </div>
              </div>
            ) : (
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
                              Kitchen Prep: {dish.estimatedPortions || event.guestCount}{" "}
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
            )}
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
                      variant="outline"
                      size="sm"
                      onClick={() => router.navigate({ href: `/quotations?action=create&id=${quotation.id}` })}
                      className="border-[#C5A059]/50 text-[#8C7443] dark:text-[#E0BA6E] hover:bg-[#FAF6EE] text-xs font-semibold gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit / Revise</span>
                    </Button>
                    <Button
                      onClick={() => setQuotationPreviewOpen(true)}
                      className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Official Quotation</span>
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
                <h3 className="font-bold text-base">View Official Quotation</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Access the official itemized catering quotation bill for {event.clientName}.
                </p>
                <Button
                  onClick={() => router.navigate({ href: `/quotations` })}
                  className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs gap-1.5"
                >
                  <FileText className="w-4 h-4" /> View Official Quotation
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
            {/* 1. SERVICE CREW ROSTER */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-serif text-lg font-bold">
                      Service Crew Roster
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {event.staffAssigned.length} Crew Assigned
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Assign Head Chef, Captains, Stewards, and Hosting boys/girls for this banquet.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {event.staffAssigned.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateEvent(event.id, { staffAssigned: [] });
                        toast.success("Staff roster cleared");
                      }}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Roster</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      setStaffName("");
                      setStaffPhone("");
                      setStaffNotes("");
                      setStaffRole("Executive Head Chef");
                      setStaffModalOpen(true);
                    }}
                    className="bg-[#C5A059] hover:bg-[#B58E45] text-white font-semibold text-xs gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Staff Member</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                {event.staffAssigned.length === 0 ? (
                  <div className="p-8 text-center bg-muted/10 rounded-xl border border-dashed border-border space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF5ED] border border-[#E8DEC8] flex items-center justify-center mx-auto text-[#8C6D37]">
                      <UserCheck className="w-6 h-6 text-[#C5A059]" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="font-semibold text-sm text-foreground">
                        No service crew rostered yet
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Staff scheduling is conducted for kitchen leadership, service captains, buffet stewards, and guest hosts.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setStaffName("");
                          setStaffPhone("");
                          setStaffNotes("");
                          setStaffRole("Executive Head Chef");
                          setStaffModalOpen(true);
                        }}
                        className="bg-[#C5A059] hover:bg-[#B58E45] text-white text-xs gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Assign Staff Member
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {event.staffAssigned.map((st) => {
                      const isChef = st.role.toLowerCase().includes("chef");
                      const isCaptain = st.role.toLowerCase().includes("captain") || st.role.toLowerCase().includes("supervisor");
                      const isSteward = st.role.toLowerCase().includes("steward");
                      const isHosting = st.role.toLowerCase().includes("hosting") || st.role.toLowerCase().includes("host");
                      const isDriver = st.role.toLowerCase().includes("driver");

                      let badgeColor = "bg-muted text-muted-foreground border-border";
                      if (isChef) badgeColor = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
                      else if (isCaptain) badgeColor = "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
                      else if (isSteward) badgeColor = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
                      else if (isHosting) badgeColor = "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30";
                      else if (isDriver) badgeColor = "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30";

                      return (
                        <div
                          key={st.id}
                          className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-[#C5A059]/50 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="outline" className={`text-[10px] font-semibold ${badgeColor}`}>
                                {st.role}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStaffFromEvent(event.id, st.id)}
                                className="w-6 h-6 text-muted-foreground hover:text-red-500 opacity-80 group-hover:opacity-100 transition-opacity"
                                title="Remove staff member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <div className="font-bold text-sm text-foreground">
                              {st.name}
                            </div>
                            {st.notes && (
                              <div className="text-[11px] text-muted-foreground line-clamp-1 italic">
                                {st.notes}
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                            <a
                              href={`tel:${st.phone.replace(/[^0-9+]/g, "")}`}
                              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[#C5A059] transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>{st.phone}</span>
                            </a>
                            {st.phone && (
                              <a
                                href={`https://wa.me/${st.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. LOGISTICS & DISPATCH */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-serif text-lg font-bold">
                      Logistics & Kitchen Dispatch
                    </CardTitle>
                    <Badge variant="outline" className="text-xs border-[#C5A059]/40 text-[#8C6D37] dark:text-[#E0BA6E]">
                      Fleet & Transit
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Van registration number, driver name, driver phone number, and scheduled kitchen departure time.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {event.vehicleDetails?.vehicleNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateVehicleDetails(event.id, {
                          vehicleNumber: "",
                          driverName: "",
                          driverPhone: "",
                          departureTime: "",
                          notes: "",
                        });
                        toast.success("Logistics details reset");
                      }}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Details</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={openVehicleModal}
                    className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs gap-1.5 shadow-xs"
                  >
                    <Truck className="w-4 h-4" />
                    <span>{event.vehicleDetails?.vehicleNumber ? "Update Dispatch Details" : "Configure Dispatch"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                {event.vehicleDetails?.vehicleNumber ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Van Number */}
                      <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                          <Truck className="w-4 h-4 text-[#C5A059]" />
                          <span>Delivery Van Registration</span>
                        </div>
                        <div className="font-bold text-base text-foreground font-mono">
                          {event.vehicleDetails.vehicleNumber}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Insulated Catering Vehicle
                        </div>
                      </div>

                      {/* Driver Name */}
                      <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                          <UserCheck className="w-4 h-4 text-[#C5A059]" />
                          <span>Assigned Driver</span>
                        </div>
                        <div className="font-bold text-base text-foreground">
                          {event.vehicleDetails.driverName || "Driver Assigned"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Lead Transport In-charge
                        </div>
                      </div>

                      {/* Driver Phone */}
                      <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                          <Phone className="w-4 h-4 text-[#C5A059]" />
                          <span>Driver Phone Number</span>
                        </div>
                        <div className="font-bold text-base text-foreground">
                          <a
                            href={`tel:${event.vehicleDetails.driverPhone.replace(/[^0-9+]/g, "")}`}
                            className="hover:text-[#C5A059] transition-colors"
                          >
                            {event.vehicleDetails.driverPhone || "—"}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          {event.vehicleDetails.driverPhone && (
                            <a
                              href={`https://wa.me/${event.vehicleDetails.driverPhone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <MessageCircle className="w-3 h-3" /> WhatsApp Driver
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Kitchen Departure */}
                      <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                          <Clock className="w-4 h-4 text-[#C5A059]" />
                          <span>Kitchen Departure Time</span>
                        </div>
                        <div className="font-bold text-base text-foreground">
                          {event.vehicleDetails.departureTime || "03:30 PM"}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium">
                          Scheduled for Venue Transit
                        </div>
                      </div>
                    </div>

                    {event.vehicleDetails.notes && (
                      <div className="p-3.5 rounded-lg bg-muted/30 border border-border/60 text-xs text-muted-foreground flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-foreground">Transit & Gate Instructions: </strong>
                          {event.vehicleDetails.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-muted/10 rounded-xl border border-dashed border-border space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF5ED] border border-[#E8DEC8] flex items-center justify-center mx-auto text-[#8C6D37]">
                      <Truck className="w-6 h-6 text-[#C5A059]" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="font-semibold text-sm text-foreground">
                        No delivery van or driver assigned yet
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Schedule kitchen loading, driver contact, and banquet venue arrival time for seamless hot buffet execution.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={openVehicleModal}
                        className="bg-[#C5A059] hover:bg-[#B58E45] text-white text-xs gap-1.5 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" /> Configure Van & Driver
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 7: POST-EVENT WRAP-UP & AUDIT */}
          <TabsContent value="postevent" className="space-y-6">
            {/* 1. HERO BANNER */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#17181C] via-[#1E2026] to-[#121316] text-[#FDFBF7] border border-[#C5A059]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#C5A059]/15 text-[#E0BA6E] border-[#C5A059]/40 text-[10px] font-bold tracking-widest uppercase">
                    Banquet Closure & Settlement
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    • Event #{event.id.slice(0, 8)}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-[#FDFBF7] flex items-center gap-2.5">
                  <ClipboardCheck className="w-6 h-6 text-[#C5A059]" />
                  <span>Post-Event Wrap-up & Audit</span>
                </h2>
                <p className="text-xs text-[#A1A5B0] max-w-2xl leading-relaxed">
                  Post-banquet operational handover: Return warehouse equipment & chafing units, package surplus food for client, settle service crew daily wages, collect final balance, and record client review.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  onClick={handleToggleEventCompletion}
                  className={`text-xs font-semibold gap-1.5 shadow-md ${
                    event.status === "completed"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#C5A059] hover:bg-[#B58E45] text-white"
                  }`}
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>
                    {event.status === "completed"
                      ? "Banquet Completed (Reopen)"
                      : "Mark Banquet as Completed"}
                  </span>
                </Button>
              </div>
            </div>

            {/* 2. THREE KEY KPI SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Milestone Progress */}
              {(() => {
                const tasks = event.postEventTasks || [];
                const completedTasks = tasks.filter((t) => t.completed).length;
                const totalTasks = tasks.length;
                const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                return (
                  <Card className="border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase font-semibold">
                        Wrap-up Milestones
                      </span>
                      <Badge
                        variant="outline"
                        className={pct === 100 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-300" : "bg-muted text-muted-foreground"}
                      >
                        {pct}% Done
                      </Badge>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-serif text-foreground">
                        {completedTasks} / {totalTasks}{" "}
                        <span className="text-xs font-normal text-muted-foreground">verified</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full transition-all duration-300 ${pct === 100 ? "bg-emerald-500" : "bg-[#C5A059]"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })()}

              {/* Client Balance Settlement */}
              <Card className="border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    Client Balance Settlement
                  </span>
                  {balancePending === 0 ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-300 font-semibold text-[10px]">
                      Fully Paid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 border-amber-300 font-semibold text-[10px]">
                      Pending Collection
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold font-serif text-foreground">
                    ₹{balancePending.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      / ₹{event.budget.toLocaleString()}
                    </span>
                  </div>
                  {balancePending > 0 ? (
                    <button
                      type="button"
                      onClick={handleSettleFullBalance}
                      className="text-xs text-[#8C6D37] dark:text-[#E0BA6E] hover:underline font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3 h-3" /> Mark Balance as Received (₹{balancePending.toLocaleString()})
                    </button>
                  ) : (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      ✓ Advance & Balance 100% reconciled
                    </div>
                  )}
                </div>
              </Card>

              {/* Client WhatsApp Thank-You & Review */}
              <Card className="border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    Client Relations
                  </span>
                  <Badge variant="outline" className="text-[10px] border-[#C5A059]/40 text-[#8C6D37]">
                    VIP Courtesy
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <a
                    href={`https://wa.me/${event.clientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Dear ${event.clientName},\n\nThank you for choosing ROLEX Events & Caterers for "${event.title}". It was our absolute privilege to serve you and your guests.\n\nWe hope everyone enjoyed the royal culinary feast and banquet hospitality. Please share your valuable feedback with us!\n\nWarm regards,\nROLEX Events & Caterers Team`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Thank-You & Review</span>
                  </a>
                  <div className="text-[11px] text-muted-foreground text-center line-clamp-1">
                    Direct message to {event.clientName} ({event.clientPhone})
                  </div>
                </div>
              </Card>
            </div>

            {/* 3. WRAP-UP & AUDIT CHECKLIST CARD */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-serif text-lg font-bold">
                      Operations Closure Checklist
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {(event.postEventTasks || []).length} Milestones
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Inspection tasks across equipment return, leftover food handover, staff wage payout, and kitchen hygiene.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(!event.postEventTasks || event.postEventTasks.length === 0) ? (
                    <Button
                      size="sm"
                      onClick={handleLoadDefaultPostTasks}
                      className="bg-[#C5A059] hover:bg-[#B58E45] text-white font-semibold text-xs gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Load Standard Wrap-up Checklist</span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          resetPostEventTasks(event.id);
                          toast.success("Wrap-up tasks reset");
                        }}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadDefaultPostTasks}
                        className="text-xs border-[#C5A059]/50 text-[#8C6D37] hover:bg-[#FAF5ED] gap-1"
                      >
                        <RotateCcw className="w-3 h-3 text-[#C5A059]" />
                        <span>Re-load Standard Tasks</span>
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewPostTaskTitle("");
                      setNewPostTaskAssigned("");
                      setNewPostTaskNotes("");
                      setNewPostTaskCategory("equipment");
                      setPostEventModalOpen(true);
                    }}
                    className="bg-black dark:bg-[#C5A059] text-white dark:text-black font-semibold text-xs gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Wrap-up Task</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Filter tabs */}
                {(event.postEventTasks && event.postEventTasks.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border/40 text-xs">
                    {[
                      { id: "all", label: "All Tasks" },
                      { id: "equipment", label: "Equipment Return" },
                      { id: "handover", label: "Food Handover" },
                      { id: "finance", label: "Finance & Wages" },
                      { id: "hygiene", label: "Venue Hygiene" },
                      { id: "feedback", label: "Review & Debrief" },
                    ].map((tab) => {
                      const count = tab.id === "all"
                        ? event.postEventTasks?.length || 0
                        : (event.postEventTasks || []).filter((t) => t.category === tab.id).length;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPostTaskFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                            postTaskFilter === tab.id
                              ? "bg-black dark:bg-[#C5A059] text-white dark:text-black shadow-2xs"
                              : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className="text-[10px] opacity-70">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tasks List */}
                {(!event.postEventTasks || event.postEventTasks.length === 0) ? (
                  <div className="p-8 sm:p-12 text-center bg-muted/10 rounded-2xl border border-dashed border-[#C5A059]/50 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#FAF5ED] border border-[#E8DEC8] flex items-center justify-center mx-auto text-[#8C6D37]">
                      <ClipboardCheck className="w-7 h-7 text-[#C5A059]" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        Post-Event Wrap-up & Audit Checklist
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Track returned chafing dishes, handover leftover food to client, settle staff allowances, collect pending balance, and record client review.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <Button
                        onClick={handleLoadDefaultPostTasks}
                        className="bg-[#C5A059] hover:bg-[#B58E45] text-white font-semibold text-xs px-5 py-2.5 h-auto gap-2 shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Load Standard 9-Point Wrap-up Checklist</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setNewPostTaskTitle("");
                          setNewPostTaskAssigned("");
                          setNewPostTaskNotes("");
                          setNewPostTaskCategory("equipment");
                          setPostEventModalOpen(true);
                        }}
                        className="text-xs h-auto py-2.5 border-border gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Custom Task</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {event.postEventTasks
                      .filter((t) => postTaskFilter === "all" || t.category === postTaskFilter)
                      .map((task) => {
                        const isEq = task.category === "equipment";
                        const isHand = task.category === "handover";
                        const isFin = task.category === "finance";
                        const isHyg = task.category === "hygiene";
                        const isFeed = task.category === "feedback";

                        let catColor = "bg-muted text-muted-foreground border-border";
                        let catIcon = <ClipboardCheck className="w-3.5 h-3.5" />;
                        let catLabel = "General";

                        if (isEq) {
                          catColor = "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30";
                          catIcon = <Boxes className="w-3.5 h-3.5 text-purple-600" />;
                          catLabel = "Equipment Return";
                        } else if (isHand) {
                          catColor = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
                          catIcon = <ChefHat className="w-3.5 h-3.5 text-amber-600" />;
                          catLabel = "Food Handover";
                        } else if (isFin) {
                          catColor = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
                          catIcon = <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
                          catLabel = "Finance & Wages";
                        } else if (isHyg) {
                          catColor = "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
                          catIcon = <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
                          catLabel = "Venue Hygiene";
                        } else if (isFeed) {
                          catColor = "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30";
                          catIcon = <Star className="w-3.5 h-3.5 text-orange-600" />;
                          catLabel = "Client Review";
                        }

                        return (
                          <div
                            key={task.id}
                            onClick={() => togglePostEventTask(event.id, task.id)}
                            className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                              task.completed
                                ? "bg-muted/30 border-border/50 text-muted-foreground"
                                : "bg-card border-border/80 text-foreground hover:border-[#C5A059]/50 shadow-2xs"
                            }`}
                          >
                            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => togglePostEventTask(event.id, task.id)}
                                className="w-4 h-4 rounded border-border text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
                              />
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold leading-tight ${task.completed ? "line-through opacity-70" : ""}`}>
                                  {task.title}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                {task.assignedTo && (
                                  <span className="flex items-center gap-1 font-medium text-foreground">
                                    <UserCheck className="w-3 h-3 text-[#C5A059]" />
                                    <span>{task.assignedTo}</span>
                                  </span>
                                )}
                                {task.notes && (
                                  <span className="italic line-clamp-1">
                                    • {task.notes}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <Badge variant="outline" className={`text-[10px] font-semibold flex items-center gap-1 ${catColor}`}>
                                {catIcon}
                                <span>{catLabel}</span>
                              </Badge>

                              {task.completed && (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-300 text-[10px] font-semibold gap-1">
                                  <CheckCheck className="w-3 h-3" /> Done
                                </Badge>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deletePostEventTask(event.id, task.id)}
                                className="w-7 h-7 text-muted-foreground hover:text-red-500 opacity-60 group-hover:opacity-100 transition-opacity"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
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
        onEdit={(quotId) => router.navigate({ href: `/quotations?action=create&id=${quotId}` })}
      />

      {/* MODAL 4: ASSIGN STAFF MEMBER */}
      <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#C5A059]" />
              <span>Assign Staff Member to Banquet</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignStaff} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Staff Role / Assignment *</Label>
              <Select value={staffRole} onValueChange={setStaffRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Executive Head Chef">Executive Head Chef</SelectItem>
                  <SelectItem value="Sous Chef">Sous Chef</SelectItem>
                  <SelectItem value="Banquet Captain">Banquet Captain</SelectItem>
                  <SelectItem value="Floor Supervisor">Floor Supervisor</SelectItem>
                  <SelectItem value="Head Steward">Head Steward</SelectItem>
                  <SelectItem value="Service Steward">Service Steward</SelectItem>
                  <SelectItem value="Hosting Boy">Hosting Boy</SelectItem>
                  <SelectItem value="Hosting Girl">Hosting Girl</SelectItem>
                  <SelectItem value="Logistics Driver">Logistics Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="staffName" className="text-xs font-semibold">
                Staff Full Name *
              </Label>
              <Input
                id="staffName"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Faizal K."
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="staffPhone" className="text-xs font-semibold">
                Mobile Contact Number *
              </Label>
              <Input
                id="staffPhone"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                placeholder="e.g. +91 98470 33445"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="staffNotes" className="text-xs font-semibold">
                Duty Station / Assignment Notes (Optional)
              </Label>
              <Input
                id="staffNotes"
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="e.g. In-charge of VIP buffet counters & dessert bar"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStaffModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#C5A059] hover:bg-[#B58E45] text-white text-xs font-semibold shadow-xs"
              >
                Assign Staff Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: LOGISTICS & DISPATCH CONFIGURATION */}
      <Dialog open={vehicleModalOpen} onOpenChange={setVehicleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#C5A059]" />
              <span>Configure Logistics & Kitchen Dispatch</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveVehicleDetails} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label htmlFor="vehicleNumber" className="text-xs font-semibold">
                Delivery Van Registration Number *
              </Label>
              <Input
                id="vehicleNumber"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. KL-55-AB-9847 (Rolex Food Van #1)"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="driverName" className="text-xs font-semibold">
                  Driver Name *
                </Label>
                <Input
                  id="driverName"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Shamsudheen K."
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="driverPhone" className="text-xs font-semibold">
                  Driver Phone Number *
                </Label>
                <Input
                  id="driverPhone"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="e.g. +91 98470 54321"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="departureTime" className="text-xs font-semibold">
                Scheduled Kitchen Departure Time *
              </Label>
              <Input
                id="departureTime"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="e.g. 03:30 PM (2.5 hrs before banquet)"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="vehicleNotes" className="text-xs font-semibold">
                Transit, Loading & Gate Notes (Optional)
              </Label>
              <Input
                id="vehicleNotes"
                value={vehicleNotes}
                onChange={(e) => setVehicleNotes(e.target.value)}
                placeholder="e.g. Rear loading dock entrance, insulated containers inspected"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVehicleModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#C5A059] hover:bg-[#B58E45] text-white text-xs font-semibold shadow-xs"
              >
                Save Dispatch Details
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: ADD POST-EVENT WRAP-UP TASK */}
      <Dialog open={postEventModalOpen} onOpenChange={setPostEventModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#C5A059]" />
              <span>Add Post-Event Wrap-up Task</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPostTask} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Audit Category *</Label>
              <Select
                value={newPostTaskCategory}
                onValueChange={(val: any) => setNewPostTaskCategory(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">📦 Equipment & Ware Return</SelectItem>
                  <SelectItem value="handover">🍱 Leftover Food Handover</SelectItem>
                  <SelectItem value="finance">💰 Balance & Wages Settlement</SelectItem>
                  <SelectItem value="hygiene">🛡️ Kitchen & Venue Hygiene</SelectItem>
                  <SelectItem value="feedback">⭐ Client Review & Chef Debrief</SelectItem>
                  <SelectItem value="custom">📋 Custom Post-Event Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="postTaskTitle" className="text-xs font-semibold">
                Task / Milestone Title *
              </Label>
              <Input
                id="postTaskTitle"
                value={newPostTaskTitle}
                onChange={(e) => setNewPostTaskTitle(e.target.value)}
                placeholder="e.g. Return cold room keys to Bianco Castle manager"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="postTaskAssigned" className="text-xs font-semibold">
                Assigned Team Member (Optional)
              </Label>
              <Input
                id="postTaskAssigned"
                value={newPostTaskAssigned}
                onChange={(e) => setNewPostTaskAssigned(e.target.value)}
                placeholder="e.g. Faizal K. (Captain) / Driver Usman"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="postTaskNotes" className="text-xs font-semibold">
                Audit Notes / Instructions (Optional)
              </Label>
              <Input
                id="postTaskNotes"
                value={newPostTaskNotes}
                onChange={(e) => setNewPostTaskNotes(e.target.value)}
                placeholder="e.g. Signed acknowledgment required from venue manager"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPostEventModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#C5A059] hover:bg-[#B58E45] text-white text-xs font-semibold shadow-xs"
              >
                Add Wrap-up Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
