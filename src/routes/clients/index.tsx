import React, { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "../../components/layout/AppShell";
import { useOperations } from "../../lib/store";
import { Client } from "../../lib/types";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  Phone,
  Mail,
  Building2,
  Calendar,
  ChevronRight,
  Crown,
  Edit2,
  MapPin,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  const { clients, events, addClient, updateClient } = useOperations();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [vipOnly, setVipOnly] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  // New Client Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [company, setCompany] = useState("");
  const [vip, setVip] = useState(false);
  const [notes, setNotes] = useState("");

  // Edit Client Form State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editVip, setEditVip] = useState(false);

  // Metrics
  const totalClientsCount = clients.length;
  const vipClientsCount = clients.filter((c) => c.vip).length;
  const totalSpendAll = clients.reduce((sum, c) => sum + (c.totalSpend || 0), 0);

  // Filter Clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q));

      const matchesVip = vipOnly || filterType === "vip" ? c.vip : true;
      const matchesStandard = filterType === "standard" ? !c.vip : true;

      return matchesSearch && matchesVip && matchesStandard;
    });
  }, [clients, search, vipOnly, filterType]);

  // Find events for a client
  const getClientEvents = (client: Client) => {
    const cleanPhone = client.phone.replace(/[^0-9]/g, "");
    return events.filter(
      (ev) =>
        ev.clientName.toLowerCase() === client.name.toLowerCase() ||
        ev.clientPhone.replace(/[^0-9]/g, "") === cleanPhone
    );
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please provide both name and phone number");
      return;
    }

    addClient({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      company: company.trim(),
      vip,
      notes: notes.trim(),
    });

    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setCompany("");
    setVip(false);
    setNotes("");
    setAddModalOpen(false);
    toast.success(`Registered client profile for "${name}"`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    updateClient(editingClient.id, {
      name: editName.trim() || editingClient.name,
      phone: editPhone.trim() || editingClient.phone,
      email: editEmail.trim(),
      company: editCompany.trim(),
      address: editAddress.trim(),
      notes: editNotes.trim(),
      vip: editVip,
    });

    if (detailClient?.id === editingClient.id) {
      setDetailClient({
        ...detailClient,
        name: editName.trim() || editingClient.name,
        phone: editPhone.trim() || editingClient.phone,
        email: editEmail.trim(),
        company: editCompany.trim(),
        address: editAddress.trim(),
        notes: editNotes.trim(),
        vip: editVip,
      });
    }

    setEditingClient(null);
    toast.success(`Updated profile for "${editName || editingClient.name}"`);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditEmail(client.email || "");
    setEditCompany(client.company || "");
    setEditAddress(client.address || "");
    setEditNotes(client.notes || "");
    setEditVip(client.vip);
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-6 animate-in fade-in-50 duration-300">
        {/* ================================================== */}
        {/* HEADER SECTION                                     */}
        {/* ================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#111215]">
              <span className="sm:inline hidden">Client Directory & VIP Relations</span>
              <span className="sm:hidden inline">Client Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#77736B] mt-1">
              <span className="sm:inline hidden">
                Manage client contact records, banquet booking history, and direct communication shortcuts.
              </span>
              <span className="sm:hidden inline">
                Manage client contacts and relations.
              </span>
            </p>
          </div>

          {/* Desktop + Add New Client Button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111215] hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>

          {/* Mobile + Add New Client Full-Width Button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="sm:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111215] hover:bg-neutral-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        </div>

        {/* ================================================== */}
        {/* SUMMARY CARDS SECTION                              */}
        {/* ================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          {/* Card 1: TOTAL CLIENTS */}
          <Card className="bg-white border border-[#E8E4DC] rounded-2xl p-3.5 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F0F4FA] border border-[#D5E1F2] flex items-center justify-center text-[#2B5287] shrink-0">
              <Users className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="font-serif text-xl sm:text-3xl font-bold text-[#111215] leading-none">
                {totalClientsCount}
              </div>
              <span className="text-[10px] sm:text-xs text-[#77736B] font-medium block mt-1">
                <span className="sm:inline hidden">Total Clients</span>
                <span className="sm:hidden inline">Clients</span>
              </span>
            </div>
          </Card>

          {/* Card 2: VIP CLIENTS */}
          <Card className="bg-white border border-[#E8E4DC] rounded-2xl p-3.5 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FBF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0">
              <Crown className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="font-serif text-xl sm:text-3xl font-bold text-[#111215] leading-none">
                {vipClientsCount}
              </div>
              <span className="text-[10px] sm:text-xs text-[#77736B] font-medium block mt-1">
                <span className="sm:inline hidden">VIP Clients</span>
                <span className="sm:hidden inline">VIPs</span>
              </span>
            </div>
          </Card>

          {/* Card 3: LIFETIME ACCOUNT VALUE */}
          <Card className="col-span-2 sm:col-span-1 bg-white border border-[#E8E4DC] rounded-2xl p-3.5 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FBF6EE] border border-[#EEDBBD]/60 flex items-center justify-center text-[#8C6D37] shrink-0 font-serif font-bold text-base sm:text-xl">
              ₹
            </div>
            <div>
              <div className="font-serif text-xl sm:text-3xl font-bold text-[#111215] leading-none">
                ₹{totalSpendAll.toLocaleString()}
              </div>
              <span className="text-[10px] sm:text-xs text-[#77736B] font-medium block mt-1">
                <span className="sm:inline hidden">Lifetime Account Value</span>
                <span className="sm:hidden inline">Account Value</span>
              </span>
            </div>
          </Card>
        </div>

        {/* ================================================== */}
        {/* COMPACT SEARCH & FILTER BAR                        */}
        {/* ================================================== */}
        <div className="p-2 sm:p-3 rounded-2xl bg-white border border-[#E8E4DC] shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8E94A0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or company..."
              className="w-full pl-10 pr-3 py-1.5 text-xs bg-transparent border-0 ring-0 focus:outline-none placeholder:text-[#8E94A0] text-[#111215]"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0EDE6]">
            {/* All Clients Select */}
            <Select
              value={filterType}
              onValueChange={(val) => {
                setFilterType(val);
                if (val === "vip") setVipOnly(true);
                else setVipOnly(false);
              }}
            >
              <SelectTrigger className="h-9 px-3 text-xs bg-white border border-[#E8E4DC] rounded-xl text-[#111215] w-[130px] sm:w-[140px] focus:ring-1 focus:ring-[#C9A45C]">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E8E4DC] rounded-xl shadow-md text-xs">
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="vip">VIP Only</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>

            {/* VIP Quick Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const nextVip = !vipOnly;
                setVipOnly(nextVip);
                setFilterType(nextVip ? "vip" : "all");
              }}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                vipOnly
                  ? "bg-[#24211A] text-[#E5C985] border-[#C9A45C]/40 shadow-2xs"
                  : "bg-white hover:bg-neutral-50 text-[#71717A] border-[#E8E4DC]"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span className="sm:inline hidden">VIP Clients Only</span>
              <span className="sm:hidden inline">VIP Only</span>
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* CLIENT CARDS (2-Column Desktop, 1-Column Mobile)   */}
        {/* ================================================== */}
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredClients.map((client) => {
              const cleanPhone = client.phone.replace(/[^0-9]/g, "");
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hello ${client.name}, greetings from ROLEX Events & Caterers!`
              )}`;

              return (
                <div
                  key={client.id}
                  className="bg-white border border-[#E8E4DC] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#C9A45C]/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Client Name + VIP Badge + Chevron */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => setDetailClient(client)}
                          className="font-serif text-lg sm:text-[21px] font-bold text-[#111215] hover:text-[#C9A45C] transition-colors truncate text-left cursor-pointer"
                        >
                          {client.name}
                        </button>
                        {client.vip && (
                          <span className="bg-[#FAF4E8] text-[#8C6D37] border border-[#EEDBBD] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                            VIP
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setDetailClient(client)}
                        className="text-[#8E94A0] hover:text-[#111215] p-1 transition-colors cursor-pointer shrink-0"
                        aria-label="View Client Details"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Company / Organization */}
                    {client.company && (
                      <div className="flex items-center gap-1.5 text-xs text-[#71717A] mt-1">
                        <Building2 className="w-3.5 h-3.5 text-[#8E94A0] shrink-0" />
                        <span className="truncate">{client.company}</span>
                      </div>
                    )}

                    {/* Contact Details (Phone & Email) */}
                    <div className="space-y-1.5 mt-3 text-xs text-[#52525B]">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#8E94A0] shrink-0" />
                        <a
                          href={`tel:${cleanPhone}`}
                          className="hover:underline text-[#111215] font-medium"
                        >
                          {client.phone}
                        </a>
                      </div>

                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#8E94A0] shrink-0" />
                          <a
                            href={`mailto:${client.email}`}
                            className="hover:underline text-[#52525B] truncate"
                          >
                            {client.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Events Booked & Total Spend Strip */}
                    <div className="grid grid-cols-2 gap-3 pt-3.5 mt-3.5 border-t border-[#F0EDE6] text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#8E94A0] shrink-0" />
                        <span className="font-medium text-[#111215]">
                          {client.totalEvents}{" "}
                          {client.totalEvents === 1 ? "Event Booked" : "Events Booked"}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="font-serif font-bold text-sm text-[#111215]">
                          ₹{client.totalSpend.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#8E94A0]">Total Spend</div>
                      </div>
                    </div>

                    {/* Client Notes / Culinary Preferences */}
                    {client.notes && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#F0EDE6] text-[11px] text-[#71717A] italic line-clamp-2">
                        &ldquo;{client.notes}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Actions Bottom Row: [ Call ] and [ WhatsApp ] */}
                  <div className="pt-4 mt-4 border-t border-[#F0EDE6]/80 flex items-center gap-2.5">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 text-[#111215] border border-[#E8E4DC] text-xs font-semibold shadow-2xs transition-colors flex-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#71717A]" />
                      <span>Call</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold shadow-2xs transition-colors flex-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white/20 text-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : clients.length === 0 ? (
          /* Initial Empty State */
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E8E4DC] shadow-xs">
            <Users className="w-10 h-10 text-[#C9A45C] mx-auto mb-3 opacity-50" />
            <h3 className="font-serif text-lg font-bold text-[#111215]">
              No clients yet.
            </h3>
            <p className="text-xs text-[#77736B] mt-1 max-w-sm mx-auto">
              Add your first client to start managing event contacts.
            </p>
            <Button
              onClick={() => setAddModalOpen(true)}
              className="mt-4 text-xs rounded-xl bg-[#111215] text-white hover:bg-neutral-800"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Client
            </Button>
          </div>
        ) : (
          /* Filtered Empty State */
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E8E4DC] shadow-xs">
            <Users className="w-10 h-10 text-[#C9A45C] mx-auto mb-3 opacity-50" />
            <h3 className="font-serif text-lg font-bold text-[#111215]">
              No clients found
            </h3>
            <p className="text-xs text-[#77736B] mt-1 max-w-sm mx-auto">
              No client records match your current search query or filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setFilterType("all");
                setVipOnly(false);
              }}
              className="mt-4 text-xs rounded-xl border-[#E8E4DC]"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* MODAL 1: CLIENT DETAIL DIALOG                      */}
      {/* ================================================== */}
      <Dialog
        open={detailClient !== null}
        onOpenChange={(open) => !open && setDetailClient(null)}
      >
        <DialogContent className="max-w-lg bg-white rounded-2xl p-0 overflow-hidden border border-[#E8E4DC]">
          {detailClient && (() => {
            const cleanPhone = detailClient.phone.replace(/[^0-9]/g, "");
            const clientEvents = getClientEvents(detailClient);
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello ${detailClient.name}, greetings from ROLEX Events & Caterers!`
            )}`;

            return (
              <div className="flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-[#F0EDE6] bg-[#FAF8F5]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37] bg-[#FAF6EE] border border-[#EEDBBD]/60 px-2 py-0.5 rounded">
                      Client Profile
                    </span>
                    {detailClient.vip && (
                      <span className="bg-[#FAF4E8] text-[#8C6D37] border border-[#EEDBBD] text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                        VIP Strategic Partner
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-[#111215] mt-2">
                    {detailClient.name}
                  </h3>
                  {detailClient.company && (
                    <div className="flex items-center gap-1.5 text-xs text-[#71717A] mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-[#8E94A0]" />
                      <span>{detailClient.company}</span>
                    </div>
                  )}

                  {/* Call & WhatsApp Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 mt-4">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-neutral-50 text-[#111215] border border-[#E8E4DC] text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#71717A]" />
                      <span>Call Client</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white/20 text-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Contact & Financial Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#F0EDE6]">
                      <span className="text-[10px] uppercase font-bold text-[#8E94A0] block">
                        Direct Phone
                      </span>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="text-xs font-semibold text-[#111215] hover:underline mt-0.5 block"
                      >
                        {detailClient.phone}
                      </a>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#F0EDE6]">
                      <span className="text-[10px] uppercase font-bold text-[#8E94A0] block">
                        Total Spend
                      </span>
                      <span className="font-serif text-sm font-bold text-[#111215] mt-0.5 block">
                        ₹{detailClient.totalSpend.toLocaleString()}
                      </span>
                    </div>

                    {detailClient.email && (
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#F0EDE6] col-span-2">
                        <span className="text-[10px] uppercase font-bold text-[#8E94A0] block">
                          Official Email
                        </span>
                        <a
                          href={`mailto:${detailClient.email}`}
                          className="text-xs font-medium text-[#111215] hover:underline mt-0.5 block truncate"
                        >
                          {detailClient.email}
                        </a>
                      </div>
                    )}

                    {detailClient.address && (
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#F0EDE6] col-span-2">
                        <span className="text-[10px] uppercase font-bold text-[#8E94A0] block">
                          Location / Address
                        </span>
                        <span className="text-xs text-[#52525B] mt-0.5 block">
                          {detailClient.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Culinary Preferences / Notes */}
                  {detailClient.notes && (
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#F0EDE6]">
                      <span className="text-[10px] uppercase font-bold text-[#8C6D37] block mb-1">
                        Culinary Preferences & Notes
                      </span>
                      <div className="text-xs text-[#52525B] italic leading-relaxed">
                        &ldquo;{detailClient.notes}&rdquo;
                      </div>
                    </div>
                  )}

                  {/* Event History */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#71717A] mb-2">
                      Event History ({clientEvents.length})
                    </h4>

                    {clientEvents.length > 0 ? (
                      <div className="divide-y divide-[#F0EDE6] border border-[#E8E4DC] rounded-xl overflow-hidden bg-white">
                        {clientEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-3 flex items-center justify-between gap-3 hover:bg-[#FAF8F5]/50 transition-colors"
                          >
                            <div>
                              <Link
                                to="/events/$id"
                                params={{ id: ev.id }}
                                className="font-serif font-bold text-xs text-[#111215] hover:text-[#C9A45C] line-clamp-1"
                              >
                                {ev.title}
                              </Link>
                              <div className="text-[11px] text-[#8E94A0] mt-0.5">
                                Date: {ev.date} • {ev.guestCount} Guests
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                                  ev.status === "confirmed"
                                    ? "bg-[#E8F6ED] text-[#1E7E34]"
                                    : "bg-[#FEF3D6] text-[#B45309]"
                                }`}
                              >
                                {ev.status}
                              </span>
                              <div className="text-[11px] font-bold text-[#111215] mt-1">
                                ₹{ev.budget.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-[#E8E4DC] text-center text-xs text-[#71717A]">
                        No active banquet history linked.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-[#F0EDE6] bg-[#FAF8F5] flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(detailClient)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#E8E4DC] bg-white hover:bg-neutral-50 text-xs font-semibold text-[#111215] transition-colors cursor-pointer"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setDetailClient(null)}
                    className="px-4 py-1.5 rounded-xl bg-[#111215] hover:bg-neutral-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ================================================== */}
      {/* MODAL 2: ADD NEW CLIENT                            */}
      {/* ================================================== */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md bg-white border border-[#E8E4DC] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-[#111215]">
              Register New Client
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <Label htmlFor="cName" className="text-xs text-[#71717A]">
                Full Name *
              </Label>
              <Input
                id="cName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Tariq Rahman"
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cPhone" className="text-xs text-[#71717A]">
                  Phone Number *
                </Label>
                <Input
                  id="cPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98951 00000"
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cEmail" className="text-xs text-[#71717A]">
                  Email Address
                </Label>
                <Input
                  id="cEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cCompany" className="text-xs text-[#71717A]">
                Organization / Company
              </Label>
              <Input
                id="cCompany"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Rahman Specialty Hospitals"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cAddress" className="text-xs text-[#71717A]">
                Address / City
              </Label>
              <Input
                id="cAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Skyline Imperial Villa 14, Kozhikode"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cNotes" className="text-xs text-[#71717A]">
                Culinary Preferences / Notes
              </Label>
              <Textarea
                id="cNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special dietary requirements, preferred service style..."
                className="text-xs rounded-xl"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="vipStatus"
                checked={vip}
                onChange={(e) => setVip(e.target.checked)}
                className="rounded border-[#E8E4DC] text-[#C9A45C] focus:ring-[#C9A45C]"
              />
              <Label htmlFor="vipStatus" className="text-xs font-normal text-[#111215] cursor-pointer">
                Mark as VIP Strategic Partner
              </Label>
            </div>

            <DialogFooter className="pt-3">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#111215] hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Register Client
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================================================== */}
      {/* MODAL 3: EDIT CLIENT PROFILE                       */}
      {/* ================================================== */}
      <Dialog
        open={editingClient !== null}
        onOpenChange={(open) => !open && setEditingClient(null)}
      >
        <DialogContent className="max-w-md bg-white border border-[#E8E4DC] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-[#111215]">
              Edit Client Profile
            </DialogTitle>
          </DialogHeader>

          {editingClient && (
            <form onSubmit={handleEditSubmit} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <Label htmlFor="editName" className="text-xs text-[#71717A]">
                  Full Name *
                </Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="editPhone" className="text-xs text-[#71717A]">
                    Phone Number *
                  </Label>
                  <Input
                    id="editPhone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="editEmail" className="text-xs text-[#71717A]">
                    Email Address
                  </Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="editCompany" className="text-xs text-[#71717A]">
                  Organization / Company
                </Label>
                <Input
                  id="editCompany"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="editAddress" className="text-xs text-[#71717A]">
                  Address / City
                </Label>
                <Input
                  id="editAddress"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="editNotes" className="text-xs text-[#71717A]">
                  Culinary Preferences / Notes
                </Label>
                <Textarea
                  id="editNotes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="text-xs rounded-xl"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editVipStatus"
                  checked={editVip}
                  onChange={(e) => setEditVip(e.target.checked)}
                  className="rounded border-[#E8E4DC] text-[#C9A45C] focus:ring-[#C9A45C]"
                />
                <Label htmlFor="editVipStatus" className="text-xs font-normal text-[#111215] cursor-pointer">
                  Mark as VIP Strategic Partner
                </Label>
              </div>

              <DialogFooter className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#111215] hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
