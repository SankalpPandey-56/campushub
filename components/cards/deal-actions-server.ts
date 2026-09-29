"use server";

import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import type { ActionResult } from "@/components/feed/actions";

export async function toggleDealLikeAction(dealId: string): Promise<ActionResult> {
  const viewer = await requireMember();
  const deal = await db.deal.findUnique({ where: { id: dealId }, select: { likedBy: true, likes: true } });
  if (!deal) return { ok: false, error: "Deal not found." };

  if (deal.likedBy.includes(viewer.id)) {
    await db.deal.update({
      where: { id: dealId },
      data: { likedBy: { set: deal.likedBy.filter((id) => id !== viewer.id) }, likes: { decrement: 1 } },
    });
  } else {
    try {
      await db.deal.update({
        where: { id: dealId },
        data: { likedBy: { push: viewer.id }, likes: { increment: 1 } },
      });
    } catch {
      return { ok: true };
    }
  }
  return { ok: true };
}

export async function toggleDealSaveAction(dealId: string): Promise<ActionResult> {
  const viewer = await requireMember();
  const saved = await db.savedDeal.findFirst({ where: { dealId, userId: viewer.id } });
  if (saved) await db.savedDeal.delete({ where: { id: saved.id } });
  else await db.savedDeal.create({ data: { dealId, userId: viewer.id } });
  return { ok: true };
}
