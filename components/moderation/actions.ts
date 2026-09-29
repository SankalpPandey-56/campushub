"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";

export type ReportState = { ok?: boolean; error?: string };

const schema = z.object({
  targetType: z.enum(["POST", "DEAL", "EVENT", "RESOURCE", "LISTING", "USER", "LOST_FOUND"]),
  targetId: z.string().min(1),
  reason: z.enum(["Spam", "Misleading information", "Inappropriate content", "Scam", "Harassment", "Other"]),
  details: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function reportAction(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const viewer = await requireMember();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Pick a reason first." };

  await db.report.create({
    data: {
      reporterId: viewer.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
    },
  });
  return { ok: true };
}
