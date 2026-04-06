// ─── Unified Types ──────────────────────────────────────────────────────
// Single source of truth for all data models in the Cozip project.
// Every lib and page file should import types from here.
// ────────────────────────────────────────────────────────────────────────

// ─── Order Status ───────────────────────────────────────────────────────

export type OrderStatus =
  | 'Confirmed'
  | 'Packed'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Processing'
  | 'Shipped'
  | 'Cancelled';

// ─── Shipping ───────────────────────────────────────────────────────────

export type ShippingMethod = 'free' | 'standard' | 'express';

export type Address = {
  shippingAddressLine: string;
  city: string;
  state: string;
  zipCode: string;
};

// ─── Profile / User ────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export type Profile = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

// ─── Products ───────────────────────────────────────────────────────────

export type ProductReviewRow = {
  name?: string;
  rating?: number | string;
  comment?: string;
  created_at?: string;
  date?: string;
};

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  stock: number | null;
  category: string | null;
  rating: number | string | null;
  images: string[] | null;
  is_featured: boolean | null;
  material: string | null;
  capacity: string | null;
  dimensions: string | null;
  weight: string | null;
  care: string | null;
  shipping_info: string | null;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  reviews: ProductReviewRow[] | string | null;
  created_at: string | null;
};

export type ProductMutationInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  images: string[];
  isFeatured?: boolean;
  material?: string;
  capacity?: string;
  dimensions?: string;
  weight?: string;
  care?: string;
  shippingInfo?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  rating?: number;
};

export type ProductUpdateInput = Partial<ProductMutationInput> & {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
};

export type ProductCard = {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  image: string;
  category: string | null;
  stock: number;
  isFeatured: boolean;
};

export type ProductReview = {
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export type ProductDetailData = ProductCard & {
  description: string;
  rating: number;
  reviewCount: number;
  images: string[];
  specifications: Record<string, string>;
  shipping: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  reviews: ProductReview[];
};

// ─── Cart ───────────────────────────────────────────────────────────────

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type CartRow = {
  id: string;
  product_id: string;
  quantity: number;
};

export type ProductLookupRow = {
  id: string;
  name: string;
  price: number | string;
  images: string[] | null;
};

// ─── Wishlist ───────────────────────────────────────────────────────────

export type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
};

// ─── Orders ─────────────────────────────────────────────────────────────

export type TrackedOrderItem = {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type TrackingEvent = {
  id: string;
  label: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
};

export type TrackedOrder = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  shippingMethod: ShippingMethod;
  status: OrderStatus;
  statusDescription: string;
  carrier: string;
  trackingCode: string;
  originCity: string;
  destinationCity: string;
  estimatedDelivery: string;
  orderPlacedAt: string;
  items: TrackedOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  timeline: TrackingEvent[];
} & Address;

export type CreateTrackedOrderInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  shippingMethod: ShippingMethod;
  items: TrackedOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
};

// ─── Admin ──────────────────────────────────────────────────────────────

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: OrderStatus;
};

export type AdminCustomer = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  totalSpent: number;
  orderCount: number;
};

// ─── Coupons ────────────────────────────────────────────────────────────

export type CouponStatus = 'Active' | 'Expired';

export type Coupon = {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  usageLimit: number;
  usedCount: number;
  status: CouponStatus;
  expiresAt: string | null;
  createdAt: string;
};

// ─── FAQs ───────────────────────────────────────────────────────────────

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

// ─── Dashboard (display view) ───────────────────────────────────────────

export type DashboardView = 'overview' | 'orders' | 'wishlist' | 'settings';

export type DashboardOrder = {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: number;
};
