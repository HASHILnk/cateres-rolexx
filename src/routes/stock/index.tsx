import React, { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../../components/layout/AppShell";
import { useOperations } from "../../lib/store";
import { StockCategory, StockItem } from "../../lib/types";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/stock/")({
  component: StockPage,
});

// Category mapping helper
const CATEGORY_CHIPS = [
  { id: "all", label: "All", shortLabel: "All" },
  { id: "Chafing Dishes", label: "Chafing Dishes", shortLabel: "Chafing" },
  { id: "Silverware & Cutlery", label: "Silverware & Cutlery", shortLabel: "Cutlery" },
  { id: "Crockery & Glassware", label: "Crockery & Glassware", shortLabel: "Crockery" },
  { id: "Live Cooking Counters", label: "Cooking Equipment", shortLabel: "Cooking" },
  { id: "Linens & Tableware", label: "Linens & Tableware", shortLabel: "Linens" },
  { id: "Warmers & Transport", label: "Warmers & Transport", shortLabel: "Transport" },
] as const;

// Helper to calculate stock operational status
function getStockStatus(total: number, reserved: number, minThreshold: number) {
  const available = total - reserved;
  if (available < 0) {
    return {
      status: "Shortage" as const,
      color: "text-[#DC2626]",
      dotColor: "bg-[#DC2626]",
      badgeBg: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      available,
      deficit: Math.abs(available),
    };
  }
  if (available <= minThreshold) {
    return {
      status: "Low" as const,
      color: "text-[#D97706]",
      dotColor: "bg-[#D97706]",
      badgeBg: "bg-[#FEF3D6] text-[#B45309] border-[#FDE68A]",
      available,
      deficit: 0,
    };
  }
  return {
    status: "Available" as const,
    color: "text-[#16A34A]",
    dotColor: "bg-[#16A34A]",
    badgeBg: "bg-[#E8F6ED] text-[#1E7E34] border-[#C6ECD2]",
    available,
    deficit: 0,
  };
}

// Icon renderer for equipment items matching reference design aesthetics
function EquipmentItemIcon({ name, category }: { name: string; category: string }) {
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  if (n.includes("plate") || n.includes("china") || n.includes("crockery")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
        </svg>
      </div>
    );
  }

  if (n.includes("goblet") || n.includes("glass") || n.includes("water") || n.includes("juice")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 3h10v5a5 5 0 0 1-5 5v5h4v2H8v-2h4v-5a5 5 0 0 1-5-5V3z" />
          <line x1="7" y1="7" x2="17" y2="7" />
        </svg>
      </div>
    );
  }

  if (n.includes("bowl") || n.includes("platter") || n.includes("dessert")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 11h16a1 1 0 0 1 1 1 7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7 1 1 0 0 1 1-1z" />
          <path d="M9 19v2M15 19v2" />
        </svg>
      </div>
    );
  }

  if (n.includes("spoon") || n.includes("fork") || n.includes("cutlery") || c.includes("silverware")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 2v20M15 2v6a3 3 0 0 0 6 0V2M6 2v20M4 2c0 3 2 5 2 5s2-2 2-5" />
        </svg>
      </div>
    );
  }

  if (n.includes("tandoor") || n.includes("drum") || n.includes("griddle") || c.includes("cooking")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <line x1="8" y1="18" x2="8" y2="21" />
          <line x1="16" y1="18" x2="16" y2="21" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
    );
  }

  if (c.includes("linens") || n.includes("tablecloth") || n.includes("napkin")) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18v12H3z" />
          <path d="M7 6v12M17 6v12" />
        </svg>
      </div>
    );
  }

  // Default chafing dishes / handis / warmers
  return (
    <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 11h16a1 1 0 0 1 1 1v2a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6v-2a1 1 0 0 1 1-1z" />
        <path d="M12 4v4M9 5l3-3 3 3" />
        <path d="M6 19v2M18 19v2" />
      </svg>
    </div>
  );
}

function StockPage() {
  const { stock, events, addStockItem, updateStockItem, deleteStockItem } =
    useOperations();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyShortages, setOnlyShortages] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<StockItem | null>(null);
  const [editQtyItem, setEditQtyItem] = useState<StockItem | null>(null);
  const [editTotalQty, setEditTotalQty] = useState(0);

  // New stock form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<StockCategory>("Chafing Dishes");
  const [totalQty, setTotalQty] = useState(20);
  const [unit, setUnit] = useState("units");
  const [location, setLocation] = useState("Aisle A-01, Warehouse 1");
  const [minThreshold, setMinThreshold] = useState(5);
  const [condition, setCondition] = useState<any>("Excellent");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate Operational Metrics
  const summaryMetrics = useMemo(() => {
    const totalItems = stock.length;
    const reservedItemsCount = stock.filter((s) => s.reservedQty > 0).length;
    const attentionItems = stock.filter((s) => {
      const avail = s.totalQty - s.reservedQty;
      return avail < 0 || avail <= s.minThreshold;
    });

    const shortageItems = stock.filter((s) => s.totalQty - s.reservedQty < 0);

    return {
      totalItems,
      reservedItemsCount,
      attentionCount: attentionItems.length,
      attentionItems,
      shortageItems,
    };
  }, [stock]);

  // Filter Stock Items
  const filteredStock = useMemo(() => {
    return stock.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "all" ? true : item.category === selectedCategory;

      const avail = item.totalQty - item.reservedQty;
      const matchesAttention = onlyShortages
        ? avail < 0 || avail <= item.minThreshold
        : true;

      return matchesSearch && matchesCategory && matchesAttention;
    });
  }, [stock, search, selectedCategory, onlyShortages]);

  const totalPages = Math.max(1, Math.ceil(filteredStock.length / itemsPerPage));
  const paginatedStock = filteredStock.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Find upcoming events reserving an item
  const getReservingEvents = (stockId: string) => {
    return events
      .filter((ev) =>
        ev.stockAllocations?.some((sa) => sa.stockItemId === stockId)
      )
      .map((ev) => {
        const alloc = ev.stockAllocations.find((sa) => sa.stockItemId === stockId);
        return {
          eventId: ev.id,
          eventTitle: ev.title,
          date: ev.date,
          guestCount: ev.guestCount,
          quantity: alloc?.quantity || 0,
          status: alloc?.status || "reserved",
        };
      });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addStockItem({
      name,
      category,
      totalQty,
      unit,
      location,
      minThreshold,
      condition,
    });

    setName("");
    setTotalQty(20);
    setAddModalOpen(false);
    toast.success(`Registered "${name}" in inventory`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQtyItem) return;
    updateStockItem(editQtyItem.id, { totalQty: editTotalQty });
    if (detailItem?.id === editQtyItem.id) {
      setDetailItem({ ...detailItem, totalQty: editTotalQty });
    }
    setEditQtyItem(null);
    toast.success(`Updated stock quantity for ${editQtyItem.name}`);
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-6 animate-in fade-in-50 duration-300">
        {/* ================================================== */}
        {/* HEADER SECTION                                     */}
        {/* ================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#111215]">
              Stock & Equipment
            </h1>
            <p className="text-xs sm:text-sm text-[#77736B] mt-1">
              Track equipment available for upcoming events.
            </p>
          </div>

          {/* Desktop + Add Equipment Item Button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111215] hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Equipment Item</span>
          </button>

          {/* Mobile + Add Equipment Item Full-Width Button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="sm:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111215] hover:bg-neutral-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Equipment Item</span>
          </button>
        </div>

        {/* ================================================== */}
        {/* 3 SUMMARY CARDS (Single Row on Desktop & Mobile)   */}
        {/* ================================================== */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
          {/* Card 1: TOTAL ITEMS */}
          <Card className="bg-white border border-[#E8E4DC] rounded-2xl p-3 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#FBF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
              <Boxes className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#77736B] block">
                Total Items
              </span>
              <div className="font-serif text-lg sm:text-3xl font-bold text-[#111215] mt-0.5 sm:mt-1 leading-none">
                {summaryMetrics.totalItems}
              </div>
            </div>
          </Card>

          {/* Card 2: RESERVED */}
          <Card className="bg-white border border-[#E8E4DC] rounded-2xl p-3 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#FBF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
              <CalendarCheck className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#77736B] block">
                Reserved
              </span>
              <div className="font-serif text-lg sm:text-3xl font-bold text-[#111215] mt-0.5 sm:mt-1 leading-none">
                {summaryMetrics.reservedItemsCount}
              </div>
            </div>
          </Card>

          {/* Card 3: LOW / SHORT */}
          <Card className="bg-white border border-[#E8E4DC] rounded-2xl p-3 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-[#FDF2F2] border border-[#F8D7DA] flex items-center justify-center text-[#DC2626] shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#77736B] block">
                Low / Short
              </span>
              <div className="font-serif text-lg sm:text-3xl font-bold text-[#DC2626] mt-0.5 sm:mt-1 leading-none">
                {summaryMetrics.attentionCount}
              </div>
            </div>
          </Card>
        </div>

        {/* ================================================== */}
        {/* STOCK ALERT BANNER                                 */}
        {/* ================================================== */}
        {summaryMetrics.attentionCount > 0 ? (
          <div className="bg-[#FDF2F2] border border-[#F8D7DA] rounded-2xl p-4 sm:p-4.5 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#F8D7DA] flex items-center justify-center text-[#DC2626] shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#991B1B]">
                  {summaryMetrics.attentionCount} items need attention
                </h4>
                <p className="text-[11px] sm:text-xs text-[#7F1D1D] mt-0.5 truncate">
                  {summaryMetrics.attentionItems
                    .slice(0, 2)
                    .map((item) => {
                      const avail = item.totalQty - item.reservedQty;
                      return `${item.name} (${
                        avail < 0 ? `short by ${Math.abs(avail)}` : `low stock`
                      })`;
                    })
                    .join(", ")}
                  {summaryMetrics.attentionCount > 2 &&
                    ` and ${summaryMetrics.attentionCount - 2} more items.`}
                </p>
              </div>
            </div>

            {/* Desktop Action Button */}
            <button
              onClick={() => setOnlyShortages(!onlyShortages)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-[#F8D7DA] text-xs font-semibold text-[#111215] shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              <span>{onlyShortages ? "Show All Items" : "View Shortages"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Action Chevron */}
            <button
              onClick={() => setOnlyShortages(!onlyShortages)}
              className="sm:hidden text-[#991B1B] hover:text-black p-1"
              aria-label="Toggle Shortages Filter"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#166534]">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span className="font-medium">
              All stock requirements are covered. No equipment shortages detected.
            </span>
          </div>
        )}

        {/* ================================================== */}
        {/* SEARCH & CATEGORY FILTER AREA                      */}
        {/* ================================================== */}
        <div className="space-y-3">
          {/* Top Search & Dropdown Row */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-[#E8E4DC] shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8E94A0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search equipment..."
                className="w-full pl-10 pr-3 py-1.5 text-xs bg-transparent border-0 ring-0 focus:outline-none placeholder:text-[#8E94A0] text-[#111215]"
              />
            </div>

            {/* Desktop Category Select */}
            <div className="hidden sm:block">
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 px-3 text-xs bg-white border border-[#E8E4DC] rounded-xl text-[#111215] w-[180px] focus:ring-1 focus:ring-[#C9A45C]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E8E4DC] rounded-xl shadow-md text-xs">
                  {CATEGORY_CHIPS.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setOnlyShortages(!onlyShortages)}
              className={`sm:hidden h-9 px-3 rounded-xl border flex items-center justify-center transition-colors text-xs ${
                onlyShortages
                  ? "bg-[#111215] text-white border-[#111215]"
                  : "bg-white text-[#70757F] border-[#E8E4DC]"
              }`}
              title="Filter Attention"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
            {CATEGORY_CHIPS.map((chip) => {
              const isActive = selectedCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    setSelectedCategory(chip.id);
                    setCurrentPage(1);
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-all shrink-0 cursor-pointer font-medium ${
                    isActive
                      ? "bg-[#111215] text-white shadow-2xs"
                      : "bg-white hover:bg-neutral-50 text-[#71717A] hover:text-[#111215] border border-[#E8E4DC]"
                  }`}
                >
                  <span className="sm:hidden">{chip.shortLabel}</span>
                  <span className="hidden sm:inline">{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================== */}
        {/* DESKTOP INVENTORY TABLE (Hidden on Mobile)         */}
        {/* ================================================== */}
        <div className="hidden sm:block rounded-2xl border border-[#E8E4DC] bg-white overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] text-[#71717A] font-semibold border-b border-[#E8E4DC]">
              <tr>
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Reserved</th>
                <th className="py-3.5 px-4">Available</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE6]">
              {paginatedStock.map((item) => {
                const statusInfo = getStockStatus(
                  item.totalQty,
                  item.reservedQty,
                  item.minThreshold
                );

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF8F5]/60 transition-colors group cursor-pointer"
                    onClick={() => setDetailItem(item)}
                  >
                    {/* Item Name + Line Icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <EquipmentItemIcon name={item.name} category={item.category} />
                        <div>
                          <div className="font-semibold text-sm text-[#111215] group-hover:text-[#C9A45C] transition-colors">
                            {item.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-[#71717A]">
                      {item.category}
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 font-medium text-[#111215]">
                      <div>{item.totalQty}</div>
                      <div className="text-[10px] text-[#8E94A0]">{item.unit}</div>
                    </td>

                    {/* Reserved */}
                    <td className="py-3.5 px-4 font-medium text-[#111215]">
                      {item.reservedQty}
                    </td>

                    {/* Available */}
                    <td className={`py-3.5 px-4 font-bold text-sm ${statusInfo.color}`}>
                      {statusInfo.available}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 font-medium text-xs">
                        <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                        <span className={statusInfo.color}>{statusInfo.status}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailItem(item);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#111215] hover:text-[#C9A45C] transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State in Table */}
          {filteredStock.length === 0 && (
            <div className="p-12 text-center">
              <Boxes className="w-10 h-10 text-[#C9A45C] mx-auto mb-3 opacity-50" />
              <h3 className="font-serif text-base font-bold text-[#111215]">
                No equipment items found
              </h3>
              <p className="text-xs text-[#77736B] mt-1 max-w-sm mx-auto">
                No items match your query. Try clearing filters or add a new equipment item.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setOnlyShortages(false);
                }}
                className="mt-4 text-xs rounded-xl border-[#E8E4DC]"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* MOBILE INVENTORY CARDS (Shown on Mobile)           */}
        {/* ================================================== */}
        <div className="sm:hidden space-y-3">
          {paginatedStock.map((item) => {
            const statusInfo = getStockStatus(
              item.totalQty,
              item.reservedQty,
              item.minThreshold
            );

            return (
              <div
                key={item.id}
                onClick={() => setDetailItem(item)}
                className="bg-white border border-[#E8E4DC] rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.99] transition-all cursor-pointer"
              >
                {/* Top: Icon + Name + Status Pill + Chevron */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <EquipmentItemIcon name={item.name} category={item.category} />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-[#111215] leading-snug line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#71717A] mt-0.5">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.badgeBg}`}
                    >
                      {statusInfo.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#8E94A0]" />
                  </div>
                </div>

                {/* Bottom 3-Stat Strip */}
                <div className="grid grid-cols-3 pt-3 mt-3 border-t border-[#F0EDE6] text-xs">
                  <div>
                    <span className="text-[10px] text-[#8E94A0] block">Total</span>
                    <span className="font-medium text-[#111215]">
                      {item.totalQty}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E94A0] block">Reserved</span>
                    <span className="font-medium text-[#111215]">
                      {item.reservedQty}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E94A0] block">Available</span>
                    <span className={`font-bold ${statusInfo.color}`}>
                      {statusInfo.available}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State on Mobile */}
          {filteredStock.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E8E4DC]">
              <Boxes className="w-8 h-8 text-[#C9A45C] mx-auto mb-2 opacity-50" />
              <h3 className="font-serif text-sm font-bold text-[#111215]">
                No equipment items found
              </h3>
              <p className="text-[11px] text-[#77736B] mt-1">
                Try adjusting your search query or category filters.
              </p>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* DESKTOP & MOBILE PAGINATION FOOTER                 */}
        {/* ================================================== */}
        {filteredStock.length > 0 && (
          <div className="flex items-center justify-between pt-2 text-xs text-[#77736B]">
            <div>
              Showing {paginatedStock.length} of {filteredStock.length} items
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="w-8 h-8 rounded-lg border border-[#E8E4DC] bg-white flex items-center justify-center text-[#70757F] hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-[#C9A45C] text-white shadow-2xs"
                      : "border border-[#E8E4DC] bg-white text-[#70757F] hover:bg-neutral-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 rounded-lg border border-[#E8E4DC] bg-white flex items-center justify-center text-[#70757F] hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* MODAL 1: STOCK ITEM DETAILS & EVENT RESERVATIONS   */}
      {/* ================================================== */}
      <Dialog
        open={detailItem !== null}
        onOpenChange={(open) => !open && setDetailItem(null)}
      >
        <DialogContent className="max-w-lg bg-white rounded-2xl p-0 overflow-hidden border border-[#E8E4DC]">
          {detailItem && (() => {
            const statusInfo = getStockStatus(
              detailItem.totalQty,
              detailItem.reservedQty,
              detailItem.minThreshold
            );
            const reservingEvents = getReservingEvents(detailItem.id);

            return (
              <div className="flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-[#F0EDE6] bg-[#FAF8F5]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37] bg-[#FAF6EE] border border-[#EEDBBD]/60 px-2 py-0.5 rounded">
                      {detailItem.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeBg}`}
                    >
                      {statusInfo.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#111215] mt-2">
                    {detailItem.name}
                  </h3>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Storage: {detailItem.location} • Min Threshold: {detailItem.minThreshold} {detailItem.unit}
                  </p>
                </div>

                <div className="p-5 space-y-5 text-xs">
                  {/* 3 Metric Summary Boxes */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-center">
                      <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                        Total
                      </span>
                      <span className="font-serif text-xl font-bold text-[#111215] block mt-0.5">
                        {detailItem.totalQty}
                      </span>
                      <span className="text-[10px] text-[#8E94A0]">{detailItem.unit}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-center">
                      <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                        Reserved
                      </span>
                      <span className="font-serif text-xl font-bold text-[#111215] block mt-0.5">
                        {detailItem.reservedQty}
                      </span>
                      <span className="text-[10px] text-[#8E94A0]">{detailItem.unit}</span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border text-center ${
                        statusInfo.status === "Shortage"
                          ? "bg-[#FDF2F2] border-[#F8D7DA]"
                          : statusInfo.status === "Low"
                          ? "bg-[#FEF3D6]/40 border-[#FDE68A]"
                          : "bg-[#F0FDF4] border-[#DCFCE7]"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                        Available
                      </span>
                      <span
                        className={`font-serif text-xl font-bold block mt-0.5 ${statusInfo.color}`}
                      >
                        {statusInfo.available}
                      </span>
                      <span className="text-[10px] text-[#8E94A0]">{detailItem.unit}</span>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {statusInfo.status === "Shortage" && (
                    <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                        <span>SHORT BY {statusInfo.deficit} {detailItem.unit.toUpperCase()}</span>
                      </div>
                      <button
                        onClick={() => {
                          setEditQtyItem(detailItem);
                          setEditTotalQty(detailItem.totalQty + statusInfo.deficit);
                        }}
                        className="px-3 py-1 bg-white hover:bg-neutral-50 rounded-lg border border-[#FECACA] text-xs font-semibold text-[#111215] cursor-pointer"
                      >
                        Quick Restock +{statusInfo.deficit}
                      </button>
                    </div>
                  )}

                  {/* Event Reservations */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#71717A] mb-2.5">
                      Reserved For Upcoming Events ({reservingEvents.length})
                    </h4>

                    {reservingEvents.length > 0 ? (
                      <div className="divide-y divide-[#F0EDE6] border border-[#E8E4DC] rounded-xl overflow-hidden bg-white">
                        {reservingEvents.map((ev) => (
                          <div
                            key={ev.eventId}
                            className="p-3 flex items-center justify-between gap-3 hover:bg-[#FAF8F5]/50 transition-colors"
                          >
                            <div>
                              <Link
                                to="/events/$id"
                                params={{ id: ev.eventId }}
                                className="font-serif font-bold text-xs text-[#111215] hover:text-[#C9A45C] line-clamp-1"
                              >
                                {ev.eventTitle}
                              </Link>
                              <div className="text-[11px] text-[#8E94A0] mt-0.5">
                                Date: {ev.date} • {ev.guestCount} Guests
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs text-[#111215]">
                                Need: {ev.quantity} {detailItem.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-[#E8E4DC] text-center text-[#71717A]">
                        No active event reservations for this item.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-[#F0EDE6] bg-[#FAF8F5] flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${detailItem.name}" from inventory?`)) {
                        deleteStockItem(detailItem.id);
                        setDetailItem(null);
                        toast.success("Item removed from inventory");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#DC2626] hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Item</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditQtyItem(detailItem);
                        setEditTotalQty(detailItem.totalQty);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#E8E4DC] bg-white hover:bg-neutral-50 text-xs font-semibold text-[#111215] transition-colors cursor-pointer"
                    >
                      Adjust Total Qty
                    </button>
                    <button
                      onClick={() => setDetailItem(null)}
                      className="px-4 py-1.5 rounded-xl bg-[#111215] hover:bg-neutral-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ================================================== */}
      {/* MODAL 2: ADD EQUIPMENT ITEM                        */}
      {/* ================================================== */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md bg-white border border-[#E8E4DC] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-[#111215]">
              Register Equipment Item
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label htmlFor="stockName" className="text-xs text-[#71717A]">
                Equipment / Item Name *
              </Label>
              <Input
                id="stockName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Brass Chafing Dish (Round 6L)"
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-[#71717A]">Category</Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as StockCategory)}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#E8E4DC] rounded-xl text-xs">
                    <SelectItem value="Chafing Dishes">Chafing Dishes</SelectItem>
                    <SelectItem value="Silverware & Cutlery">Silverware & Cutlery</SelectItem>
                    <SelectItem value="Crockery & Glassware">Crockery & Glassware</SelectItem>
                    <SelectItem value="Live Cooking Counters">Live Cooking Counters</SelectItem>
                    <SelectItem value="Linens & Tableware">Linens & Tableware</SelectItem>
                    <SelectItem value="Warmers & Transport">Warmers & Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="unit" className="text-xs text-[#71717A]">
                  Unit of Measure
                </Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="units, pcs, sets"
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="totalQty" className="text-xs text-[#71717A]">
                  Total Quantity *
                </Label>
                <Input
                  id="totalQty"
                  type="number"
                  min={1}
                  value={totalQty}
                  onChange={(e) => setTotalQty(Number(e.target.value))}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="minThreshold" className="text-xs text-[#71717A]">
                  Low Stock Threshold
                </Label>
                <Input
                  id="minThreshold"
                  type="number"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(Number(e.target.value))}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="location" className="text-xs text-[#71717A]">
                Warehouse Storage Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Aisle A-03, Warehouse 1"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-3">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#111215] hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Register Equipment
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================================================== */}
      {/* MODAL 3: ADJUST STOCK QUANTITY                     */}
      {/* ================================================== */}
      <Dialog
        open={editQtyItem !== null}
        onOpenChange={(open) => !open && setEditQtyItem(null)}
      >
        <DialogContent className="max-w-xs bg-white border border-[#E8E4DC] rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-base font-bold text-[#111215]">
              Adjust Stock Quantity
            </DialogTitle>
          </DialogHeader>

          {editQtyItem && (
            <form onSubmit={handleEditSubmit} className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-[#111215]">
                {editQtyItem.name}
              </div>
              <div className="space-y-1">
                <Label htmlFor="editQty" className="text-xs text-[#71717A]">
                  Total Units in Stock
                </Label>
                <Input
                  id="editQty"
                  type="number"
                  min={0}
                  value={editTotalQty}
                  onChange={(e) => setEditTotalQty(Number(e.target.value))}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#111215] hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Update Quantity
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
