import Link from "next/link";
import { db } from "@/lib/db";
import { Icon, type IconName } from "@/components/icons";

export const metadata = { title: "Admin — Overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86_400_000);
  const weekAhead = new Date(now.getTime() + 7 * 86_400_000);

  const [
    pendingVerifications,
    approvedUsers,
    postsToday,
    activeDeals,
    upcomingEvents,
    openReports,
  ] = await Promise.all([
    db.verificationRequest.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { verificationStatus: "APPROVED" } }),
    db.post.count({ where: { createdAt: { gte: dayAgo } } }),
    db.deal.count({ where: { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
    db.event.count({ where: { startsAt: { gte: now, lte: weekAhead } } }),
    db.report.count({ where: { status: "OPEN" } }),
  ]);

  // "Active members" = posted or commented in the last 7 days (real activity only).
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const activeUsers = await db.user.count({
    where: {
      OR: [
        { posts: { some: { createdAt: { gte: weekAgo } } } },
        { comments: { some: { createdAt: { gte: weekAgo } } } },
      ],
    },
  });

  const metrics: Array<{ label: string; value: number; href: string; icon: IconName; tone: string }> = [
    { label: "Pending verifications", value: pendingVerifications, href: "/admin/verifications", icon: "shield", tone: pendingVerifications > 0 ? "text-[#e8c46a]" : "text-white/80" },
    { label: "Approved members", value: approvedUsers, href: "/admin/users", icon: "users", tone: "text-white/80" },
    { label: "Active this week", value: activeUsers, href: "/admin/users", icon: "sparkles", tone: "text-white/80" },
    { label: "Posts (24h)", value: postsToday, href: "/admin/posts", icon: "file", tone: "text-white/80" },
    { label: "Active deals", value: activeDeals, href: "/admin/deals", icon: "tag", tone: "text-white/80" },
    { label: "Events this week", value: upcomingEvents, href: "/admin/events", icon: "calendar", tone: "text-white/80" },
    { label: "Open reports", value: openReports, href: "/admin/reports", icon: "flag", tone: openReports > 0 ? "text-[#e89a8a]" : "text-white/80" },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-bold tracking-tight">Overview</h1>
        <p className="mt-0.5 text-[13px] text-white/50">What needs your attention on CampusHub right now.</p>
      </header>

      {pendingVerifications > 0 || openReports > 0 ? (
        <div className="mb-6 rounded-xl border border-[#e8c46a]/25 bg-[#e8c46a]/10 px-4 py-3.5">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold text-[#e8c46a]">
            <Icon.bell size={15} />
            {pendingVerifications > 0 ? `${pendingVerifications} verification request${pendingVerifications === 1 ? "" : "s"} waiting` : ""}
            {pendingVerifications > 0 && openReports > 0 ? " · " : ""}
            {openReports > 0 ? `${openReports} open report${openReports === 1 ? "" : "s"}` : ""}
          </p>
          <p className="mt-0.5 text-[12.5px] text-white/55">
            Head to{" "}
            <Link href="/admin/verifications" className="underline">Verification Requests</Link>
            {openReports > 0 ? (
              <>
                {" or "}
                <Link href="/admin/reports" className="underline">Reports</Link>
              </>
            ) : null}{" "}
            to act on them.
          </p>
        </div>
      ) : null}

      {/* Metrics — a plain grid with varied emphasis, not decorative cards */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group bg-[#171d1a] px-5 py-5 transition hover:bg-[#1b2320]"
          >
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
              {(() => {
                const Ico = Icon[m.icon];
                return <Ico size={13} />;
              })()}
              {m.label}
            </p>
            <p className={`font-display mt-2 text-[28px] font-bold leading-none tracking-tight ${m.tone}`}>
              {m.value}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-[12px] text-white/35">
        Active-member tracking starts once members begin engaging — counts are computed from real
        activity (posts and comments), never sampled or faked.
      </p>
    </div>
  );
}
