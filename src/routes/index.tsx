import React, { useState, useMemo } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { useOperations } from "../lib/store";
import { useAuth } from "../lib/auth-context";
import { NewEventModal } from "../components/events/NewEventModal";
import {
  CalendarDays,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckSquare,
  ChevronRight,
  Plus,
  MapPin,
  Utensils,
  Wine,
  Armchair,
  LayoutGrid,
  Soup,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function formatEventDate(dateStr: string) {
  if (!dateStr) return "Date TBD";
  try {
    const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getEventStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return { label: "Confirmed", style: "bg-[#E8F6ED] text-[#1E7E34] border-[#C6ECD2]" };
    case "in_progress":
      return { label: "Planning", style: "bg-[#FFF8E6] text-[#B45309] border-[#FDE68A]" };
    case "draft":
      return { label: "Draft", style: "bg-[#FEF3D6] text-[#B45309] border-[#FDE68A]" };
    case "cancelled":
      return { label: "Cancelled", style: "bg-[#FDE8E8] text-[#DC2626] border-[#FECACA]" };
    case "completed":
      return { label: "Completed", style: "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]" };
    default:
      return { label: status || "Planning", style: "bg-[#FEF3D6] text-[#B45309] border-[#FDE68A]" };
  }
}

interface AttentionItem {
  id: string;
  type: "shortage" | "quotation" | "payment" | "checklist";
  title: string;
  subtitle: string;
  icon: typeof AlertTriangle;
  iconBg: string;
  iconColor: string;
  textColor: string;
  link: string;
}

function DashboardPage() {
  const router = useRouter();
  const { events, stock, quotations, metrics, shortages } = useOperations();
  const { admin } = useAuth();
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const displayName = admin?.username || "ADMIN";

  // Real Current Date
  const todayFormatted = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
  }, []);

  const todayDateStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const thisMonthStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, []);

  // Today's events dynamically derived
  const todayEvents = useMemo(() => {
    return events.filter((ev) => ev.date?.startsWith(todayDateStr));
  }, [events, todayDateStr]);

  // Upcoming events dynamically derived
  const upcomingEvents = useMemo(() => {
    return events
      .filter((ev) => ev.date >= todayDateStr && ev.status !== "completed" && ev.status !== "cancelled")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events, todayDateStr]);

  // Total events this month
  const thisMonthEventsCount = useMemo(() => {
    return events.filter((ev) => ev.date?.startsWith(thisMonthStr)).length;
  }, [events, thisMonthStr]);

  // Pending receivables count
  const pendingReceivablesCount = useMemo(() => {
    return events.filter((e) => (e.budget - (e.advancePaid || 0)) > 0).length;
  }, [events]);

  // Stock alerts count
  const stockAlertsCount = useMemo(() => {
    const belowMin = stock.filter(
      (item) => (item.totalQty - item.reservedQty) < item.minThreshold
    ).length;
    return belowMin || shortages.length;
  }, [stock, shortages]);

  // Real Stock items preview (top 5)
  const stockAtAGlance = useMemo(() => {
    return stock.slice(0, 5).map((item) => {
      const available = item.totalQty - item.reservedQty;
      const isLow = available < item.minThreshold;
      let Icon = Utensils;
      if (item.category === "Crockery & Glassware") Icon = Wine;
      else if (item.category === "Chafing Dishes" || item.category === "Warmers & Transport") Icon = Soup;
      else if (item.category === "Linens & Tableware") Icon = Armchair;
      else if (item.category === "Live Cooking Counters") Icon = LayoutGrid;

      return {
        id: item.id,
        name: item.name,
        icon: Icon,
        available: `${available} ${item.unit || "available"}`,
        isLow,
      };
    });
  }, [stock]);

  // Real Dynamic Attention items
  const attentionItems = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];

    // 1. Stock Shortages or items below threshold
    shortages.forEach(({ item, deficit, eventTitles }) => {
      items.push({
        id: `shortage-${item.id}`,
        type: "shortage",
        title: `${deficit} ${item.name} needed`,
        subtitle: eventTitles.length ? `Needed for ${eventTitles[0]}` : "Inventory deficit",
        icon: AlertTriangle,
        iconBg: "bg-[#FDE8E8]",
        iconColor: "text-[#D92525]",
        textColor: "group-hover:text-[#D92525]",
        link: "/stock",
      });
    });

    if (items.length < 4) {
      stock
        .filter((s) => (s.totalQty - s.reservedQty) < s.minThreshold)
        .slice(0, 2)
        .forEach((s) => {
          if (!items.find((i) => i.id === `shortage-${s.id}`)) {
            items.push({
              id: `shortage-${s.id}`,
              type: "shortage",
              title: `${s.name} below minimum stock`,
              subtitle: `${s.totalQty - s.reservedQty} remaining (Min: ${s.minThreshold})`,
              icon: AlertTriangle,
              iconBg: "bg-[#FDE8E8]",
              iconColor: "text-[#D92525]",
              textColor: "group-hover:text-[#D92525]",
              link: "/stock",
            });
          }
        });
    }

    // 2. Pending or Draft Quotations
    quotations
      .filter((q) => q.status === "draft" || q.status === "sent")
      .slice(0, 2)
      .forEach((q) => {
        items.push({
          id: `quote-${q.id}`,
          type: "quotation",
          title: q.status === "sent" ? "Quotation awaiting approval" : "Quotation draft incomplete",
          subtitle: `${q.eventTitle || q.clientName}`,
          icon: AlertTriangle,
          iconBg: "bg-[#FDE8E8]",
          iconColor: "text-[#D92525]",
          textColor: "group-hover:text-[#D92525]",
          link: "/quotations",
        });
      });

    // 3. Pending Payments (events where balance > 0)
    events
      .filter((e) => e.budget > (e.advancePaid || 0) && e.status !== "cancelled")
      .slice(0, 2)
      .forEach((e) => {
        const balance = e.budget - (e.advancePaid || 0);
        items.push({
          id: `payment-${e.id}`,
          type: "payment",
          title: `₹${balance.toLocaleString("en-IN")} payment pending`,
          subtitle: e.title,
          icon: Clock,
          iconBg: "bg-[#FEF3D6]",
          iconColor: "text-[#B45309]",
          textColor: "group-hover:text-[#B45309]",
          link: "/money",
        });
      });

    // 4. Incomplete Readiness Checklists on upcoming events
    events
      .filter((e) => e.status !== "completed" && e.status !== "cancelled")
      .forEach((e) => {
        const pendingTasks = (e.readinessChecklist || []).filter((c) => !c.completed).length;
        if (pendingTasks > 0 && items.length < 5) {
          items.push({
            id: `checklist-${e.id}`,
            type: "checklist",
            title: `${pendingTasks} checklist task${pendingTasks > 1 ? "s" : ""} pending`,
            subtitle: e.title,
            icon: CheckSquare,
            iconBg: "bg-[#EEF2F6]",
            iconColor: "text-[#3B5998]",
            textColor: "group-hover:text-[#3B5998]",
            link: `/events/${e.id}`,
          });
        }
      });

    return items.slice(0, 5);
  }, [shortages, stock, quotations, events]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
        {/* ================================================== */}
        {/* 1. GREETING & DATE BAR                             */}
        {/* ================================================== */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] font-bold text-[#8C7443] uppercase block mb-1">
              DASHBOARD
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#111215] leading-tight">
              Good Morning, {displayName}
            </h1>
            <p className="text-xs text-[#70757F] mt-0.5">
              Here's what you need to know today.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#656A75] font-medium bg-white px-3.5 py-2 rounded-xl border border-[#E8E4DC] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#8C7443]" />
              <span>{todayFormatted}</span>
            </div>

            <button
              onClick={() => setNewEventModalOpen(true)}
              className="bg-[#C9A45C] hover:bg-[#B58E45] active:scale-98 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </div>
        </section>

        {/* ================================================== */}
        {/* 2. 4 SUMMARY CARDS                                 */}
        {/* ================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Card 1: Events Today */}
          <div className="rolex-card p-3 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#FBF3E8] text-[#B58138] flex items-center justify-center mb-1.5 sm:mb-3">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="font-serif text-xl sm:text-3xl font-bold text-[#111215] leading-none mb-0.5 sm:mb-1">
                {todayEvents.length}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-[#70757F]">
                Events Today
              </div>
            </div>

            <Link
              to="/events"
              className="text-[10px] sm:text-[11px] text-[#606570] hover:text-[#111215] flex items-center justify-between gap-1 mt-1.5 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-[#F2EEE6] transition-colors"
            >
              <span className="truncate">{upcomingEvents.length} upcoming</span>
              <ChevronRight className="w-3 h-3 text-[#8E94A0] shrink-0" />
            </Link>
          </div>

          {/* Card 2: Total Events This Month */}
          <div className="rolex-card p-3 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#EAF5EE] text-[#2E7D48] flex items-center justify-center mb-1.5 sm:mb-3">
                <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="font-serif text-xl sm:text-3xl font-bold text-[#111215] leading-none mb-0.5 sm:mb-1">
                {thisMonthEventsCount}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-[#70757F]">
                Total Events
              </div>
            </div>

            <Link
              to="/events"
              className="text-[10px] sm:text-[11px] text-[#606570] hover:text-[#111215] flex items-center justify-between gap-1 mt-1.5 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-[#F2EEE6] transition-colors"
            >
              <span className="truncate">This Month</span>
              <ChevronRight className="w-3 h-3 text-[#8E94A0] shrink-0" />
            </Link>
          </div>

          {/* Card 3: Money To Receive */}
          <div className="rolex-card p-3 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#FDF4E5] text-[#C98A2C] flex items-center justify-center mb-1.5 sm:mb-3 font-serif font-bold text-xs sm:text-sm">
                ₹
              </div>
              <div className="font-serif text-base sm:text-2xl lg:text-[26px] font-bold text-[#111215] leading-none mb-0.5 sm:mb-1 truncate">
                ₹{metrics.totalPendingReceivables.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-[#70757F]">
                To Receive
              </div>
            </div>

            <Link
              to="/money"
              className="text-[10px] sm:text-[11px] text-[#606570] hover:text-[#111215] flex items-center justify-between gap-1 mt-1.5 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-[#F2EEE6] transition-colors"
            >
              <span className="truncate">{pendingReceivablesCount} pending</span>
              <ChevronRight className="w-3 h-3 text-[#8E94A0] shrink-0" />
            </Link>
          </div>

          {/* Card 4: Stock Alerts */}
          <div className="rolex-card p-3 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#FDE8E8] text-[#D92525] flex items-center justify-center mb-1.5 sm:mb-3">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="font-serif text-xl sm:text-3xl font-bold text-[#111215] leading-none mb-0.5 sm:mb-1">
                {stockAlertsCount}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-[#70757F]">
                Stock Alerts
              </div>
            </div>

            <Link
              to="/stock"
              className="text-[10px] sm:text-[11px] text-[#606570] hover:text-[#111215] flex items-center justify-between gap-1 mt-1.5 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-[#F2EEE6] transition-colors"
            >
              <span className="truncate">Items below min</span>
              <ChevronRight className="w-3 h-3 text-[#8E94A0] shrink-0" />
            </Link>
          </div>
        </section>

        {/* ================================================== */}
        {/* 3. MIDDLE SECTION: TODAY'S EVENTS + NEEDS ATTENTION*/}
        {/* ================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: TODAY'S EVENTS (col-span-12 lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-serif text-lg font-bold text-[#111215]">
                Today's Events
              </h2>
              <Link
                to="/events"
                className="text-xs font-medium text-[#70757F] hover:text-[#111215] flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {todayEvents.length > 0 ? (
              <div className="rolex-card p-4 sm:p-5 space-y-4">
                {todayEvents.map((ev, index) => {
                  const statusInfo = getEventStatusBadge(ev.status);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => router.navigate({ to: "/events/$id", params: { id: ev.id } })}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group ${
                        index > 0 ? "pt-4 border-t border-[#F0EDE6]" : ""
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <span className="bg-[#F2ECE1] text-[#8C6D37] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider inline-block">
                          {ev.eventType}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-[#111215] leading-snug group-hover:text-[#B58E45] transition-colors">
                          {ev.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#70757F]">
                          <span>📅 {formatEventDate(ev.date)}</span>
                          {ev.time && (
                            <>
                              <span>•</span>
                              <span>🕒 {ev.time}</span>
                            </>
                          )}
                        </div>
                        {ev.venue && (
                          <div className="flex items-center gap-1 text-xs text-[#70757F] line-clamp-1">
                            <MapPin className="w-3 h-3 text-[#8E94A0] shrink-0" />
                            <span className="truncate">{ev.venue}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Guest Count, Status Pill, Chevron Button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#111215]">
                            👥 {ev.guestCount} Guests
                          </span>
                          <span
                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.style}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 group-hover:bg-[#C9A45C] group-hover:text-white text-neutral-500 flex items-center justify-center transition-all mt-1">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rolex-card p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-[#FBF3E8] text-[#B58138] flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#111215]">
                  No Events Scheduled for Today
                </h3>
                <p className="text-xs text-[#70757F] max-w-sm mt-1 mb-4">
                  You have no banquets running today. Review upcoming bookings or create a new celebration.
                </p>
                <button
                  onClick={() => setNewEventModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C9A45C] hover:bg-[#B58E45] text-white rounded-xl text-xs font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Event</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: NEEDS ATTENTION (col-span-12 lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#111215]">
                  Needs Attention
                </h2>
                <span
                  className={`w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center ${
                    attentionItems.length > 0 ? "bg-[#D92525]" : "bg-[#2E7D48]"
                  }`}
                >
                  {attentionItems.length}
                </span>
              </div>
              {attentionItems.length > 0 && (
                <Link
                  to="/stock"
                  className="text-xs font-medium text-[#70757F] hover:text-[#111215]"
                >
                  See All →
                </Link>
              )}
            </div>

            <div className="rolex-card p-4 divide-y divide-[#F0EDE6]">
              {attentionItems.length > 0 ? (
                attentionItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.navigate({ href: item.link })}
                      className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-bold text-[#111215] ${item.textColor} transition-colors truncate`}
                          >
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#70757F] truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8E94A0] shrink-0" />
                    </div>
                  );
                })
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#EAF5EE] text-[#2E7D48] flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#111215]">All Systems Ready</p>
                  <p className="text-[11px] text-[#70757F] mt-0.5">
                    No immediate inventory shortages, pending quotations, or overdue checklist items.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 4. LOWER SECTION: UPCOMING EVENTS + STOCK AT GLANCE*/}
        {/* ================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: UPCOMING EVENTS (col-span-12 lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-serif text-lg font-bold text-[#111215]">
                Upcoming Events
              </h2>
              <Link
                to="/events"
                className="text-xs font-medium text-[#70757F] hover:text-[#111215] flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="rolex-card p-4 divide-y divide-[#F0EDE6]">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((ev) => {
                  const statusInfo = getEventStatusBadge(ev.status);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => router.navigate({ to: "/events/$id", params: { id: ev.id } })}
                      className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#111215] group-hover:text-[#B58E45] transition-colors truncate">
                          {ev.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#70757F]">
                          <span>📅 {formatEventDate(ev.date)}</span>
                          {ev.venue && (
                            <>
                              <span>•</span>
                              <span className="truncate">📍 {ev.venue}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="hidden sm:block text-[11px] text-[#70757F]">
                          👥 {ev.guestCount} Guests
                        </div>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.style}`}
                        >
                          {statusInfo.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#8E94A0]" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#FAF5ED] text-[#8C7443] flex items-center justify-center mb-2">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#111215]">No Upcoming Events</p>
                  <p className="text-[11px] text-[#70757F] mt-0.5 max-w-xs">
                    Upcoming banquets will be listed here chronologically once scheduled.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: STOCK AT A GLANCE (col-span-12 lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-serif text-lg font-bold text-[#111215]">
                Stock at a Glance
              </h2>
              <Link
                to="/stock"
                className="text-xs font-medium text-[#70757F] hover:text-[#111215] flex items-center gap-1 transition-colors"
              >
                View Stock <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="rolex-card p-4 divide-y divide-[#F0EDE6]">
              {stockAtAGlance.length > 0 ? (
                stockAtAGlance.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.navigate({ href: "/stock" })}
                      className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#F7F4EE] border border-[#EAE5DC] text-[#8C7443] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-[#111215] group-hover:text-[#8C7443] transition-colors truncate">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold ${
                            item.isLow ? "text-[#D92525]" : "text-[#1E7E34]"
                          }`}
                        >
                          {item.available}
                        </span>
                        {item.isLow && (
                          <span className="bg-[#FDE8E8] text-[#D92525] text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Low
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#FAF5ED] text-[#8C7443] flex items-center justify-center mb-2">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#111215]">No Stock Items Registered</p>
                  <p className="text-[11px] text-[#70757F] mt-0.5 max-w-xs mb-3">
                    Inventory levels will appear here once items are cataloged in Stock.
                  </p>
                  <Link
                    to="/stock"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#8C7443] hover:underline"
                  >
                    <span>Go to Stock Inventory</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 5. FOOTER BRANDING                                 */}
        {/* ================================================== */}
        <footer className="pt-6 border-t border-[#E8E3DA] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#70757F]">
          <div>
            <span className="font-semibold text-[#111215]">ROLEX Events & Caterers</span>
            <span className="mx-2">•</span>
            <span>Creating Memorable Events, One Celebration at a Time.</span>
          </div>
          <div className="flex items-center gap-1 text-[#8C7443]">
            <MapPin className="w-3 h-3" />
            <span>Kerala, India</span>
          </div>
        </footer>
      </div>

      {/* NEW EVENT MODAL */}
      <NewEventModal
        open={newEventModalOpen}
        onOpenChange={setNewEventModalOpen}
      />
    </AppShell>
  );
}
