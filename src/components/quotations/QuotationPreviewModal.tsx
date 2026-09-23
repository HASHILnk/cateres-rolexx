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
import { Printer, MessageCircle, Check, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface QuotationPreviewModalProps {
  quotation: Quotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuotationPreviewModal({
  quotation,
  open,
  onOpenChange,
}: QuotationPreviewModalProps) {
  const { profile, updateQuotationStatus } = useOperations();

  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = quotation.clientPhone.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `*ROLEX EVENTS & CATERERS*\n` +
        `Official Quotation: *${quotation.quotationNumber}*\n` +
        `------------------------------------\n` +
        `Dear *${quotation.clientName}*,\n\n` +
        `Here is the quotation for *${quotation.eventTitle}*:\n` +
        `Date: ${quotation.date}\n\n` +
        `*Breakdown:*\n` +
        quotation.items
          .map(
            (i) =>
              `• ${i.description} (x${i.qty}) — ₹${i.amount.toLocaleString()}`
          )
          .join("\n") +
        `\n\n` +
        `Subtotal: ₹${quotation.subtotal.toLocaleString()}\n` +
        `Discount: ${quotation.discountPercentage}%\n` +
        `GST (${quotation.taxPercentage}%): Included\n` +
        `*Grand Total: ₹${quotation.total.toLocaleString()}*\n\n` +
        `Validity: Until ${quotation.validUntil}\n` +
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
    toast.success("Quotation marked as Approved!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-border shadow-2xl print:border-none print:shadow-none">
        <DialogHeader className="p-4 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between no-print">
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
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6 bg-card print:p-0 print:max-h-none print:overflow-visible">
          {/* Top Brand Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
            <div>
              <BrandLogo size="md" />
              <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                {profile.address} • Phone: {profile.phone}
              </p>
              <p className="text-xs font-medium text-foreground">
                GSTIN: {profile.gstNumber}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Official Estimate / Quotation
              </div>
              <div className="text-xl font-bold font-serif text-[#8F702F] dark:text-[#E0BA6E]">
                {quotation.quotationNumber}
              </div>
              <div className="text-xs text-muted-foreground">
                Issued: {quotation.date}
              </div>
              <div className="text-xs text-muted-foreground">
                Valid Until: {quotation.validUntil}
              </div>
            </div>
          </div>

          {/* Client & Event Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/60 text-xs">
            <div>
              <div className="text-muted-foreground uppercase font-semibold text-[10px] tracking-wider mb-1">
                Billed To:
              </div>
              <div className="font-bold text-sm text-foreground">
                {quotation.clientName}
              </div>
              <div className="text-muted-foreground">{quotation.clientPhone}</div>
              {quotation.clientEmail && (
                <div className="text-muted-foreground">
                  {quotation.clientEmail}
                </div>
              )}
            </div>

            <div>
              <div className="text-muted-foreground uppercase font-semibold text-[10px] tracking-wider mb-1">
                Event Occasion:
              </div>
              <div className="font-bold text-sm text-foreground">
                {quotation.eventTitle}
              </div>
              <div className="text-muted-foreground">
                Catering Service Package
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-border/60 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Rate (₹)</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {quotation.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium text-foreground">
                      {item.description}
                      {item.category && (
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          {item.category}
                        </span>
                      )}
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

          {/* Totals Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-xs text-muted-foreground max-w-sm space-y-1">
              <div className="font-semibold text-foreground text-[11px]">
                Terms & Conditions:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {profile.quotationTerms.slice(0, 3).map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ul>
              {quotation.notes && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-900 dark:text-amber-200 mt-2">
                  <strong>Special Note:</strong> {quotation.notes}
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  ₹{quotation.subtotal.toLocaleString()}
                </span>
              </div>
              {quotation.discountPercentage > 0 && (
                <div className="flex justify-between py-1 border-b border-border/40 text-emerald-600 dark:text-emerald-400">
                  <span>Discount ({quotation.discountPercentage}%)</span>
                  <span>
                    -₹
                    {(
                      (quotation.subtotal * quotation.discountPercentage) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">
                  GST ({quotation.taxPercentage}%)
                </span>
                <span>
                  ₹
                  {(
                    ((quotation.subtotal *
                      (100 - quotation.discountPercentage)) /
                      100) *
                    (quotation.taxPercentage / 100)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sm bg-muted/40 p-2 rounded text-foreground">
                <span className="font-serif">Grand Total</span>
                <span className="text-[#8F702F] dark:text-[#E0BA6E]">
                  ₹{quotation.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-8 border-t border-border/60 flex justify-between items-end text-xs text-muted-foreground">
            <div>
              <p>For ROLEX Events & Caterers</p>
              <div className="mt-8 border-b border-border/80 w-36" />
              <p className="mt-1">Authorized Signatory</p>
            </div>
            <div className="text-right">
              <p>Client Acceptance</p>
              <div className="mt-8 border-b border-border/80 w-36 ml-auto" />
              <p className="mt-1">Signature & Date</p>
            </div>
          </div>
        </div>

        {/* ACTION FOOTER */}
        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2 no-print">
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
            {quotation.status !== "approved" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkApproved}
                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 gap-1.5"
              >
                <Check className="w-4 h-4" /> Mark Approved
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
