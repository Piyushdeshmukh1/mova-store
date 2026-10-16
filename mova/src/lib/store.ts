"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  key: string; productId: number; variantId: number | null; name: string; slug: string;
  image: string | null; variantLabel: string | null; price: number; mrp: number; quantity: number;
};

type CartState = {
  items: CartItem[];
  couponCode: string;
  drawerOpen: boolean;
  bump: number;
  add: (item: Omit<CartItem, "key" | "quantity">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setCoupon: (c: string) => void;
  openDrawer: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [], couponCode: "", drawerOpen: false, bump: 0,
      add: (item, qty = 1) =>
        set((s) => {
          const key = `${item.productId}:${item.variantId ?? 0}`;
          const existing = s.items.find((i) => i.key === key);
          const items = existing
            ? s.items.map((i) => (i.key === key ? { ...i, ...item, quantity: Math.min(20, i.quantity + qty) } : i))
            : [...s.items, { ...item, key, quantity: qty }];
          return { items, drawerOpen: true, bump: s.bump + 1 };
        }),
      setQty: (key, qty) => set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(20, qty)) } : i)) })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [], couponCode: "" }),
      setCoupon: (couponCode) => set({ couponCode }),
      openDrawer: (drawerOpen) => set({ drawerOpen }),
    }),
    { name: "mova-cart", partialize: (s) => ({ items: s.items, couponCode: s.couponCode }) },
  ),
);

type WishState = { ids: number[]; toggle: (id: number) => void; has: (id: number) => boolean };
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "mova-wishlist" },
  ),
);
