import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../../components/layout/AppShell";
import { useOperations } from "../../lib/store";
import { useAuth } from "../../lib/auth-context";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import {
  Settings,
  Building,
  FileText,
  MessageCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Lock,
  User,
  Eye,
  EyeOff,
  Users,
  Loader2,
  CheckCircle2,
  Database,
  ArrowRight,
  Server,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

interface AdminRecord {
  id: string;
  username: string;
  is_superadmin?: boolean;
  created_at?: string;
}

type SettingsTab = "admins" | "profile" | "templates" | "system";

function SettingsPage() {
  const { profile, updateProfile, resetToInitialData } = useOperations();
  const { admin: currentLoggedInAdmin } = useAuth();

  // Active tab state
  const [activeTab, setActiveTab] = useState<SettingsTab>("admins");

  // Business profile state
  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [address, setAddress] = useState(profile.address);
  const [gstNumber, setGstNumber] = useState(profile.gstNumber);
  const [whatsappTemplate, setWhatsappTemplate] = useState(profile.whatsappTemplate);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Admin management state
  const [adminsList, setAdminsList] = useState<AdminRecord[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Password edit modal state
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [editNewPassword, setEditNewPassword] = useState("");
  const [showEditPass, setShowEditPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete admin state
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  // Fetch admin list from backend
  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const data = await api.admins.list();
      setAdminsList(data);
    } catch (err: any) {
      console.warn("Could not load admins from backend:", err.message);
      if (currentLoggedInAdmin) {
        setAdminsList([{ id: currentLoggedInAdmin.id, username: currentLoggedInAdmin.username, is_superadmin: true }]);
      }
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUser.trim() || !newAdminPass) {
      toast.error("Please enter both username and password.");
      return;
    }

    setIsCreatingAdmin(true);
    try {
      await api.admins.create(newAdminUser.trim(), newAdminPass);
      toast.success(`Admin account "${newAdminUser.trim()}" created successfully!`);
      setNewAdminUser("");
      setNewAdminPass("");
      setAddAdminModalOpen(false);
      await fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to create administrator");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleOpenEditPassword = (adminItem: AdminRecord) => {
    setEditingAdmin(adminItem);
    setEditNewPassword("");
    setShowEditPass(false);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin || !editNewPassword) {
      toast.error("Please enter a new password.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.admins.updatePassword(editingAdmin.id, editNewPassword);
      toast.success(`Password updated for "${editingAdmin.username}".`);
      setEditingAdmin(null);
      setEditNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAdmin = async (adminToDelete: AdminRecord) => {
    if (adminsList.length <= 1) {
      toast.error("Cannot delete the only remaining administrator account.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete administrator account "${adminToDelete.username}"?`
      )
    ) {
      return;
    }

    setDeletingAdminId(adminToDelete.id);
    try {
      await api.admins.delete(adminToDelete.id);
      toast.success(`Admin "${adminToDelete.username}" removed.`);
      await fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete administrator");
    } finally {
      setDeletingAdminId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const updatedData = {
      name,
      tagline,
      phone,
      email,
      address,
      gstNumber,
      whatsappTemplate,
    };

    updateProfile(updatedData);

    try {
      await api.profile.update(updatedData);
      toast.success("Business profile & system settings saved!");
    } catch {
      toast.success("Business profile updated locally!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to restore the default sample events, stock items, and client records?"
      )
    ) {
      resetToInitialData();
      toast.info("Database reset to luxury banquet demonstration state.");
    }
  };

  const tabs = [
    {
      id: "admins" as SettingsTab,
      label: "Administrators",
      icon: ShieldCheck,
      count: adminsList.length,
    },
    {
      id: "profile" as SettingsTab,
      label: "Business Profile",
      icon: Building,
    },
    {
      id: "templates" as SettingsTab,
      label: "Templates & Terms",
      icon: MessageCircle,
    },
    {
      id: "system" as SettingsTab,
      label: "System & Data",
      icon: Database,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 pb-16">
        {/* ======================================================== */}
        {/* 1. SIMPLE MODERN HEADER                                  */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] font-bold text-[#8C7443] uppercase block mb-1">
              SYSTEM SETTINGS
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#111215] leading-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs text-[#70757F] mt-0.5">
              Manage administrators, catering identity, and banquet operations.
            </p>
          </div>

          {activeTab === "admins" && (
            <Button
              onClick={() => {
                setNewAdminUser("");
                setNewAdminPass("");
                setAddAdminModalOpen(true);
              }}
              className="bg-[#C9A45C] hover:bg-[#B58E45] text-white text-xs h-9 px-4 rounded-xl shadow-xs font-medium flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Administrator</span>
            </Button>
          )}
        </div>

        {/* ======================================================== */}
        {/* 2. MODERN HORIZONTAL TABS                                */}
        {/* ======================================================== */}
        <div className="border-b border-[#E8E4DC] flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-[#C9A45C] text-[#111215]"
                    : "border-transparent text-[#70757F] hover:text-[#111215] hover:border-[#E8E4DC]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-[#C9A45C]" : "text-[#8E94A0]"
                  }`}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-[#24211A] text-[#E5C985]"
                        : "bg-[#FAF8F5] text-[#70757F] border border-[#E8E4DC]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* 3. TAB CONTENT: ADMINISTRATORS                           */}
        {/* ======================================================== */}
        {activeTab === "admins" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <Card className="border-[#E8E4DC] shadow-xs rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-[#FAF8F5] border-b border-[#E8E4DC] py-4 px-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-base sm:text-lg font-bold text-[#111215]">
                      Active Administrators
                    </CardTitle>
                    <CardDescription className="text-xs text-[#70757F] mt-0.5">
                      Users with authorized access to the Rolex Operations Console.
                    </CardDescription>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAdmins}
                    className="text-[11px] text-[#8C7443] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Refresh
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loadingAdmins ? (
                  <div className="p-10 text-center text-xs text-[#70757F] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C9A45C]" />
                    <span>Loading administrators...</span>
                  </div>
                ) : adminsList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#70757F]">
                    No administrator accounts found.
                  </div>
                ) : (
                  <div className="divide-y divide-[#F0EDE6]">
                    {adminsList.map((adm) => {
                      const initials = adm.username.slice(0, 2).toUpperCase();
                      const isSelf = currentLoggedInAdmin?.username === adm.username;
                      const canDelete = adminsList.length > 1;

                      return (
                        <div
                          key={adm.id}
                          className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#111215] text-[#E5C985] font-bold text-xs flex items-center justify-center shrink-0 border border-[#C9A45C]/30 shadow-2xs">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs sm:text-sm text-[#111215]">
                                  {adm.username}
                                </span>
                                {adm.is_superadmin && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FBF3E8] text-[#B58138] border border-[#C9A45C]/30 font-semibold">
                                    Superadmin
                                  </span>
                                )}
                                {isSelf && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> You
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#70757F] mt-0.5">
                                {adm.created_at
                                  ? `Created on ${new Date(adm.created_at).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}`
                                  : "Authorized Administrator"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditPassword(adm)}
                              className="h-8 text-xs border-[#E8E4DC] hover:bg-[#FAF8F5] text-stone-700 gap-1.5 cursor-pointer rounded-lg"
                            >
                              <KeyRound className="w-3 h-3 text-[#8C7443]" />
                              <span>Edit Password</span>
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canDelete || deletingAdminId === adm.id}
                              onClick={() => handleDeleteAdmin(adm)}
                              className={`h-8 text-xs gap-1 cursor-pointer rounded-lg ${
                                canDelete
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                  : "text-stone-300 cursor-not-allowed"
                              }`}
                              title={!canDelete ? "Cannot delete the last admin" : "Delete Admin"}
                            >
                              {deletingAdminId === adm.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              <span>Delete</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. TAB CONTENT: BUSINESS PROFILE                         */}
        {/* ======================================================== */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-4 animate-in fade-in-50 duration-200">
            <Card className="border-[#E8E4DC] shadow-xs rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-[#FAF8F5] border-b border-[#E8E4DC] py-4 px-5 sm:px-6">
                <CardTitle className="font-serif text-base sm:text-lg font-bold text-[#111215]">
                  Caterer Identity & Legal Details
                </CardTitle>
                <CardDescription className="text-xs text-[#70757F] mt-0.5">
                  Appears on official printed quotations, invoices, and banquet agreements.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bName" className="text-xs font-semibold text-[#111215]">
                      Business Name
                    </Label>
                    <Input
                      id="bName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-white border-[#E8E4DC] text-xs h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bTagline" className="text-xs font-semibold text-[#111215]">
                      Brand Tagline
                    </Label>
                    <Input
                      id="bTagline"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="bg-white border-[#E8E4DC] text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bPhone" className="text-xs font-semibold text-[#111215]">
                      Operations Mobile
                    </Label>
                    <Input
                      id="bPhone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="bg-white border-[#E8E4DC] text-xs h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bEmail" className="text-xs font-semibold text-[#111215]">
                      Official Email
                    </Label>
                    <Input
                      id="bEmail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      className="bg-white border-[#E8E4DC] text-xs h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bGst" className="text-xs font-semibold text-[#111215]">
                      GSTIN / Registration
                    </Label>
                    <Input
                      id="bGst"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      className="bg-white border-[#E8E4DC] text-xs h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bAddress" className="text-xs font-semibold text-[#111215]">
                    Central Warehouse & Commercial Kitchen Address
                  </Label>
                  <Input
                    id="bAddress"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-white border-[#E8E4DC] text-xs h-10 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="bg-[#C9A45C] hover:bg-[#B58E45] text-white text-xs h-10 px-6 rounded-xl font-medium flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 5. TAB CONTENT: TEMPLATES & TERMS                        */}
        {/* ======================================================== */}
        {activeTab === "templates" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <Card className="border-[#E8E4DC] shadow-xs rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-[#FAF8F5] border-b border-[#E8E4DC] py-4 px-5 sm:px-6">
                <CardTitle className="font-serif text-base sm:text-lg font-bold text-[#111215] flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Notification Template
                </CardTitle>
                <CardDescription className="text-xs text-[#70757F] mt-0.5">
                  Default text generated when contacting clients directly from event workspaces.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#70757F] mb-1">
                  <span>Available Tokens:</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E4DC] font-mono text-[#8C7443]">
                    {"{clientName}"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E4DC] font-mono text-[#8C7443]">
                    {"{eventTitle}"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E8E4DC] font-mono text-[#8C7443]">
                    {"{eventDate}"}
                  </span>
                </div>
                <Textarea
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  rows={4}
                  className="bg-white border-[#E8E4DC] text-xs font-mono rounded-xl p-3"
                />
              </CardContent>
            </Card>

            <Card className="border-[#E8E4DC] shadow-xs rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-[#FAF8F5] border-b border-[#E8E4DC] py-4 px-5 sm:px-6">
                <CardTitle className="font-serif text-base sm:text-lg font-bold text-[#111215] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C9A45C]" /> Standard Quotation Terms
                </CardTitle>
                <CardDescription className="text-xs text-[#70757F] mt-0.5">
                  Standard legal and operational terms printed on customer estimates.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-2">
                {profile.quotationTerms.map((term, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-[#FAF8F5]/70 border border-[#E8E4DC] text-xs text-[#555A64] flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-white border border-[#E8E4DC] text-[#111215] font-bold text-[11px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{term}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleSaveProfile}
                className="bg-[#C9A45C] hover:bg-[#B58E45] text-white text-xs h-10 px-6 rounded-xl font-medium flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Template Changes</span>
              </Button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. TAB CONTENT: SYSTEM & DATA                            */}
        {/* ======================================================== */}
        {activeTab === "system" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <Card className="border-[#E8E4DC] shadow-xs rounded-2xl overflow-hidden bg-white">
              <CardHeader className="bg-[#FAF8F5] border-b border-[#E8E4DC] py-4 px-5 sm:px-6">
                <CardTitle className="font-serif text-base sm:text-lg font-bold text-[#111215] flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#C9A45C]" /> Operations Database & Architecture
                </CardTitle>
                <CardDescription className="text-xs text-[#70757F] mt-0.5">
                  Backend connection and persistent storage details.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#8C7443] font-bold">
                      Backend Server
                    </span>
                    <div className="font-semibold text-sm text-[#111215]">FastAPI Python Engine</div>
                    <p className="text-[11px] text-[#70757F]">
                      Running locally at http://localhost:8000 with JWT Authentication & CORS.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#8C7443] font-bold">
                      Database Engine
                    </span>
                    <div className="font-semibold text-sm text-[#111215]">PostgreSQL / SQLite</div>
                    <p className="text-[11px] text-[#70757F]">
                      Auto-fallback enabled with persistent storage for events, stock, clients, and admins.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-xs text-red-900">Reset Demo Data</h4>
                    <p className="text-[11px] text-red-700/80 mt-0.5">
                      Restores default banquet events, stock equipment, and sample client records.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="text-xs text-red-700 border-red-200 hover:bg-red-100 bg-white gap-1.5 cursor-pointer rounded-xl h-9 self-start sm:self-auto shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Sample Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: ADD NEW ADMINISTRATOR                             */}
        {/* ======================================================== */}
        <Dialog open={addAdminModalOpen} onOpenChange={setAddAdminModalOpen}>
          <DialogContent className="sm:max-w-md bg-white border border-[#E8E4DC] shadow-2xl rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-[#111215] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#C9A45C]" /> Add New Administrator
              </DialogTitle>
              <DialogDescription className="text-xs text-[#70757F]">
                Create login credentials for a staff member to access the Rolex Operations Console.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAdmin} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="modal-admin-user" className="text-xs font-semibold text-[#111215]">
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="modal-admin-user"
                    type="text"
                    placeholder="e.g. MANAGER1"
                    value={newAdminUser}
                    onChange={(e) => setNewAdminUser(e.target.value)}
                    required
                    autoFocus
                    className="bg-white border-[#E8E4DC] text-xs h-10 pl-8 rounded-xl"
                  />
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="modal-admin-pass" className="text-xs font-semibold text-[#111215]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="modal-admin-pass"
                    type={showNewPass ? "text" : "password"}
                    placeholder="Enter secure password"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    required
                    className="bg-white border-[#E8E4DC] text-xs h-10 pl-8 pr-8 rounded-xl"
                  />
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddAdminModalOpen(false)}
                  className="text-xs h-9 rounded-xl border-[#E8E4DC] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingAdmin}
                  size="sm"
                  className="bg-[#C9A45C] hover:bg-[#B58E45] text-white text-xs h-9 px-4 rounded-xl font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isCreatingAdmin ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* MODAL: EDIT ADMINISTRATOR PASSWORD                       */}
        {/* ======================================================== */}
        <Dialog open={!!editingAdmin} onOpenChange={(open) => !open && setEditingAdmin(null)}>
          <DialogContent className="sm:max-w-md bg-white border border-[#E8E4DC] shadow-2xl rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-[#111215] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#C9A45C]" /> Change Administrator Password
              </DialogTitle>
              <DialogDescription className="text-xs text-[#70757F]">
                Update login password for administrator{" "}
                <span className="font-semibold text-stone-900">{editingAdmin?.username}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSavePassword} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-admin-pass" className="text-xs font-semibold text-[#111215]">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="edit-admin-pass"
                    type={showEditPass ? "text" : "password"}
                    placeholder="Enter new password"
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    required
                    autoFocus
                    className="bg-white border-[#E8E4DC] text-xs h-10 pl-8 pr-8 rounded-xl"
                  />
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showEditPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAdmin(null)}
                  className="text-xs h-9 rounded-xl border-[#E8E4DC] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  size="sm"
                  className="bg-[#C9A45C] hover:bg-[#B58E45] text-white text-xs h-9 px-4 rounded-xl font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save New Password</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
