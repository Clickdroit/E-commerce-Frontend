// ─── API Response Types ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth Types ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ─── Product Types ─────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
}

export type UpdateProductData = Partial<CreateProductData>;

// ─── Order Types ───────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  trackingNumber: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderData {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
}

// ─── Shipment Types ────────────────────────────────────────────────────────

export type ShipmentStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered";

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  updatedAt: string;
}

export interface UpdateShipmentData {
  status: ShipmentStatus;
  carrier?: string;
  estimatedDelivery?: string;
}

// ─── Payment Types ─────────────────────────────────────────────────────────

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

// ─── Refund Types ──────────────────────────────────────────────────────────

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: "pending" | "processed" | "failed";
  createdAt: string;
}

// ─── Cart Types ────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Tracking Types ────────────────────────────────────────────────────────

export interface TrackingInfo {
  order: Order;
  shipment: Shipment | null;
}
