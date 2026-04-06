import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';
import {
  fetchCartItems,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from '../lib/cart';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Derived
  itemCount: () => number;
  total: () => number;

  // Actions
  loadCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setItems: (items: CartItem[]) => void;

  // Realtime lifecycle
  initRealtime: () => void;
  disposeRealtime: () => void;
}

let realtimeChannel: RealtimeChannel | null = null;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: true,
  error: null,

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  loadCart: async () => {
    try {
      const items = await fetchCartItems();
      set({ items, isLoading: false, error: null });
    } catch {
      set({ items: [], isLoading: false, error: null });
    }
  },

  addItem: async (productId, quantity = 1) => {
    await addToCart(productId, quantity);
    await get().loadCart();
  },

  removeItem: async (itemId) => {
    await removeFromCart(itemId);
    await get().loadCart();
  },

  updateQuantity: async (itemId, qty) => {
    await updateCartQuantity(itemId, qty);
    await get().loadCart();
  },

  clearCart: async () => {
    await clearCart();
    set({ items: [] });
  },

  setItems: (items) => set({ items }),

  initRealtime: () => {
    if (realtimeChannel) return;

    const supabase = getSupabaseClient();

    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) return;

      realtimeChannel = supabase
        .channel('cart-store-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void get().loadCart();
          },
        )
        .subscribe();
    })();
  },

  disposeRealtime: () => {
    if (realtimeChannel) {
      void getSupabaseClient().removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  },
}));
