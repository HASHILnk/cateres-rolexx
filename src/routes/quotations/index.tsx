import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../../components/layout/AppShell";
import { useOperations } from "../../lib/store";
import { Quotation } from "../../lib/types";
import { QuotationPreviewModal } from "../../components/quotations/QuotationPreviewModal";
import { QuotationBuilder } from "../../components/quotations/QuotationBuilder";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  FileText,
  Search,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";

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
  
  // In-place Quotation Builder workspace state
  const [isCreating, setIsCreating] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("new") === "true" || params.get("action") === "create";
    }
    return false;
  });

  const [editingQuotationId, setEditingQuotationId] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("id") || undefined;
    }
    return undefined;
  });

  // Sync browser URL history without reloading page
  const handleOpenCreate = (id?: string) => {
    setEditingQuotationId(id);
    setIsCreating(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("new", "true");
      if (id) {
        url.searchParams.set("id", id);
      } else {
        url.searchParams.delete("id");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleBackToList = () => {
    setIsCreating(false);
    setEditingQuotationId(undefined);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      url.searchParams.delete("id");
      url.searchParams.delete("action");
      window.history.pushState({}, "", url.toString());
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const isNew = params.get("new") === "true" || params.get("action") === "create";
      setIsCreating(isNew);
      setEditingQuotationId(params.get("id") || undefined);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const filteredQuotations = quotations.filter((q) => {
    const qNum = (q.quotationNumber || "").toLowerCase();
    const cName = (q.clientName || "").toLowerCase();
    const eTitle = (q.eventTitle || "").toLowerCase();
    const qSearch = (search || "").toLowerCase().trim();
    const matchesSearch =
      !qSearch ||
      qNum.includes(qSearch) ||
      cName.includes(qSearch) ||
      eTitle.includes(qSearch);
    const matchesStatus =
      statusFilter === "all" ? true : q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalQuotedValue = quotations.reduce((sum, q) => sum + (q.total || 0), 0);
  const approvedValue = quotations
    .filter((q) => q.status === "approved")
    .reduce((sum, q) => sum + (q.total || 0), 0);

  return (
    <AppShell>
      {isCreating ? (
        <QuotationBuilder
          onBack={handleBackToList}
          initialQuotationId={editingQuotationId}
        />
      ) : (
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
              onClick={() => handleOpenCreate()}
              className="bg-black hover:bg-neutral-800 dark:bg-[#C5A059] dark:hover:bg-[#B59049] dark:text-black text-white font-semibold text-xs h-10 px-4 gap-2 cursor-pointer shadow-xs"
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
                {filteredQuotations.length > 0 ? (
                  filteredQuotations.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/30">
                      <td className="p-3.5 font-bold font-serif text-sm text-[#8F702F] dark:text-[#E0BA6E]">
                        {q.quotationNumber || "QTN-001"}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-foreground text-sm">
                          {q.eventTitle || "Banquet Event"}
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                          {q.clientName || "Client"} • {q.clientPhone || "No Phone"}
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground">{q.date || "-"}</td>
                      <td className="p-3.5 text-muted-foreground">{q.validUntil || "-"}</td>
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
                          {q.status || "draft"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right font-bold text-sm text-foreground">
                        ₹{(q.total || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {q.status !== "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateQuotationStatus(q.id, "approved");
                              toast.success(`Quotation ${q.quotationNumber} approved!`, {
                                description: `Event "${q.eventTitle}" is now Confirmed in Events calendar.`,
                              });
                            }}
                            className="text-xs h-8 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Confirm Event
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCreate(q.id)}
                          className="text-xs h-8 border-[#C9A45C]/50 text-[#8C7443] hover:bg-[#FAF6EE] dark:hover:bg-[#8C7443]/10"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit / Revise
                        </Button>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <div className="font-semibold text-foreground text-sm">No Quotations Found</div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Draft your first client quotation using the button above.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      <QuotationPreviewModal
        quotation={activeQuotation}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onEdit={(id) => handleOpenCreate(id)}
      />
    </AppShell>
  );
}
