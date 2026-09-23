import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../../components/layout/AppShell";
import { useOperations } from "../../lib/store";
import { Quotation, QuotationLineItem } from "../../lib/types";
import { QuotationPreviewModal } from "../../components/quotations/QuotationPreviewModal";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
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
  FileText,
  Search,
  Plus,
  Printer,
  MessageCircle,
  Check,
  TrendingUp,
  Clock,
  Sparkles,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/quotations/")({
  component: QuotationsPage,
});

function QuotationsPage() {
  const { quotations, events, clients, createQuotation, updateQuotationStatus } =
    useOperations();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeQuotation, setActiveQuotation] = useState<Quotation | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);

  // New Quotation form state
  const [selectedEventId, setSelectedEventId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [items, setItems] = useState<QuotationLineItem[]>([
    {
      id: "item-1",
      description: "Royal 5-Course Banquet Feast (Per Plate)",
      qty: 350,
      unitPrice: 1250,
      amount: 437500,
    },
    {
      id: "item-2",
      description: "Live Tandoor & Chaat Cooking Station Setup",
      qty: 2,
      unitPrice: 25000,
      amount: 50000,
    },
  ]);

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      q.eventTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalQuotedValue = quotations.reduce((sum, q) => sum + q.total, 0);
  const approvedValue = quotations
    .filter((q) => q.status === "approved")
    .reduce((sum, q) => sum + q.total, 0);

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      setEventTitle(ev.title);
      setClientName(ev.clientName);
      setClientPhone(ev.clientPhone);
      setValidUntil(ev.date);
      setItems([
        {
          id: `item-${Date.now()}-1`,
          description: `${ev.packageTier} Catering Feast (${ev.guestCount} Guests)`,
          qty: ev.guestCount,
          unitPrice: Math.round((ev.budget * 0.8) / ev.guestCount),
          amount: Math.round(ev.budget * 0.8),
        },
        {
          id: `item-${Date.now()}-2`,
          description: "Chafing Ware & Hospitality Service Setup",
          qty: 1,
          unitPrice: Math.round(ev.budget * 0.2),
          amount: Math.round(ev.budget * 0.2),
        },
      ]);
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "Custom Catering Inclusion",
        qty: 1,
        unitPrice: 15000,
        amount: 15000,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: "description" | "qty" | "unitPrice",
    val: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === "qty" || field === "unitPrice") {
          updated.amount = (updated.qty || 0) * (updated.unitPrice || 0);
        }
        return updated;
      })
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !eventTitle.trim()) return;

    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    const discountAmount = (subtotal * discountPct) / 100;
    const taxable = subtotal - discountAmount;
    const taxAmount = Math.round(taxable * 0.18);
    const total = Math.round(taxable + taxAmount);

    const newQ = createQuotation({
      eventId: selectedEventId || undefined,
      eventTitle,
      clientName,
      clientPhone,
      date: new Date().toISOString().split("T")[0] ?? "2026-09-23",
      validUntil: validUntil || (new Date().toISOString().split("T")[0] ?? "2026-09-23"),
      items,
      subtotal,
      discountPercentage: discountPct,
      taxPercentage: 18,
      total,
      status: "draft",
    });

    setNewModalOpen(false);
    toast.success(`Created quotation ${newQ.quotationNumber}!`);
    setActiveQuotation(newQ);
    setPreviewOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Quotations & Invoicing Center
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Draft, preview, print, and WhatsApp official itemized catering
              estimates ({quotations.length} records)
            </p>
          </div>

          <Button
            onClick={() => setNewModalOpen(true)}
            className="bg-black hover:bg-neutral-800 dark:bg-[#C5A059] dark:hover:bg-[#B59049] dark:text-black text-white font-semibold text-xs h-10 px-4 gap-2"
          >
            <Plus className="w-4 h-4" /> Create Quotation
          </Button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/80 shadow-xs p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Total Quotations Issued
              </span>
              <div className="text-2xl font-bold font-serif mt-1">
                {quotations.length} Estimates
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </Card>

          <Card className="border-border/80 shadow-xs p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Approved Pipeline Value
              </span>
              <div className="text-2xl font-bold font-serif mt-1 text-emerald-600 dark:text-emerald-400">
                ₹{approvedValue.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </Card>

          <Card className="border-border/80 shadow-xs p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Pending Approvals
              </span>
              <div className="text-2xl font-bold font-serif mt-1 text-amber-600 dark:text-amber-400">
                {quotations.filter((q) => q.status === "sent" || q.status === "draft").length} Estimates
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border/80">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotation #, client or event..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="sent">Sent to Client</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TABLE */}
        <div className="border border-border/80 rounded-xl bg-card overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/60">
              <tr>
                <th className="p-3.5">Quotation #</th>
                <th className="p-3.5">Event & Client</th>
                <th className="p-3.5">Date Issued</th>
                <th className="p-3.5">Valid Until</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Grand Total (₹)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredQuotations.map((q) => (
                <tr key={q.id} className="hover:bg-muted/30">
                  <td className="p-3.5 font-bold font-serif text-sm text-[#8F702F] dark:text-[#E0BA6E]">
                    {q.quotationNumber}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-foreground text-sm">
                      {q.eventTitle}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      {q.clientName} • {q.clientPhone}
                    </div>
                  </td>
                  <td className="p-3.5 text-muted-foreground">{q.date}</td>
                  <td className="p-3.5 text-muted-foreground">{q.validUntil}</td>
                  <td className="p-3.5">
                    <Badge
                      variant="outline"
                      className={`capitalize text-[10px] font-semibold ${
                        q.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : q.status === "sent"
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {q.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right font-bold text-sm text-foreground">
                    ₹{q.total.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveQuotation(q);
                        setPreviewOpen(true);
                      }}
                      className="text-xs h-8"
                    >
                      Preview / Print
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE QUOTATION MODAL */}
      <Dialog open={newModalOpen} onOpenChange={setNewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold">
              Draft New Quotation
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">
                Link to Scheduled Event (Optional)
              </Label>
              <Select
                value={selectedEventId}
                onValueChange={handleEventSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose event or standalone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Standalone Quotation</SelectItem>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title} ({e.date}) — {e.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="qEventTitle" className="text-xs">
                  Event / Occasion Title *
                </Label>
                <Input
                  id="qEventTitle"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Royal Wedding Banquet"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="qValidUntil" className="text-xs">
                  Quotation Valid Until
                </Label>
                <Input
                  id="qValidUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="qClientName" className="text-xs">
                  Client Name *
                </Label>
                <Input
                  id="qClientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Sanjay Singhania"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="qClientPhone" className="text-xs">
                  Client Mobile *
                </Label>
                <Input
                  id="qClientPhone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98470 00000"
                  required
                />
              </div>
            </div>

            {/* Line Items Builder */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Line Items & Charges
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line Item
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-muted/30 border border-border/40 text-xs"
                  >
                    <div className="col-span-6">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Description"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "qty",
                            Number(e.target.value)
                          )
                        }
                        placeholder="Qty"
                        className="h-8 text-xs text-right"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "unitPrice",
                            Number(e.target.value)
                          )
                        }
                        placeholder="Rate"
                        className="h-8 text-xs text-right"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <Label htmlFor="discPct" className="text-xs">
                  Discount Percentage (%)
                </Label>
                <Input
                  id="discPct"
                  type="number"
                  min={0}
                  max={100}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-black text-white text-xs">
                Create & Preview Quotation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PREVIEW MODAL */}
      <QuotationPreviewModal
        quotation={activeQuotation}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </AppShell>
  );
}
