"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";

export type GroupFormState = { error?: string };

const schema = z.object({
  name: z.string().trim().min(3).max(80),
  subject: z.string().trim().max(60).optional().or(z.literal("")),
  description: z.string().trim().min(5).max(800),
});

export async function createGroupAction(_prev: GroupFormState, formData: FormData): Promise<GroupFormState> {
  const viewer = await requireMember();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const d = parsed.data;

  const group = await db.group.create({
    data: {
      name: d.name,
      subject: d.subject || null,
      description: d.description,
      creatorId: viewer.id,
      campusId: viewer.campusId!,
      members: { create: { userId: viewer.id } },
    },
    select: { id: true },
  });

  redirect(`/groups/${group.id}`);
}
