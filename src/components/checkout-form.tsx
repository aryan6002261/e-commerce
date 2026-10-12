"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store-provider";
import { formatPrecisePrice } from "@/lib/format";

interface CustomerDetails {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PlacedOrder {
  orderNumber: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const initialCustomer: CustomerDetails = {
  name: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  country: "United States",
};

export function CheckoutForm() {
  const { cart, subtotal, clearCart, updateQuantity, removeFromCart } = useStore();
  const [customer, setCustomer] = useState(initialCustomer);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const shipping = subtotal >= 7500 ? 0 : 650;
  const tax = Math.round(subtotal * 0.08);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data: { user?: { name: string; email: string } | null }) => {
        if (active && data.user) {
          setCustomer((current) => ({ ...current, name: data.user?.name ?? current.name, email: data.user?.email ?? current.email }));
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPlacingOrder(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((line) => ({ productId: line.id, quantity: line.quantity })),
          customer,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "We couldn’t place your order just now. Please try again.");
        return;
      }
      setOrder(data.order as PlacedOrder);
      clearCart();
    } catch {
      setError("We couldn’t reach the shop just now. Check your connection and try once more.");
    } finally {
      setPlacingOrder(false);
    }
  }

  if (order) {
    return (
      <main className="checkout-page success-page">
        <div className="order-success-card">
          <span className="success-sparkle" aria-hidden="true">✳</span>
          <p className="eyebrow">A LITTLE SOMETHING GOOD IS ON ITS WAY</p>
          <h1>That’s a <em>lovely</em><br />choice.</h1>
          <p>Thanks, {customer.name.split(" ")[0] || "friend"}. We’ve got your order and will send a note as soon as it’s on its way.</p>
          <div className="success-order-number"><span>YOUR ORDER NUMBER</span><strong>{order.orderNumber}</strong></div>
          <div className="success-total"><span>Order total</span><strong>{formatPrecisePrice(order.total)}</strong></div>
          <Link href="/" className="button button-dark">Back to the good stuff <span>↗</span></Link>
          <Link href="/account" className="success-account-link">Have an account? Keep an eye on your orders <span>↗</span></Link>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page checkout-empty-page">
        <div className="checkout-page-heading"><p className="eyebrow">THE LAST LITTLE STEP</p><h1>Make it <em>yours.</em></h1></div>
        <div className="checkout-empty-card"><span aria-hidden="true">✳</span><h2>Your bag is taking a breather.</h2><p>There isn’t anything in it just yet. Have a look around and see what feels like you.</p><Link className="button button-dark" href="/#shop">Find something lovely <span>↗</span></Link></div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-page-heading"><p className="eyebrow">A FEW MORE LITTLE DETAILS</p><h1>Make it <em>yours.</em></h1><p className="checkout-intro">A good choice deserves a thoughtful send-off.</p></div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={placeOrder}>
          <div className="checkout-section-heading"><span className="step-number">01</span><div><h2>Where should we send it?</h2><p>Your details stay right here with us.</p></div></div>
          <div className="checkout-fields">
            <label className="form-field form-field-full"><span>Full name</span><input autoComplete="name" required maxLength={160} value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="The name on your door" /></label>
            <label className="form-field form-field-full"><span>Email address</span><input type="email" autoComplete="email" required maxLength={255} value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="Where we’ll send your receipt" /></label>
            <label className="form-field form-field-full"><span>Street address</span><input autoComplete="street-address" required maxLength={255} value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="House number and street" /></label>
            <label className="form-field"><span>City</span><input autoComplete="address-level2" required maxLength={120} value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} placeholder="City" /></label>
            <label className="form-field"><span>ZIP / postal code</span><input autoComplete="postal-code" required maxLength={32} value={customer.postalCode} onChange={(event) => setCustomer({ ...customer, postalCode: event.target.value })} placeholder="Postal code" /></label>
            <label className="form-field form-field-full"><span>Country</span><select autoComplete="country-name" required value={customer.country} onChange={(event) => setCustomer({ ...customer, country: event.target.value })}><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option><option>New Zealand</option><option>Iceland</option><option>Other</option></select></label>
          </div>

          <div className="checkout-section-heading payment-heading"><span className="step-number">02</span><div><h2>Payment, the easy way.</h2><p>For now, payment is collected on delivery.</p></div></div>
          <div className="payment-method"><span className="payment-radio" /><div><strong>Pay on delivery</strong><span>No card details needed for this demo checkout.</span></div><span className="payment-method-icon">♡</span></div>
          <p className="checkout-privacy-note"><span>⌑</span> Your order details are sent securely and only used to get your good things to you.</p>
          {error && <p className="form-error checkout-error" role="alert">{error}</p>}
          <button type="submit" className="button button-dark place-order-button" disabled={placingOrder}>{placingOrder ? <><span className="button-spinner" /> Placing your order…</> : <>Place my order <span>↗</span></>}</button>
          <p className="checkout-terms">By placing your order, you agree to our easy, 30-day return policy.</p>
        </form>

        <aside className="checkout-summary">
          <div className="summary-heading"><h2>A look in your bag</h2><Link href="/#shop">Keep browsing</Link></div>
          <div className="checkout-line-items">
            {cart.map((line) => (
              <article className="checkout-line-item" key={line.slug}>
                <Link className="checkout-item-image" href={`/products/${line.slug}`}><img src={line.imageUrl} alt={line.name} /><span>{line.quantity}</span></Link>
                <div className="checkout-item-copy"><Link href={`/products/${line.slug}`}>{line.name}</Link><span>{formatPrecisePrice(line.price)}</span><div className="checkout-item-controls"><button type="button" onClick={() => updateQuantity(line.slug, line.quantity - 1)} aria-label={`Remove one ${line.name}`}>−</button><span>{line.quantity}</span><button type="button" onClick={() => updateQuantity(line.slug, line.quantity + 1)} aria-label={`Add one ${line.name}`}>+</button><button type="button" className="summary-remove" onClick={() => removeFromCart(line.slug)}>Remove</button></div></div>
                <strong className="checkout-item-total">{formatPrecisePrice(line.price * line.quantity)}</strong>
              </article>
            ))}
          </div>
          <div className="checkout-totals"><div><span>Subtotal</span><span>{formatPrecisePrice(subtotal)}</span></div><div><span>Shipping</span><span>{shipping === 0 ? "On us" : formatPrecisePrice(shipping)}</span></div><div><span>Estimated tax</span><span>{formatPrecisePrice(tax)}</span></div><div className="checkout-grand-total"><strong>Total</strong><strong>{formatPrecisePrice(subtotal + shipping + tax)}</strong></div></div>
          <p className="checkout-shipping-callout"><span>✳</span> {shipping === 0 ? "Your shipping is on us. Lovely." : `Add ${formatPrecisePrice(7500 - subtotal)} more for complimentary shipping.`}</p>
          <div className="checkout-guest-note"><span>✦</span><p>Checking out as a guest? Easy. <Link href="/account">Sign in or create an account</Link> to keep track of your next order.</p></div>
        </aside>
      </div>
    </main>
  );
}
