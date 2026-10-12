"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrecisePrice } from "@/lib/format";

type StoreUser = { id: number; name: string; email: string };
type OrderItem = { productName: string; productImageUrl: string; unitPrice: number; quantity: number };
type StoreOrder = {
  id: number;
  orderNumber: string;
  status: string;
  createdAt: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
};

export function AccountPanel() {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data: { user: StoreUser | null }) => {
        if (active) {
          setUser(data.user);
          setName(data.user?.name ?? "");
          setEmail(data.user?.email ?? "");
        }
      })
      .catch(() => { if (active) setMessage("We couldn’t check your account just now. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch("/api/orders")
      .then((response) => response.ok ? response.json() : { orders: [] })
      .then((data: { orders?: StoreOrder[] }) => { if (active) setOrders(data.orders ?? []); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [user]);

  async function submitAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(typeof data.error === "string" ? data.error : "We couldn’t complete that just now. Please try again.");
        return;
      }
      setUser(data.user as StoreUser);
      setName("");
      setPassword("");
      setNotice(mode === "register" ? "Your account is all set. Welcome to Morrow." : "You’re signed in. It’s nice to have you back.");
    } catch {
      setMessage("We couldn’t reach the shop just now. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrders([]);
    setNotice("You’ve been signed out. See you again soon.");
  }

  if (loading) {
    return <main className="account-page"><div className="account-loading"><span className="loading-sparkle">✳</span><p>One little moment…</p></div></main>;
  }

  if (user) {
    return (
      <main className="account-page">
        <div className="account-heading"><p className="eyebrow">YOUR LITTLE CORNER</p><h1>Good to have<br /><em>you here.</em></h1><p>Your good things, all in one place.</p></div>
        <div className="account-dashboard">
          <section className="account-profile-card"><span className="profile-sparkle">✳</span><p className="eyebrow">SIGNED IN AS</p><h2>{user.name}</h2><p>{user.email}</p><div className="profile-card-bottom"><span>Member since {new Date().getFullYear()}</span><button type="button" className="text-button" onClick={signOut}>Sign out ↗</button></div></section>
          <section className="account-orders-card"><div className="account-orders-heading"><div><p className="eyebrow">A LITTLE PAPER TRAIL</p><h2>Your orders</h2></div><Link href="/#shop" className="underlined-link">Find something lovely <span>↗</span></Link></div>
            {orders.length === 0 ? (
              <div className="no-orders"><span aria-hidden="true">♡</span><h3>No orders just yet.</h3><p>When you find something to bring home, we’ll keep the details right here.</p><Link href="/#shop" className="text-button">Have a look around ↗</Link></div>
            ) : (
              <div className="order-list">{orders.map((order) => <article className="account-order" key={order.id}><div className="account-order-heading"><div><span className="order-label">ORDER</span><strong>{order.orderNumber}</strong></div><div className="order-date"><span className="order-label">PLACED</span><span>{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div><span className={`order-status status-${order.status}`}>{order.status}</span></div><div className="account-order-items">{order.items.map((item, index) => <div className="account-order-item" key={`${order.id}-${index}`}><img src={item.productImageUrl} alt="" /><span>{item.productName} <small>× {item.quantity}</small></span><strong>{formatPrecisePrice(item.unitPrice * item.quantity)}</strong></div>)}</div><div className="account-order-total"><span>Order total</span><strong>{formatPrecisePrice(order.total)}</strong></div></article>)}</div>
            )}
          </section>
        </div>
        {notice && <p className="account-notice" role="status">{notice}</p>}
      </main>
    );
  }

  return (
    <main className="account-page account-login-page">
      <div className="account-heading"><p className="eyebrow">A NICER WAY TO KEEP TRACK</p><h1>Your place<br />at <em>Morrow.</em></h1><p>Save your details. Find your orders. Feel at home.</p></div>
      <div className="account-auth-card">
        <div className="auth-card-top"><span aria-hidden="true">✳</span><div><p className="eyebrow">{mode === "login" ? "WELCOME BACK" : "COME ON IN"}</p><h2>{mode === "login" ? "Good to see you." : "Let’s make it yours."}</h2></div></div>
        <div className="auth-mode-tabs" role="tablist" aria-label="Account options"><button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-selected" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Sign in</button><button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "is-selected" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Create an account</button></div>
        <form className="account-auth-form" onSubmit={submitAccount}>
          {mode === "register" && <label className="form-field"><span>Your name</span><input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={160} autoComplete="name" placeholder="What should we call you?" /></label>}
          <label className="form-field"><span>Email address</span><input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" maxLength={255} autoComplete="email" placeholder="you@example.com" /></label>
          <label className="form-field"><span>Password</span><input value={password} onChange={(event) => setPassword(event.target.value)} required type="password" minLength={mode === "register" ? 8 : 1} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder={mode === "register" ? "At least 8 characters" : "Your password"} /></label>
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? <><span className="button-spinner" /> One moment…</> : <>{mode === "login" ? "Sign in to your account" : "Create my account"} <span>↗</span></>}</button>
        </form>
        <p className="auth-switch-note">{mode === "login" ? "New around here? " : "Already have a place here? "}<button type="button" className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>{mode === "login" ? "Come on in." : "Sign in instead."}</button></p>
        <div className="account-guest-note"><span>✧</span><p>Looking for something first? <Link href="/#shop">Shop as a guest</Link>, no account needed.</p></div>
      </div>
    </main>
  );
}
