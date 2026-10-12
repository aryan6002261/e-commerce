import { asc, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { productCatalog } from "@/db/schema";
import { ProductDetail } from "@/components/product-detail";
import type { CatalogProduct } from "@/components/product-card";
import { ensureCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await ensureCatalog();
  const { slug } = await params;
  const [product] = await db.select().from(productCatalog).where(eq(productCatalog.slug, slug)).limit(1);
  if (!product) notFound();

  const recommendations = await db
    .select({
      id: productCatalog.id,
      slug: productCatalog.slug,
      name: productCatalog.name,
      category: productCatalog.category,
      description: productCatalog.description,
      price: productCatalog.price,
      compareAtPrice: productCatalog.compareAtPrice,
      imageUrl: productCatalog.imageUrl,
      badge: productCatalog.badge,
      rating: productCatalog.rating,
      reviewCount: productCatalog.reviewCount,
      stock: productCatalog.stock,
      featured: productCatalog.featured,
    })
    .from(productCatalog)
    .where(ne(productCatalog.slug, slug))
    .orderBy(asc(productCatalog.id))
    .limit(4);

  const safeProduct: CatalogProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    imageUrl: product.imageUrl,
    badge: product.badge,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stock: product.stock,
    featured: product.featured,
  };

  return <ProductDetail product={safeProduct} recommendations={recommendations} />;
}
