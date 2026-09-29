import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { isFlagged } from "@/lib/flags";
import { exchangeGoogleCode } from "@/lib/auth/google";
import { signSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/session";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? new URL(reqUrlFallback()).origin;
}

function reqUrlFallback() {
  return "http://localhost:3000";
}

export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, base));

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const jar = await cookies();
  const expectedState = jar.get("campushub_oauth_state")?.value;
  jar.delete("campushub_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) return fail("oauth_state");

  let profile;
  try {
    profile = await exchangeGoogleCode(code);
  } catch {
    return fail("oauth_failed");
  }

  const email = profile.email.toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const isAdmin = adminEmail !== "" && email === adminEmail;

  // Signup pause: block brand-new accounts (admins always get through).
  if (!isAdmin) {
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!existing && !(await isFlagged("signups"))) {
      return NextResponse.redirect(new URL("/login?error=signups_paused", base));
    }
  }

  const user = await db.user.upsert({
    where: { email },
    update: {
      name: profile.name,
      image: profile.picture ?? undefined,
      emailVerified: profile.email_verified ? new Date() : undefined,
    },
    create: {
      email,
      name: profile.name,
      image: profile.picture ?? null,
      emailVerified: profile.email_verified ? new Date() : null,
      verificationStatus: "PENDING",
    },
  });

  // Role is derived server-side from ADMIN_EMAIL on every login.
  if (user.role !== (isAdmin ? "ADMIN" : "USER")) {
    await db.user.update({ where: { id: user.id }, data: { role: isAdmin ? "ADMIN" : "USER" } });
  }

  const token = await signSession({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: isAdmin ? "ADMIN" : user.role,
  });
  jar.set(SESSION_COOKIE, token, sessionCookieOptions);

  // Routing: admin → /admin; otherwise pending users → verification.
  if (isAdmin) return NextResponse.redirect(new URL("/admin", base));
  if (user.verificationStatus === "APPROVED") return NextResponse.redirect(new URL("/feed", base));
  if (user.verificationStatus === "SUSPENDED") return NextResponse.redirect(new URL("/suspended", base));
  return NextResponse.redirect(new URL("/verify", base));
}
