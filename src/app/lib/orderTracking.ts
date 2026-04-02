import { getSupabaseClient } from './supabase';

type ShippingMethod = 'free' | 'standard' | 'express';

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
  shippingAddressLine: string;
  city: string;
  state: string;
  zipCode: string;
  shippingMethod: ShippingMethod;
  status: 'Confirmed' | 'Packed' | 'In Transit' | 'Out for Delivery' | 'Delivered';
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
};

type CreateTrackedOrderInput = {
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

const STORAGE_KEY = 'snugsip-guest-orders';

const sampleOrders: TrackedOrder[] = [
  {
    orderNumber: 'CZP-10892',
    customerName: 'Sarah Martinez',
    email: 'sarah.martinez@example.com',
    phone: '+92 300 1234567',
    shippingAddressLine: 'House 24, Gulberg III',
    city: 'Lahore',
    state: 'PB',
    zipCode: '54000',
    shippingMethod: 'standard',
    status: 'In Transit',
    statusDescription: 'Your parcel has left the Lahore dispatch hub and is moving toward the destination city.',
    carrier: 'BlueEX',
    trackingCode: 'BLX-CZP10892',
    originCity: 'Lahore',
    destinationCity: 'Karachi',
    estimatedDelivery: 'March 13, 2026',
    orderPlacedAt: 'March 10, 2026, 11:10 AM',
    items: [
      {
        id: 1,
        productId: 1,
        name: 'Handmade Aesthetic Pastel Cloud Mug - Limited 2026 Edition',
        price: 24.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1674317872332-ca9c2cd00953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBjZXJhbWljJTIwbXVnJTIwY29mZmVlfGVufDF8fHx8MTc3MjgzNDAxNnww&ixlib=rb-4.1.0&q=80&w=1080',
      },
      {
        id: 2,
        productId: 2,
        name: 'Pink Pastel Mug',
        price: 22.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1588165231518-b4b22bfa0ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwYWVzdGhldGljJTIwY29mZmVlJTIwbXVnfGVufDF8fHx8MTc3MjgzNDAxNnww&ixlib=rb-4.1.0&q=80&w=1080',
      },
    ],
    subtotal: 72.97,
    shippingCost: 5.99,
    tax: 5.84,
    total: 84.8,
    timeline: [
      {
        id: 'confirmed',
        label: 'Order Confirmed',
        description: 'Payment was received and your order entered the fulfillment queue.',
        location: 'Cozip Storefront',
        timestamp: 'March 10, 2026, 11:10 AM',
        completed: true,
      },
      {
        id: 'packed',
        label: 'Parcel Packed',
        description: 'Your mugs were quality-checked, wrapped, and sealed for dispatch.',
        location: 'Lahore Studio Warehouse',
        timestamp: 'March 10, 2026, 2:45 PM',
        completed: true,
      },
      {
        id: 'shipped',
        label: 'Shipped from Origin',
        description: 'The parcel was handed over to BlueEX and scanned at the origin hub.',
        location: 'Lahore Dispatch Hub',
        timestamp: 'March 11, 2026, 8:20 AM',
        completed: true,
      },
      {
        id: 'in-transit',
        label: 'Reached Regional Hub',
        description: 'The shipment reached the main sorting facility and is being routed onward.',
        location: 'Karachi Sorting Hub',
        timestamp: 'March 12, 2026, 6:40 AM',
        completed: true,
      },
      {
        id: 'delivery',
        label: 'Out for Delivery',
        description: 'The parcel is scheduled for last-mile delivery after local scan.',
        location: 'Karachi Delivery Station',
        timestamp: 'Expected by March 13, 2026',
        completed: false,
      },
    ],
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readStoredOrders() {
  if (!canUseStorage()) {
    return [] as TrackedOrder[];
  }

  const rawOrders = window.localStorage.getItem(STORAGE_KEY);

  if (!rawOrders) {
    return [] as TrackedOrder[];
  }

  try {
    return JSON.parse(rawOrders) as TrackedOrder[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [] as TrackedOrder[];
  }
}

function writeStoredOrders(orders: TrackedOrder[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date: Date, days: number) {
  return addHours(date, days * 24);
}

export function normalizeOrderNumber(value: string) {
  return value.replace(/#/g, '').trim().toUpperCase();
}

export function formatOrderNumber(value: string) {
  const normalizedValue = normalizeOrderNumber(value);
  return normalizedValue ? `#${normalizedValue}` : '#';
}

export function buildOrderTrackingPath(value: string) {
  return `/track-order/${normalizeOrderNumber(value)}`;
}

export function getTrackedOrder(orderNumber: string) {
  const normalizedOrderNumber = normalizeOrderNumber(orderNumber);
  const allOrders = [...readStoredOrders(), ...sampleOrders];
  return allOrders.find((order) => normalizeOrderNumber(order.orderNumber) === normalizedOrderNumber) ?? null;
}

export async function getTrackedOrderFromSupabase(orderNumber: string): Promise<TrackedOrder | null> {
  try {
    const supabase = getSupabaseClient();
    const normalized = normalizeOrderNumber(orderNumber);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', normalized)
      .maybeSingle();

    if (!data) return null;
    return mapRowToTrackedOrder(data);
  } catch {
    return null;
  }
}

export async function getUserOrdersFromSupabase(): Promise<TrackedOrder[]> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return (data ?? []).map(mapRowToTrackedOrder);
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToTrackedOrder(row: any): TrackedOrder {
  return {
    orderNumber: row.order_number,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    shippingAddressLine: row.shipping_address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    shippingMethod: row.shipping_method,
    status: row.status,
    statusDescription: row.status_description,
    carrier: row.carrier,
    trackingCode: row.tracking_code,
    originCity: row.origin_city,
    destinationCity: row.destination_city,
    estimatedDelivery: row.estimated_delivery,
    orderPlacedAt: row.order_placed_at,
    items: row.items,
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    tax: row.tax,
    total: row.total,
    timeline: row.timeline,
  };
}

export function getMostRecentTrackedOrder() {
  const storedOrders = readStoredOrders();
  return storedOrders[0] ?? sampleOrders[0] ?? null;
}

export function saveTrackedOrder(order: TrackedOrder) {
  const normalizedOrderNumber = normalizeOrderNumber(order.orderNumber);
  const remainingOrders = readStoredOrders().filter(
    (existingOrder) => normalizeOrderNumber(existingOrder.orderNumber) !== normalizedOrderNumber
  );

  writeStoredOrders([order, ...remainingOrders].slice(0, 10));

  // Also persist to Supabase (fire-and-forget)
  void saveOrderToSupabase(order);
}

async function saveOrderToSupabase(order: TrackedOrder) {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('orders').upsert(
      {
        order_number: order.orderNumber,
        user_id: user.id,
        customer_name: order.customerName,
        email: order.email,
        phone: order.phone,
        shipping_address: order.shippingAddressLine,
        city: order.city,
        state: order.state,
        zip_code: order.zipCode,
        shipping_method: order.shippingMethod,
        status: order.status,
        status_description: order.statusDescription,
        carrier: order.carrier,
        tracking_code: order.trackingCode,
        origin_city: order.originCity,
        destination_city: order.destinationCity,
        estimated_delivery: order.estimatedDelivery,
        order_placed_at: order.orderPlacedAt,
        items: order.items,
        subtotal: order.subtotal,
        shipping_cost: order.shippingCost,
        tax: order.tax,
        total: order.total,
        timeline: order.timeline,
      },
      { onConflict: 'order_number' }
    );
  } catch {
    // Supabase persistence is best-effort; localStorage is the fallback
  }
}

export function createTrackedOrder(input: CreateTrackedOrderInput) {
  const createdAt = new Date();
  const orderNumber = `CZP-${Math.floor(10000 + Math.random() * 90000)}`;
  const customerName = `${input.firstName} ${input.lastName}`.trim();
  const estimatedDeliveryDate = addDays(createdAt, input.shippingMethod === 'express' ? 2 : input.shippingMethod === 'free' ? 6 : 4);
  const orderPlacedAt = formatTimestamp(createdAt);

  return {
    orderNumber,
    customerName,
    email: input.email,
    phone: input.phone,
    shippingAddressLine: input.address,
    city: input.city,
    state: input.state,
    zipCode: input.zipCode,
    shippingMethod: input.shippingMethod,
    status: 'Packed' as const,
    statusDescription: 'Your order is confirmed and currently being packed by the Cozip fulfillment team.',
    carrier: input.shippingMethod === 'express' ? 'Leopards Courier' : 'BlueEX',
    trackingCode: `${input.shippingMethod === 'express' ? 'LPD' : 'BLX'}-${orderNumber}`,
    originCity: 'Lahore',
    destinationCity: input.city,
    estimatedDelivery: new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(estimatedDeliveryDate),
    orderPlacedAt,
    items: input.items,
    subtotal: input.subtotal,
    shippingCost: input.shippingCost,
    tax: input.tax,
    total: input.total,
    timeline: [
      {
        id: 'confirmed',
        label: 'Order Confirmed',
        description: 'Payment was verified and your order was placed successfully.',
        location: 'Cozip Online Store',
        timestamp: orderPlacedAt,
        completed: true,
      },
      {
        id: 'packed',
        label: 'Packing in Progress',
        description: 'Your products are being carefully wrapped for a safe journey.',
        location: 'Lahore Studio Warehouse',
        timestamp: formatTimestamp(addHours(createdAt, 3)),
        completed: true,
      },
      {
        id: 'pickup',
        label: 'Courier Pickup Scheduled',
        description: 'The courier pickup is scheduled from our dispatch center.',
        location: 'Lahore Dispatch Desk',
        timestamp: formatTimestamp(addHours(createdAt, 12)),
        completed: false,
      },
      {
        id: 'regional',
        label: 'Regional Hub Arrival',
        description: 'The parcel will be sorted at the destination region before last-mile delivery.',
        location: `${input.city} Regional Hub`,
        timestamp: new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(addDays(createdAt, input.shippingMethod === 'express' ? 1 : 3)),
        completed: false,
      },
      {
        id: 'delivery',
        label: 'Expected Delivery',
        description: 'The parcel is expected to reach the provided shipping address on this date.',
        location: `${input.address}, ${input.city}`,
        timestamp: new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(estimatedDeliveryDate),
        completed: false,
      },
    ],
  } satisfies TrackedOrder;
}