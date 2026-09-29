"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";

export type DealFormState = { error?: string };

const schema = z
  .object({
    title: z.string().trim().min(3).max(120),
    business: z.string().trim().min(2).max(80),
    location: z.string().trim().max(120).optional().or(z.literal("")),
    description: z.string().trim().min(5).max(1500),
    originalPrice: z.coerce.number().int().min(0).max(1_000_000).optional().or(z.literal("").transform(() => undefined)),
    discountedPrice: z.coerce.number().int().min(0).max(1_000_000).optional().or(z.literal("").transform(() => undefined)),
    category: z.enum(["FOOD", "FASHION", "ELECTRONICS", "ENTERTAINMENT", "SERVICES", "STUDENT_DEALS", "OTHER"]),
    expiresAt: z.string().optional().or(z.literal("")),
    imageUrl: z.string().url().optional().or(z.literal("")),
  })
  .refine(
    (d) => d.originalPrice == null || d.discountedPrice == null || d.discountedPrice <= d.originalPrice,
    { message: "Discounted price can't be higher than the original.", path: ["discountedPrice"] },
  );

function parseDeal(d: z.infer<typeof schema>) {
  const expiresAt = d.expiresAt ? new Date(d.expiresAt + (d.expiresAt.length === 10 ? "T23:59:59" : "")) : null;
  const discountPercent =
    d.originalPrice != null && d.discountedPrice != null && d.originalPrice > 0
      ? Math.round(((d.originalPrice - d.discountedPrice) / d.originalPrice) * 100)
      : null;
  return {
    title: d.title,
    business: d.business,
    location: d.location || null,
    description: d.description,
    originalPrice: d.originalPrice ?? null,
    discountedPrice: d.discountedPrice ?? null,
    discountPercent,
    category: d.category,
    expiresAt: expiresAt && !isNaN(expiresAt.getTime()) ? expiresAt : null,
    imageUrl: d.imageUrl || null,
  };
}

export async function saveDealAction(_prev: DealFormState, formData: FormData, dealId?: string): Promise<DealFormState> {
  const viewer = await requireMember();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const data = parseDeal(parsed.data);

  if (dealId) {
    const existing = await db.deal.findUnique({ where: { id: dealId }, select: { authorId: true } });
    if (!existing || existing.authorId !== viewer.id) return { error: "You can only edit your own deals." };
    await db.deal.update({ where: { id: dealId }, data });
  } else {
    await db.deal.create({ data: { ...data, authorId: viewer.id, campusId: viewer.campusId! } });
  }

  revalidatePath("/deals");
  redirect("/deals");
}
