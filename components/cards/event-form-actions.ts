"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";

export type EventFormState = { error?: string };

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(5).max(2000),
  startsAt: z.string().min(10),
  location: z.string().trim().min(2).max(120),
  category: z.enum(["TECH", "CULTURAL", "SPORTS", "ACADEMIC", "WORKSHOP", "SOCIAL", "OTHER"]),
  regLink: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function createEventAction(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const viewer = await requireMember();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const d = parsed.data;

  const startsAt = new Date(d.startsAt);
  if (isNaN(startsAt.getTime())) return { error: "Pick a valid date and time." };

  await db.event.create({
    data: {
      organizerId: viewer.id,
      campusId: viewer.campusId!,
      title: d.title,
      description: d.description,
      startsAt,
      location: d.location,
      category: d.category,
      regLink: d.regLink || null,
      imageUrl: d.imageUrl || null,
    },
  });

  revalidatePath("/events");
  redirect("/events");
}
