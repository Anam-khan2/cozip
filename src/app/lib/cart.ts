import { useEffect, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

// ─── Types ──────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartRow {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number | string;
    images: string[] | null;
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

function mapRow(row: CartRow): CartItem {
  const images = row.products.images ?? [];
  return {
    id: row.id,
    productId: row.products.id,
    name: row.products.name,
    price: Number(row.products.price),
    quantity: row.quantity,
    image: images[0] ?? '',
  };
}

const CART_SELECT = `
  id,
  product_id,
  quantity,
  products (
    id,
    name,
    price,
    images
  )
`;

// ─── CRUD ───────────────────────────────────────────────────────────────

export async function fetchCartItems(): Promise<CartItem[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cart_items')
    .select(CART_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as unknown as CartRow[]).map(mapRow);
}

export async function addToCart(productId: string, quantity = 1): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('You must be signed in to add items to your cart.');

  const supabase = getSupabaseClient();

  // Check if already in cart → increment quantity
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity });
    if (error) throw error;
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number): Promise<void> {
  if (quantity < 1) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);
  if (error) throw error;
}

export async function removeFromCart(cartItemId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);
  if (error) throw error;
}

export async function clearCart(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// ─── Real-time hook ─────────────────────────────────────────────────────

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const fetched = await fetchCartItems();
      setItems(fetched);
    } catch {
      // Silently handle — user may not be authenticated
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    // Subscribe to real-time changes on the cart_items table
    const supabase = getSupabaseClient();
    let channel: RealtimeChannel | null = null;

    (async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;

      channel = supabase
        .channel('cart-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void refresh();
          },
        )
        .subscribe();
    })();

    return () => {
      if (channel) {
        void getSupabaseClient().removeChannel(channel);
      }
    };
  }, [refresh]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, count, loading, refresh };
}
