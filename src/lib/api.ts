// Central REST API Client for ROLEX Operations Backend

function resolveApiBaseUrl(): string {
  const envUrl = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_URL : undefined;

  // 1. If an explicit external domain with a dot is provided (e.g. https://rolex-backend-xxxx.onrender.com)
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/+$/, "");
    if (trimmed.includes(".") || trimmed.includes("localhost")) {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      return `https://${trimmed}`;
    }
  }

  // 2. If running locally in development browser
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:8000";
    }
    // 3. In production on Render, connect directly to the live verified backend URL:
    return "https://rolex-backend-7blq.onrender.com";
  }

  return "https://rolex-backend-7blq.onrender.com";
}

const API_BASE_URL = resolveApiBaseUrl();

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("rolex_auth_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("rolex_auth_token");
      localStorage.removeItem("rolex_auth_user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized: Please log in with admin credentials.");
  }

  if (!response.ok) {
    let errorMsg = `API request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorMsg = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Ignore fallback
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Authentication
  auth: {
    login: (username: string, password: string) =>
      request<{ access_token: string; token_type: string; admin: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    getMe: () => request<any>("/api/auth/me"),
  },

  // Administrators
  admins: {
    list: () => request<any[]>("/api/admins"),
    create: (username: string, password: string) =>
      request<any>("/api/admins", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    updatePassword: (id: string, password: string) =>
      request<any>(`/api/admins/${id}/password`, {
        method: "PUT",
        body: JSON.stringify({ password }),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/admins/${id}`, {
        method: "DELETE",
      }),
    emptyData: () =>
      request<{ message: string }>("/api/admins/empty-data", {
        method: "POST",
      }),
  },

  // Clients
  clients: {
    list: () => request<any[]>("/api/clients"),
    create: (data: any) =>
      request<any>("/api/clients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/api/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/clients/${id}`, {
        method: "DELETE",
      }),
  },

  // Catering Events
  events: {
    list: () => request<any[]>("/api/events"),
    get: (id: string) => request<any>(`/api/events/${id}`),
    create: (data: any) =>
      request<any>("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/api/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/events/${id}`, {
        method: "DELETE",
      }),

    // Readiness items
    addReadiness: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/readiness`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    toggleReadiness: (eventId: string, itemId: string) =>
      request<any>(`/api/events/${eventId}/readiness/${itemId}/toggle`, {
        method: "PUT",
      }),

    // Menu course items
    addMenuCourse: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/menu`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    deleteMenuCourse: (eventId: string, itemId: string) =>
      request<{ message: string }>(`/api/events/${eventId}/menu/${itemId}`, {
        method: "DELETE",
      }),

    // Stock Allocations
    allocateStock: (eventId: string, data: { stock_item_id: string; quantity: number }) =>
      request<any>(`/api/events/${eventId}/stock`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    removeStockAllocation: (eventId: string, stockItemId: string) =>
      request<{ message: string }>(`/api/events/${eventId}/stock/${stockItemId}`, {
        method: "DELETE",
      }),

    // Event Expense
    logExpense: (eventId: string, data: any) =>
      request<any>(`/api/events/${eventId}/expenses`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Stock Inventory
  stock: {
    list: () => request<any[]>("/api/stock"),
    create: (data: any) =>
      request<any>("/api/stock", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<any>(`/api/stock/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/stock/${id}`, {
        method: "DELETE",
      }),
  },

  // Quotations
  quotations: {
    list: () => request<any[]>("/api/quotations"),
    create: (data: any) =>
      request<any>("/api/quotations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/api/quotations/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/quotations/${id}`, {
        method: "DELETE",
      }),
  },

  // Money & Transactions
  transactions: {
    list: () => request<any[]>("/api/transactions"),
    create: (data: any) =>
      request<any>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Business Profile
  profile: {
    get: () => request<any>("/api/profile"),
    update: (data: any) =>
      request<any>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};
