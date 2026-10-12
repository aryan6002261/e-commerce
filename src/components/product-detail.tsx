"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/store-provider";
import type { CatalogProduct } from "@/components/product-card";
import { ProductCard } from "@/components/product-card";
import { formatPrecisePrice } from "@/lib/format";

export function ProductDetail({ product, recommendations }: { product: CatalogProduct; recommendations: CatalogProduct[] }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useStore();
  const stock = product.stock ?? 0;

  return (
    <main className="product-detail-page">
      <div className="detail-breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/#shop">Shop</Link><span>/</span><span>{product.name}</span></div>
      <section className="product-detail-layout">
        <div className="detail-visual-column">
          <div className="detail-main-image">
            <img src={product.imageUrl} alt={product.name} />
            <span className="detail-image-stamp">GOOD THINGS<br />FOR THE EVERYDAY <span>✳</span></span>
          </div>
          <div className="detail-image-caption"><span>MADE TO BE LIVED WITH.</span><span>AN EVERYDAY FAVORITE</span></div>
        </div>
        <div className="detail-copy-column">
          <p className="eyebrow"><span className="eyebrow-line" /> {product.category.toUpperCase()} · THOUGHTFULLY CHOSEN</p>
          <h1>{product.name}</h1>
          <div className="detail-rating"><span aria-hidden="true">★★★★★</span><strong>{(product.rating / 10).toFixed(1)}</strong><a href="#reviews">({product.reviewCount} thoughtful reviews)</a></div>
          <div className="detail-price-line"><strong>{formatPrecisePrice(product.price)}</strong>{product.compareAtPrice && <span>{formatPrecisePrice(product.compareAtPrice)}</span>}</div>
          {product.badge && <span className="detail-badge">✳ &nbsp;{product.badge}</span>}
          <p className="detail-description">{product.description}</p>

          <div className="detail-material-note"><span className="detail-note-icon">✳</span><span>Selected with care. Made to feel at home wherever you land.</span></div>

          <div className="detail-add-row">
            <div className="quantity-control detail-quantity" aria-label="Choose quantity">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((current) => Math.min(stock || 1, current + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button
              type="button"
              className="button button-dark detail-add-button"
              disabled={stock < 1}
              onClick={() => {
                addToCart(product, quantity);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 2200);
              }}
            >
              {stock < 1 ? "Currently unavailable" : added ? "Added to your bag ✓" : "Add to bag"}
              <span>{stock < 1 ? "·" : "↗"}</span>
            </button>
          </div>
          <p className={`stock-note${stock < 5 ? " stock-low" : ""}`}>{stock < 1 ? "Out of stock for now" : stock < 5 ? `Only ${stock} left — just so you know.` : "Ready when you are · ships in 2–3 days"}</p>

          <div className="detail-perks"><div><span>↗</span><p>Complimentary shipping<br /><strong>on orders over $75</strong></p></div><div><span>↻</span><p>A little breathing room<br /><strong>30-day easy returns</strong></p></div></div>

          <details className="detail-accordion" open><summary>A little more about it <span>＋</span></summary><p>{product.description} We work with a small circle of thoughtful makers and choose pieces for the way they fit into real, everyday life.</p></details>
          <details className="detail-accordion"><summary>Shipping &amp; the details <span>＋</span></summary><p>Orders are carefully packed and leave our studio within 2–3 business days. Standard shipping is complimentary over $75; otherwise it’s a flat $6.50. If it doesn’t feel quite right, return it within 30 days.</p></details>
          <details className="detail-accordion"><summary>Made with care <span>＋</span></summary><p>We look for enduring materials, responsible production, and people who take pride in their work. A little variation is part of what makes every piece special.</p></details>
        </div>
      </section>

      <section className="detail-recommendations content-shell" id="reviews">
        <div className="section-heading"><div><p className="eyebrow">A FEW MORE TO LOVE</p><h2>Keep good <em>company.</em></h2></div><Link href="/#shop" className="underlined-link">Shop all the good stuff <span>↗</span></Link></div>
        <div className="product-grid product-grid-related">{recommendations.map((item) => <ProductCard key={item.slug} product={item} />)}</div>
      </section>
    </main>
  );
}
