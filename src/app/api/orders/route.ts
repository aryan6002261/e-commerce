import { randomBytes } from "node:crypto";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { productCatalog, purchaseOrderItems, purchaseOrders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

class OrderProblem extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Your order details could not be read. Please try again." }, { status: 400 });
  }

  const values = body as { items?: unknown; customer?: unknown };
  const customer = values.customer as {
    name?: unknown;
    email?: unknown;
    address?: unknown;
    city?: unknown;
    postalCode?: unknown;
    country?: unknown;
  } | null;

  if (!customer || typeof customer !== "object") {
    return Response.json({ error: "Please add your delivery details." }, { status: 400 });
  }
  const name = typeof customer.name === "string" ? customer.name.trim() : "";
  const email = typeof customer.email === "string" ? customer.email.trim().toLowerCase() : "";
  const address = typeof customer.address === "string" ? customer.address.trim() : "";
  const city = typeof customer.city === "string" ? customer.city.trim() : "";
  const postalCode = typeof customer.postalCode === "string" ? customer.postalCode.trim() : "";
  const country = typeof customer.country === "string" ? customer.country.trim() : "";
  if (!name || name.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 || !address || address.length > 255 || !city || city.length > 120 || !postalCode || postalCode.length > 32 || !country || country.length > 80) {
    return Response.json({ error: "Please complete every delivery field with valid details." }, { status: 400 });
  }

  if (!Array.isArray(values.items) || values.items.length < 1 || values.items.length > 40) {
    return Response.json({ error: "Your bag is empty. Add something lovely before checking out." }, { status: 400 });
  }

  const requested = new Map<number, number>();
  for (const item of values.items) {
    if (!item || typeof item !== "object") return Response.json({ error: "There’s a problem with your bag. Please refresh and try again." }, { status: 400 });
    const row = item as { productId?: unknown; quantity?: unknown };
    if (!Number.isInteger(row.productId) || !Number.isInteger(row.quantity) || Number(row.quantity) < 1 || Number(row.quantity) > 20) {
      return Response.json({ error: "Please choose a valid quantity for each item." }, { status: 400 });
    }
    const productId = Number(row.productId);
    requested.set(productId, (requested.get(productId) ?? 0) + Number(row.quantity));
  }
  for (const quantity of requested.values()) {
    if (quantity > 20) return Response.json({ error: "Please order no more than 20 of any one item." }, { status: 400 });
  }

  const user = await getCurrentUser();
  const orderNumber = `MOR-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;

  try {
    const order = await db.transaction(async (tx) => {
      const lockedProducts = await tx
        .select()
        .from(productCatalog)
        .where(inArray(productCatalog.id, [...requested.keys()]))
        .for("update");

      if (lockedProducts.length !== requested.size) {
        throw new OrderProblem("One of the lovely things in your bag is no longer available.", 409);
      }

      for (const product of lockedProducts) {
        const quantity = requested.get(product.id) ?? 0;
        if (product.stock < quantity) {
          throw new OrderProblem(`Sorry, only ${product.stock} ${product.name} ${product.stock === 1 ? "is" : "are"} available right now.`, 409);
        }
      }

      const subtotal = lockedProducts.reduce(
        (sum, product) => sum + product.price * (requested.get(product.id) ?? 0),
        0,
      );
      const shipping = subtotal >= 7500 ? 0 : 650;
      const tax = Math.round(subtotal * 0.08);
      const [createdOrder] = await tx
        .insert(purchaseOrders)
        .values({
          orderNumber,
          userId: user?.id ?? null,
          customerName: name,
          customerEmail: email,
          addressLine1: address,
          city,
          postalCode,
          country,
          subtotal,
          shipping,
          tax,
          total: subtotal + shipping + tax,
          status: "processing",
        })
        .returning({ id: purchaseOrders.id, orderNumber: purchaseOrders.orderNumber, total: purchaseOrders.total });

      await tx.insert(purchaseOrderItems).values(
        lockedProducts.map((product) => ({
          orderId: createdOrder.id,
          productId: product.id,
          productName: product.name,
          productImageUrl: product.imageUrl,
          unitPrice: product.price,
          quantity: requested.get(product.id) ?? 0,
        })),
      );

      for (const product of lockedProducts) {
        const quantity = requested.get(product.id) ?? 0;
        await tx
          .update(productCatalog)
          .set({ stock: sql`${productCatalog.stock} - ${quantity}` })
          .where(eq(productCatalog.id, product.id));
      }

      return {
        orderNumber: createdOrder.orderNumber,
        total: createdOrder.total,
        subtotal,
        shipping,
        tax,
      };
    });

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderProblem) return Response.json({ error: error.message }, { status: error.status });
    console.error("Unable to create order", error);
    return Response.json({ error: "We couldn’t place your order just now. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to view your orders." }, { status: 401 });

  const orders = await db
    .select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.userId, user.id))
    .orderBy(desc(purchaseOrders.createdAt));

  if (orders.length === 0) return Response.json({ orders: [] });
  const items = await db
    .select({
      orderId: purchaseOrderItems.orderId,
      productName: purchaseOrderItems.productName,
      productImageUrl: purchaseOrderItems.productImageUrl,
      unitPrice: purchaseOrderItems.unitPrice,
      quantity: purchaseOrderItems.quantity,
    })
    .from(purchaseOrderItems)
    .where(inArray(purchaseOrderItems.orderId, orders.map((order) => order.id)));

  return Response.json({
    orders: orders.map((order) => ({
      ...order,
      items: items.filter((item) => item.orderId === order.id),
    })),
  });
}
