import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";
import { Logo } from "@/components/logo";
import { VerificationForm } from "@/components/auth/verification-form";
import { Icon } from "@/components/icons";

export const metadata = { title: "Campus verification" };

export default async function VerifyPage() {
  const viewer = await requireUser();
  if (viewer.verificationStatus === "APPROVED") redirect("/feed");
  if (viewer.role === "ADMIN") redirect("/admin");

  const campusList = await db.campus.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, city: true } });

  const existing = await db.verificationRequest.findFirst({
    where: { userId: viewer.id, status: { in: ["PENDING", "REJECTED"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-dvh w-full max-w-xl px-5 py-10">
      <Logo />
      <div className="mt-8">
        <span className="chip bg-[color:var(--color-marigold-soft)] text-[color:var(--color-marigold-deep)]">
          <Icon.shield size={12} /> Verification required
        </span>
        <h1 className="font-display mt-3 text-[26px] font-bold leading-tight tracking-tight">
          Almost there — prove you belong.
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--color-ink-soft)]">
          CampusHub communities are private to each campus. Fill this in, and the admin will review your
          request — usually within a day. You&apos;ll get an email when it&apos;s approved
          {viewer.email ? "" : " (add a Google account so we can email you)"}.
        </p>
      </div>

      <div className="card-surface mt-7 p-5 sm:p-6">
        <VerificationForm
          campuses={campusList}
          defaultName={viewer.name}
          defaultEmail={viewer.email}
          lockedEmail={Boolean(viewer.email)}
        />
        {existing?.status === "REJECTED" ? (
          <p className="mt-4 rounded-lg bg-[#faeeea] px-3.5 py-2.5 text-[13px] font-medium text-[color:var(--color-danger)]">
            Your previous request was rejected{existing.reviewNote ? ` — "${existing.reviewNote}"` : ""}. You can submit a fresh one.
          </p>
        ) : null}
      </div>
    </main>
  );
}
