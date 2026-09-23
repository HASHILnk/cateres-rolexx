import React, { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useOperations } from "../../lib/store";
import { EventType, PackageTier, ReadinessItem } from "../../lib/types";
import { toast } from "sonner";
import {
  Sparkles,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface NewEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewEventModal({ open, onOpenChange }: NewEventModalProps) {
  const router = useRouter();
  const { clients, addEvent, addClient } = useOperations();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [title, setTitle] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [eventType, setEventType] = useState<EventType>("Wedding");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("06:30 PM - 11:30 PM");
  const [venue, setVenue] = useState("");
  const [guestCount, setGuestCount] = useState<number>(350);
  const [packageTier, setPackageTier] = useState<PackageTier>("Royal Grandeur");
  const [budget, setBudget] = useState<number>(450000);
  const [advancePaid, setAdvancePaid] = useState<number>(200000);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setSelectedClientId("");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setEventType("Wedding");
    setDate("");
    setTime("06:30 PM - 11:30 PM");
    setVenue("");
    setGuestCount(350);
    setPackageTier("Royal Grandeur");
    setBudget(450000);
    setAdvancePaid(200000);
    setSpecialInstructions("");
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === "new") {
      setClientName("");
      setClientPhone("");
      setClientEmail("");
    } else {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        setClientName(client.name);
        setClientPhone(client.phone);
        setClientEmail(client.email || "");
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!title.trim()) {
        toast.error("Please enter an event title");
        return;
      }
      if (!clientName.trim() || !clientPhone.trim()) {
        toast.error("Please enter client contact details");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!date) {
        toast.error("Please select an event date");
        return;
      }
      if (!venue.trim()) {
        toast.error("Please enter the venue address");
        return;
      }
      if (guestCount <= 0) {
        toast.error("Guest count must be greater than 0");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If new client, save to clients
    if (selectedClientId === "new" || !selectedClientId) {
      const existing = clients.find(
        (c) => c.phone === clientPhone || c.name === clientName
      );
      if (!existing) {
        addClient({
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          address: venue,
          vip: false,
          notes: `Created via new event: ${title}`,
        });
      }
    }

    const defaultChecklist: ReadinessItem[] = [
      {
        id: "chk-c1",
        label: "Client Booking Confirmed & Advance Verified",
        category: "client",
        completed: advancePaid > 0,
      },
      {
        id: "chk-c2",
        label: "Catering Menu & Special Courses Approved",
        category: "menu",
        completed: false,
      },
      {
        id: "chk-c3",
        label: "Chafing Dishes & Silverware Allocated",
        category: "stock",
        completed: false,
      },
      {
        id: "chk-c4",
        label: "Lead Chef & Banquet Staff Scheduled",
        category: "staff",
        completed: false,
      },
      {
        id: "chk-c5",
        label: "Transport & Logistics Schedule Locked",
        category: "logistics",
        completed: false,
      },
      {
        id: "chk-c6",
        label: "Pre-Event Final Payment (40%) Settled",
        category: "payment",
        completed: false,
      },
    ];

    const newEvent = addEvent({
      title,
      clientName,
      clientPhone,
      clientEmail,
      date,
      time,
      venue,
      guestCount,
      eventType,
      status: "confirmed",
      packageTier,
      budget,
      advancePaid,
      specialInstructions,
      readinessChecklist: defaultChecklist,
      menuCourses: [
        {
          category: "Welcome Drinks",
          items: [],
        },
        {
          category: "Starters & Appetizers",
          items: [],
        },
        {
          category: "Main Course",
          items: [],
        },
        {
          category: "Desserts & Sweets",
          items: [],
        },
      ],
      stockAllocations: [],
      staffAssigned: [],
      expenses: [],
    });

    toast.success(`Event "${newEvent.title}" successfully scheduled!`);
    onOpenChange(false);
    resetForm();
    router.navigate({ href: `/events/${newEvent.id}` });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-[#C5A059]/30">
        <DialogHeader className="p-6 bg-gradient-to-r from-[#1E2024] via-[#16181B] to-[#121316] text-white border-b border-[#C5A059]/20">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-serif text-2xl font-bold text-[#FDFBF7] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C5A059]" />
                Schedule New Event
              </DialogTitle>
              <p className="text-xs text-[#C5A059]/90 mt-1">
                Step {step} of 3 —{" "}
                {step === 1 && "Client & Event Fundamentals"}
                {step === 2 && "Venue, Schedule & Guest Count"}
                {step === 3 && "Package, Budget & Financials"}
              </p>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-medium transition-all ${
                    step === s
                      ? "bg-[#C5A059] text-black ring-2 ring-[#C5A059]/40 font-bold"
                      : step > s
                      ? "bg-[#C5A059]/40 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {step > s ? "✓" : s}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Step 1: Client & Details */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Event Title / Occasion *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Grand Royal Wedding Banquet: Tariq & Zoya"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Event Type</Label>
                    <Select
                      value={eventType}
                      onValueChange={(val) => setEventType(val as EventType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wedding">Wedding</SelectItem>
                        <SelectItem value="Reception">Reception</SelectItem>
                        <SelectItem value="Corporate Gala">
                          Corporate Gala
                        </SelectItem>
                        <SelectItem value="Executive Dinner">
                          Executive Dinner
                        </SelectItem>
                        <SelectItem value="Birthday / Jubilee">
                          Birthday / Jubilee
                        </SelectItem>
                        <SelectItem value="Banquet">Banquet</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Select Existing Client (Optional)
                    </Label>
                    <Select
                      value={selectedClientId}
                      onValueChange={handleClientSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose client or new" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">+ Enter New Client</SelectItem>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} {c.vip ? "(VIP)" : ""} — {c.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/40">
                  <div className="space-y-1.5">
                    <Label htmlFor="clientName" className="text-sm font-medium">
                      Client Full Name *
                    </Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Dr. Tariq Rahman"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="clientPhone" className="text-sm font-medium">
                      Mobile / WhatsApp *
                    </Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+91 98470 00000"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="clientEmail" className="text-sm font-medium">
                      Email Address (Optional)
                    </Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Schedule & Logistics */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-sm font-medium">
                      Event Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="time" className="text-sm font-medium">
                      Event Timing *
                    </Label>
                    <Input
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 06:30 PM - 11:30 PM"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="venue" className="text-sm font-medium">
                    Venue / Banquet Hall Location *
                  </Label>
                  <Input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. The Grand Regal Palace Convention Centre, Calicut"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="guestCount" className="text-sm font-medium">
                      Expected Guest Count *
                    </Label>
                    <Input
                      id="guestCount"
                      type="number"
                      min={10}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Equipment & portion quantities will be estimated based on
                      this count.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Culinary Package Tier
                    </Label>
                    <Select
                      value={packageTier}
                      onValueChange={(val) =>
                        setPackageTier(val as PackageTier)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Royal Grandeur">
                          Royal Grandeur (5-Course Premium Feast)
                        </SelectItem>
                        <SelectItem value="Imperial Gold">
                          Imperial Gold (4-Course Gourmet)
                        </SelectItem>
                        <SelectItem value="Classic Elegance">
                          Classic Elegance (Traditional Banquet)
                        </SelectItem>
                        <SelectItem value="Custom Executive">
                          Custom Executive Tier
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Budget & Notes */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="budget" className="text-sm font-medium">
                      Total Estimated Budget / Agreed Price (₹) *
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      step="1000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="advance" className="text-sm font-medium">
                      Advance Token Collected (₹)
                    </Label>
                    <Input
                      id="advance"
                      type="number"
                      step="1000"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Will be automatically recorded in the finance income ledger.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Special Culinary or Logistics Instructions
                  </Label>
                  <Textarea
                    id="notes"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. VIP dining service protocol, woodfire dum pots, specific dietary requests..."
                    rows={3}
                  />
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-lg bg-amber-500/10 border border-[#C5A059]/30 text-xs space-y-1 text-foreground">
                  <div className="font-semibold text-sm text-[#8F702F] dark:text-[#E0BA6E]">
                    Ready to schedule: {title || "Untitled Event"}
                  </div>
                  <div>
                    Client: {clientName} ({clientPhone})
                  </div>
                  <div>
                    Date: {date || "Not set"} • Venue: {venue} • {guestCount}{" "}
                    guests
                  </div>
                  <div>
                    Package: {packageTier} • Total: ₹{budget.toLocaleString()} •
                    Advance: ₹{advancePaid.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border/40 bg-muted/20 flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-black hover:bg-neutral-800 text-white gap-1.5"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#C5A059] to-[#8F702F] hover:from-[#B59049] hover:to-[#7F601F] text-white font-semibold gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Open Workspace
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
