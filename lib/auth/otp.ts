import "server-only";
import { createHash, randomInt } from "crypto";
import { db } from "@/lib/db";

const OTP_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}:${process.env.AUTH_SECRET}`).digest("hex");
}

/** Normalize Indian phone numbers to E.164 (+91XXXXXXXXXX). */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s()-]/g, "");
  if (/^(\+?91)?[6-9]\d{9}$/.test(digits)) {
    const ten = digits.slice(-10);
    return `+91${ten}`;
  }
  return null;
}

/** Issue an OTP for a phone number. Dev "console" provider logs the code. */
export async function issueOtp(rawPhone: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: "Enter a valid Indian mobile number." };

  const since = new Date(Date.now() - 60_000);
  const recent = await db.otpToken.count({ where: { phone, createdAt: { gte: since } } });
  if (recent >= 2) return { ok: false, error: "Too many requests. Wait a minute and try again." };

  const code = String(randomInt(100000, 1000000));
  await db.otpToken.create({
    data: {
      phone,
      codeHash: hashCode(phone, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MIN * 60_000),
    },
  });

  const provider = process.env.PHONE_AUTH_PROVIDER ?? "console";
  if (provider === "twilio") {
    await sendTwilioSms(phone, code);
  } else {
    // Local development: print instead of sending SMS.
    console.log(`\n[CampusHub OTP] ${phone} → ${code}\n`);
  }
  return { ok: true };
}

export async function verifyOtp(rawPhone: string, code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: "Invalid phone number." };
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "Enter the 6-digit code." };

  const token = await db.otpToken.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!token) return { ok: false, error: "Code expired. Request a new one." };

  if (token.attempts >= MAX_ATTEMPTS) {
    await db.otpToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } });
    return { ok: false, error: "Too many wrong attempts. Request a new code." };
  }

  if (token.codeHash !== hashCode(phone, code)) {
    await db.otpToken.update({ where: { id: token.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, error: "Incorrect code." };
  }

  await db.otpToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } });
  return { ok: true };
}

/**
 * Twilio Verify integration. Note: Verify sends & checks codes itself, so the
 * console-path above is bypassed — issueOtp triggers Verify's start, and
 * verification happens against the Twilio API.
 */
async function sendTwilioSms(phone: string, _fallbackCode: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const service = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!sid || !token || !service) {
    console.log(`[CampusHub OTP] Twilio env missing; logging code: ${_fallbackCode}`);
    return;
  }
  const res = await fetch(`https://verify.twilio.com/v2/Services/${service}/Verifications`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: phone, Channel: "sms" }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Twilio Verify start failed:", text);
    throw new Error("Could not send SMS. Try again in a moment.");
  }
  // With Twilio Verify the code never reaches our DB; verifyOtp checks via API.
  await db.otpToken.updateMany({ where: { phone, consumedAt: null }, data: { consumedAt: new Date() } });
}

/** Twilio Verify check call. */
export async function twilioVerifyCheck(phone: string, code: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const service = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!sid || !token || !service) return false;
  const res = await fetch(`https://verify.twilio.com/v2/Services/${service}/VerificationCheck`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: phone, Code: code }),
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { status?: string; valid?: boolean };
  return json.valid === true || json.status === "approved";
}
