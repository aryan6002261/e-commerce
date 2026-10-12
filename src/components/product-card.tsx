"use client";

import Link from "next/link";
import { useStore, type CartProduct } from "@/components/store-provider";
import { formatPrecisePrice } from "@/lib/format";

export interface CatalogProduct extends CartProduct {
  category: string;
  description: string;
  compareAtPrice: number | null;
  badge: string | null;
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/products/${product.slug}`} className="product-image-link" aria-label={`View ${product.name}`}>
          <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
          {product.badge && <span className={`product-badge${product.badge === "New arrival" ? " badge-new" : ""}`}>{product.badge}</span>}
        </Link>
        <AddToBagButton product={product} />
      </div>
      <div className="product-info">
        <div className="product-title-row">
          <Link href={`/products/${product.slug}`} className="product-name">{product.name}</Link>
          <span className="product-rating" aria-label={`${(product.rating / 10).toFixed(1)} out of 5 stars`}>★ <span>{(product.rating / 10).toFixed(1)}</span></span>
        </div>
        <div className="product-category">{product.category} <span>·</span> {product.reviewCount} reviews</div>
        <div className="product-price-row">
          <span className="product-price">{formatPrecisePrice(product.price)}</span>
          {product.compareAtPrice && <span className="product-price-old">{formatPrecisePrice(product.compareAtPrice)}</span>}
        </div>
      </div>
    </article>
  );
}

function AddToBagButton({ product }: { product: CatalogProduct }) {
  const { addToCart } = useStore();
  const unavailable = (product.stock ?? 0) < 1;
  return (
    <button
      type="button"
      className="quick-add-button"
      disabled={unavailable}
      onClick={() => addToCart(product, 1)}
      aria-label={unavailable ? `${product.name} is out of stock` : `Add ${product.name} to your bag`}
    >
      <span>{unavailable ? "Sold out" : "Add to bag"}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
    </button>
  );
}
