import { db } from "@/db";
import { storeUsers } from "@/db/schema";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please check the details and try again." }, { status: 400 });
  }

  const values = body as { name?: unknown; email?: unknown; password?: unknown };
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const password = typeof values.password === "string" ? values.password : "";

  if (name.length < 2 || name.length > 160) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return Response.json({ error: "Choose a password with at least 8 characters." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(storeUsers)
    .values({ name, email, passwordHash })
    .onConflictDoNothing({ target: storeUsers.email })
    .returning({ id: storeUsers.id, name: storeUsers.name, email: storeUsers.email });

  if (!user) return Response.json({ error: "An account with this email already exists. Try signing in instead." }, { status: 409 });
  await setSessionCookie(user.id);
  return Response.json({ user }, { status: 201 });
}
