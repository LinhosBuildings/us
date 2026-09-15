import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { User, Relationship } from "@/lib/types";
import { getStore, type DataStore } from "@/lib/data/contracts";

const COOKIE_NAME = "us_session";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  // Demo users
  if (stored === "demo-seeded" || !stored) {
    return password === "demo1234";
  }
  if (!stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function secret(): string {
  return process.env.SESSION_SECRET || "demo-session-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function issueToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { sub: string; exp: number };
    if (!data.sub || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data.sub;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, issueToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const store = await getStore();
  return store.findUserById(userId);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRelationship(): Promise<{ user: User; relationship: Relationship; store: DataStore }> {
  const user = await requireUser();
  const store = await getStore();
  const relationship = await store.getRelationshipForUser(user.id);
  if (!relationship) {
    redirect("/setup");
  }
  return { user, relationship, store };
}

/** asserts a user belongs to a given relationship id — the core relationship boundary */
export async function assertMember(user: User, relationshipId: string): Promise<Relationship> {
  const store = await getStore();
  const rel = await store.getRelationship(relationshipId);
  if (!rel || !rel.members.some((m) => m.id === user.id)) {
    notFound();
  }
  return rel;
}

export function csrfDigest(value: string) {
  return createHash("sha256").update(value + secret()).digest("hex").slice(0, 16);
}