"use server";

import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import type { ActionResult } from "@/components/feed/actions";

export async function rsvpAction(eventId: string): Promise<ActionResult> {
  const viewer = await requireMember();
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true, title: true, startsAt: true },
  });
  if (!event) return { ok: false, error: "Event not found." };

  const existing = await db.eventAttendee.findUnique({
    where: { eventId_userId: { eventId, userId: viewer.id } },
  });

  if (existing) {
    await db.eventAttendee.delete({ where: { id: existing.id } });
  } else {
    await db.eventAttendee.create({ data: { eventId, userId: viewer.id } });
    if (event.organizerId !== viewer.id) {
      await db.notification.create({
        data: {
          userId: event.organizerId,
          type: "EVENT",
          title: `${viewer.name} is going to "${event.title}"`,
          body: event.startsAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          link: "/events",
        },
      });
    }
  }
  return { ok: true };
}
