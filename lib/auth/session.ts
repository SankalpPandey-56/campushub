import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const ALG = "HS256";
export const SESSION_COOKIE = "campushub_session";
const SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  email: string | null;
  name: string;
  image: string | null;
  role: "USER" | "ADMIN";
};

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET missing/too short");
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_S}s`)
    .sign(secret());
}

export async function readSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.id !== "string") return null;
    return {
      id: payload.id,
      email: (payload.email as string | null) ?? null,
      name: (payload.name as string) ?? "Student",
      image: (payload.image as string | null) ?? null,
      role: payload.role === "ADMIN" ? "ADMIN" : "USER",
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_S,
};
