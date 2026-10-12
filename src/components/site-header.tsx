"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/store-provider";

export function SiteHeader() {
  const { cartCount, openCart } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="announcement-bar">
        <span>A little something good for your everyday.</span>
        <span className="announcement-divider">✳</span>
        <span>Complimentary shipping over $75</span>
      </div>
      <header className="site-header">
        <div className="header-main">
          <button
            type="button"
            className="mobile-menu-button icon-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7h17M3.5 12h17M3.5 17h17" /></svg>}
          </button>
          <nav className="header-nav header-nav-left" aria-label="Main navigation">
            <Link href="/#shop">Shop all</Link>
            <Link href="/#our-story">Our story</Link>
          </nav>
          <Link href="/" className="wordmark" aria-label="Morrow home">
            <span className="wordmark-sun" aria-hidden="true">✳</span>morrow
          </Link>
          <nav className="header-nav header-nav-right" aria-label="Your account and shopping bag">
            <Link href="/account" className="account-link"><span className="account-label">Account</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg></Link>
            <button type="button" className="bag-button" onClick={openCart} aria-label={`Open shopping bag with ${cartCount} items`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5h14l1 12H4l1-12Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>
              <span className="bag-label">Bag</span><span className="bag-count">{cartCount}</span>
            </button>
          </nav>
        </div>
        <nav className={`mobile-navigation${menuOpen ? " is-open" : ""}`} aria-label="Mobile navigation">
          <Link href="/#shop" onClick={() => setMenuOpen(false)}>Shop all <span>↗</span></Link>
          <Link href="/#our-story" onClick={() => setMenuOpen(false)}>Our story <span>↗</span></Link>
          <Link href="/account" onClick={() => setMenuOpen(false)}>Your account <span>↗</span></Link>
        </nav>
      </header>
    </>
  );
}
