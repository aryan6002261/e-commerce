import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const storeUsers = pgTable("store_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productCatalog = pgTable("product_catalog", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  imageUrl: text("image_url").notNull(),
  badge: varchar("badge", { length: 80 }),
  rating: integer("rating").notNull().default(49),
  reviewCount: integer("review_count").notNull().default(0),
  stock: integer("stock").notNull().default(24),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 40 }).notNull().unique(),
  userId: integer("user_id").references(() => storeUsers.id, { onDelete: "set null" }),
  status: varchar("status", { length: 32 }).notNull().default("processing"),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  postalCode: varchar("postal_code", { length: 32 }).notNull(),
  country: varchar("country", { length: 80 }).notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  tax: integer("tax").notNull(),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => productCatalog.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 180 }).notNull(),
  productImageUrl: text("product_image_url").notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
});
