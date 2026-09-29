import "server-only";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { readSession, type SessionUser } from "@/lib/auth/session";

export type Viewer = SessionUser & {
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  campusId: string | null;
  course: string | null;
  year: string | null;
  bio: string | null;
};

/** Full viewer for server components. Null when signed out. */
export async function getViewer(): Promise<Viewer | null> {
  const session = await readSession();
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      verificationStatus: true,
      campusId: true,
      course: true,
      year: true,
      bio: true,
    },
  });
  if (!user) return null;
  return user;
}

/** Require a signed-in user, else redirect to login. */
export async function requireUser(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return viewer;
}

/**
 * Require an approved, non-suspended member.
 * Suspended users see the gate page; pending/rejected users are routed
 * to the verification flow.
 */
export async function requireMember(): Promise<Viewer> {
  const viewer = await requireUser();
  if (viewer.role === "ADMIN") return viewer;
  if (viewer.verificationStatus === "SUSPENDED") redirect("/suspended");
  if (viewer.verificationStatus !== "APPROVED") redirect("/verify");
  return viewer;
}

/** Require the admin role (server-side; admins bypass campus verification). */
export async function requireAdmin() {
  const viewer = await requireUser();
  if (viewer.role !== "ADMIN") notFound();
  return viewer;
}
