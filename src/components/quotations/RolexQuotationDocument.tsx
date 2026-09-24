import React from "react";
import { MapPin, Phone } from "lucide-react";

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
  printId?: string;
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

function formatDateDisplay(rawDate?: string): string {
  if (!rawDate) return "06.11.2026";
  if (rawDate.includes(".")) return rawDate;
  const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}.${match[2]}.${match[1]}`;
  }
  return rawDate;
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
  printId,
}: RolexQuotationDocumentProps) {
  const words = amountInWords || formatIndianRupeesInWords(grandTotal);
  const formattedDate = formatDateDisplay(eventDate || dateIssued);

  return (
    <div
      id={printId}
      className={`rolex-print-sheet relative bg-[#FAF6EE] text-[#141518] rounded-3xl border border-[#E7DFCE] p-4 sm:p-7 shadow-lg font-sans select-none print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0 print:max-h-none print:overflow-visible ${className}`}
    >
      {/* ================================================== */}
      {/* 0. FAINT BACKGROUND WATERMARK                       */}
      {/* ================================================== */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <img
          src="/images/rolex-emblem.png"
          className="w-[340px] opacity-[0.035] filter grayscale contrast-125 select-none pointer-events-none"
          alt=""
        />
      </div>

      <div className="relative z-10 space-y-3 sm:space-y-3.5 print:space-y-3">
        {/* ================================================== */}
        {/* 1. TOP LUXURY OBSIDIAN & GOLD BRAND HEADER CARD    */}
        {/* ================================================== */}
        <div className="rolex-print-avoid-break bg-[#121316] text-white rounded-2xl p-4 sm:p-5 border border-[#C5A059]/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 print:p-4 print:rounded-xl">
          {/* Left: Brand Emblem + Title & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full border border-[#C5A059]/70 flex items-center justify-center bg-[#1B1C22] p-1.5 shadow-inner shrink-0">
              <img
                src="/images/rolex-emblem.png"
                alt="Rolex Emblem"
                className="w-full h-full object-contain filter brightness-110 drop-shadow-xs"
              />
            </div>
            <div className="text-left">
              <h2 className="font-serif text-base sm:text-lg font-bold tracking-[0.2em] text-[#E5C985] uppercase leading-tight">
                Rolex Events & Caterers
              </h2>
              <div className="text-[8px] sm:text-[9px] tracking-[0.22em] text-[#C9A45C] uppercase font-semibold mt-0.5">
                Exquisite Culinary Experiences & Premium Event Planning
              </div>
            </div>
          </div>

          {/* Right: Contact & Location Stack */}
          <div className="text-right text-[10px] sm:text-[11px] text-neutral-300 space-y-1 shrink-0 self-end sm:self-auto">
            <div className="flex items-center justify-end gap-1.5 font-medium">
              <Phone className="w-3 h-3 text-[#C9A45C]" />
              <span>+91 9947460000</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 font-medium">
              <Phone className="w-3 h-3 text-[#C9A45C]" />
              <span>9207177777</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-neutral-400">
              <MapPin className="w-3 h-3 text-[#C9A45C]" />
              <span>Poongotukulam, Tirur, Kerala</span>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. EVENT METADATA ROWS (2-COLUMN PILL GRID)        */}
        {/* ================================================== */}
        <div className="rolex-print-avoid-break grid grid-cols-2 gap-2 text-xs">
          {/* Card 1: NAME */}
          <div className="bg-white border border-[#EAE2D2] rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              NAME:
            </span>
            <span className="font-bold text-xs text-[#111215] uppercase truncate max-w-[170px] sm:max-w-none">
              {clientName || "MR. RAJU CHACKO"}
            </span>
          </div>

          {/* Card 2: VENUE */}
          <div className="bg-white border border-[#EAE2D2] rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              VENUE:
            </span>
            <span className="font-bold text-xs text-[#111215] uppercase truncate max-w-[170px] sm:max-w-none">
              {venue || "BIANCO CASTE TIRUR"}
            </span>
          </div>

          {/* Card 3: GUARANTEED PAX */}
          <div className="bg-white border border-[#EAE2D2] rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              GUARANTEED PAX:
            </span>
            <span className="font-bold text-xs text-[#111215] uppercase">
              {guestCount ? `${guestCount.toLocaleString()} PAX` : "1500 PAX"}
            </span>
          </div>

          {/* Card 4: EVENT DATE */}
          <div className="bg-white border border-[#EAE2D2] rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              EVENT DATE:
            </span>
            <span className="font-bold text-xs text-[#111215]">
              {formattedDate}
            </span>
          </div>

          {/* Card 5: TYPE OF SERVICE */}
          <div className="bg-white border border-[#EAE2D2] rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              TYPE OF SERVICE:
            </span>
            <span className="font-bold text-xs text-[#111215] uppercase tracking-wide">
              {serviceType || "BUFFET"}
            </span>
          </div>

          {/* Card 6: TIMING / QUOTATION ID */}
          <div className="bg-white border border-[#EAE2D2] rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs">
            <span className="text-[10px] font-bold text-[#8C7443] uppercase tracking-wider">
              {eventTiming ? "TIMING:" : "QUOTE ID:"}
            </span>
            <span className="font-bold text-xs text-[#111215] uppercase">
              {eventTiming || quotationNumber || "06:00 PM to 11:00 PM"}
            </span>
          </div>
        </div>

        {/* ================================================== */}
        {/* 3. MENU SECTIONS (2-COLUMN ITEMS MATCHING PDF 2)   */}
        {/* ================================================== */}
        <div className="space-y-2.5 pt-0.5">
          {sections.map((sec, idx) => (
            <div key={sec.id || idx} className="rolex-print-avoid-break space-y-1 py-0.5">
              {/* Champagne Gold Banner Bar */}
              <div className="bg-[#F8F2E4] border border-[#E5DBBE] rounded-lg py-1.5 px-3 text-center shadow-2xs">
                <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#7D5E1F] block">
                  {sec.name}
                </span>
              </div>

              {/* 2-COLUMN ITEM GRID */}
              {sec.items && sec.items.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-1 px-3 sm:px-4 py-0.5">
                  {sec.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="flex items-start gap-2 text-xs font-semibold text-[#1C1D21] uppercase tracking-wide leading-snug"
                    >
                      <span className="text-[#C5A059] text-[9px] mt-0.5 select-none shrink-0">
                        ◆
                      </span>
                      <span className="truncate">{item}</span>
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
                <span className="h-[1px] w-12 bg-[#C5A059]/30" />
                <span className="text-[8px] text-[#C5A059]/60">◆</span>
                <span className="h-[1px] w-12 bg-[#C5A059]/30" />
              </div>
            </div>
          ))}
        </div>

        {/* ================================================== */}
        {/* 4. TOTAL INVESTMENT QUOTE CARD (PDF 2)             */}
        {/* ================================================== */}
        <div className="rolex-print-avoid-break bg-[#121316] text-white rounded-2xl p-4 sm:p-5 border border-[#C5A059]/60 shadow-md space-y-2.5 print:p-4 print:rounded-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#C9A45C] uppercase tracking-[0.2em] block">
                TOTAL INVESTMENT QUOTE
              </span>
              <div className="text-[11px] text-neutral-300 mt-0.5">
                Inclusive of full menu, service management, and event setup
              </div>
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#F3E5C8] tracking-tight">
              ₹ {grandTotal.toLocaleString("en-IN")} /-
            </div>
          </div>

          <div className="pt-2 border-t border-[#C5A059]/30 text-xs text-[#E5C985]">
            <span className="font-bold tracking-wider uppercase text-[10px] text-[#C9A45C]">
              AMOUNT IN WORDS:
            </span>{" "}
            <span className="italic font-serif">({words})</span>
          </div>
        </div>

        {/* ================================================== */}
        {/* 5. QUOTATION REMARKS & TERMS BOX (PDF 2)           */}
        {/* ================================================== */}
        <div className="rolex-print-avoid-break bg-white/90 border border-[#EAE2D2] rounded-xl p-4 text-xs text-[#2A2B30] leading-relaxed shadow-2xs">
          <p>
            {quotationRemarks ||
              "We hope our quotation is in line with your requirement. If you need further clarification in this regard please do not hesitate to call or write to us. We look forward to the pleasure of receiving your positive action."}
          </p>
        </div>

        {/* ================================================== */}
        {/* 6. SIGN-OFF & FOOTER CREDENTIALS (PDF 2)           */}
        {/* ================================================== */}
        <div className="rolex-print-avoid-break pt-2 sm:pt-3 text-xs text-[#52525B] space-y-1">
          <div className="font-serif font-bold text-sm text-[#111215]">Thanking You</div>
          <div className="text-xs text-[#70757F] italic">Yours faithfully</div>
          <div className="font-semibold text-xs text-[#111215] pt-0.5">For Rolex Events & Caterers</div>
          <div className="text-[11px] text-[#70757F]">Date: {formattedDate}</div>
        </div>
      </div>
    </div>
  );
}
