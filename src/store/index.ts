import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProduct, SizeId } from "@/data/menu";
import { User } from "@/services/auth";
import {
  computeTotals,
  describeLine,
  Line,
  PROMOS,
  unitPrice,
} from "@/utils/pricing";

const storage = createJSONStorage(() => AsyncStorage);

/* ---------- auth ---------- */
type AuthState = {
  user: User | null;
  guest: boolean;
  remember: boolean;
  seenOnboarding: boolean;
  setUser: (u: User, remember?: boolean) => void;
  continueAsGuest: () => void;
  signOut: () => void;
  finishOnboarding: () => void;
};
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      guest: false,
      remember: true,
      seenOnboarding: false,
      setUser: (user, remember = true) => set({ user, guest: false, remember }),
      continueAsGuest: () => set({ guest: true, user: null }),
      signOut: () => set({ user: null, guest: false }),
      finishOnboarding: () => set({ seenOnboarding: true }),
    }),
    {
      name: "auth",
      storage,
      // "Keep me signed in" unchecked => the session isn't written to disk. Guests start at login next launch.
      partialize: (s) => ({
        user: s.remember ? s.user : null,
        remember: s.remember,
        seenOnboarding: s.seenOnboarding,
      }),
    },
  ),
);

/* ---------- cart ---------- */
type AddInput = {
  productId: string;
  size: SizeId;
  extras: string[];
  qty: number;
  note?: string;
};
type CartState = {
  lines: Line[];
  promo: string | null;
  add: (i: AddInput) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
};
const lineKey = (i: Pick<AddInput, "productId" | "size" | "extras">) =>
  `${i.productId}|${i.size}|${[...i.extras].sort().join(",")}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      promo: null,
      add: (i) =>
        set((s) => {
          const key = lineKey(i);
          const existing = s.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.key === key
                  ? {
                      ...l,
                      qty: Math.min(20, l.qty + i.qty),
                      note: i.note || l.note,
                    }
                  : l,
              ),
            };
          }
          return {
            lines: [
              ...s.lines,
              {
                key,
                productId: i.productId,
                size: i.size,
                extras: i.extras,
                qty: i.qty,
                note: i.note,
              },
            ],
          };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.key !== key)
              : s.lines.map((l) =>
                  l.key === key ? { ...l, qty: Math.min(20, qty) } : l,
                ),
        })),
      clear: () => set({ lines: [], promo: null }),
      applyPromo: (code) => {
        const c = code.trim().toUpperCase();
        if (!PROMOS[c]) return false;
        set({ promo: c });
        return true;
      },
      removePromo: () => set({ promo: null }),
    }),
    { name: "cart", storage },
  ),
);
export const useCartCount = () =>
  useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
export const useCartTotals = () => {
  const lines = useCart((s) => s.lines);
  const promo = useCart((s) => s.promo);
  return computeTotals(lines, promo);
};

/* ---------- favourites ---------- */
type FavState = { ids: string[]; toggle: (id: string) => void };
export const useFavs = create<FavState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
    }),
    { name: "favs", storage },
  ),
);

/* ---------- addresses ---------- */
export type Address = {
  id: string;
  label: "Home" | "Work" | "Other";
  line: string;
  note?: string;
};
type AddressState = {
  items: Address[];
  selectedId: string | null;
  add: (a: Omit<Address, "id">) => void;
  remove: (id: string) => void;
  select: (id: string) => void;
};
export const useAddresses = create<AddressState>()(
  persist(
    (set, get) => ({
      items: [
        {
          id: "a1",
          label: "Home",
          line: "3rd Avenne, Gwarimpa, Abuja",
          note: "First Gate, near the mosque",
        },
      ],
      selectedId: "a1",
      add: (a) => {
        const id = `a_${Date.now()}`;
        set((s) => ({ items: [...s.items, { ...a, id }], selectedId: id }));
      },
      remove: (id) =>
        set((s) => {
          const items = s.items.filter((x) => x.id !== id);
          return {
            items,
            selectedId:
              s.selectedId === id ? (items[0]?.id ?? null) : s.selectedId,
          };
        }),
      select: (id) => set({ selectedId: id }),
    }),
    { name: "addresses", storage },
  ),
);
export const useSelectedAddress = () => {
  const items = useAddresses((s) => s.items);
  const selectedId = useAddresses((s) => s.selectedId);
  return items.find((a) => a.id === selectedId) ?? null;
};

/* ---------- orders ---------- */
export type Order = {
  id: string;
  createdAt: number;
  total: number;
  address: string;
  items: { name: string; qty: number; detail: string; price: number }[];
};
type OrderState = {
  orders: Order[];
  place: (o: Omit<Order, "id" | "createdAt">) => string;
};
export const useOrders = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      place: (o) => {
        const id = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
        set((s) => ({
          orders: [{ ...o, id, createdAt: Date.now() }, ...s.orders],
        }));
        return id;
      },
    }),
    { name: "orders", storage },
  ),
);

/** Demo status, derived from age. Replace with real status from your API. */
export function orderStatus(
  createdAt: number,
): "Preparing" | "On the way" | "Delivered" {
  const mins = (Date.now() - createdAt) / 60000;
  return mins < 8 ? "Preparing" : mins < 25 ? "On the way" : "Delivered";
}

/** Build the order payload from the current cart. */
export function buildOrderItems(lines: Line[]) {
  return lines.flatMap((l) => {
    const p = getProduct(l.productId);
    if (!p) return [];
    return [
      {
        name: p.name,
        qty: l.qty,
        detail: describeLine(l),
        price: unitPrice(p, l.size, l.extras) * l.qty,
      },
    ];
  });
}

/* ---------- support chat (in-memory) ---------- */
export type Msg = { id: string; from: "me" | "bot"; text: string };
type ChatState = { messages: Msg[]; push: (m: Omit<Msg, "id">) => void };
export const useChat = create<ChatState>((set) => ({
  messages: [
    {
      id: "m0",
      from: "bot",
      text: "Hi! I’m the Shawarma support bot. Ask about an order, your address or ingredients.",
    },
  ],
  push: (m) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...m, id: `m${s.messages.length}_${Date.now()}` },
      ],
    })),
}));

/* ---------- hydration gate ---------- */
const persisted = [useAuth, useCart, useFavs, useAddresses, useOrders] as const;
const allHydrated = () => persisted.every((s) => s.persist.hasHydrated());
export function useStoresHydrated() {
  const [ready, setReady] = useState(allHydrated());
  useEffect(() => {
    if (allHydrated()) return setReady(true);
    const unsubs = persisted.map((s) =>
      s.persist.onFinishHydration(() => allHydrated() && setReady(true)),
    );
    return () => unsubs.forEach((u) => u());
  }, []);
  return ready;
}
