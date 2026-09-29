"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { sendVerificationDecisionEmail } from "@/lib/email";

async function admin() {
  return requireAdmin();
}

// ── Verifications ────────────────────────────────────────────────────────────

export async function decideVerificationAction(requestId: string, decision: "APPROVED" | "REJECTED", note?: string) {
  const a = await admin();
  const request = await db.verificationRequest.findUnique({
    where: { id: requestId },
    include: { user: { select: { id: true, email: true, name: true } }, campus: { select: { name: true } } },
  });
  if (!request) return { ok: false as const, error: "Request not found." };

  await db.$transaction([
    db.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: decision,
        reviewedBy: a.id,
        reviewedAt: new Date(),
        reviewNote: note ?? null,
      },
    }),
    db.user.update({
      where: { id: request.userId },
      data: { verificationStatus: decision },
    }),
    db.notification.create({
      data: {
        userId: request.userId,
        type: "VERIFICATION",
        title: decision === "APPROVED" ? "You're verified — welcome to CampusHub!" : "Verification update",
        body:
          decision === "APPROVED"
            ? `Your ${request.campus.name} verification was approved. Dive in.`
            : (note ?? "Your request wasn't approved this time."),
        link: decision === "APPROVED" ? "/feed" : "/verify",
      },
    }),
  ]);

  await sendVerificationDecisionEmail({
    to: request.user.email,
    name: request.user.name,
    approved: decision === "APPROVED",
    note,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  });

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
  return { ok: true as const };
}

// ── Campuses ─────────────────────────────────────────────────────────────────

export async function addCampusAction(formData: FormData) {
  await admin();
  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  if (name.length < 3) return { ok: false as const, error: "Campus name is too short." };
  try {
    await db.campus.create({ data: { name, city: city || null } });
  } catch {
    return { ok: false as const, error: "A campus with that name already exists." };
  }
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function suspendUserAction(userId: string, reason: string) {
  const a = await admin();
  if (userId === a.id) return { ok: false as const, error: "You can't suspend yourself." };
  await db.user.update({
    where: { id: userId },
    data: { verificationStatus: "SUSPENDED", suspendedAt: new Date(), suspensionReason: reason || null },
  });
  await db.notification.create({
    data: { userId, type: "MODERATION", title: "Your CampusHub access was suspended", body: reason || "Contact the admin for details." },
  });
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function restoreUserAction(userId: string) {
  await admin();
  await db.user.update({
    where: { id: userId },
    data: { verificationStatus: "APPROVED", suspendedAt: null, suspensionReason: null },
  });
  await db.notification.create({
    data: { userId, type: "MODERATION", title: "Your CampusHub access was restored", link: "/feed" },
  });
  revalidatePath("/admin/users");
  return { ok: true as const };
}

// ── Content moderation ───────────────────────────────────────────────────────

export async function deleteContentAction(targetType: string, targetId: string) {
  await admin();
  switch (targetType) {
    case "POST":
      await db.post.delete({ where: { id: targetId } });
      break;
    case "DEAL":
      await db.deal.delete({ where: { id: targetId } });
      break;
    case "EVENT":
      await db.event.delete({ where: { id: targetId } });
      break;
    case "RESOURCE":
      await db.resource.delete({ where: { id: targetId } });
      break;
    case "LISTING":
      await db.marketplaceListing.delete({ where: { id: targetId } });
      break;
    case "LOST_FOUND":
      await db.lostFoundItem.delete({ where: { id: targetId } });
      break;
    default:
      return { ok: false as const, error: "Unknown content type." };
  }
  return { ok: true as const };
}

// ── Reports ──────────────────────────────────────────────────────────────────

export async function resolveReportAction(
  reportId: string,
  outcome: "DISMISSED" | "ACTIONED",
  actionNote?: string,
) {
  const a = await admin();
  const report = await db.report.findUnique({ where: { id: reportId } });
  if (!report) return { ok: false as const, error: "Report not found." };

  if (outcome === "ACTIONED" && actionNote !== "user_only") {
    // Remove the reported content (except USER targets, handled below).
    if (report.targetType !== "USER") {
      const res = await deleteContentAction(report.targetType, report.targetId);
      if (!res.ok) return res;
    }
  }
  if (outcome === "ACTIONED" && actionNote === "user_only" && report.targetType === "USER") {
    await db.user.update({
      where: { id: report.targetId },
      data: { verificationStatus: "SUSPENDED", suspendedAt: new Date(), suspensionReason: "Multiple valid reports" },
    });
  }

  await db.report.update({
    where: { id: reportId },
    data: {
      status: outcome,
      actionTaken: outcome === "DISMISSED" ? "No violation found" : (actionNote ?? "Content removed"),
      actionedBy: a.id,
    },
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return { ok: true as const };
}
