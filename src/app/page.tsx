import { asc } from "drizzle-orm";
import { db } from "@/db";
import { productCatalog } from "@/db/schema";
import { Storefront } from "@/components/storefront";
import { ensureCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureCatalog();
  const products = await db
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
    .orderBy(asc(productCatalog.id));

  return <Storefront products={products} />;
}
