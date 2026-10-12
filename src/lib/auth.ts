import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storeUsers } from "@/db/schema";

const SESSION_COOKIE = "morrow_session";
const SESSION_DURATION = 60 * 60 * 24 * 30;

function deriveKey(password: string, salt: Buffer, length = 64) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, length, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

function signingSecret() {
  return process.env.AUTH_SECRET ?? process.env.DATABASE_URL ?? "morrow-local-session-secret";
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [saltHex, keyHex] = encoded.split(":");
  if (!saltHex || !keyHex) return false;

  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(keyHex, "hex");
    if (salt.length !== 16 || expected.length !== 64) return false;
    const actual = await deriveKey(password, salt);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function signSession(userId: number) {
  const payload = Buffer.from(
    JSON.stringify({ userId, expiresAt: Date.now() + SESSION_DURATION * 1000 }),
  ).toString("base64url");
  const signature = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readSession(token: string | undefined) {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = createHmac("sha256", signingSecret()).update(payload).digest();
  const provided = Buffer.from(signature, "base64url");
  if (provided.length !== expected.length || !timingSafeEqual(expected, provided)) return null;

  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: number;
      expiresAt?: number;
    };
    if (!Number.isInteger(value.userId) || !value.expiresAt || value.expiresAt <= Date.now()) return null;
    return value.userId as number;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = readSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  const [user] = await db
    .select({ id: storeUsers.id, name: storeUsers.name, email: storeUsers.email })
    .from(storeUsers)
    .where(eq(storeUsers.id, userId))
    .limit(1);

  return user ?? null;
}
