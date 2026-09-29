"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";
import { sendAdminVerificationEmail } from "@/lib/email";

export type VerifyState = { ok?: boolean; error?: string };

const schema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  course: z.string().trim().min(2).max(60),
  year: z.string().trim().min(1).max(10),
  campusId: z.string().min(1),
  collegeEmail: z.string().email().optional().or(z.literal("")),
  extraInfo: z.string().trim().max(600).optional().or(z.literal("")),
});

export async function submitVerificationAction(_prev: VerifyState, formData: FormData): Promise<VerifyState> {
  const viewer = await requireUser();
  if (viewer.verificationStatus === "APPROVED") return { ok: true };

  const dbUser = await db.user.findUnique({ where: { id: viewer.id }, select: { phone: true } });

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fill the required fields correctly." };
  const data = parsed.data;

  const campus = await db.campus.findUnique({ where: { id: data.campusId }, select: { name: true } });
  if (!campus) return { error: "That campus doesn't exist — pick again." };

  const request = await db.verificationRequest.create({
    data: {
      userId: viewer.id,
      fullName: data.fullName,
      email: data.email || null,
      phone: dbUser?.phone ?? null,
      course: data.course,
      year: data.year,
      campusId: data.campusId,
      collegeEmail: data.collegeEmail || null,
      extraInfo: data.extraInfo || null,
      status: "PENDING",
    },
  });

  // Keep the user record in sync for the pending-gate checks.
  await db.user.update({
    where: { id: viewer.id },
    data: { name: data.fullName, course: data.course, year: data.year, campusId: data.campusId },
  });

  await db.notification.create({
    data: {
      userId: viewer.id,
      type: "VERIFICATION",
      title: "Verification request submitted",
      body: `We've sent your request for ${campus.name} to the admin for review.`,
    },
  });

  await sendAdminVerificationEmail({
    name: data.fullName,
    email: data.email || null,
    phone: null,
    course: data.course,
    year: data.year,
    campus: campus.name,
    submittedAt: new Date(),
    reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/admin/verifications`,
  });

  return { ok: true };
}
