"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard, type CatalogProduct } from "@/components/product-card";

const categoryOptions = ["Everything", "Objects", "Textiles", "Kitchen", "Lighting", "Fragrance", "Furniture"];

export function Storefront({ products }: { products: CatalogProduct[] }) {
  const [category, setCategory] = useState("Everything");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("curated");
  const [subscribed, setSubscribed] = useState(false);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === "Everything" || product.category === category;
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
    if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
    if (sort === "popular") filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    if (sort === "curated") filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
    return filtered;
  }, [products, category, search, sort]);

  return (
    <main>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> MADE FOR THE IN-BETWEEN</p>
          <h1 id="hero-title">Make room<br />for <em>living.</em></h1>
          <p className="hero-description">The little things that make a place feel like yours. Thoughtfully chosen, made to be lived with.</p>
          <Link href="#shop" className="button button-dark hero-button">Find your everyday <span>↗</span></Link>
          <div className="hero-note"><span className="note-star">✳</span><span>Considered pieces.<br /><strong>Better days at home.</strong></span></div>
        </div>
        <div className="hero-art">
          <img src="/images/morrow-hero.jpg" alt="A sunlit living room with natural oak, soft linen, and handmade home objects" />
          <div className="hero-image-tag"><span className="tag-star">✳</span><span>Less, but<br />a little lovelier.</span></div>
          <div className="hero-image-caption"><span>THE SLOW LIVING EDIT</span><span>NO. 01 — 2026</span></div>
        </div>
        <div className="hero-bottom-note"><span>GOOD THINGS, MADE TO STAY.</span><span>SCROLL A LITTLE <span aria-hidden="true">↓</span></span></div>
      </section>

      <section className="promise-strip" aria-label="What makes Morrow special">
        <div><span className="promise-icon">✳</span><span>Made with intention</span></div>
        <span className="promise-divider" />
        <div><span className="promise-icon">⌂</span><span>For the home you call yours</span></div>
        <span className="promise-divider" />
        <div><span className="promise-icon">♡</span><span>Packed up with care</span></div>
      </section>

      <section className="shop-section content-shell" id="shop" aria-labelledby="shop-title">
        <div className="section-heading shop-heading">
          <div>
            <p className="eyebrow">A FEW THINGS WE LOVE</p>
            <h2 id="shop-title">The good <em>stuff.</em></h2>
          </div>
          <p className="section-side-note">Useful, beautiful, and always<br className="desktop-break" /> better when shared.</p>
        </div>

        <div className="catalog-toolbar">
          <div className="category-tabs" role="group" aria-label="Filter by category">
            {categoryOptions.map((option) => (
              <button type="button" key={option} onClick={() => setCategory(option)} className={`category-tab${category === option ? " is-active" : ""}`} aria-pressed={category === option}>{option}</button>
            ))}
          </div>
          <div className="catalog-tools">
            <label className="search-field">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.2 4.2"/></svg>
              <input aria-label="Search products" type="search" placeholder="Find something…" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <label className="sort-field"><span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
                <option value="curated">Curated</option>
                <option value="popular">Most loved</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        <div className="catalog-meta"><span>{visibleProducts.length} little {visibleProducts.length === 1 ? "good thing" : "good things"}</span><span>Made for keeping.</span></div>
        {visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product, index) => (
              <div className={index === 0 && category === "Everything" && !search ? "product-card-featured" : ""} key={product.slug}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="catalog-empty"><span>✳</span><h3>Nothing here just yet.</h3><p>Try another search or have a look at everything we love.</p><button className="text-button" type="button" onClick={() => { setSearch(""); setCategory("Everything"); }}>Show me everything ↗</button></div>
        )}
      </section>

      <section className="story-section content-shell" id="our-story">
        <div className="story-image">
          <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=88" alt="A relaxed, thoughtfully layered living room" loading="lazy" />
          <span className="story-image-stamp">A HOME<br />IN PROGRESS</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> A NOTE FROM US</p>
          <h2>It’s the small<br />things that make<br />a <em>home.</em></h2>
          <p>We believe the things we live with should make the everyday feel a little more considered. So we seek out makers with good ideas, good hands, and a softer footprint.</p>
          <p>Nothing for show. Just good things that feel like you.</p>
          <Link href="/#shop" className="underlined-link">A little more about us <span>↗</span></Link>
          <span className="story-signature">With care, the Morrow team</span>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="newsletter-mark" aria-hidden="true">✳</div>
        <p className="eyebrow">A LETTER, ONCE IN A WHILE</p>
        <h2>Notes for the <em>everyday.</em></h2>
        <p className="newsletter-description">A few good finds, small rituals, and first dibs. Never the noisy stuff.</p>
        {subscribed ? (
          <p className="newsletter-success" role="status"><span>✳</span> You’re on the list. Look out for a little note from us.</p>
        ) : (
          <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }}>
            <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
            <input id="newsletter-email" type="email" placeholder="Your email address" required />
            <button type="submit" aria-label="Subscribe to the Morrow newsletter">Count me in <span>↗</span></button>
          </form>
        )}
        <p className="newsletter-fineprint">By subscribing, you agree to occasional, genuinely lovely emails.</p>
      </section>
    </main>
  );
}
