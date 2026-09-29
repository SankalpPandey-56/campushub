"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import type { ActionResult } from "@/components/feed/actions";

export async function toggleMembershipAction(groupId: string): Promise<ActionResult> {
  const viewer = await requireMember();
  const group = await db.group.findUnique({ where: { id: groupId }, select: { creatorId: true, name: true } });
  if (!group) return { ok: false, error: "Group not found." };

  const existing = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: viewer.id } },
  });

  if (existing) {
    if (group.creatorId === viewer.id) return { ok: false, error: "Creators can't leave their own group." };
    await db.groupMember.delete({ where: { id: existing.id } });
  } else {
    await db.groupMember.create({ data: { groupId, userId: viewer.id } });
    if (group.creatorId !== viewer.id) {
      await db.notification.create({
        data: {
          userId: group.creatorId,
          type: "GROUP",
          title: `${viewer.name} joined "${group.name}"`,
          link: `/groups/${groupId}`,
        },
      });
    }
  }
  return { ok: true };
}

const postSchema = z.object({ content: z.string().trim().min(1).max(1000) });

export async function createGroupPostAction(groupId: string, formData: FormData): Promise<ActionResult> {
  const viewer = await requireMember();
  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: viewer.id } },
  });
  if (!membership) return { ok: false, error: "Join the group to post." };

  const parsed = postSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { ok: false, error: "Write something first." };

  await db.groupPost.create({ data: { groupId, authorId: viewer.id, content: parsed.data.content } });
  return { ok: true };
}
