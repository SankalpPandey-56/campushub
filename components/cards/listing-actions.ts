"use server";

import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import type { ActionResult } from "@/components/feed/actions";

/**
 * "Safe contact": opens (or reuses) a 1:1 conversation with the seller and
 * drops a starter message referencing the listing. No phone numbers exposed.
 */
export async function startConversationAction(sellerId: string, listingId: string): Promise<ActionResult> {
  const viewer = await requireMember();
  if (sellerId === viewer.id) return { ok: false, error: "That's your own listing." };

  const listing = await db.marketplaceListing.findUnique({
    where: { id: listingId },
    select: { title: true, sellerId: true },
  });
  if (!listing) return { ok: false, error: "Listing not found." };

  // Find an existing 1:1 conversation between the two users.
  const existing = await db.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { members: { some: { userId: viewer.id } } },
        { members: { some: { userId: sellerId } } },
      ],
    },
    select: { id: true },
  });

  const conversationId =
    existing?.id ??
    (
      await db.conversation.create({
        data: {
          members: { create: [{ userId: viewer.id }, { userId: sellerId }] },
        },
        select: { id: true },
      })
    ).id;

  await db.message.create({
    data: {
      conversationId,
      senderId: viewer.id,
      body: `Hi! Is "${listing.title}" still available? (via Marketplace)`,
    },
  });

  await db.conversationMember.updateMany({
    where: { conversationId, userId: sellerId },
    data: { lastReadAt: null }, // mark unread for seller
  });

  return { ok: true };
}

export async function markListingSoldAction(listingId: string): Promise<ActionResult> {
  const viewer = await requireMember();
  const listing = await db.marketplaceListing.findUnique({ where: { id: listingId }, select: { sellerId: true } });
  if (!listing) return { ok: false, error: "Listing not found." };
  if (listing.sellerId !== viewer.id) return { ok: false, error: "Not your listing." };

  await db.marketplaceListing.update({
    where: { id: listingId },
    data: { status: "SOLD" },
  });
  return { ok: true };
}
