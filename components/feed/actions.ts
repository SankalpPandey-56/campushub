"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";

export type ActionResult = { ok: true } | { ok: false; error: string };

const createSchema = z.object({
  title: z.string().trim().max(120).optional().or(z.literal("")),
  content: z.string().trim().min(1, "Write something first.").max(4000),
  category: z.enum(["CAMPUS", "DEALS", "EVENTS", "RESOURCES", "MARKETPLACE", "LOST_FOUND"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
});

export async function createPostAction(formData: FormData): Promise<ActionResult> {
  const viewer = await requireMember();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid post" };
  const d = parsed.data;

  const post = await db.post.create({
    data: {
      authorId: viewer.id,
      campusId: viewer.campusId!,
      category: d.category,
      title: d.title || null,
      content: d.content,
      imageUrl: d.imageUrl || null,
      location: d.location || null,
    },
  });
  redirect(`/feed/${post.id}`);
}

export async function updatePostAction(postId: string, formData: FormData): Promise<ActionResult> {
  const viewer = await requireMember();
  const post = await db.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return { ok: false, error: "Post not found." };
  if (post.authorId !== viewer.id) return { ok: false, error: "You can only edit your own posts." };

  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid post" };
  const d = parsed.data;

  await db.post.update({
    where: { id: postId },
    data: {
      title: d.title || null,
      content: d.content,
      category: d.category,
      imageUrl: d.imageUrl || null,
      location: d.location || null,
    },
  });
  revalidatePath(`/feed/${postId}`);
  redirect(`/feed/${postId}`);
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  const viewer = await requireMember();
  const post = await db.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return { ok: false, error: "Post not found." };
  if (post.authorId !== viewer.id) return { ok: false, error: "You can only delete your own posts." };
  await db.post.delete({ where: { id: postId } });
  revalidatePath("/feed");
  return { ok: true };
}

export async function toggleLikeAction(postId: string): Promise<ActionResult> {
  const viewer = await requireMember();
  const existing = await db.like.findUnique({
    where: { postId_userId: { postId, userId: viewer.id } },
  });
  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
  } else {
    try {
      await db.like.create({ data: { postId, userId: viewer.id } });
    } catch {
      return { ok: true }; // already liked (double-tap race)
    }
  }
  return { ok: true };
}

export async function toggleSaveAction(postId: string): Promise<ActionResult> {
  const viewer = await requireMember();
  const existing = await db.savedPost.findUnique({
    where: { postId_userId: { postId, userId: viewer.id } },
  });
  if (existing) await db.savedPost.delete({ where: { id: existing.id } });
  else await db.savedPost.create({ data: { postId, userId: viewer.id } });
  return { ok: true };
}

const commentSchema = z.object({ content: z.string().trim().min(1, "Comment can't be empty.").max(1000) });

export async function addCommentAction(postId: string, formData: FormData): Promise<ActionResult> {
  const viewer = await requireMember();
  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { ok: false, error: "Comment can't be empty." };

  const post = await db.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) return { ok: false, error: "Post not found." };

  await db.comment.create({ data: { postId, authorId: viewer.id, content: parsed.data.content } });

  if (post.authorId !== viewer.id) {
    await db.notification.create({
      data: {
        userId: post.authorId,
        type: "COMMENT",
        title: `${viewer.name} commented on your post`,
        link: `/feed/${postId}`,
      },
    });
  }
  revalidatePath(`/feed/${postId}`);
  return { ok: true };
}
