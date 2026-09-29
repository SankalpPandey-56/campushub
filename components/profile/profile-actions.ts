"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import type { ActionResult } from "@/components/feed/actions";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  course: z.string().trim().max(60).optional().or(z.literal("")),
  year: z.string().trim().max(10).optional().or(z.literal("")),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
});

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const viewer = await requireMember();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Check the fields and try again." };
  const d = parsed.data;

  await db.user.update({
    where: { id: viewer.id },
    data: {
      name: d.name,
      course: d.course || null,
      year: d.year || null,
      bio: d.bio || null,
    },
  });

  revalidatePath("/profile");
  return { ok: true };
}
