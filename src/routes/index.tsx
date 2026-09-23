import React, { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { useOperations } from "../lib/store";
import { useAuth } from "../lib/auth-context";
import { NewEventModal } from "../components/events/NewEventModal";
import {
  CalendarDays,
  Calendar,
  Users,
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
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const router = useRouter();
  const { events, clients, stock, metrics, shortages } = useOperations();
  const { admin } = useAuth();
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const displayName = admin?.username || "ADMIN";

  // Today's events data from reference
  const todayEvents = [
    {
      id: "ev-today-1",
      title: "Rahman Wedding",
      category: "WEDDING",
      date: "24 Sep 2026",
      time: "7:00 PM",
      venue: "Eram Convention Center, Aluva",
      guestCount: 500,
      status: "Preparing",
      statusColor: "bg-[#E6F4EA] text-[#1E7E34]",
    },
    {
      id: "ev-today-2",
      title: "Singhania Annual Gala",
      category: "CORPORATE",
      date: "24 Sep 2026",
      time: "6:00 PM",
      venue: "Le Maritime Ballroom, Willingdon",
      guestCount: 220,
      status: "Final Check",
      statusColor: "bg-[#FEF3D6] text-[#B45309]",
    },
  ];

  // Upcoming events data from reference
  const upcomingEvents = [
    {
      id: "ev-up-1",
      title: "Adv. Meera Nambiar Golden Jubilee",
      date: "26 Sep 2026",
      venue: "Taj Gateway, Marine Drive",
      guestCount: 300,
      status: "Planning",
      statusColor: "bg-[#FEF3D6] text-[#B45309]",
    },
    {
      id: "ev-up-2",
      title: "Malabar Heritage Feast",
      date: "04 Oct 2026",
      venue: "Al-Reem Convention Center",
      guestCount: 400,
      status: "Planning",
      statusColor: "bg-[#FEF3D6] text-[#B45309]",
    },
    {
      id: "ev-up-3",
      title: "Fathima Nikkah Reception",
      date: "12 Oct 2026",
      venue: "Calicut",
      guestCount: 250,
      status: "Confirmed",
      statusColor: "bg-[#E6F4EA] text-[#1E7E34]",
    },
  ];

  // Stock summary items from reference
  const stockAtAGlance = [
    {
      name: "Dinner Plates",
      icon: Utensils,
      available: "650 available",
      isLow: false,
    },
    {
      name: "Water Glasses",
      icon: Wine,
      available: "320 available",
      isLow: false,
    },
    {
      name: "Chairs",
      icon: Armchair,
      available: "180 available",
      isLow: true,
    },
    {
      name: "Tables",
      icon: LayoutGrid,
      available: "85 available",
      isLow: false,
    },
    {
      name: "Serving Bowls",
      icon: Soup,
      available: "60 available",
      isLow: false,
    },
  ];

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
              <span>Tuesday, 24 September 2026</span>
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
                2
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-[#70757F]">
                Events Today
              </div>
            </div>

            <Link
              to="/events"
              className="text-[10px] sm:text-[11px] text-[#606570] hover:text-[#111215] flex items-center justify-between gap-1 mt-1.5 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-[#F2EEE6] transition-colors"
            >
              <span className="truncate">5 upcoming</span>
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
                18
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
                ₹1,80,000
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-[#70757F]">
                To Receive
              </div>
            </div>

            <Link
              to="/money"
              className="text-[10px] sm:text-[11px] text-[#606570] hover:text-[#111215] flex items-center justify-between gap-1 mt-1.5 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-[#F2EEE6] transition-colors"
            >
              <span className="truncate">3 pending</span>
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
                2
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

            <div className="rolex-card p-4 sm:p-5 space-y-4">
              {todayEvents.map((ev, index) => (
                <div
                  key={ev.id}
                  onClick={() => router.navigate({ href: "/events" })}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group ${
                    index > 0 ? "pt-4 border-t border-[#F0EDE6]" : ""
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="bg-[#F2ECE1] text-[#8C6D37] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider inline-block">
                      {ev.category}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[#111215] leading-snug group-hover:text-[#B58E45] transition-colors">
                      {ev.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#70757F]">
                      <span>📅 {ev.date}</span>
                      <span>•</span>
                      <span>🕒 {ev.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#70757F] line-clamp-1">
                      <MapPin className="w-3 h-3 text-[#8E94A0] shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </div>

                  {/* Right: Guest Count, Status Pill, Chevron Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#111215]">
                        👥 {ev.guestCount} Guests
                      </span>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ev.statusColor}`}
                      >
                        {ev.status}
                      </span>
                    </div>

                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 group-hover:bg-[#C9A45C] group-hover:text-white text-neutral-500 flex items-center justify-center transition-all mt-1">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: NEEDS ATTENTION (col-span-12 lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#111215]">
                  Needs Attention
                </h2>
                <span className="w-5 h-5 rounded-full bg-[#D92525] text-white text-[11px] font-bold flex items-center justify-center">
                  4
                </span>
              </div>
              <Link
                to="/stock"
                className="text-xs font-medium text-[#70757F] hover:text-[#111215]"
              >
                See All →
              </Link>
            </div>

            <div className="rolex-card p-4 divide-y divide-[#F0EDE6]">
              {/* Item 1 */}
              <div
                onClick={() => router.navigate({ href: "/stock" })}
                className="py-3 first:pt-1 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FDE8E8] text-[#D92525] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111215] group-hover:text-[#D92525] transition-colors">
                      50 dinner plates needed
                    </div>
                    <div className="text-[11px] text-[#70757F]">
                      For tomorrow's event
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E94A0] shrink-0" />
              </div>

              {/* Item 2 */}
              <div
                onClick={() => router.navigate({ href: "/quotations" })}
                className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FDE8E8] text-[#D92525] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111215] group-hover:text-[#D92525] transition-colors">
                      Quotation not accepted
                    </div>
                    <div className="text-[11px] text-[#70757F]">
                      Rahman Wedding
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E94A0] shrink-0" />
              </div>

              {/* Item 3 */}
              <div
                onClick={() => router.navigate({ href: "/money" })}
                className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF3D6] text-[#B45309] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111215] group-hover:text-[#B45309] transition-colors">
                      ₹50,000 payment pending
                    </div>
                    <div className="text-[11px] text-[#70757F]">
                      Singhania Annual Gala
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E94A0] shrink-0" />
              </div>

              {/* Item 4 */}
              <div
                onClick={() => router.navigate({ href: "/events" })}
                className="py-3 last:pb-1 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#EEF2F6] text-[#3B5998] flex items-center justify-center shrink-0">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#111215] group-hover:text-[#3B5998] transition-colors">
                      3 events have incomplete checklist
                    </div>
                    <div className="text-[11px] text-[#70757F]">
                      Review and complete
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8E94A0] shrink-0" />
              </div>
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
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => router.navigate({ href: "/events" })}
                  className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#111215] group-hover:text-[#B58E45] transition-colors truncate">
                      {ev.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#70757F]">
                      <span>📅 {ev.date}</span>
                      <span>•</span>
                      <span className="truncate">
                        📍 {ev.venue}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="hidden sm:block text-[11px] text-[#70757F]">
                      👥 {ev.guestCount} Guests
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${ev.statusColor}`}
                    >
                      {ev.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#8E94A0]" />
                  </div>
                </div>
              ))}
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
              {stockAtAGlance.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    onClick={() => router.navigate({ href: "/stock" })}
                    className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F7F4EE] border border-[#EAE5DC] text-[#8C7443] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#111215] group-hover:text-[#8C7443] transition-colors">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          item.isLow ? "text-[#111215]" : "text-[#1E7E34]"
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
              })}
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
