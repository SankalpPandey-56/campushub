import { db } from "@/lib/db";
import { ReportCard } from "@/components/admin/report-card";

export const metadata = { title: "Admin — Reports" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = status === "DISMISSED" || status === "ACTIONED" ? status : "OPEN";

  const reports = await db.report.findMany({
    where: { status: filter },
    orderBy: { createdAt: "asc" },
    take: 60,
    include: { reporter: { select: { name: true } } },
  });

  // Resolve target previews (best-effort — content may already be deleted).
  const previews = await Promise.all(
    reports.map(async (r) => {
      if (r.targetType === "POST") {
        const t = await db.post.findUnique({ where: { id: r.targetId }, select: { content: true, title: true } });
        return t ? (t.title ?? t.content.slice(0, 160)) : null;
      }
      if (r.targetType === "DEAL") {
        const t = await db.deal.findUnique({ where: { id: r.targetId }, select: { title: true, description: true } });
        return t ? `${t.title} — ${t.description.slice(0, 120)}` : null;
      }
      if (r.targetType === "EVENT") {
        const t = await db.event.findUnique({ where: { id: r.targetId }, select: { title: true } });
        return t?.title ?? null;
      }
      if (r.targetType === "RESOURCE") {
        const t = await db.resource.findUnique({ where: { id: r.targetId }, select: { title: true } });
        return t?.title ?? null;
      }
      if (r.targetType === "LISTING") {
        const t = await db.marketplaceListing.findUnique({ where: { id: r.targetId }, select: { title: true } });
        return t?.title ?? null;
      }
      if (r.targetType === "LOST_FOUND") {
        const t = await db.lostFoundItem.findUnique({ where: { id: r.targetId }, select: { title: true } });
        return t?.title ?? null;
      }
      if (r.targetType === "USER") {
        const t = await db.user.findUnique({ where: { id: r.targetId }, select: { name: true } });
        return t ? `User: ${t.name}` : null;
      }
      return null;
    }),
  );

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-bold tracking-tight">Reports</h1>
        <p className="mt-0.5 text-[13px] text-white/50">
          Student flags on content and members. Review the content, then dismiss or act.
        </p>
      </header>

      <nav aria-label="Report status" className="mb-5 flex gap-1.5">
        {(["OPEN", "DISMISSED", "ACTIONED"] as const).map((s) => (
          <a
            key={s}
            href={`/admin/reports?status=${s}`}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
              filter === s ? "border-white/60 bg-white text-[#141a17]" : "border-white/15 text-white/60 hover:border-white/40"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </a>
        ))}
      </nav>

      {reports.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-[13.5px] text-white/50">
          No {filter.toLowerCase()} reports. Quiet campus.
        </p>
      ) : (
        <ul className="space-y-3">
          {reports.map((r, i) => (
            <li key={r.id}>
              <ReportCard
                id={r.id}
                targetType={r.targetType}
                targetId={r.targetId}
                targetPreview={previews[i]}
                reason={r.reason}
                details={r.details}
                reporter={r.reporter.name}
                when={r.createdAt.toISOString()}
                resolved={filter !== "OPEN"}
                actionTaken={r.actionTaken}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
