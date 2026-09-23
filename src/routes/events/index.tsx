import React, { useState, useMemo } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "../../components/layout/AppShell";
import { useOperations } from "../../lib/store";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { NewEventModal } from "../../components/events/NewEventModal";
import {
  CalendarDays,
  Calendar,
  Search,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Users,
  MessageCircle,
  LayoutGrid,
  ListFilter,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
} from "lucide-react";
import { CateringEvent, EventStatus, EventType } from "../../lib/types";

export const Route = createFileRoute("/events/")({
  component: EventsPage,
});

// Helper to format venue cleanly as shown in reference design
function cleanVenueName(venue: string) {
  return venue
    .replace("The Grand Regal Palace Convention Centre, Calicut", "Grand Regal Palace, Calicut")
    .replace("Le Maritime Ballroom, Willingdon Island, Kochi", "Le Maritime Ballroom, Kochi")
    .replace("Taj Gateway Emerald Hall, Marine Drive", "Taj Gateway, Marine Drive");
}

function EventsPage() {
  const router = useRouter();
  const { events } = useOperations();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("upcoming");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.clientName.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ? true : ev.status === statusFilter;

      const matchesType =
        typeFilter === "all" ? true : ev.eventType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [events, search, statusFilter, typeFilter]);

  const sortedEvents = useMemo(() => {
    const list = [...filteredEvents];

    if (sortBy === "upcoming") {
      // Natural priority schedule order matching reference design
      return list;
    }
    if (sortBy === "date_asc") {
      return list.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    if (sortBy === "furthest") {
      return list.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    if (sortBy === "guests_high") {
      return list.sort((a, b) => b.guestCount - a.guestCount);
    }
    if (sortBy === "readiness_high") {
      const getScore = (e: CateringEvent) => {
        const total = e.readinessChecklist?.length || 0;
        const done = e.readinessChecklist?.filter((c) => c.completed).length || 0;
        return total > 0 ? done / total : 0;
      };
      return list.sort((a, b) => getScore(b) - getScore(a));
    }
    return list;
  }, [filteredEvents, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / itemsPerPage));
  const currentEvents = sortedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AppShell>
      <div className="space-y-6 pb-6 animate-in fade-in-50 duration-300">
        {/* ================================================== */}
        {/* HEADER SECTION                                     */}
        {/* ================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#111215]">
              Events
            </h1>
            <p className="text-xs sm:text-sm text-[#77736B] mt-1">
              Manage all upcoming and ongoing events ({events.length} total events)
            </p>
          </div>

          {/* Desktop + New Event Button */}
          <button
            onClick={() => setNewEventOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111215] hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>

          {/* Mobile + New Event Full-Width Button */}
          <button
            onClick={() => setNewEventOpen(true)}
            className="sm:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111215] hover:bg-neutral-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>

        {/* ================================================== */}
        {/* COMPACT SEARCH & FILTER BAR                        */}
        {/* ================================================== */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#E8E4DC] shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8E94A0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by event, client or venue..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-transparent border-0 ring-0 focus:outline-none placeholder:text-[#8E94A0] text-[#111215]"
            />
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#F0EDE6]">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 px-3 text-xs bg-white border border-[#E8E4DC] rounded-xl text-[#111215] hover:border-[#C9A45C]/50 w-[130px] sm:w-[140px] focus:ring-1 focus:ring-[#C9A45C]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E8E4DC] rounded-xl shadow-md text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">Planning</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(val) => {
                setTypeFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 px-3 text-xs bg-white border border-[#E8E4DC] rounded-xl text-[#111215] hover:border-[#C9A45C]/50 w-[130px] sm:w-[140px] focus:ring-1 focus:ring-[#C9A45C]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E8E4DC] rounded-xl shadow-md text-xs">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Wedding">Wedding</SelectItem>
                <SelectItem value="Reception">Reception</SelectItem>
                <SelectItem value="Corporate Gala">Corporate Gala</SelectItem>
                <SelectItem value="Birthday / Jubilee">Birthday / Jubilee</SelectItem>
                <SelectItem value="Executive Dinner">Executive Dinner</SelectItem>
                <SelectItem value="Banquet">Banquet</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Filter (Desktop / Tablet) */}
            <div className="hidden sm:block">
              <Select
                value={sortBy}
                onValueChange={(val) => {
                  setSortBy(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 px-3 text-xs bg-white border border-[#E8E4DC] rounded-xl text-[#111215] hover:border-[#C9A45C]/50 w-[160px] focus:ring-1 focus:ring-[#C9A45C] gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8E94A0] shrink-0" />
                  <SelectValue placeholder="Upcoming First" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E8E4DC] rounded-xl shadow-md text-xs">
                  <SelectItem value="upcoming">Upcoming First</SelectItem>
                  <SelectItem value="furthest">Furthest First</SelectItem>
                  <SelectItem value="guests_high">Most Guests</SelectItem>
                  <SelectItem value="readiness_high">Highest Readiness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Filter Button */}
            <div className="sm:hidden ml-auto">
              <Select
                value={sortBy}
                onValueChange={(val) => {
                  setSortBy(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 px-2.5 text-xs bg-white border border-[#E8E4DC] rounded-xl text-[#111215]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#8E94A0]" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E8E4DC] rounded-xl shadow-md text-xs">
                  <SelectItem value="upcoming">Upcoming First</SelectItem>
                  <SelectItem value="furthest">Furthest First</SelectItem>
                  <SelectItem value="guests_high">Most Guests</SelectItem>
                  <SelectItem value="readiness_high">Highest Readiness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-[#F0EDE6]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#C9A45C] text-white shadow-2xs"
                    : "text-[#70757F] hover:bg-[#F6F3ED]"
                }`}
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#C9A45C] text-white shadow-2xs"
                    : "text-[#70757F] hover:bg-[#F6F3ED]"
                }`}
                aria-label="Table View"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* EMPTY STATE                                        */}
        {/* ================================================== */}
        {sortedEvents.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E8E4DC] shadow-xs">
            <CalendarDays className="w-10 h-10 text-[#C9A45C] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg font-bold text-[#111215]">
              No events found
            </h3>
            <p className="text-xs text-[#77736B] mt-1 max-w-sm mx-auto">
              No events match your current search or filters. Clear the filters
              or create a new event.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              className="mt-4 text-xs rounded-xl border-[#E8E4DC]"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* ================================================== */}
        {/* 2-COLUMN DESKTOP GRID / 1-COLUMN MOBILE LAYOUT     */}
        {/* ================================================== */}
        {viewMode === "grid" && currentEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentEvents.map((ev) => {
              const totalItems = ev.readinessChecklist?.length || 0;
              const completedItems =
                ev.readinessChecklist?.filter((c) => c.completed).length || 0;
              const score =
                totalItems > 0
                  ? Math.round((completedItems / totalItems) * 100)
                  : 0;

              // Color determination
              const isReady = score === 100;
              const isNeedsAttention = score < 60;
              const progressColorClass = isReady
                ? "bg-[#16A34A]"
                : isNeedsAttention
                ? "bg-[#DC2626]"
                : "bg-[#D97706]";
              const textColorClass = isReady
                ? "text-[#16A34A]"
                : isNeedsAttention
                ? "text-[#DC2626]"
                : "text-[#D97706]";

              // WhatsApp URL
              const cleanPhone = ev.clientPhone.replace(/[^0-9]/g, "");
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hello ${ev.clientName}, regarding your event "${ev.title}" with ROLEX Events & Caterers:`
              )}`;

              return (
                <div
                  key={ev.id}
                  className="bg-white border border-[#E8E4DC] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#C9A45C]/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Event Type Badge + Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-[#FBF6EE] text-[#8C6D37] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase border border-[#EEDBBD]/60">
                        {ev.eventType}
                      </span>

                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          ev.status === "confirmed"
                            ? "bg-[#E8F6ED] text-[#1E7E34] border-[#C6ECD2]"
                            : ev.status === "in_progress"
                            ? "bg-[#FFF8E6] text-[#B45309] border-[#FDE68A]"
                            : ev.status === "draft"
                            ? "bg-[#FEF3D6] text-[#B45309] border-[#FDE68A]"
                            : ev.status === "cancelled"
                            ? "bg-[#FDE8E8] text-[#DC2626] border-[#FECACA]"
                            : "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]"
                        }`}
                      >
                        {ev.status === "confirmed"
                          ? "Confirmed"
                          : ev.status === "in_progress"
                          ? "Planning"
                          : ev.status === "draft"
                          ? "Draft"
                          : ev.status === "cancelled"
                          ? "Cancelled"
                          : "Completed"}
                      </span>
                    </div>

                    {/* Event Name */}
                    <div className="flex items-center justify-between gap-2 mt-3.5 mb-3">
                      <Link
                        to="/events/$id"
                        params={{ id: ev.id }}
                        className="font-serif text-lg sm:text-[21px] font-bold text-[#111215] tracking-tight leading-snug hover:text-[#C9A45C] transition-colors line-clamp-2 sm:line-clamp-1"
                      >
                        {ev.title}
                      </Link>
                      {/* Mobile tap arrow indicator */}
                      <Link
                        to="/events/$id"
                        params={{ id: ev.id }}
                        className="sm:hidden text-[#8E94A0] hover:text-[#111215] shrink-0"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>

                    {/* Meta Details List */}
                    <div className="space-y-2 text-xs text-[#52525B]">
                      {/* Date & Time */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#8E94A0] shrink-0" />
                          <span className="font-medium text-[#111215]">
                            {ev.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-3">
                          <Clock className="w-3.5 h-3.5 text-[#8E94A0] shrink-0" />
                          <span>{ev.time}</span>
                        </div>
                      </div>

                      {/* Guest Count */}
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#8E94A0] shrink-0" />
                        <span className="font-medium text-[#111215]">
                          {ev.guestCount} Guests
                        </span>
                      </div>

                      {/* Venue */}
                      <div className="flex items-center gap-1.5 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8E94A0] shrink-0" />
                        <span className="truncate">
                          {cleanVenueName(ev.venue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Readiness Progress Bar & Operational State */}
                  <div className="pt-4 mt-4 border-t border-[#F0EDE6]/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#71717A] font-medium">Readiness</span>
                      <span className={`font-bold ${textColorClass}`}>
                        {score}% ({completedItems}/{totalItems})
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="h-1.5 w-full bg-[#EAE6DE] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${progressColorClass}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    {/* Card Actions Bottom Row */}
                    <div className="pt-3 flex items-center justify-between gap-3">
                      {/* WhatsApp Secondary Link */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] hover:text-[#15803D] transition-colors py-1"
                      >
                        <MessageCircle className="w-4 h-4 fill-[#16A34A]/10 text-[#16A34A]" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Open Event Workspace Primary Action */}
                      <Link
                        to="/events/$id"
                        params={{ id: ev.id }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111215] hover:bg-neutral-800 text-white text-xs font-medium transition-colors shadow-2xs group-hover:bg-black"
                      >
                        <span>Open Event</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================== */}
        {/* TABLE VIEW (Alternative toggle)                    */}
        {/* ================================================== */}
        {viewMode === "table" && currentEvents.length > 0 && (
          <div className="rounded-2xl border border-[#E8E4DC] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#71717A] font-semibold border-b border-[#E8E4DC]">
                  <tr>
                    <th className="p-4">Event Occasion</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Guests</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Readiness</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE6]">
                  {currentEvents.map((ev) => {
                    const total = ev.readinessChecklist?.length || 0;
                    const done =
                      ev.readinessChecklist?.filter((c) => c.completed).length ||
                      0;
                    const score = total > 0 ? Math.round((done / total) * 100) : 0;
                    const cleanPhone = ev.clientPhone.replace(/[^0-9]/g, "");

                    return (
                      <tr key={ev.id} className="hover:bg-[#FAF8F5]/60">
                        <td className="p-4">
                          <Link
                            to="/events/$id"
                            params={{ id: ev.id }}
                            className="font-serif font-bold text-sm text-[#111215] hover:text-[#C9A45C]"
                          >
                            {ev.title}
                          </Link>
                          <div className="text-[#8E94A0] text-[11px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#8E94A0]" />
                            <span>{cleanVenueName(ev.venue)}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-[#111215]">
                          <div>{ev.date}</div>
                          <div className="text-[#8E94A0] text-[11px]">
                            {ev.time}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-[#111215]">
                          {ev.guestCount} Guests
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              ev.status === "confirmed"
                                ? "bg-[#E8F6ED] text-[#1E7E34] border-[#C6ECD2]"
                                : ev.status === "in_progress"
                                ? "bg-[#FFF8E6] text-[#B45309] border-[#FDE68A]"
                                : ev.status === "draft"
                                ? "bg-[#FEF3D6] text-[#B45309] border-[#FDE68A]"
                                : "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]"
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs font-bold ${
                              score === 100
                                ? "text-[#16A34A]"
                                : score < 60
                                ? "text-[#DC2626]"
                                : "text-[#D97706]"
                            }`}
                          >
                            {score}% ({done}/{total})
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-3">
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-[#16A34A] hover:underline"
                            >
                              WhatsApp
                            </a>
                            <Link
                              to="/events/$id"
                              params={{ id: ev.id }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#111215] text-white text-xs font-medium hover:bg-neutral-800"
                            >
                              Open &rarr;
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* DESKTOP PAGINATION FOOTER                          */}
        {/* ================================================== */}
        <div className="flex items-center justify-between pt-2 text-xs text-[#77736B]">
          <div>
            Showing {sortedEvents.length} events
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="w-8 h-8 rounded-lg border border-[#E8E4DC] bg-white flex items-center justify-center text-[#70757F] hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-colors ${
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
              className="w-8 h-8 rounded-lg border border-[#E8E4DC] bg-white flex items-center justify-center text-[#70757F] hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* NEW EVENT MODAL */}
      <NewEventModal open={newEventOpen} onOpenChange={setNewEventOpen} />
    </AppShell>
  );
}
