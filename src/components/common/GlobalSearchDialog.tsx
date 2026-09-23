import React, { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useOperations } from "../../lib/store";
import {
  Calendar,
  Users,
  Package,
  FileText,
  Search,
  ArrowRight,
} from "lucide-react";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { events, clients, stock, quotations } = useOperations();

  // Reset query on open
  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const cleanQuery = query.toLowerCase().trim();

  const matchingEvents = cleanQuery
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(cleanQuery) ||
          e.clientName.toLowerCase().includes(cleanQuery) ||
          e.venue.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingClients = cleanQuery
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.phone.includes(cleanQuery) ||
          (c.company && c.company.toLowerCase().includes(cleanQuery))
      )
    : [];

  const matchingStock = cleanQuery
    ? stock.filter(
        (s) =>
          s.name.toLowerCase().includes(cleanQuery) ||
          s.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingQuotations = cleanQuery
    ? quotations.filter(
        (q) =>
          q.quotationNumber.toLowerCase().includes(cleanQuery) ||
          q.clientName.toLowerCase().includes(cleanQuery) ||
          q.eventTitle.toLowerCase().includes(cleanQuery)
      )
    : [];

  const hasResults =
    matchingEvents.length > 0 ||
    matchingClients.length > 0 ||
    matchingStock.length > 0 ||
    matchingQuotations.length > 0;

  const navigateTo = (path: string) => {
    onOpenChange(false);
    router.navigate({ href: path });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-border/80 shadow-2xl">
        <DialogHeader className="p-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, clients, equipment, quotations..."
              className="border-none shadow-none focus-visible:ring-0 text-base bg-transparent p-0 h-auto"
              autoFocus
            />
            <Badge variant="outline" className="text-xs text-muted-foreground">
              ESC to close
            </Badge>
          </div>
          <DialogTitle className="sr-only">Global Search</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!cleanQuery && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                Type to search across active events, VIP clients, inventory, or billing.
              </p>
              <div className="flex justify-center gap-2 mt-4 text-xs">
                <span className="px-2 py-1 bg-muted rounded">Events</span>
                <span className="px-2 py-1 bg-muted rounded">Clients</span>
                <span className="px-2 py-1 bg-muted rounded">Equipment</span>
                <span className="px-2 py-1 bg-muted rounded">Quotations</span>
              </div>
            </div>
          )}

          {cleanQuery && !hasResults && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No results found for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {/* Events */}
          {matchingEvents.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C5A059]" /> Events (
                {matchingEvents.length})
              </div>
              <div className="space-y-1">
                {matchingEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => navigateTo(`/events/${ev.id}`)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-accent/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-sm text-foreground group-hover:text-primary">
                        {ev.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{ev.date}</span>
                        <span>•</span>
                        <span>{ev.clientName}</span>
                        <span>•</span>
                        <span>{ev.guestCount} guests</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clients */}
          {matchingClients.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C5A059]" /> Clients (
                {matchingClients.length})
              </div>
              <div className="space-y-1">
                {matchingClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => navigateTo("/clients")}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-accent/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {client.name}
                        {client.vip && (
                          <Badge className="bg-[#C5A059] text-white text-[10px] px-1.5 py-0 h-4">
                            VIP
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {client.phone} {client.company && `• ${client.company}`}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          {matchingStock.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#C5A059]" /> Stock &
                Equipment ({matchingStock.length})
              </div>
              <div className="space-y-1">
                {matchingStock.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo("/stock")}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-accent/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.category} • Total: {item.totalQty} {item.unit} (
                        {item.totalQty - item.reservedQty} available)
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quotations */}
          {matchingQuotations.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C5A059]" /> Quotations (
                {matchingQuotations.length})
              </div>
              <div className="space-y-1">
                {matchingQuotations.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => navigateTo("/quotations")}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-accent/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {q.quotationNumber} — {q.clientName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ₹{q.total.toLocaleString()} • {q.eventTitle} • Status:{" "}
                        {q.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
