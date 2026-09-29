"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";

export type ListingFormState = { error?: string };

const schema = z.object({
  title: z.string().trim().min(2).max(100),
  price: z.coerce.number().int().min(1).max(1_000_000),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  category: z.enum(["BOOKS", "ELECTRONICS", "FURNITURE", "ACCESSORIES", "OTHER"]),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().min(5).max(1500),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function createListingAction(_prev: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const viewer = await requireMember();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const d = parsed.data;

  await db.marketplaceListing.create({
    data: {
      sellerId: viewer.id,
      campusId: viewer.campusId!,
      title: d.title,
      price: d.price,
      condition: d.condition,
      category: d.category,
      location: d.location || null,
      description: d.description,
      imageUrl: d.imageUrl || null,
    },
  });

  revalidatePath("/marketplace");
  redirect("/marketplace");
}
