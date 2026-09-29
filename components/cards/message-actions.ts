"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import type { ActionResult } from "@/components/feed/actions";

const schema = z.object({ body: z.string().trim().min(1).max(2000) });

export async function sendMessageAction(conversationId: string, formData: FormData): Promise<ActionResult> {
  const viewer = await requireMember();

  const membership = await db.conversationMember.findFirst({
    where: { conversationId, userId: viewer.id },
  });
  if (!membership) return { ok: false, error: "You're not part of this conversation." };

  const parsed = schema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { ok: false, error: "Write a message first." };

  await db.message.create({
    data: { conversationId, senderId: viewer.id, body: parsed.data.body },
  });

  // Mark thread unread for everyone else.
  await db.conversationMember.updateMany({
    where: { conversationId, userId: { not: viewer.id } },
    data: { lastReadAt: null },
  });

  revalidatePath(`/messages/${conversationId}`);
  return { ok: true };
}
