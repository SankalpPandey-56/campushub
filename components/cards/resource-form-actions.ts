"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";

export type ResourceFormState = { error?: string };

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(5).max(1500),
  subject: z.string().trim().min(2).max(60),
  course: z.string().trim().max(60).optional().or(z.literal("")),
  semester: z.string().trim().max(20).optional().or(z.literal("")),
  link: z.string().url().optional().or(z.literal("")),
});

export async function createResourceAction(_prev: ResourceFormState, formData: FormData): Promise<ResourceFormState> {
  const viewer = await requireMember();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const d = parsed.data;

  await db.resource.create({
    data: {
      authorId: viewer.id,
      campusId: viewer.campusId!,
      title: d.title,
      description: d.description,
      subject: d.subject,
      course: d.course || null,
      semester: d.semester || null,
      link: d.link || null,
    },
  });

  revalidatePath("/resources");
  redirect("/resources");
}
