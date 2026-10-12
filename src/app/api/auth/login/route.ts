import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storeUsers } from "@/db/schema";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please check the details and try again." }, { status: 400 });
  }

  const values = body as { email?: unknown; password?: unknown };
  const email = typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const password = typeof values.password === "string" ? values.password : "";
  if (!email || !password || password.length > 128) {
    return Response.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const [user] = await db.select().from(storeUsers).where(eq(storeUsers.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ error: "That email and password don’t seem to match." }, { status: 401 });
  }

  await setSessionCookie(user.id);
  return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
}
