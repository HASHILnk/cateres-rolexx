import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import {
  CateringEvent,
  StockItem,
  Client,
  Quotation,
  Transaction,
  BusinessProfile,
  ReadinessItem,
  MenuItem,
  Expense,
  StockAllocation,
} from "./types";
import {
  initialBusinessProfile,
  initialClients,
  initialEvents,
  initialQuotations,
  initialStockItems,
  initialTransactions,
} from "./mock-data";
import { api } from "./api";

interface OperationsMetrics {
  activeEventsCount: number;
  totalPipelineRevenue: number;
  totalAdvanceReceived: number;
  totalPendingReceivables: number;
  totalExpenses: number;
  netMargin: number;
  stockShortagesCount: number;
  urgentReadinessCount: number;
}

interface OperationsContextType {
  events: CateringEvent[];
  stock: StockItem[];
  clients: Client[];
  quotations: Quotation[];
  transactions: Transaction[];
  profile: BusinessProfile;
  metrics: OperationsMetrics;
  shortages: { item: StockItem; deficit: number; eventTitles: string[] }[];
  urgentEvents: CateringEvent[];

  // Event Actions
  addEvent: (event: Omit<CateringEvent, "id" | "createdAt">) => CateringEvent;
  updateEvent: (id: string, updates: Partial<CateringEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleReadinessItem: (eventId: string, itemId: string) => void;
  addReadinessItem: (
    eventId: string,
    item: Omit<ReadinessItem, "id">
  ) => void;
  addMenuCourseItem: (
    eventId: string,
    category: string,
    item: Omit<MenuItem, "id">
  ) => void;
  removeMenuCourseItem: (
    eventId: string,
    category: string,
    itemId: string
  ) => void;
  allocateStockToEvent: (
    eventId: string,
    stockItemId: string,
    quantity: number
  ) => void;
  removeStockFromEvent: (eventId: string, stockItemId: string) => void;
  logEventExpense: (eventId: string, expense: Omit<Expense, "id">) => void;

  // Stock Actions
  addStockItem: (
    item: Omit<StockItem, "id" | "reservedQty">
  ) => StockItem;
  updateStockItem: (id: string, updates: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;

  // Client Actions
  addClient: (
    client: Omit<Client, "id" | "totalEvents" | "totalSpend">
  ) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;

  // Quotation Actions
  createQuotation: (
    quotation: Omit<Quotation, "id" | "quotationNumber">
  ) => Quotation;
  updateQuotationStatus: (id: string, status: Quotation["status"]) => void;

  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, "id">) => Transaction;

  // Profile Actions
  updateProfile: (updates: Partial<BusinessProfile>) => void;
  resetToInitialData: () => void;
  emptyDatabaseData: () => Promise<void>;
}

const OperationsContext = createContext<OperationsContextType | undefined>(
  undefined
);

const STORAGE_KEYS = {
  EVENTS: "rolex_operations_events_v1",
  STOCK: "rolex_operations_stock_v1",
  CLIENTS: "rolex_operations_clients_v1",
  QUOTATIONS: "rolex_operations_quotations_v1",
  TRANSACTIONS: "rolex_operations_transactions_v1",
  PROFILE: "rolex_operations_profile_v1",
};

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CateringEvent[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  // Client-side hydration from localStorage followed by backend API sync
  useEffect(() => {
    async function loadData() {
      // 1. Initial local load for instant UI rendering
      try {
        const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
        const storedStock = localStorage.getItem(STORAGE_KEYS.STOCK);
        const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
        const storedQuotations = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
        const storedTransactions = localStorage.getItem(
          STORAGE_KEYS.TRANSACTIONS
        );
        const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);

        if (storedEvents) setEvents(JSON.parse(storedEvents));
        if (storedStock) setStock(JSON.parse(storedStock));
        if (storedClients) setClients(JSON.parse(storedClients));
        if (storedQuotations) setQuotations(JSON.parse(storedQuotations));
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
        if (storedProfile) setProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.warn("Failed to load operations state from localStorage", e);
      } finally {
        setIsLoaded(true);
      }

      // 2. Sync from backend API
      try {
        const [liveClients, liveStock, liveEvents, liveQuotations, liveTransactions, liveProfile] =
          await Promise.allSettled([
            api.clients.list(),
            api.stock.list(),
            api.events.list(),
            api.quotations.list(),
            api.transactions.list(),
            api.profile.get(),
          ]);

        if (liveClients.status === "fulfilled" && Array.isArray(liveClients.value)) {
          const mappedClients: Client[] = liveClients.value.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || "",
            address: c.address || "",
            company: c.company || "",
            vip: !!c.vip,
            notes: c.notes || "",
            totalEvents: c.total_events ?? c.totalEvents ?? 0,
            totalSpend: c.total_spend ?? c.totalSpend ?? 0,
            lastEventDate: c.last_event_date ?? c.lastEventDate,
          }));
          setClients(mappedClients);
        }

        if (liveStock.status === "fulfilled" && Array.isArray(liveStock.value)) {
          const mappedStock: StockItem[] = liveStock.value.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category || "Crockery & Glassware",
            totalQty: s.total_qty ?? s.totalQty ?? 0,
            reservedQty: s.reserved_qty ?? s.reservedQty ?? 0,
            unit: s.unit || "pcs",
            location: s.location || "Warehouse Shelf A",
            minThreshold: s.min_threshold ?? s.minThreshold ?? 0,
            condition: (s.condition || "Excellent") as any,
          }));
          setStock(mappedStock);
        }

        if (liveEvents.status === "fulfilled" && Array.isArray(liveEvents.value)) {
          const mappedEvents: CateringEvent[] = liveEvents.value.map((e: any) => ({
            id: e.id,
            title: e.title,
            clientName: e.client_name ?? e.clientName ?? "",
            clientPhone: e.client_phone ?? e.clientPhone ?? "",
            date: e.date,
            time: e.time || "18:00",
            guestCount: e.guest_count ?? e.guestCount ?? 0,
            venue: e.venue || "",
            eventType: (e.event_type ?? e.eventType ?? "Wedding") as any,
            status: (e.status ?? "planning") as any,
            packageTier: (e.package_tier ?? e.packageTier ?? "Royal Grandeur") as any,
            budget: e.budget ?? 0,
            advancePaid: e.advance_paid ?? e.advancePaid ?? 0,
            specialInstructions: e.special_instructions ?? e.specialInstructions ?? "",
            createdAt: e.created_at ?? e.createdAt ?? new Date().toISOString(),
            readinessChecklist: (e.readiness_items || []).map((r: any) => ({
              id: r.id,
              category: r.category || "client",
              label: r.label,
              completed: !!r.is_done,
              notes: r.notes || "",
            })),
            menuCourses: (e.menu_courses || []).map((m: any) => ({
              category: m.category || "Main Course",
              items: (m.items || []).map((it: any) => ({
                id: it.id,
                name: it.name,
                isVeg: !it.dietary || it.dietary === "veg",
                description: it.notes || "",
              })),
            })),
            stockAllocations: (e.stock_allocations || []).map((sa: any) => ({
              stockItemId: sa.stock_item_id,
              stockItemName: sa.stock_item_name || "Equipment",
              quantity: sa.quantity,
              status: "reserved" as const,
            })),
            expenses: (e.expenses || []).map((ex: any) => ({
              id: ex.id,
              category: ex.category || "Miscellaneous",
              amount: ex.amount,
              description: ex.description || "",
              date: ex.date,
              paidTo: "Vendor",
              paymentMethod: "Bank Transfer" as const,
            })),
            staffAssigned: [],
          }));
          setEvents(mappedEvents);
        }

        if (liveQuotations.status === "fulfilled" && Array.isArray(liveQuotations.value)) {
          const mappedQuotations: Quotation[] = liveQuotations.value.map((q: any) => ({
            id: q.id,
            quotationNumber: q.quotation_number ?? q.quotationNumber ?? "QTN-001",
            eventId: q.event_id ?? q.eventId,
            eventTitle: q.event_title ?? q.eventTitle ?? "Banquet Event",
            clientName: q.client_name ?? q.clientName ?? "Client",
            clientPhone: q.client_phone ?? q.clientPhone ?? "",
            clientEmail: q.client_email ?? q.clientEmail ?? "",
            date: q.date || new Date().toISOString().split("T")[0],
            validUntil: q.valid_until ?? q.validUntil ?? "",
            subtotal: Number(q.subtotal ?? 0),
            taxPercentage: Number(q.tax_pct ?? q.taxPercentage ?? 5),
            discountPercentage: Number(q.discount_pct ?? q.discountPercentage ?? 0),
            total: Number(q.total ?? 0),
            status: (q.status || "draft") as any,
            notes: q.notes || "",
            items: (q.items || []).map((it: any) => ({
              id: it.id,
              description: it.description || "",
              category: it.category || "Food & Beverage",
              qty: Number(it.quantity ?? it.qty ?? 1),
              unitPrice: Number(it.unit_rate ?? it.unitPrice ?? 0),
              amount: Number(it.amount ?? 0),
            })),
          }));
          setQuotations(mappedQuotations);
        }

        if (liveTransactions.status === "fulfilled" && Array.isArray(liveTransactions.value)) {
          const mappedTransactions: Transaction[] = liveTransactions.value.map((t: any) => ({
            id: t.id,
            date: t.date || new Date().toISOString().split("T")[0],
            type: t.type as "income" | "expense",
            amount: Number(t.amount ?? 0),
            category: t.category || "General",
            description: t.description || "",
            eventId: t.event_id ?? t.eventId,
            eventTitle: t.event_title ?? t.eventTitle,
            clientName: t.client_name ?? t.clientName,
            paymentMethod: (t.payment_method ?? t.paymentMethod ?? "Bank Transfer") as any,
            status: (t.status ?? "completed") as any,
          }));
          setTransactions(mappedTransactions);
        }

        if (liveProfile.status === "fulfilled" && liveProfile.value && liveProfile.value.name) {
          setProfile((prev) => ({
            ...prev,
            name: liveProfile.value.name,
            tagline: liveProfile.value.tagline || prev.tagline,
            phone: liveProfile.value.phone || prev.phone,
            email: liveProfile.value.email || prev.email,
            address: liveProfile.value.address || prev.address,
            gstNumber: liveProfile.value.gst_number || prev.gstNumber,
            whatsappTemplate: liveProfile.value.whatsapp_template || prev.whatsappTemplate,
          }));
        }
      } catch (err) {
        console.warn("API background sync warning:", err);
      }
    }

    loadData();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      localStorage.setItem(
        STORAGE_KEYS.QUOTATIONS,
        JSON.stringify(quotations)
      );
      localStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions)
      );
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn("Failed to persist operations state to localStorage", e);
    }
  }, [events, stock, clients, quotations, transactions, profile, isLoaded]);

  // Recalculate dynamic stock reservations and shortage detections
  const shortages = useMemo(() => {
    return stock
      .filter((item) => item.reservedQty > item.totalQty)
      .map((item) => {
        const affected = events
          .filter(
            (ev) =>
              ev.status !== "completed" &&
              ev.status !== "cancelled" &&
              ev.stockAllocations.some((sa) => sa.stockItemId === item.id)
          )
          .map((ev) => ev.title);
        return {
          item,
          deficit: item.reservedQty - item.totalQty,
          eventTitles: affected,
        };
      });
  }, [stock, events]);

  // Urgent events: happening soon with incomplete readiness
  const urgentEvents = useMemo(() => {
    return events.filter((ev) => {
      if (ev.status === "completed" || ev.status === "cancelled") return false;
      const incomplete = ev.readinessChecklist.filter((c) => !c.completed);
      return incomplete.length > 0;
    });
  }, [events]);

  // Operational metrics
  const metrics = useMemo<OperationsMetrics>(() => {
    const activeEvents = events.filter(
      (e) => e.status === "confirmed" || e.status === "in_progress"
    );
    const totalPipelineRevenue = activeEvents.reduce(
      (sum, e) => sum + (e.budget || 0),
      0
    );
    const totalAdvanceReceived = activeEvents.reduce(
      (sum, e) => sum + (e.advancePaid || 0),
      0
    );
    const totalPendingReceivables = Math.max(
      0,
      totalPipelineRevenue - totalAdvanceReceived
    );

    const totalExpenses = transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    const netMargin =
      totalIncome > 0
        ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
        : 0;

    return {
      activeEventsCount: activeEvents.length,
      totalPipelineRevenue,
      totalAdvanceReceived,
      totalPendingReceivables,
      totalExpenses,
      netMargin,
      stockShortagesCount: shortages.length,
      urgentReadinessCount: urgentEvents.length,
    };
  }, [events, transactions, shortages, urgentEvents]);

  // Actions
  const addEvent = (
    eventData: Omit<CateringEvent, "id" | "createdAt">
  ): CateringEvent => {
    const id = `evt-${Date.now()}`;
    const newEvent: CateringEvent = {
      ...eventData,
      id,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);

    // Update client stats if client exists
    setClients((prev) =>
      prev.map((c) => {
        if (
          c.name.toLowerCase() === newEvent.clientName.toLowerCase() ||
          c.phone === newEvent.clientPhone
        ) {
          return {
            ...c,
            totalEvents: c.totalEvents + 1,
            totalSpend: c.totalSpend + (newEvent.budget || 0),
            lastEventDate: newEvent.date,
          };
        }
        return c;
      })
    );

    // If advance paid, record transaction
    if (newEvent.advancePaid > 0) {
      const txn: Transaction = {
        id: `txn-${Date.now()}`,
        date: newEvent.date,
        type: "income",
        amount: newEvent.advancePaid,
        category: "Event Advance Payment",
        description: `Advance received for ${newEvent.title}`,
        eventId: id,
        eventTitle: newEvent.title,
        clientName: newEvent.clientName,
        paymentMethod: "Bank Transfer",
        status: "completed",
      };
      setTransactions((prev) => [txn, ...prev]);
    }

    // Also sync to backend API
    api.events
      .create({
        title: newEvent.title,
        client_name: newEvent.clientName,
        client_phone: newEvent.clientPhone,
        date: newEvent.date,
        time: newEvent.time,
        guest_count: newEvent.guestCount,
        venue: newEvent.venue,
        event_type: newEvent.eventType,
        status: newEvent.status,
        budget: newEvent.budget,
        advance_paid: newEvent.advancePaid,
        special_instructions: newEvent.specialInstructions,
      })
      .catch((err) => console.warn("Could not sync event creation to API:", err));

    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CateringEvent>) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev))
    );

    const p: any = {};
    if (updates.title !== undefined) p.title = updates.title;
    if (updates.clientName !== undefined) p.client_name = updates.clientName;
    if (updates.clientPhone !== undefined) p.client_phone = updates.clientPhone;
    if (updates.date !== undefined) p.date = updates.date;
    if (updates.time !== undefined) p.time = updates.time;
    if (updates.guestCount !== undefined) p.guest_count = updates.guestCount;
    if (updates.venue !== undefined) p.venue = updates.venue;
    if (updates.eventType !== undefined) p.event_type = updates.eventType;
    if (updates.status !== undefined) p.status = updates.status;
    if (updates.budget !== undefined) p.budget = updates.budget;
    if (updates.advancePaid !== undefined) p.advance_paid = updates.advancePaid;
    if (updates.specialInstructions !== undefined) p.special_instructions = updates.specialInstructions;
    api.events.update(id, p).catch((err) => console.warn("Could not sync event update to API:", err));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    api.events.delete(id).catch((err) => console.warn("Could not sync event deletion to API:", err));
  };

  const toggleReadinessItem = (eventId: string, itemId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const updatedChecklist = ev.readinessChecklist.map((item) =>
          item.id === itemId
            ? { ...item, completed: !item.completed }
            : item
        );
        return { ...ev, readinessChecklist: updatedChecklist };
      })
    );
    api.events.toggleReadiness(eventId, itemId).catch((err) => console.warn("Could not sync readiness toggle:", err));
  };

  const addReadinessItem = (
    eventId: string,
    item: Omit<ReadinessItem, "id">
  ) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const newItem: ReadinessItem = { ...item, id: `chk-${Date.now()}` };
        return {
          ...ev,
          readinessChecklist: [...ev.readinessChecklist, newItem],
        };
      })
    );
  };

  const addMenuCourseItem = (
    eventId: string,
    category: string,
    item: Omit<MenuItem, "id">
  ) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const newItem: MenuItem = { ...item, id: `m-${Date.now()}` };
        let categoryFound = false;
        const updatedCourses = ev.menuCourses.map((c) => {
          if (c.category === category) {
            categoryFound = true;
            return { ...c, items: [...c.items, newItem] };
          }
          return c;
        });
        if (!categoryFound) {
          updatedCourses.push({
            category: category as any,
            items: [newItem],
          });
        }
        return { ...ev, menuCourses: updatedCourses };
      })
    );
  };

  const removeMenuCourseItem = (
    eventId: string,
    category: string,
    itemId: string
  ) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const updatedCourses = ev.menuCourses
          .map((c) => {
            if (c.category === category) {
              return {
                ...c,
                items: c.items.filter((i) => i.id !== itemId),
              };
            }
            return c;
          })
          .filter((c) => c.items.length > 0);
        return { ...ev, menuCourses: updatedCourses };
      })
    );
  };

  const allocateStockToEvent = (
    eventId: string,
    stockItemId: string,
    quantity: number
  ) => {
    const stockItem = stock.find((s) => s.id === stockItemId);
    if (!stockItem) return;

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const existing = ev.stockAllocations.find(
          (sa) => sa.stockItemId === stockItemId
        );
        let updatedAllocations: StockAllocation[];
        const isShortage = stockItem.reservedQty + quantity > stockItem.totalQty;

        if (existing) {
          updatedAllocations = ev.stockAllocations.map((sa) =>
            sa.stockItemId === stockItemId
              ? {
                  ...sa,
                  quantity: sa.quantity + quantity,
                  status: isShortage ? "shortage" : "reserved",
                }
              : sa
          );
        } else {
          updatedAllocations = [
            ...ev.stockAllocations,
            {
              stockItemId,
              stockItemName: stockItem.name,
              quantity,
              status: isShortage ? "shortage" : "reserved",
            },
          ];
        }
        return { ...ev, stockAllocations: updatedAllocations };
      })
    );

    // Update stock reserved quantity
    setStock((prev) =>
      prev.map((s) =>
        s.id === stockItemId
          ? { ...s, reservedQty: s.reservedQty + quantity }
          : s
      )
    );
  };

  const removeStockFromEvent = (eventId: string, stockItemId: string) => {
    let releasedQty = 0;
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        const alloc = ev.stockAllocations.find(
          (sa) => sa.stockItemId === stockItemId
        );
        if (alloc) releasedQty = alloc.quantity;
        return {
          ...ev,
          stockAllocations: ev.stockAllocations.filter(
            (sa) => sa.stockItemId !== stockItemId
          ),
        };
      })
    );

    if (releasedQty > 0) {
      setStock((prev) =>
        prev.map((s) =>
          s.id === stockItemId
            ? { ...s, reservedQty: Math.max(0, s.reservedQty - releasedQty) }
            : s
        )
      );
    }
  };

  const logEventExpense = (
    eventId: string,
    expenseData: Omit<Expense, "id">
  ) => {
    const expenseId = `exp-${Date.now()}`;
    const newExpense: Expense = { ...expenseData, id: expenseId };

    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, expenses: [...ev.expenses, newExpense] }
          : ev
      )
    );

    // Also add to transactions ledger
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      date: newExpense.date,
      type: "expense",
      amount: newExpense.amount,
      category: newExpense.category,
      description: newExpense.description,
      eventId,
      eventTitle: newExpense.eventTitle,
      paymentMethod: newExpense.paymentMethod,
      status: "completed",
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  const addStockItem = (
    itemData: Omit<StockItem, "id" | "reservedQty">
  ): StockItem => {
    const newItem: StockItem = {
      ...itemData,
      id: `stk-${Date.now()}`,
      reservedQty: 0,
    };
    setStock((prev) => [newItem, ...prev]);

    api.stock
      .create({
        name: itemData.name,
        category: itemData.category,
        total_qty: itemData.totalQty,
        unit: itemData.unit,
        min_threshold: itemData.minThreshold,
      })
      .catch((err) => console.warn("Could not sync stock item creation to API:", err));

    return newItem;
  };

  const updateStockItem = (id: string, updates: Partial<StockItem>) => {
    setStock((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    const p: any = {};
    if (updates.name !== undefined) p.name = updates.name;
    if (updates.category !== undefined) p.category = updates.category;
    if (updates.totalQty !== undefined) p.total_qty = updates.totalQty;
    if (updates.unit !== undefined) p.unit = updates.unit;
    if (updates.minThreshold !== undefined) p.min_threshold = updates.minThreshold;
    api.stock.update(id, p).catch((err) => console.warn("Could not sync stock update to API:", err));
  };

  const deleteStockItem = (id: string) => {
    setStock((prev) => prev.filter((item) => item.id !== id));
    api.stock.delete(id).catch((err) => console.warn("Could not sync stock deletion to API:", err));
  };

  const addClient = (
    clientData: Omit<Client, "id" | "totalEvents" | "totalSpend">
  ): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      totalEvents: 0,
      totalSpend: 0,
    };
    setClients((prev) => [newClient, ...prev]);

    api.clients
      .create({
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        address: clientData.address,
        company: clientData.company,
        vip: clientData.vip,
        notes: clientData.notes,
      })
      .catch((err) => console.warn("Could not sync client creation to API:", err));

    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    api.clients.update(id, updates).catch((err) => console.warn("Could not sync client update to API:", err));
  };

  const createQuotation = (
    quotData: Omit<Quotation, "id" | "quotationNumber">
  ): Quotation => {
    const quotNumber = `ROX-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newQuot: Quotation = {
      ...quotData,
      id: `quot-${Date.now()}`,
      quotationNumber: quotNumber,
    };
    setQuotations((prev) => [newQuot, ...prev]);

    if (quotData.eventId) {
      updateEvent(quotData.eventId, { quotationId: newQuot.id });
    } else if (quotData.status === "approved") {
      // Auto-create confirmed event if saved directly as approved
      const parsedEventType = (quotData.serviceType === "Plated Table Service" ? "Reception" : "Wedding") as any;
      const newEvent = addEvent({
        title: quotData.eventTitle,
        clientName: quotData.clientName,
        clientPhone: quotData.clientPhone,
        clientEmail: quotData.clientEmail,
        date: quotData.eventDate || quotData.validUntil || new Date().toISOString().split("T")[0],
        time: quotData.eventTiming || "06:00 PM - 11:00 PM",
        venue: quotData.venue || "Bianco Castle, Tirur",
        guestCount: quotData.guestCount || 1500,
        eventType: parsedEventType,
        status: "confirmed",
        packageTier: "Royal Grandeur",
        budget: quotData.total,
        advancePaid: 0,
        readinessChecklist: [
          { id: `chk-1-${Date.now()}`, label: "Quotation & Menu Approved by Client", category: "client", completed: true },
          { id: `chk-2-${Date.now()}`, label: "50% Booking Advance Received", category: "payment", completed: false },
          { id: `chk-3-${Date.now()}`, label: "Kitchen Ingredient Procurement Order", category: "menu", completed: false },
          { id: `chk-4-${Date.now()}`, label: "Banquet Ware & Chafing Handis Reserved", category: "stock", completed: false },
          { id: `chk-5-${Date.now()}`, label: "Service Captains & Stewards Rostered", category: "staff", completed: false },
          { id: `chk-6-${Date.now()}`, label: "Logistics Van & Kitchen Dispatch Scheduled", category: "logistics", completed: false },
        ],
        menuCourses: [],
        stockAllocations: [],
        expenses: [],
        staffAssigned: [],
        quotationId: newQuot.id,
      });
      newQuot.eventId = newEvent.id;
    }

    api.quotations
      .create({
        client_name: quotData.clientName,
        client_phone: quotData.clientPhone,
        event_title: quotData.eventTitle,
        date: quotData.date,
        valid_until: quotData.validUntil,
        status: quotData.status,
        subtotal: quotData.subtotal,
        tax_pct: quotData.taxPercentage,
        discount_pct: quotData.discountPercentage,
        total: quotData.total,
        notes: quotData.notes || "",
        items: (quotData.items || []).map((it) => ({
          description: it.description,
          category: it.category || "Food & Beverage",
          quantity: it.qty,
          unit_rate: it.unitPrice,
          amount: it.amount,
        })),
      })
      .catch((err) => console.warn("Could not sync quotation creation to API:", err));

    return newQuot;
  };

  const updateQuotationStatus = (
    id: string,
    status: Quotation["status"]
  ) => {
    const targetQuot = quotations.find((q) => q.id === id);

    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
    api.quotations.updateStatus(id, status).catch((err) => console.warn("Could not sync quotation status to API:", err));

    if (status === "approved" && targetQuot) {
      if (targetQuot.eventId) {
        // Link to existing event and confirm it
        updateEvent(targetQuot.eventId, {
          status: "confirmed",
          budget: targetQuot.total,
          quotationId: targetQuot.id,
        });
      } else {
        // Automatically create and confirm the event in the schedule!
        const parsedEventType = (targetQuot.serviceType === "Plated Table Service" ? "Reception" : "Wedding") as any;
        const newEvent = addEvent({
          title: targetQuot.eventTitle,
          clientName: targetQuot.clientName,
          clientPhone: targetQuot.clientPhone,
          clientEmail: targetQuot.clientEmail,
          date: targetQuot.eventDate || targetQuot.validUntil || new Date().toISOString().split("T")[0],
          time: targetQuot.eventTiming || "06:00 PM - 11:00 PM",
          venue: targetQuot.venue || "Bianco Castle, Tirur",
          guestCount: targetQuot.guestCount || 1500,
          eventType: parsedEventType,
          status: "confirmed",
          packageTier: "Royal Grandeur",
          budget: targetQuot.total,
          advancePaid: 0,
          readinessChecklist: [
            { id: `chk-1-${Date.now()}`, label: "Quotation & Menu Approved by Client", category: "client", completed: true },
            { id: `chk-2-${Date.now()}`, label: "50% Booking Advance Received", category: "payment", completed: false },
            { id: `chk-3-${Date.now()}`, label: "Kitchen Ingredient Procurement Order", category: "menu", completed: false },
            { id: `chk-4-${Date.now()}`, label: "Banquet Ware & Chafing Handis Reserved", category: "stock", completed: false },
            { id: `chk-5-${Date.now()}`, label: "Service Captains & Stewards Rostered", category: "staff", completed: false },
            { id: `chk-6-${Date.now()}`, label: "Logistics Van & Kitchen Dispatch Scheduled", category: "logistics", completed: false },
          ],
          menuCourses: [],
          stockAllocations: [],
          expenses: [],
          staffAssigned: [],
          quotationId: targetQuot.id,
        });

        // Link the newly created event back to the quotation
        setQuotations((prev) =>
          prev.map((q) => (q.id === id ? { ...q, eventId: newEvent.id } : q))
        );
      }
    }
  };

  const addTransaction = (
    txnData: Omit<Transaction, "id">
  ): Transaction => {
    const newTxn: Transaction = {
      ...txnData,
      id: `txn-${Date.now()}`,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    api.transactions
      .create({
        event_id: txnData.eventId,
        type: txnData.type,
        amount: txnData.amount,
        category: txnData.category,
        description: txnData.description,
        date: txnData.date,
        payment_method: txnData.paymentMethod,
        status: txnData.status,
      })
      .catch((err) => console.warn("Could not sync transaction to API:", err));
    return newTxn;
  };

  const updateProfile = (updates: Partial<BusinessProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    const p: any = {};
    if (updates.name !== undefined) p.name = updates.name;
    if (updates.tagline !== undefined) p.tagline = updates.tagline;
    if (updates.phone !== undefined) p.phone = updates.phone;
    if (updates.email !== undefined) p.email = updates.email;
    if (updates.address !== undefined) p.address = updates.address;
    if (updates.gstNumber !== undefined) p.gst_number = updates.gstNumber;
    if (updates.whatsappTemplate !== undefined) p.whatsapp_template = updates.whatsappTemplate;
    api.profile.update(p).catch((err) => console.warn("Could not sync profile update to API:", err));
  };

  const emptyDatabaseData = async () => {
    setEvents([]);
    setStock([]);
    setClients([]);
    setQuotations([]);
    setTransactions([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.STOCK);
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    } catch (e) {
      console.warn("Failed to clear localStorage", e);
    }
    await api.admins.emptyData();
  };

  const resetToInitialData = () => {
    setEvents(initialEvents);
    setStock(initialStockItems);
    setClients(initialClients);
    setQuotations(initialQuotations);
    setTransactions(initialTransactions);
    setProfile(initialBusinessProfile);
    try {
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.STOCK);
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch (e) {
      console.warn("Failed to clear localStorage", e);
    }
  };

  return (
    <OperationsContext.Provider
      value={{
        events,
        stock,
        clients,
        quotations,
        transactions,
        profile,
        metrics,
        shortages,
        urgentEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleReadinessItem,
        addReadinessItem,
        addMenuCourseItem,
        removeMenuCourseItem,
        allocateStockToEvent,
        removeStockFromEvent,
        logEventExpense,
        addStockItem,
        updateStockItem,
        deleteStockItem,
        addClient,
        updateClient,
        createQuotation,
        updateQuotationStatus,
        addTransaction,
        updateProfile,
        resetToInitialData,
        emptyDatabaseData,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error("useOperations must be used within an OperationsProvider");
  }
  return context;
}
