import React from "react";
import { Quotation } from "../../lib/types";
import { useOperations } from "../../lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BrandLogo } from "../common/BrandLogo";
import { Printer, MessageCircle, Check, Send, Sparkles, Edit2 } from "lucide-react";
import { toast } from "sonner";

import { RolexQuotationDocument } from "./RolexQuotationDocument";

interface QuotationPreviewModalProps {
  quotation: Quotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (quotationId: string) => void;
}

export function QuotationPreviewModal({
  quotation,
  open,
  onOpenChange,
  onEdit,
}: QuotationPreviewModalProps) {
  const { profile, updateQuotationStatus, events } = useOperations();

  if (!quotation) return null;

  const linkedEvent = events.find((e) => e.id === quotation.eventId);

  const sections = React.useMemo(() => {
    if (!quotation.items || quotation.items.length === 0) {
      return [
        {
          name: "Banquet Feast & Hospitality Setup",
          category: "Main Course",
          items: ["Royal Catering Feast", "Chafing Dishes & Tableware", "Hospitality Service Staff"],
        },
      ];
    }

    const map = new Map<string, string[]>();
    for (const it of quotation.items) {
      const cat = it.category || "Banquet Inclusions";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(it.description || "Banquet Item");
    }

    return Array.from(map.entries()).map(([cat, items]) => ({
      name: cat,
      category: cat,
      items,
    }));
  }, [quotation.items]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = (quotation.clientPhone || "").replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `*ROLEX EVENTS & CATERERS*\n` +
        `Official Quotation: *${quotation.quotationNumber || "QTN"}*\n` +
        `------------------------------------\n` +
        `Dear *${quotation.clientName || "Valued Client"}*,\n\n` +
        `Here is your catering estimate for *${quotation.eventTitle || "Catering Event"}*:\n` +
        `Date: ${quotation.date || "-"}\n\n` +
        `*Grand Total: ₹${(quotation.total || 0).toLocaleString()}*\n\n` +
        `Validity: Until ${quotation.validUntil || "-"}\n` +
        `Warm regards,\n` +
        `Rolex Operations Team`
    );

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, "_blank");

    if (quotation.status === "draft") {
      updateQuotationStatus(quotation.id, "sent");
      toast.success("Quotation marked as Sent via WhatsApp");
    }
  };

  const handleMarkApproved = () => {
    updateQuotationStatus(quotation.id, "approved");
    toast.success("Quotation Approved!", {
      description: `Event "${quotation.eventTitle}" is now Confirmed in the Events Calendar.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-[#E8E4DC] bg-[#FAF6EE] shadow-2xl print:border-none print:shadow-none print:p-0 print:max-h-none print:overflow-visible print:bg-transparent">
        <DialogHeader className="p-4 border-b border-[#E8E4DC] bg-[#FAF8F5] flex flex-row items-center justify-between no-print rolex-screen-only sticky top-0 z-20">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            Quotation Preview — {quotation.quotationNumber}
          </DialogTitle>
          <Badge
            variant="outline"
            className={`capitalize font-semibold ${
              quotation.status === "approved"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : quotation.status === "sent"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {quotation.status}
          </Badge>
        </DialogHeader>

        {/* PRINTABLE INVOICE BODY */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto bg-[#FAF6EE] print:p-0 print:m-0 print:max-h-none print:overflow-visible">
          <RolexQuotationDocument
            clientName={quotation.clientName || linkedEvent?.clientName || "Valued Client"}
            clientPhone={quotation.clientPhone || linkedEvent?.clientPhone || "+91 XXXXX XXXXX"}
            eventTitle={quotation.eventTitle || linkedEvent?.title || "Banquet Event"}
            venue={linkedEvent?.venue || "Bianco Castle, Trivandrum"}
            eventDate={quotation.date || linkedEvent?.date || "18 Oct 2026"}
            eventTiming={linkedEvent?.time || "06:00 PM to 11:00 PM"}
            guestCount={linkedEvent?.guestCount || 1500}
            serviceType={linkedEvent?.eventType || "Buffet"}
            sections={sections}
            grandTotal={quotation.total || 0}
            quotationRemarks={quotation.notes}
            quotationNumber={quotation.quotationNumber}
            dateIssued={quotation.date}
            printId="rolex-active-quotation-print"
          />
        </div>

        {/* ACTION FOOTER */}
        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2 no-print rolex-screen-only">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </Button>
            <Button
              size="sm"
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <MessageCircle className="w-4 h-4" /> Share on WhatsApp
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(quotation.id);
                }}
                className="border-[#C9A45C]/60 text-[#8C7443] hover:bg-[#FAF6EE] gap-1.5 font-medium"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit / Revise Quotation
              </Button>
            )}
            {quotation.status !== "approved" && (
              <Button
                size="sm"
                onClick={handleMarkApproved}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs font-semibold"
              >
                <Check className="w-4 h-4" /> Confirm & Book Event
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
