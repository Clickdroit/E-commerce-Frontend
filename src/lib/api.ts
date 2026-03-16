import type {
  ApiResponse,
  AuthResponse,
  CreateOrderData,
  CreateProductData,
  LoginCredentials,
  Order,
  PaginatedData,
  PaymentIntent,
  Product,
  Refund,
  RegisterData,
  Shipment,
  TrackingInfo,
  UpdateProductData,
  UpdateShipmentData,
  User,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success && data.data.accessToken) {
      accessToken = data.data.accessToken;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // If 401 and we have a token, try refreshing
  if (res.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      res = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  const data = await res.json();
  return data as ApiResponse<T>;
}

// ─── Auth API ──────────────────────────────────────────────────────────────

export const authApi = {
  register(data: RegisterData) {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: LoginCredentials) {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout() {
    return apiRequest<void>("/auth/logout", { method: "POST" });
  },

  getProfile() {
    return apiRequest<User>("/auth/profile");
  },

  refreshToken() {
    return refreshAccessToken();
  },
};

// ─── Products API ──────────────────────────────────────────────────────────

export const productsApi = {
  list(params?: { page?: number; limit?: number; search?: string; category?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    const qs = query.toString();
    return apiRequest<PaginatedData<Product>>(`/products${qs ? `?${qs}` : ""}`);
  },

  get(id: string) {
    return apiRequest<Product>(`/products/${encodeURIComponent(id)}`);
  },

  create(data: CreateProductData) {
    return apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: UpdateProductData) {
    return apiRequest<Product>(`/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiRequest<void>(`/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  updateStock(id: string, stock: number) {
    return apiRequest<Product>(`/products/${encodeURIComponent(id)}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ stock }),
    });
  },
};

// ─── Orders API ────────────────────────────────────────────────────────────

export const ordersApi = {
  create(data: CreateOrderData) {
    return apiRequest<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  listMine(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiRequest<PaginatedData<Order>>(`/orders/mine${qs ? `?${qs}` : ""}`);
  },

  get(id: string) {
    return apiRequest<Order>(`/orders/${encodeURIComponent(id)}`);
  },

  listAll(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiRequest<PaginatedData<Order>>(`/orders${qs ? `?${qs}` : ""}`);
  },

  track(trackingNumber: string) {
    return apiRequest<TrackingInfo>(`/orders/track/${encodeURIComponent(trackingNumber)}`);
  },
};

// ─── Payments API ──────────────────────────────────────────────────────────

export const paymentsApi = {
  createPaymentIntent(orderId: string) {
    return apiRequest<PaymentIntent>("/payments/create-intent", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });
  },
};

// ─── Shipments API ─────────────────────────────────────────────────────────

export const shipmentsApi = {
  list(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiRequest<PaginatedData<Shipment>>(`/shipments${qs ? `?${qs}` : ""}`);
  },

  get(id: string) {
    return apiRequest<Shipment>(`/shipments/${encodeURIComponent(id)}`);
  },

  update(id: string, data: UpdateShipmentData) {
    return apiRequest<Shipment>(`/shipments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// ─── Refunds API ───────────────────────────────────────────────────────────

export const refundsApi = {
  create(orderId: string, data: { amount: number; reason: string }) {
    return apiRequest<Refund>(`/orders/${encodeURIComponent(orderId)}/refunds`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  list(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiRequest<PaginatedData<Refund>>(`/refunds${qs ? `?${qs}` : ""}`);
  },
};
