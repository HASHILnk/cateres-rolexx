import React, { useState, useMemo } from "react";
import { useOperations } from "../../lib/store";
import { BrandLogo } from "../common/BrandLogo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { RolexQuotationDocument } from "./RolexQuotationDocument";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Download,
  Eye,
  Save,
  Sparkles,
  UserCheck,
  CheckCircle2,
  FileText,
  MessageCircle,
  HelpCircle,
  Layers,
  Utensils,
  Receipt,
  Printer,
  X,
} from "lucide-react";

interface MenuSection {
  id: string;
  name: string;
  category: string;
  items: string[];
  isExpanded: boolean;
}

interface QuotationBuilderProps {
  onBack: () => void;
  initialQuotationId?: string;
}

// Helper: Convert numbers to Indian Rupees in words
function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return "Rupees Zero Only";
  const num = Math.round(amount);

  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n: number): string {
    if (n === 0) return "";
    if (n < 20) return units[n] + " ";
    const t = Math.floor(n / 10);
    const u = n % 10;
    return tens[t] + (u > 0 ? " " + units[u] : "") + " ";
  }

  let result = "";
  let n = num;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  if (crore > 0) {
    result += convertTwoDigits(crore) + "Crore ";
  }

  const lakh = Math.floor(n / 100000);
  n %= 100000;
  if (lakh > 0) {
    result += convertTwoDigits(lakh) + "Lakh ";
  }

  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (thousand > 0) {
    result += convertTwoDigits(thousand) + "Thousand ";
  }

  const hundred = Math.floor(n / 100);
  n %= 100;
  if (hundred > 0) {
    result += units[hundred] + " Hundred ";
  }

  if (n > 0) {
    if (result !== "") result += "and ";
    result += convertTwoDigits(n);
  }

  return `Rupees ${result.trim()} Only`;
}

// Pre-defined menu templates
const TEMPLATES: Record<
  string,
  {
    name: string;
    description: string;
    suggestedRate: number;
    sections: { name: string; category: string; items: string[] }[];
  }
> = {
  wedding_grandeur: {
    name: "Wedding Grandeur (11 Sections)",
    description: "Complete royal Malabar banquet with welcome sips, live stations, rich curries, flatbreads, and dessert bar.",
    suggestedRate: 450,
    sections: [
      {
        name: "Warm Welcome with Soft Sip",
        category: "Welcome Drink",
        items: ["Watermelon Breeze", "Pineapple Fizz", "Grape Galaxy", "Pacha Manga", "Orange Punch"],
      },
      {
        name: "Mojito Jar",
        category: "Welcome Drink",
        items: ["Green Apple Mojito", "Blue Lagoon Sparkler", "Passionfruit Fizz", "Mint Lemon Cooler"],
      },
      {
        name: "Celebration with Rice",
        category: "Main Course",
        items: ["Thalassery Mutton Dum Biryani", "Fragrant Kaima Ghee Rice"],
      },
      {
        name: "Flat Breads",
        category: "Main Course",
        items: ["Butter Naan", "Kerala Malabar Parotta", "Rumali Roti"],
      },
      {
        name: "Celebration with Gravy",
        category: "Main Course",
        items: ["Chicken Mughlai Butter Masala"],
      },
      {
        name: "Celebration with Dry",
        category: "Starters",
        items: ["Crispy Chicken 65", "Charcoal Grilled Al Faham"],
      },
      {
        name: "Meals",
        category: "Main Course",
        items: ["Avial", "Kerala Sambar", "Pineapple Pachadi", "Cabbage Thoran", "Crispy Pappadam", "Mango Pickle", "Ada Pradhaman Payasam"],
      },
      {
        name: "Garden Fresh Salads & Pickles",
        category: "Add-ons",
        items: ["Russian Salad", "Tossed Mediterranean Green Salad", "Beetroot Carpaccio", "Arabic Pickles", "Fresh Mint Raita"],
      },
      {
        name: "Sweet Memories",
        category: "Desserts",
        items: ["Royal Saffron Falooda with Dry Fruits", "Hot Gulab Jamun with Vanilla Bean Ice Cream"],
      },
      {
        name: "Hotspot",
        category: "Add-ons",
        items: ["Live Spiced Sulaimani & Karak Tea Counter"],
      },
      {
        name: "Complete Event Service & Setup Inclusions",
        category: "Add-ons",
        items: [
          "Fine Bone China Dinner Plates",
          "Highball Crystal Water Glasses",
          "Stainless Steel Dessert Bowls",
          "Heavy Gauge Silver Cutlery Sets",
          "Royal Gold Chafing Handis",
          "Live Grills & Counter Stations",
          "Buffet Table Satin Linens & Skirting",
          "Uniformed Executive Head Chef",
          "Uniformed Service Captain & Stewards",
          "Water Dispenser Station & Ice Boxes",
          "Waste Disposal Logistics & Cleanliness Protocol",
          "Transport & Logistics Vans",
          "VIP Silver Cloche Service Team",
          "Post-Event Kitchen Clearance",
        ],
      },
    ],
  },
  corporate_gala: {
    name: "Corporate Gala Executive",
    description: "Tailored for annual general meetings, corporate jubilees, and executive networking banquets.",
    suggestedRate: 420,
    sections: [
      {
        name: "Welcome Sips & Canapés",
        category: "Welcome Drink",
        items: ["Signature Blue Curacao Mocktail", "Smoked Salmon Bruschetta", "Herb Cheese Crostini"],
      },
      {
        name: "Live Cooking Stations",
        category: "Live Counters",
        items: ["Live Truffle Penne Alfredo Pasta Counter", "Charcoal Grilled Chicken & Paneer Tikka Skewers"],
      },
      {
        name: "Executive Continental & Indian Mains",
        category: "Main Course",
        items: ["Grilled Herb Chicken in Wild Mushroom Demi-Glace", "Mutton Rogan Josh", "Kashmiri Pulao", "Butter Naan"],
      },
      {
        name: "Garden Salads & Breads",
        category: "Add-ons",
        items: ["Caesar Salad with Herb Croutons", "Mediterranean Hummus & Warm Pita", "Fresh Fruit Skewers"],
      },
      {
        name: "Artisan Dessert Bar",
        category: "Desserts",
        items: ["Belgian Dark Chocolate Ganache", "Classic Italian Tiramisu Glasses", "Mango Panna Cotta"],
      },
      {
        name: "Service & Setup Inclusions",
        category: "Add-ons",
        items: [
          "Imported Porcelain Tableware",
          "Crystal Highball Glassware",
          "Executive Buffet Setup with Floral Chafers",
          "Formal Black-Tie Service Stewards",
          "Logistics Delivery & Setup Support",
        ],
      },
    ],
  },
  reception_standard: {
    name: "Reception Standard Feast",
    description: "Popular wedding reception package combining biryani, flatbreads, and live dessert counters.",
    suggestedRate: 380,
    sections: [
      {
        name: "Welcome Drinks",
        category: "Welcome Drink",
        items: ["Watermelon Mint Refresher", "Virgin Mojito", "Passionfruit Slush"],
      },
      {
        name: "Starters & Appetizers",
        category: "Starters",
        items: ["Crispy Fish Fingers with Tartar Dip", "Spicy Chicken Lollipop", "Veg Spring Rolls"],
      },
      {
        name: "Main Course",
        category: "Main Course",
        items: ["Malabar Chicken Dum Biryani", "Ghee Rice", "Kerala Parotta", "Beef Roast / Paneer Butter Masala"],
      },
      {
        name: "Dessert Station",
        category: "Desserts",
        items: ["Royal Falooda Station", "Matka Kulfi", "Gulab Jamun"],
      },
      {
        name: "Service & Tableware Setup",
        category: "Add-ons",
        items: ["Porcelain Plates & Cutlery", "Chafing Dish Warmers", "Service Staff & Captain"],
      },
    ],
  },
};

export function QuotationBuilder({ onBack, initialQuotationId }: QuotationBuilderProps) {
  const { clients, events, profile, createQuotation, quotations } = useOperations();

  // Try to pre-fill from an existing quotation or event
  const existingQuotation = useMemo(
    () => (initialQuotationId ? quotations.find((q) => q.id === initialQuotationId) : null),
    [initialQuotationId, quotations]
  );

  const initialEvent = useMemo(() => events[0] || null, [events]);
  const initialClient = useMemo(() => clients[0] || null, [clients]);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClient?.id || ""
  );
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEvent?.id || ""
  );
  const [clientName, setClientName] = useState<string>(
    existingQuotation?.clientName || initialClient?.name || "Dr. Radhakrishnan Nair"
  );
  const [clientPhone, setClientPhone] = useState<string>(
    existingQuotation?.clientPhone || initialClient?.phone || "+91 94471 98765"
  );
  const [eventTitle, setEventTitle] = useState<string>(
    existingQuotation?.eventTitle || initialEvent?.title || "Dr. Nair Silver Jubilee Corporate Gala"
  );
  const [venue, setVenue] = useState<string>(
    initialEvent?.venue || "Bianco Caste, Trivandrum"
  );
  const [eventDate, setEventDate] = useState<string>(
    existingQuotation?.date || initialEvent?.date || "2026-10-18"
  );
  const [eventTiming, setEventTiming] = useState<string>(
    initialEvent?.time || "06:00 PM to 11:00 PM"
  );
  const [guestCount, setGuestCount] = useState<number>(
    initialEvent?.guestCount || 1500
  );
  const [serviceType, setServiceType] = useState<string>("Buffet");
  const [specialNotes, setSpecialNotes] = useState<string>("");
  const [quotationRemarks, setQuotationRemarks] = useState<string>(
    "Pricing is inclusive of live cooking counter setups, uniformed hospitality captain, bone china tableware, and delivery logistics. Advance 50% required upon confirmation."
  );

  // Menu Sections State
  const [sections, setSections] = useState<MenuSection[]>(() => {
    return TEMPLATES.wedding_grandeur.sections.map((sec, index) => ({
      id: `sec-${Date.now()}-${index}`,
      name: sec.name,
      category: sec.category,
      items: [...sec.items],
      isExpanded: index === 0,
    }));
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All Sections");
  const [newSectionModalOpen, setNewSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionCategory, setNewSectionCategory] = useState("Main Course");
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});

  // Pricing State
  const [subtotal, setSubtotal] = useState<number>(650000);
  const [discount, setDiscount] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(25000);

  // Dialogs State
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [fullPreviewModalOpen, setFullPreviewModalOpen] = useState(false);

  // Computed Grand Total
  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discount + additionalCharges);
  }, [subtotal, discount, additionalCharges]);

  // Total items count across sections
  const totalItemsCount = useMemo(() => {
    return sections.reduce((sum, s) => sum + s.items.length, 0);
  }, [sections]);

  // Filtered sections for UI
  const filteredSections = useMemo(() => {
    if (activeCategoryFilter === "All Sections") return sections;
    return sections.filter((s) => s.category.toLowerCase().includes(activeCategoryFilter.toLowerCase()));
  }, [sections, activeCategoryFilter]);

  // Handlers for Sections & Items
  const toggleSectionExpand = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s))
    );
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    const newSec: MenuSection = {
      id: `sec-${Date.now()}`,
      name: newSectionName.trim(),
      category: newSectionCategory,
      items: [],
      isExpanded: true,
    };
    setSections((prev) => [...prev, newSec]);
    setNewSectionName("");
    setNewSectionModalOpen(false);
    toast.success(`Created section "${newSec.name}"`);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    toast.success("Section removed");
  };

  const handleAddItemToSection = (sectionId: string) => {
    const text = newItemInputs[sectionId]?.trim();
    if (!text) return;
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, text] } : s))
    );
    setNewItemInputs((prev) => ({ ...prev, [sectionId]: "" }));
  };

  const handleDeleteItem = (sectionId: string, itemIndex: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((_, idx) => idx !== itemIndex) }
          : s
      )
    );
  };

  const handleApplyTemplate = (templateKey: string) => {
    const tmpl = TEMPLATES[templateKey];
    if (!tmpl) return;
    setSections(
      tmpl.sections.map((sec, idx) => ({
        id: `sec-${Date.now()}-${idx}`,
        name: sec.name,
        category: sec.category,
        items: [...sec.items],
        isExpanded: idx === 0,
      }))
    );
    const suggestedTotal = tmpl.suggestedRate * guestCount;
    setSubtotal(suggestedTotal);
    setTemplateModalOpen(false);
    toast.success(`Applied template "${tmpl.name}"`);
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const c = clients.find((cl) => cl.id === clientId);
    if (c) {
      setClientName(c.name);
      setClientPhone(c.phone);
    }
    setClientModalOpen(false);
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      setEventTitle(ev.title);
      setClientName(ev.clientName);
      setClientPhone(ev.clientPhone);
      setVenue(ev.venue);
      setEventDate(ev.date);
      setEventTiming(ev.time);
      setGuestCount(ev.guestCount);
      setServiceType(ev.eventType === "Wedding" ? "Buffet" : "Plated Table Service");
    }
    setClientModalOpen(false);
  };

  // Save Quotation Handler
  const handleSaveQuotation = (status: "draft" | "sent" | "approved" = "draft") => {
    if (!clientName.trim() || !eventTitle.trim()) {
      toast.error("Please provide client name and event title.");
      return;
    }

    // Build structured line items from sections and pricing
    const lineItems = sections.map((sec, idx) => ({
      id: `li-${Date.now()}-${idx}`,
      description: `${sec.name} (${sec.items.length} items)`,
      category: sec.category,
      qty: 1,
      unitPrice: Math.round(subtotal / (sections.length || 1)),
      amount: Math.round(subtotal / (sections.length || 1)),
    }));

    if (additionalCharges > 0) {
      lineItems.push({
        id: `li-charges-${Date.now()}`,
        description: "Service, Logistics & Setup Charges",
        category: "Service",
        qty: 1,
        unitPrice: additionalCharges,
        amount: additionalCharges,
      });
    }

    const created = createQuotation({
      eventId: selectedEventId || undefined,
      eventTitle,
      clientName,
      clientPhone,
      date: new Date().toISOString().split("T")[0] ?? "2026-09-24",
      validUntil: eventDate || "2026-10-31",
      items: lineItems,
      subtotal,
      discountPercentage: discount > 0 ? Math.round((discount / (subtotal || 1)) * 100) : 0,
      taxPercentage: 5,
      total: grandTotal,
      status,
      notes: quotationRemarks,
    });

    toast.success(`Quotation ${created.quotationNumber} saved successfully!`);
    onBack();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300 pb-32 sm:pb-8">
      {/* ================================================== */}
      {/* 1. TOP HEADER & WORKSPACE ACTIONS                  */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rolex-screen-only">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C7443] hover:text-[#111215] mb-1.5 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Quotations</span>
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#111215]">
            Create Quotation
          </h1>
          <p className="text-xs text-[#70757F] mt-0.5">
            Build a detailed catering estimate with custom menu, services, and pricing.
          </p>
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSaveQuotation("draft")}
            className="text-xs h-9 px-3.5 border-[#E8E4DC] hover:bg-neutral-100 gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFullPreviewModalOpen(true)}
            className="text-xs h-9 px-3.5 border-[#E8E4DC] hover:bg-neutral-100 gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTemplateModalOpen(true)}
            className="text-xs h-9 px-3.5 border-[#C9A45C]/50 text-[#8C7443] hover:bg-[#FAF6EE] gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Templates</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-9 px-4 bg-[#C9A45C] hover:bg-[#B58E45] text-white font-medium shadow-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. CLIENT / EVENT CONTEXT CARD                     */}
      {/* ================================================== */}
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 rolex-screen-only">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FAF5ED] border border-[#E8DEC8] text-[#8C7443] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7443] block">
              CLIENT / EVENT
            </span>
            <div className="font-serif text-base sm:text-lg font-bold text-[#111215] leading-tight">
              {eventTitle || "Select Event Banquet"}
            </div>
            <div className="text-xs text-[#70757F] mt-0.5">
              <span>{clientName || "No Client Selected"}</span>
              <span className="mx-1.5">•</span>
              <span>{clientPhone || "+91 XXXXX XXXXX"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setClientModalOpen(true)}
            className="text-xs h-8 px-3 border-[#E8E4DC] hover:border-[#C9A45C] hover:bg-[#FAF6EE] text-[#111215]"
          >
            Change Client
          </Button>
          <span className="bg-[#FAF5ED] text-[#8C6D37] border border-[#EEDBBD]/70 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            Package Selected
          </span>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. TWO-COLUMN WORKSPACE: EDITOR & LIVE PREVIEW     */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================ */}
        {/* LEFT COLUMN: QUOTATION EDITOR (col-span-7)       */}
        {/* ================================================ */}
        <div className="lg:col-span-7 space-y-6 rolex-screen-only">
          {/* STEP 1: EVENT DETAILS */}
          <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8C7443]" />
                <h3 className="font-serif text-base font-bold text-[#111215]">
                  1. Event Details
                </h3>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#F5F2EB] text-[#70757F] px-2 py-0.5 rounded">
                Step 1 of 3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <Label className="text-xs text-[#52525B]">Event Name *</Label>
                <Input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Royal Wedding Banquet"
                  className="h-9 text-xs border-[#E8E4DC]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#52525B]">Event Venue *</Label>
                <Input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Le Maritime Ballroom, Kochi"
                  className="h-9 text-xs border-[#E8E4DC]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#52525B]">Event Date *</Label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-9 text-xs border-[#E8E4DC]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#52525B]">
                  Guest Count (Expected) *
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value) || 0)}
                    className="h-9 text-xs border-[#E8E4DC] pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#70757F] font-semibold pointer-events-none">
                    Pax
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#52525B]">Event Timing</Label>
                <div className="relative">
                  <Input
                    value={eventTiming}
                    onChange={(e) => setEventTiming(e.target.value)}
                    placeholder="e.g. 06:00 PM to 11:00 PM"
                    className="h-9 text-xs border-[#E8E4DC] pl-8"
                  />
                  <Clock className="w-3.5 h-3.5 text-[#8E94A0] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#52525B]">Type of Service</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-9 text-xs border-[#E8E4DC]">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buffet">Buffet Catering</SelectItem>
                    <SelectItem value="Plated Table Service">Plated Table Service</SelectItem>
                    <SelectItem value="Live Counters Feast">Live Counters Feast</SelectItem>
                    <SelectItem value="Traditional Sadya">Traditional Sadya Feast</SelectItem>
                    <SelectItem value="Cocktail & Canapés">Cocktail & Canapés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <Label className="text-xs text-[#52525B]">
                Special Notes (Optional)
              </Label>
              <Textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Add any special requirements, theme, or client instructions..."
                className="text-xs border-[#E8E4DC] resize-none"
              />
            </div>
          </div>

          {/* STEP 2: MENU SECTIONS & ITEMS */}
          <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#8C7443]" />
                <h3 className="font-serif text-base font-bold text-[#111215]">
                  2. Menu Sections & Items
                </h3>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={() => setNewSectionModalOpen(true)}
                className="h-8 px-3 text-xs bg-[#C9A45C] hover:bg-[#B58E45] text-white gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Section</span>
              </Button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                `All Sections (${sections.length})`,
                "Welcome Drink",
                "Starters",
                "Main Course",
                "Desserts",
                "Live Counters",
                "Add-ons",
              ].map((cat) => {
                const label = cat.startsWith("All Sections") ? "All Sections" : cat;
                const active =
                  activeCategoryFilter === label ||
                  (activeCategoryFilter === "All Sections" && cat.startsWith("All Sections"));
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(label)}
                    className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? "bg-[#111215] text-white"
                        : "bg-[#F5F2EB] text-[#70757F] hover:bg-[#EAE5DC]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* List of Menu Sections */}
            <div className="space-y-2.5 pt-1">
              {filteredSections.map((sec, sIdx) => {
                return (
                  <div
                    key={sec.id}
                    className="border border-[#E8E4DC] rounded-xl overflow-hidden bg-white transition-all shadow-2xs"
                  >
                    {/* Section Header */}
                    <div
                      onClick={() => toggleSectionExpand(sec.id)}
                      className="p-3 sm:px-4 flex items-center justify-between gap-3 bg-[#FAF8F5] hover:bg-[#F5EFE6]/60 transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GripVertical className="w-4 h-4 text-[#8E94A0] shrink-0" />
                        <span className="w-5 h-5 rounded-md bg-white border border-[#E0DCD4] text-[10px] font-bold text-[#111215] flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <span className="font-semibold text-xs sm:text-sm text-[#111215] truncate">
                          {sec.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[11px] font-semibold text-[#8C7443] bg-white px-2 py-0.5 rounded border border-[#E8DEC8]">
                          {sec.items.length} items
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(sec.id);
                          }}
                          className="text-[#8E94A0] hover:text-[#DC2626] p-1 rounded transition-colors"
                          title="Delete section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {sec.isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#8E94A0]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#8E94A0]" />
                        )}
                      </div>
                    </div>

                    {/* Section Expanded Body */}
                    {sec.isExpanded && (
                      <div className="p-3.5 sm:p-4 space-y-3 bg-white border-t border-[#F0EDE6]">
                        {sec.items.length > 0 ? (
                          <div className="space-y-1.5">
                            {sec.items.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F2EB] text-xs transition-colors group"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="text-[#C9A45C] text-sm">•</span>
                                  <span className="text-[#111215] font-medium truncate">
                                    {item}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(sec.id, iIdx)}
                                  className="text-[#8E94A0] hover:text-[#DC2626] opacity-60 group-hover:opacity-100 p-0.5 rounded transition-all shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic py-1">
                            No dishes added yet in this section.
                          </p>
                        )}

                        {/* Inline Add Item Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <Input
                            placeholder="Add dish or item..."
                            value={newItemInputs[sec.id] || ""}
                            onChange={(e) =>
                              setNewItemInputs((prev) => ({
                                ...prev,
                                [sec.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddItemToSection(sec.id);
                              }
                            }}
                            className="h-8 text-xs border-[#E8E4DC]"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAddItemToSection(sec.id)}
                            className="h-8 px-3 text-xs bg-[#111215] hover:bg-black text-white shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: PRICING & REMARKS */}
          <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDE6]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#8C7443]" />
                <h3 className="font-serif text-base font-bold text-[#111215]">
                  3. Pricing & Terms
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="space-y-1">
                <Label className="text-xs text-[#52525B]">Subtotal (₹)</Label>
                <Input
                  type="number"
                  value={subtotal}
                  onChange={(e) => setSubtotal(Number(e.target.value) || 0)}
                  className="h-9 text-xs border-[#E8E4DC] font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#52525B]">Discount (₹)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="h-9 text-xs border-[#E8E4DC]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-[#52525B]">
                  Additional Charges / Tax (₹)
                </Label>
                <Input
                  type="number"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(Number(e.target.value) || 0)}
                  className="h-9 text-xs border-[#E8E4DC]"
                />
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7443] block">
                  CALCULATED TOTAL QUOTATION
                </span>
                <span className="text-xs text-[#70757F]">
                  For {guestCount.toLocaleString()} Guests • {sections.length} Sections
                </span>
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#111215]">
                ₹{grandTotal.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[#52525B]">Quotation Remarks</Label>
              <Textarea
                rows={2}
                value={quotationRemarks}
                onChange={(e) => setQuotationRemarks(e.target.value)}
                placeholder="Add any terms, conditions or special remarks for this quotation..."
                className="text-xs border-[#E8E4DC] resize-none"
              />
            </div>
          </div>
        </div>

        {/* ================================================ */}
        {/* RIGHT COLUMN: LIVE QUOTATION PREVIEW (col-span-5)*/}
        {/* ================================================ */}
        <div className={`lg:col-span-5 space-y-3 sticky top-6 ${fullPreviewModalOpen ? "print:hidden" : "print:col-span-12 print:static print:w-full print:p-0 print:m-0"}`}>
          <div className="flex items-center justify-between px-1 rolex-screen-only">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#8C7443]" />
              <h3 className="font-serif text-base font-bold text-[#111215]">
                Live Quotation Preview
              </h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFullPreviewModalOpen(true)}
              className="text-xs h-7 px-2.5 border-[#E8E4DC] hover:border-[#C9A45C]"
            >
              View Full Preview
            </Button>
          </div>

          {/* EXACT REFERENCE QUOTATION DOCUMENT */}
          <div className={`max-h-[calc(100vh-140px)] overflow-y-auto rounded-3xl shadow-sm border border-[#E7DFCE] print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none print:p-0 ${fullPreviewModalOpen ? "print:hidden" : ""}`}>
            <RolexQuotationDocument
              clientName={clientName}
              clientPhone={clientPhone}
              eventTitle={eventTitle}
              venue={venue}
              eventDate={eventDate}
              eventTiming={eventTiming}
              guestCount={guestCount}
              serviceType={serviceType}
              sections={sections}
              grandTotal={grandTotal}
              quotationRemarks={quotationRemarks}
              printId={fullPreviewModalOpen ? undefined : "rolex-active-quotation-print"}
              className={fullPreviewModalOpen ? "print:hidden" : ""}
            />
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. MOBILE STICKY BOTTOM ACTION BAR                 */}
      {/* ================================================== */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-[#E8E4DC] flex items-center justify-between gap-3 z-30 shadow-lg rolex-screen-only">
        <div>
          <span className="text-[10px] text-[#70757F] block uppercase font-bold">Total</span>
          <span className="font-serif font-bold text-base text-[#111215]">
            ₹{grandTotal.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSaveQuotation("draft")}
            className="text-xs h-9"
          >
            Save Draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setFullPreviewModalOpen(true)}
            className="text-xs h-9 bg-[#C9A45C] hover:bg-[#B58E45] text-white font-medium"
          >
            Preview
          </Button>
        </div>
      </div>

      {/* ================================================== */}
      {/* MODAL: CHANGE CLIENT / EVENT                       */}
      {/* ================================================== */}
      <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">
              Select Client or Event
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            {/* Pick from existing events */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">From Existing Events</Label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {events.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => handleSelectEvent(e.id)}
                    className="w-full text-left p-2.5 rounded-lg border border-[#E8E4DC] hover:border-[#C9A45C] hover:bg-[#FAF8F5] transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#111215]">{e.title}</div>
                      <div className="text-[11px] text-[#70757F]">
                        {e.clientName} • {e.guestCount} Pax • {e.date}
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#8C7443] opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Pick from existing clients */}
            <div className="space-y-1.5 pt-2 border-t border-[#EAE5DC]">
              <Label className="text-xs font-semibold">From Registered Clients</Label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectClient(c.id)}
                    className="w-full text-left p-2.5 rounded-lg border border-[#E8E4DC] hover:border-[#C9A45C] hover:bg-[#FAF8F5] transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#111215]">{c.name}</div>
                      <div className="text-[11px] text-[#70757F]">{c.phone}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================================================== */}
      {/* MODAL: ADD CUSTOM SECTION                          */}
      {/* ================================================== */}
      <Dialog open={newSectionModalOpen} onOpenChange={setNewSectionModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">
              Add Custom Menu Section
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Section Name *</Label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g. Seafood Live Counter"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select value={newSectionCategory} onValueChange={setNewSectionCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Welcome Drink">Welcome Drink</SelectItem>
                  <SelectItem value="Starters">Starters & Appetizers</SelectItem>
                  <SelectItem value="Main Course">Main Course</SelectItem>
                  <SelectItem value="Live Counters">Live Counters</SelectItem>
                  <SelectItem value="Desserts">Desserts & Sweets</SelectItem>
                  <SelectItem value="Add-ons">Add-ons & Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNewSectionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAddSection}
              className="bg-[#C9A45C] hover:bg-[#B58E45] text-white"
            >
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================== */}
      {/* MODAL: SELECT PRESET TEMPLATE                      */}
      {/* ================================================== */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">
              Choose Pre-Configured Menu Template
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2.5 pt-2 text-xs">
            {Object.entries(TEMPLATES).map(([key, tmpl]) => (
              <div
                key={key}
                onClick={() => handleApplyTemplate(key)}
                className="p-3.5 rounded-xl border border-[#E8E4DC] hover:border-[#C9A45C] hover:bg-[#FAF8F5] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-sm text-[#111215] group-hover:text-[#8C7443] transition-colors">
                    {tmpl.name}
                  </div>
                  <span className="text-[10px] font-bold text-[#8C7443] bg-[#FAF5ED] px-2 py-0.5 rounded border border-[#E8DEC8]">
                    ₹{tmpl.suggestedRate}/pax
                  </span>
                </div>
                <p className="text-[11px] text-[#70757F] leading-relaxed">
                  {tmpl.description}
                </p>
                <div className="text-[10px] text-[#8E94A0] mt-1.5">
                  Includes {tmpl.sections.length} categorized menu sections
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ================================================== */}
      {/* MODAL: FULL QUOTATION PREVIEW & PDF EXPORT         */}
      {/* ================================================== */}
      <Dialog open={fullPreviewModalOpen} onOpenChange={setFullPreviewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 border-[#E8E4DC] bg-[#FAF6EE] print:max-h-none print:overflow-visible print:p-0 print:border-none print:bg-transparent">
          <DialogHeader className="p-4 border-b border-[#E8E4DC] bg-[#FAF8F5] flex flex-row items-center justify-between sticky top-0 z-20 rolex-screen-only">
            <DialogTitle className="font-serif text-base font-bold text-[#111215] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8C7443]" />
              Official Catering Quotation
            </DialogTitle>
            <div className="flex items-center gap-2 pr-6">
              <Button
                type="button"
                size="sm"
                onClick={handlePrint}
                className="h-8 px-3 text-xs bg-[#C9A45C] hover:bg-[#B58E45] text-white gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </Button>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-6 print:p-0 print:m-0">
            <RolexQuotationDocument
              clientName={clientName}
              clientPhone={clientPhone}
              eventTitle={eventTitle}
              venue={venue}
              eventDate={eventDate}
              eventTiming={eventTiming}
              guestCount={guestCount}
              serviceType={serviceType}
              sections={sections}
              grandTotal={grandTotal}
              quotationRemarks={quotationRemarks}
              printId="rolex-active-quotation-print"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
