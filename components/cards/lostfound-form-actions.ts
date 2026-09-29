"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";

export type LostFoundFormState = { error?: string };

const schema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(1200),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  lastSeenAt: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function createLostFoundAction(_prev: LostFoundFormState, formData: FormData): Promise<LostFoundFormState> {
  const viewer = await requireMember();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const d = parsed.data;

  await db.lostFoundItem.create({
    data: {
      authorId: viewer.id,
      campusId: viewer.campusId!,
      type: d.type,
      title: d.title,
      description: d.description,
      location: d.location || null,
      lastSeenAt: d.lastSeenAt ? new Date(d.lastSeenAt) : null,
      imageUrl: d.imageUrl || null,
    },
  });

  revalidatePath("/lost-found");
  redirect("/lost-found");
}
