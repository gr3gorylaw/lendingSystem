import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users, roles } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "session_id";
const SESSION_DURATION_DAYS = 7;

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
}

export async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo - in production use bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "lending_system_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (sessionCookie) {
    await db.delete(sessions).where(eq(sessions.id, sessionCookie.value));
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie) {
    return null;
  }

  const session = await db
    .select()
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(and(eq(sessions.id, sessionCookie.value), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (session.length === 0) {
    // Check if session is expired
    const expiredSession = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionCookie.value))
      .limit(1);

    if (expiredSession.length > 0) {
      await destroySession();
    }
    return null;
  }

  return {
    id: session[0].users.id,
    name: session[0].users.name,
    email: session[0].users.email,
    role: session[0].roles.name,
    roleId: session[0].users.roleId,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
