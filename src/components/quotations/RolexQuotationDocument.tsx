import React from "react";
import { BrandLogo } from "../common/BrandLogo";
import { MapPin, Phone, Calendar, Clock, Users, Utensils } from "lucide-react";

export interface QuotationDocumentSection {
  id?: string;
  name: string;
  category?: string;
  items: string[];
}

export interface RolexQuotationDocumentProps {
  clientName: string;
  clientPhone: string;
  eventTitle: string;
  venue: string;
  eventDate: string;
  eventTiming: string;
  guestCount: number;
  serviceType: string;
  sections: QuotationDocumentSection[];
  grandTotal: number;
  amountInWords?: string;
  quotationRemarks?: string;
  quotationNumber?: string;
  dateIssued?: string;
  className?: string;
  compact?: boolean;
}

// Helper: Convert numbers to Indian Rupees in words
export function formatIndianRupeesInWords(amount: number): string {
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

export function RolexQuotationDocument({
  clientName,
  clientPhone,
  eventTitle,
  venue,
  eventDate,
  eventTiming,
  guestCount,
  serviceType,
  sections,
  grandTotal,
  amountInWords,
  quotationRemarks,
  quotationNumber = "QTN-2026-419",
  dateIssued,
  className = "",
  compact = false,
}: RolexQuotationDocumentProps) {
  const words = amountInWords || formatIndianRupeesInWords(grandTotal);
  const formattedDate = eventDate || dateIssued || "18 Oct 2026";

  return (
    <div
      className={`rolex-print-sheet relative bg-[#FAF6EE] text-[#141518] rounded-3xl border border-[#E7DFCE] p-4 sm:p-7 shadow-lg overflow-hidden font-sans select-none print:shadow-none print:border-none print:rounded-none print:p-0 print:max-h-none print:overflow-visible ${className}`}
    >
      {/* ================================================== */}
      {/* 0. FAINT BACKGROUND WATERMARK                       */}
      {/* ================================================== */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <img
          src="/images/rolex-logo-transparent.png"
          className="w-[85%] max-w-[420px] opacity-[0.035] print:opacity-[0.04] filter grayscale contrast-150 select-none pointer-events-none"
          alt=""
        />
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-5 print:space-y-4">
        {/* ================================================== */}
        {/* 1. TOP LUXURY OBSIDIAN & GOLD BRAND CARD           */}
        {/* ================================================== */}
        <div className="rolex-print-avoid-break bg-[#111215] text-white rounded-2xl p-5 sm:p-6 text-center border border-[#C5A059]/40 shadow-sm relative overflow-hidden print:p-4">
          {/* Subtle gold corner accents */}
          <div className="absolute top-2 left-2 text-[#C5A059]/30 text-xs">╔</div>
          <div className="absolute top-2 right-2 text-[#C5A059]/30 text-xs">╗</div>
          <div className="absolute bottom-2 left-2 text-[#C5A059]/30 text-xs">╚</div>
          <div className="absolute bottom-2 right-2 text-[#C5A059]/30 text-xs">╝</div>

          <div className="flex flex-col items-center">
            {/* Rolex Gold Emblem */}
            <div className="w-12 h-12 rounded-full border border-[#C5A059]/60 flex items-center justify-center bg-[#17181D]/80 p-2 shadow-inner">
              <img
                src="/images/rolex-emblem.png"
                alt="Rolex Emblem"
                className="w-full h-full object-contain filter brightness-110 drop-shadow-xs"
              />
            </div>

            {/* Brand Title */}
            <h2 className="font-serif text-lg sm:text-xl font-bold tracking-[0.22em] text-[#E5C985] mt-2 uppercase">
              Rolex Events & Caterers
            </h2>
            <div className="text-[9px] sm:text-[10.5px] tracking-[0.28em] text-[#C9A45C] uppercase font-semibold mt-0.5">
              Exquisite Culinary Experiences
            </div>

            {/* Decorative Gold Flourish Line */}
            <div className="flex items-center justify-center gap-2 my-2.5 w-full max-w-xs text-[#C5A059]/50">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C5A059]/50" />
              <span className="text-[9px]">◆</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C5A059]/50" />
            </div>

            {/* Contact Pills */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] sm:text-[11px] text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[#C9A45C]" />
                <span>+91 94471 98765, 98470 00000</span>
              </div>
              <div className="hidden sm:inline text-neutral-600">•</div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#C9A45C]" />
                <span>Bianco Castle, Trivandrum, Kerala</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. EVENT METADATA ROWS (INDIVIDUAL PILL STRIPS)    */}
        {/* ================================================== */}
        <div className="rolex-print-avoid-break space-y-1.5 text-xs">
          {/* Row 1: NAME */}
          <div className="bg-white/90 border border-[#EAE2D2] rounded-xl px-4 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              NAME
            </span>
            <span className="font-bold text-xs text-[#111215]">
              {clientName || "Dr. Radhakrishnan Nair"}
            </span>
          </div>

          {/* Row 2: VENUE */}
          <div className="bg-white/90 border border-[#EAE2D2] rounded-xl px-4 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              VENUE
            </span>
            <span className="font-semibold text-xs text-[#111215] text-right truncate max-w-[240px] sm:max-w-none">
              {venue || "Bianco Castle, Trivandrum"}
            </span>
          </div>

          {/* Row 3: GUEST COUNT (PAX) */}
          <div className="bg-white/90 border border-[#EAE2D2] rounded-xl px-4 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              GUEST COUNT (PAX)
            </span>
            <span className="font-bold text-xs text-[#111215]">
              {guestCount ? `${guestCount.toLocaleString()} Pax` : "1500 Pax"}
            </span>
          </div>

          {/* Row 4: EVENT DATE */}
          <div className="bg-white/90 border border-[#EAE2D2] rounded-xl px-4 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              EVENT DATE
            </span>
            <span className="font-semibold text-xs text-[#111215]">
              {formattedDate}
            </span>
          </div>

          {/* Row 5: TIMING */}
          <div className="bg-white/90 border border-[#EAE2D2] rounded-xl px-4 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              TIMING
            </span>
            <span className="font-semibold text-xs text-[#111215]">
              {eventTiming || "06:00 PM to 11:00 PM"}
            </span>
          </div>

          {/* Row 6: TYPE OF SERVICE */}
          <div className="bg-white/90 border border-[#EAE2D2] rounded-xl px-4 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              TYPE OF SERVICE
            </span>
            <span className="font-bold text-xs text-[#111215] uppercase tracking-wide">
              {serviceType || "BUFFET"}
            </span>
          </div>
        </div>

        {/* ================================================== */}
        {/* 3. MENU SECTIONS & INCLUSIONS                      */}
        {/* ================================================== */}
        <div className="space-y-3 pt-1">
          {sections.map((sec, idx) => (
            <div key={sec.id || idx} className="rolex-print-avoid-break space-y-1.5 py-1">
              {/* Champagne Gold Banner Bar */}
              <div className="bg-[#F8F2E4] border border-[#E5DBBE] rounded-lg py-1.5 px-3 text-center shadow-2xs">
                <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#7D5E1F] block">
                  {sec.name}
                </span>
              </div>

              {/* Items List with Diamonds */}
              {sec.items && sec.items.length > 0 ? (
                <div className="space-y-1 px-3 sm:px-4 py-0.5">
                  {sec.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="flex items-start gap-2.5 text-xs text-[#1C1D21] font-medium"
                    >
                      <span className="text-[#C5A059] text-[9px] mt-0.5 select-none">
                        ◆
                      </span>
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-stone-400 italic py-1">
                  No items listed
                </div>
              )}

              {/* Decorative Flourish Divider between sections */}
              <div className="flex items-center justify-center gap-2 py-0.5 text-[#C5A059]/40">
                <span className="h-[1px] w-10 bg-[#C5A059]/30" />
                <span className="text-[8px] text-[#C5A059]/60">◆</span>
                <span className="h-[1px] w-10 bg-[#C5A059]/30" />
              </div>
            </div>
          ))}
        </div>

        {/* ================================================== */}
        {/* 4. TOTAL QUOTATION AMOUNT CARD                     */}
        {/* ================================================== */}
        <div className="rolex-print-avoid-break bg-[#111215] text-white rounded-2xl p-5 sm:p-6 text-center border border-[#C5A059]/50 shadow-md space-y-2 relative overflow-hidden print:p-4">
          <span className="text-[9.5px] sm:text-[10px] font-bold text-[#C9A45C] uppercase tracking-[0.2em] block">
            TOTAL QUOTATION AMOUNT
          </span>
          <div className="text-[10px] text-neutral-300 tracking-wider uppercase font-medium">
            For {guestCount ? guestCount.toLocaleString() : "1,500"} Pax •{" "}
            {sections.length} Menu Sections • Full Service Setup
          </div>

          <div className="font-serif text-3xl sm:text-4xl font-bold text-[#F3E5C8] tracking-tight pt-1">
            ₹ {grandTotal.toLocaleString("en-IN")} /-
          </div>

          <div className="pt-2 border-t border-[#C5A059]/30 text-[10px] sm:text-[11px] text-[#E5C985] italic">
            Amount in Words: {words}
          </div>
        </div>

        {/* ================================================== */}
        {/* 5. QUOTATION REMARKS & TERMS BOX                   */}
        {/* ================================================== */}
        {quotationRemarks && (
          <div className="rolex-print-avoid-break bg-white/90 border border-[#EAE2D2] rounded-xl p-3.5 sm:p-4 text-xs text-[#52525B] leading-relaxed shadow-2xs space-y-1">
            <span className="font-bold text-[#8C7443] text-[10px] uppercase tracking-wider block">
              Special Instructions & Terms:
            </span>
            <p className="text-[11px] sm:text-xs text-[#1F2024] whitespace-pre-line">
              {quotationRemarks}
            </p>
          </div>
        )}

        {/* ================================================== */}
        {/* 6. SIGN-OFF & FOOTER CREDENTIALS                   */}
        {/* ================================================== */}
        <div className="rolex-print-avoid-break pt-2 sm:pt-3 text-xs text-[#70757F] space-y-1">
          <div className="font-serif font-semibold text-[#111215]">Thanking You,</div>
          <div className="font-bold text-[#8C7443] text-sm font-serif">Rolex Caterers</div>
          <div className="text-[11px] text-[#70757F]">For ROLEX Events & Caterers</div>
          <div className="text-[10px] text-[#8E94A0] pt-0.5">Date: {formattedDate}</div>
        </div>
      </div>
    </div>
  );
}
