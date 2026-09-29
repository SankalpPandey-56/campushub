import { db } from "@/lib/db";
import { VerificationCard } from "@/components/admin/verification-card";

export const metadata = { title: "Admin — Verification Requests" };
export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = status === "PENDING" || status === "APPROVED" || status === "REJECTED" ? status : "PENDING";

  const requests = await db.verificationRequest.findMany({
    where: { status: filter },
    orderBy: { createdAt: "asc" },
    take: 60,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, image: true } },
      campus: { select: { name: true } },
    },
  });

  const counts = await db.$transaction([
    db.verificationRequest.count({ where: { status: "PENDING" } }),
    db.verificationRequest.count({ where: { status: "APPROVED" } }),
    db.verificationRequest.count({ where: { status: "REJECTED" } }),
  ]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-bold tracking-tight">Verification requests</h1>
        <p className="mt-0.5 text-[13px] text-white/50">
          Approve students into their campus community. They get an email either way.
        </p>
      </header>

      <nav aria-label="Status filter" className="mb-5 flex gap-1.5">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s, i) => (
          <a
            key={s}
            href={`/admin/verifications?status=${s}`}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
              filter === s
                ? "border-white/60 bg-white text-[#141a17]"
                : "border-white/15 text-white/60 hover:border-white/40"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()} <span className="opacity-60">{counts[i]}</span>
          </a>
        ))}
      </nav>

      {requests.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-[13.5px] text-white/50">
          No {filter.toLowerCase()} requests.
        </p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id}>
              <VerificationCard
                id={r.id}
                fullName={r.fullName}
                email={r.user.email ?? r.email}
                phone={r.user.phone ?? r.phone}
                course={r.course}
                year={r.year}
                campus={r.campus.name}
                collegeEmail={r.collegeEmail}
                extraInfo={r.extraInfo}
                submitted={r.createdAt.toISOString()}
                name={r.user.name}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
