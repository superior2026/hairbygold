import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  cartLines as initialCart,
  notifications as initialNotifications,
  products,
  type CartLine,
  type Notification,
  type Product,
} from "./mock-data";

type StoreValue = {
  cart: CartLine[];
  addToCart: (product: Product, size?: string) => void;
  setQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  cartCount: number;
  subtotal: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  wishlistProducts: Product[];
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(initialCart);
  const [wishlist, setWishlist] = useState<string[]>(["hbg-002", "hbg-011"]);
  const [notes, setNotes] = useState<Notification[]>(initialNotifications);

  const addToCart = useCallback((product: Product, size = "One size") => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product, qty: 1, size }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      prev.map((l) => (l.product.id === id ? { ...l, qty: Math.max(1, Math.min(9, qty)) } : l)),
    );
  }, []);

  const removeLine = useCallback((id: string) => {
    setCart((prev) => prev.filter((l) => l.product.id !== id));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotes((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      addToCart,
      setQty,
      removeLine,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      subtotal: cart.reduce((n, l) => n + l.qty * l.product.price, 0),
      wishlist,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      wishlistProducts: products.filter((p) => wishlist.includes(p.id)),
      notifications: notes,
      unreadCount: notes.filter((n) => !n.read).length,
      markRead,
      markAllRead,
    }),
    [cart, wishlist, notes, addToCart, setQty, removeLine, toggleWishlist, markRead, markAllRead],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
