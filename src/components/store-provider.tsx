"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { formatPrecisePrice } from "@/lib/format";

export interface CartProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  stock?: number;
}

export interface CartLine extends CartProduct {
  quantity: number;
}

interface StoreContextValue {
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  drawerOpen: boolean;
  addToCart: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_STORAGE_KEY = "morrow-shopping-bag";
const EMPTY_CART: CartLine[] = [];
let cartSnapshot: CartLine[] = EMPTY_CART;
let serializedCartSnapshot: string | null = null;
const cartListeners = new Set<() => void>();

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return typeof line.id === "number" && typeof line.slug === "string" &&
    typeof line.name === "string" && typeof line.price === "number" &&
    typeof line.imageUrl === "string" && typeof line.quantity === "number";
}

function parseCart(value: string | null): CartLine[] {
  if (!value) return EMPTY_CART;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

function getCartSnapshot() {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY);
    if (saved !== serializedCartSnapshot) {
      serializedCartSnapshot = saved;
      cartSnapshot = parseCart(saved);
    }
  } catch {
    return cartSnapshot;
  }
  return cartSnapshot;
}

function getServerCartSnapshot() {
  return EMPTY_CART;
}

function notifyCartListeners() {
  cartListeners.forEach((listener) => listener());
}

function subscribeToCart(listener: () => void) {
  cartListeners.add(listener);
  if (typeof window !== "undefined") {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== CART_STORAGE_KEY) return;
      serializedCartSnapshot = event.newValue;
      cartSnapshot = parseCart(event.newValue);
      notifyCartListeners();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      cartListeners.delete(listener);
      window.removeEventListener("storage", handleStorage);
    };
  }
  return () => cartListeners.delete(listener);
}

function updateCartSnapshot(updater: (current: CartLine[]) => CartLine[]) {
  const next = updater(getCartSnapshot());
  cartSnapshot = next;
  serializedCartSnapshot = JSON.stringify(next);
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, serializedCartSnapshot);
  } catch {
    // Keep the in-memory bag usable when browser storage is unavailable.
  }
  notifyCartListeners();
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addToCart = useCallback((product: CartProduct, quantity = 1) => {
    updateCartSnapshot((current) => {
      const existing = current.find((line) => line.slug === product.slug);
      const limit = Math.max(1, product.stock ?? 99);
      if (existing) {
        return current.map((line) =>
          line.slug === product.slug
            ? { ...line, quantity: Math.min(limit, line.quantity + quantity) }
            : line,
        );
      }
      return [...current, { ...product, quantity: Math.min(limit, quantity) }];
    });
    setDrawerOpen(true);
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    updateCartSnapshot((current) => {
      if (quantity < 1) return current.filter((line) => line.slug !== slug);
      return current.map((line) =>
        line.slug === slug
          ? { ...line, quantity: Math.min(Math.max(1, quantity), line.stock ?? 99) }
          : line,
      );
    });
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    updateCartSnapshot((current) => current.filter((line) => line.slug !== slug));
  }, []);

  const clearCart = useCallback(() => updateCartSnapshot(() => EMPTY_CART), []);
  const openCart = useCallback(() => setDrawerOpen(true), []);
  const closeCart = useCallback(() => setDrawerOpen(false), []);
  const cartCount = cart.reduce((count, line) => count + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      subtotal,
      drawerOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      openCart,
      closeCart,
    }),
    [cart, cartCount, subtotal, drawerOpen, addToCart, updateQuantity, removeFromCart, clearCart, openCart, closeCart],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <CartDrawer />
    </StoreContext.Provider>
  );
}

function CartDrawer() {
  const { cart, subtotal, drawerOpen, closeCart, updateQuantity, removeFromCart } = useStore();
  const freeShippingTarget = 7500;
  const remaining = Math.max(0, freeShippingTarget - subtotal);

  useEffect(() => {
    if (!drawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeCart]);

  return (
    <>
      <button
        type="button"
        aria-label="Close shopping bag"
        className={`drawer-backdrop${drawerOpen ? " is-open" : ""}`}
        onClick={closeCart}
        tabIndex={drawerOpen ? 0 : -1}
      />
      <aside className={`cart-drawer${drawerOpen ? " is-open" : ""}`} aria-label="Shopping bag" aria-hidden={!drawerOpen}>
        <div className="drawer-heading">
          <div>
            <span className="eyebrow">YOUR GOOD THINGS</span>
            <h2>Your bag <span className="bag-count">{cart.length}</span></h2>
          </div>
          <button type="button" className="icon-button drawer-close" onClick={closeCart} aria-label="Close shopping bag">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {remaining > 0 && cart.length > 0 && (
          <div className="shipping-progress">
            <p>You’re <strong>{formatPrecisePrice(remaining)}</strong> away from complimentary shipping.</p>
            <div className="shipping-progress-track"><span style={{ width: `${Math.min(100, (subtotal / freeShippingTarget) * 100)}%` }} /></div>
          </div>
        )}
        {cart.length > 0 && remaining === 0 && <p className="free-shipping-note">Lovely — shipping’s on us.</p>}

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-bag-icon" aria-hidden="true">✳</div>
            <h3>A little room for something lovely.</h3>
            <p>Your bag is waiting for something good.</p>
            <Link href="/#shop" className="button button-dark" onClick={closeCart}>Find your favorite things <span>↗</span></Link>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {cart.map((line) => (
                <article className="drawer-item" key={line.slug}>
                  <Link href={`/products/${line.slug}`} className="drawer-item-image" onClick={closeCart}>
                    <img src={line.imageUrl} alt={line.name} />
                  </Link>
                  <div className="drawer-item-copy">
                    <div className="drawer-item-title-row">
                      <Link href={`/products/${line.slug}`} onClick={closeCart}>{line.name}</Link>
                      <span>{formatPrecisePrice(line.price * line.quantity)}</span>
                    </div>
                    <p>{formatPrecisePrice(line.price)} each</p>
                    <div className="drawer-item-actions">
                      <div className="quantity-control quantity-control-small" aria-label={`Quantity for ${line.name}`}>
                        <button type="button" onClick={() => updateQuantity(line.slug, line.quantity - 1)} aria-label="Decrease quantity">−</button>
                        <span>{line.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(line.slug, line.quantity + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <button type="button" className="text-button remove-link" onClick={() => removeFromCart(line.slug)}>Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="drawer-footer">
              <div className="drawer-subtotal"><span>Subtotal</span><strong>{formatPrecisePrice(subtotal)}</strong></div>
              <p>Shipping &amp; taxes are calculated at checkout.</p>
              <Link href="/checkout" className="button button-dark checkout-button" onClick={closeCart}>Continue to checkout <span>↗</span></Link>
              <button type="button" className="text-button continue-shopping" onClick={closeCart}>Keep looking around</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
