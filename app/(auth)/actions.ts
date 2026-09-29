"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { isFlagged } from "@/lib/flags";
import { issueOtp, verifyOtp, twilioVerifyCheck } from "@/lib/auth/otp";
import { signSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/session";

export type LoginState = {
  step: "phone" | "code";
  phone?: string;
  error?: string;
  notice?: string;
};

export async function sendOtpAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!(await isFlagged("signups"))) {
    return { step: "phone", error: "New signups are paused right now. If you already have an account, contact the admin." };
  }
  const parsed = z.string().min(6).safeParse(formData.get("phone"));
  if (!parsed.success) return { step: "phone", error: "Enter your mobile number." };

  const result = await issueOtp(parsed.data);
  if (!result.ok) return { step: "phone", phone: parsed.data, error: result.error };

  const provider = process.env.PHONE_AUTH_PROVIDER ?? "console";
  return {
    step: "code",
    phone: parsed.data,
    notice:
      provider === "console"
        ? "Development mode: the code is printed in the server console."
        : "Code sent. It should arrive within a minute.",
  };
}

export async function verifyOtpAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const phone = String(formData.get("phone") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  if (!phone) return { step: "phone", error: "Session expired — enter your number again." };

  const provider = process.env.PHONE_AUTH_PROVIDER ?? "console";
  const check =
    provider === "twilio" && process.env.TWILIO_VERIFY_SERVICE_SID
      ? (await twilioVerifyCheck(phone, code))
        ? { ok: true as const }
        : { ok: false as const, error: "Incorrect or expired code." }
      : await verifyOtp(phone, code);

  if (!check.ok) return { step: "code", phone, error: check.error };

  const normalized = phone;
  const user = await db.user.upsert({
    where: { phone: normalized },
    update: { phoneVerified: new Date() },
    create: {
      phone: normalized,
      name: `Student ${normalized.slice(-4)}`,
      phoneVerified: new Date(),
      verificationStatus: "PENDING",
    },
  });

  await createSession(user.id, user.email, user.name, user.image, user.role);
  redirect(await nextStepFor(user.id, user.role));
}

async function createSession(
  id: string,
  email: string | null,
  name: string,
  image: string | null,
  role: "USER" | "ADMIN",
) {
  const token = await signSession({ id, email, name, image, role });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions);
}

/** Where should this user land after sign-in? */
export async function nextStepFor(userId: string, role: "USER" | "ADMIN"): Promise<string> {
  if (role === "ADMIN") return "/admin";
  const user = await db.user.findUnique({ where: { id: userId }, select: { verificationStatus: true } });
  if (!user) return "/login";
  if (user.verificationStatus === "APPROVED" || user.verificationStatus === "SUSPENDED") {
    return user.verificationStatus === "SUSPENDED" ? "/suspended" : "/feed";
  }
  return "/verify";
}
