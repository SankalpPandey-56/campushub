import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildGoogleAuthUrl, randomState } from "@/lib/auth/google";

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/login?error=google_unconfigured", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }
  const state = randomState();
  const jar = await cookies();
  jar.set("campushub_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
