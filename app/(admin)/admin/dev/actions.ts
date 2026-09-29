"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { setFlag, FLAG_KEYS, type FlagKey } from "@/lib/flags";

export async function toggleFlagAction(key: string, enabled: boolean) {
  await requireAdmin();
  if (!FLAG_KEYS.includes(key as FlagKey)) return { ok: false as const, error: "Unknown flag." };
  await setFlag(key as FlagKey, enabled);
  revalidatePath("/admin/dev");
  revalidatePath("/marketplace");
  revalidatePath("/login");
  return { ok: true as const };
}

export type MaintenanceResult = { ok: true; message: string } | { ok: false; error: string };

/** Expire deals whose expiry date has passed. They already render as expired; this cleans the list. */
export async function expireStaleDealsAction(): Promise<MaintenanceResult> {
  await requireAdmin();
  const res = await db.deal.deleteMany({
    where: { expiresAt: { lt: new Date(Date.now() - 30 * 86_400_000) } },
  });
  revalidatePath("/deals");
  revalidatePath("/admin/dev");
  return { ok: true, message: `Removed ${res.count} deal${res.count === 1 ? "" : "s"} expired over 30 days ago.` };
}

/** Delete all read notifications older than 30 days. */
export async function purgeReadNotificationsAction(): Promise<MaintenanceResult> {
  await requireAdmin();
  const res = await db.notification.deleteMany({
    where: { readAt: { not: null, lt: new Date(Date.now() - 30 * 86_400_000) } },
  });
  revalidatePath("/admin/dev");
  return { ok: true, message: `Cleared ${res.count} read notification${res.count === 1 ? "" : "s"}.` };
}

/** Remove seeded demo users and everything they created (cascades). */
export async function purgeDemoDataAction(): Promise<MaintenanceResult> {
  await requireAdmin();
  const campus = await db.campus.findFirst({ where: { name: process.env.SEED_CAMPUS_NAME ?? "Rishihood University" } });
  if (!campus) return { ok: false, error: "No seeded campus found — nothing to purge." };

  const demoUsers = await db.user.findMany({
    where: { campusId: campus.id, role: "USER", email: null },
    select: { id: true },
  });
  if (demoUsers.length === 0) return { ok: false, error: "No demo users remain." };

  // Delete content authored by demo users, then the users themselves.
  const ids = demoUsers.map((u) => u.id);
  const [posts, deals, events, resources, listings, lostFound, groups] = await Promise.all([
    db.post.deleteMany({ where: { authorId: { in: ids } } }),
    db.deal.deleteMany({ where: { authorId: { in: ids } } }),
    db.event.deleteMany({ where: { organizerId: { in: ids } } }),
    db.resource.deleteMany({ where: { authorId: { in: ids } } }),
    db.marketplaceListing.deleteMany({ where: { sellerId: { in: ids } } }),
    db.lostFoundItem.deleteMany({ where: { authorId: { in: ids } } }),
    db.group.deleteMany({ where: { creatorId: { in: ids } } }),
  ]);

  await db.user.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/feed");
  revalidatePath("/admin/dev");

  const total = posts.count + deals.count + events.count + resources.count + listings.count + lostFound.count + groups.count;
  return {
    ok: true,
    message: `Purged ${demoUsers.length} demo users and ${total} pieces of content. Careful — this is permanent.`,
  };
}
