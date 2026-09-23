import React, { useState, useEffect } from "react";
import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import { BrandLogo } from "../common/BrandLogo";
import { GlobalSearchDialog } from "../common/GlobalSearchDialog";
import { NewEventModal } from "../events/NewEventModal";
import { useOperations } from "../../lib/store";
import { useAuth } from "../../lib/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  LayoutDashboard,
  CalendarDays,
  Boxes,
  Users,
  FileText,
  Wallet,
  BarChart3,
  Settings,
  Plus,
  Search,
  Bell,
  AlertTriangle,
  Clock,
  LogOut,
  ChevronDown,
  Menu,
  Home,
  MoreHorizontal,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { shortages, urgentEvents } = useOperations();
  const { admin, token, logout, isLoading } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token && typeof window !== "undefined") {
      router.navigate({ to: "/login" });
    }
  }, [isLoading, token, router]);

  const adminName = admin?.username || "ADMIN";
  const initials = adminName.slice(0, 2).toUpperCase();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Events",
      href: "/events",
      icon: CalendarDays,
    },
    {
      label: "Stock",
      href: "/stock",
      icon: Boxes,
    },
    {
      label: "Clients",
      href: "/clients",
      icon: Users,
    },
    {
      label: "Quotations",
      href: "/quotations",
      icon: FileText,
    },
    {
      label: "Money",
      href: "/money",
      icon: Wallet,
    },
    {
      label: "Reports",
      href: "/reports",
      icon: BarChart3,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const totalAlerts = 3; // Matching the target reference badge

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#111215] flex flex-col md:flex-row relative selection:bg-[#E5C985]/30 selection:text-[#8E702D] w-full max-w-full">
      {/* ================================================== */}
      {/* DESKTOP FIXED SIDEBAR                              */}
      {/* ================================================== */}
      <aside className="hidden md:flex md:w-60 lg:w-64 flex-col bg-[#0E0F12] text-[#FDFBF7] border-r border-[#1C1E24] shrink-0 md:fixed md:top-0 md:left-0 md:bottom-0 md:h-screen z-30 justify-between select-none overflow-y-auto">
        <div className="flex flex-col">
          {/* Top Brand Insignia (Centered Cloche Logo) */}
          <div className="pt-7 pb-5 px-4 flex flex-col items-center justify-center border-b border-white/[0.06]">
            <Link to="/" className="block">
              <BrandLogo size="md" light layout="vertical" showTagline />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? "bg-[#24211A] text-[#E5C985] border border-[#C9A45C]/35 font-semibold shadow-xs"
                      : "text-[#8F94A0] hover:text-[#FFFFFF] hover:bg-white/[0.04] font-medium"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#E5C985]" : "text-[#787D8A]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Lower Section: User Profile */}
        <div className="p-3 pb-4">
          {/* Admin User Profile */}
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2C2923] border border-[#C9A45C]/30 text-[#E5C985] font-semibold text-xs flex items-center justify-center">
                  {initials}
                </div>
                <div>
                  <div className="font-bold text-white text-[11px] leading-tight">
                    {adminName}
                  </div>
                  <div className="text-[10px] text-[#7E838F]">Administrator</div>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 text-[11px] text-[#8F94A0] hover:text-white mt-2.5 pt-2 border-t border-white/[0.06] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ================================================== */}
      {/* MAIN CONTENT AREA                                  */}
      {/* ================================================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-12 md:ml-60 lg:ml-64 w-full max-w-full overflow-x-hidden">
        {/* TOP APPLICATION BAR */}
        <header className="h-16 px-4 sm:px-6 md:px-10 flex items-center justify-between gap-4 sticky top-0 z-20 bg-[#F6F3ED]/95 backdrop-blur-md border-b border-[#E8E3DA] w-full max-w-full">
          {/* Mobile Left: Hamburger Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-full bg-white border border-[#E8E4DC] flex items-center justify-center text-[#111215] shadow-2xs cursor-pointer"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Center: Brand Insignia */}
          <div className="md:hidden flex-1 flex items-center justify-center">
            <Link to="/" className="flex items-center justify-center">
              <BrandLogo size="md" light={false} layout="horizontal" showTagline />
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50/80 text-[#70757F] text-xs border border-[#E8E4DC] shadow-2xs transition-all text-left group cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#8E94A0] group-hover:text-[#111215] shrink-0" />
              <span className="truncate">Search events, clients, venues...</span>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-9 h-9 rounded-full bg-white hover:bg-neutral-50 border border-[#E8E4DC] flex items-center justify-center relative shadow-2xs transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 text-[#111215]" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D92525] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    3
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 shadow-lg border border-[#E8E4DC] rounded-xl bg-white">
                <div className="p-3 border-b border-[#E8E4DC] bg-[#FAF8F5] font-semibold text-xs flex items-center justify-between text-[#111215]">
                  <span>Operational Alerts</span>
                  <span className="text-[10px] bg-[#FDE8E8] text-[#D92525] font-bold px-2 py-0.5 rounded-full">
                    3 pending
                  </span>
                </div>
                <div className="divide-y divide-[#F0EDE6] text-xs max-h-72 overflow-y-auto">
                  <div
                    onClick={() => router.navigate({ href: "/stock" })}
                    className="p-3 hover:bg-[#FAF8F5] cursor-pointer space-y-0.5"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#D92525]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>50 dinner plates needed</span>
                    </div>
                    <p className="text-[#70757F] text-[11px]">For tomorrow's event</p>
                  </div>

                  <div
                    onClick={() => router.navigate({ href: "/quotations" })}
                    className="p-3 hover:bg-[#FAF8F5] cursor-pointer space-y-0.5"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#D92525]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Quotation not accepted</span>
                    </div>
                    <p className="text-[#70757F] text-[11px]">Rahman Wedding</p>
                  </div>

                  <div
                    onClick={() => router.navigate({ href: "/money" })}
                    className="p-3 hover:bg-[#FAF8F5] cursor-pointer space-y-0.5"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>₹50,000 payment pending</span>
                    </div>
                    <p className="text-[#70757F] text-[11px]">Singhania Annual Gala</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Desktop User Profile Pill */}
            <div
              onClick={() => router.navigate({ to: "/settings" })}
              className="hidden sm:flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white border border-[#E8E4DC] shadow-2xs cursor-pointer select-none hover:bg-neutral-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#111215] text-[#E5C985] text-[11px] font-bold flex items-center justify-center">
                {initials}
              </div>
              <span className="text-xs font-semibold text-[#111215]">
                {adminName}
              </span>
              <ChevronDown className="w-3 h-3 text-[#70757F]" />
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer / Popdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0E0F12] text-white p-4 space-y-2 border-b border-[#24262B]">
            <div className="flex justify-center pb-3 pt-1 border-b border-white/[0.08]">
              <BrandLogo size="sm" light layout="vertical" />
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                    isActive
                      ? "bg-[#24211A] text-[#E5C985] font-semibold"
                      : "text-[#8F94A0] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-white/[0.08] flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#2C2923] border border-[#C9A45C]/30 text-[#E5C985] text-[10px] font-bold flex items-center justify-center">
                  {initials}
                </div>
                <span className="text-stone-200 font-medium text-xs">{adminName}</span>
              </div>
              <button
                onClick={logout}
                className="text-[#E5C985] hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.08]"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* MAIN PAGE CONTAINER */}
        <main className="flex-1 px-4 sm:px-6 md:px-10 pt-5 sm:pt-6 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>

      {/* ================================================== */}
      {/* MOBILE BOTTOM NAVIGATION                           */}
      {/* ================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white text-[#70757F] border-t border-[#E8E3DA] flex items-center justify-around z-40 px-2 shadow-md w-full">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentPath === "/" ? "text-[#C9A45C] font-bold" : "text-[#70757F]"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          to="/events"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentPath.startsWith("/events")
              ? "text-[#C9A45C] font-bold"
              : "text-[#70757F]"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Events</span>
        </Link>

        <Link
          to="/stock"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentPath.startsWith("/stock")
              ? "text-[#C9A45C] font-bold"
              : "text-[#70757F]"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock</span>
        </Link>

        <Link
          to="/clients"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentPath.startsWith("/clients")
              ? "text-[#C9A45C] font-bold"
              : "text-[#70757F]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clients</span>
        </Link>

        <Link
          to="/settings"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentPath.startsWith("/settings")
              ? "text-[#C9A45C] font-bold"
              : "text-[#70757F]"
          }`}
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>More</span>
        </Link>
      </nav>

      {/* GLOBAL MODALS */}
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <NewEventModal open={newEventOpen} onOpenChange={setNewEventOpen} />
    </div>
  );
}
