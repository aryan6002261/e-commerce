import { db, pool } from "@/db";
import { productCatalog } from "@/db/schema";
import { starterProducts } from "./starter-products";

export { starterProducts };

let tablesInitialized = false;

export async function ensureTables() {
  if (tablesInitialized) return;
  if (process.env.DATABASE_URL && pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS store_users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(160) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS product_catalog (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(180) NOT NULL UNIQUE,
          name VARCHAR(180) NOT NULL,
          category VARCHAR(80) NOT NULL,
          description TEXT NOT NULL,
          price INTEGER NOT NULL,
          compare_at_price INTEGER,
          image_url TEXT NOT NULL,
          badge VARCHAR(80),
          rating INTEGER NOT NULL DEFAULT 49,
          review_count INTEGER NOT NULL DEFAULT 0,
          stock INTEGER NOT NULL DEFAULT 24,
          featured BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS purchase_orders (
          id SERIAL PRIMARY KEY,
          order_number VARCHAR(40) NOT NULL UNIQUE,
          user_id INTEGER REFERENCES store_users(id) ON DELETE SET NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'processing',
          customer_name VARCHAR(160) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          address_line_1 VARCHAR(255) NOT NULL,
          city VARCHAR(120) NOT NULL,
          postal_code VARCHAR(32) NOT NULL,
          country VARCHAR(80) NOT NULL,
          subtotal INTEGER NOT NULL,
          shipping INTEGER NOT NULL,
          tax INTEGER NOT NULL,
          total INTEGER NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS purchase_order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES product_catalog(id) ON DELETE SET NULL,
          product_name VARCHAR(180) NOT NULL,
          product_image_url TEXT NOT NULL,
          unit_price INTEGER NOT NULL,
          quantity INTEGER NOT NULL
        );
      `);
      tablesInitialized = true;
    } catch (err) {
      console.warn("Could not ensure database tables:", err);
    }
  } else {
    tablesInitialized = true;
  }
}

export async function ensureCatalog() {
  await ensureTables();
  try {
    await db
      .insert(productCatalog)
      .values(starterProducts.map((product) => ({ ...product })))
      .onConflictDoNothing({ target: productCatalog.slug });
  } catch (err) {
    console.warn("Catalog seeding failed, using fallback:", err);
  }
}
