import { db } from "@/lib/db";
import { Icon, type IconName } from "@/components/icons";
import { getFlags, FLAG_LABELS } from "@/lib/flags";
import { DevFlagToggles } from "@/components/admin/dev-flag-toggles";
import { DevMaintenance } from "@/components/admin/dev-maintenance";

export const metadata = { title: "Admin — Developer" };
export const dynamic = "force-dynamic";

export default async function AdminDevPage() {
  const flags = await getFlags();
  const now = new Date();

  const [
    users,
    campuses,
    posts,
    comments,
    deals,
    events,
    resources,
    listings,
    lostFound,
    groups,
    memberships,
    groupPosts,
    conversations,
    messages,
    notifications,
    reports,
    otpTokens,
    verifications,
  ] = await Promise.all([
    db.user.count(),
    db.campus.count(),
    db.post.count(),
    db.comment.count(),
    db.deal.count(),
    db.event.count(),
    db.resource.count(),
    db.marketplaceListing.count(),
    db.lostFoundItem.count(),
    db.group.count(),
    db.groupMember.count(),
    db.groupPost.count(),
    db.conversation.count(),
    db.message.count(),
    db.notification.count(),
    db.report.count({ where: { status: "OPEN" } }),
    db.otpToken.count({ where: { createdAt: { gte: new Date(now.getTime() - 86_400_000) } } }),
    db.verificationRequest.count({ where: { status: "PENDING" } }),
  ]);

  const signupRows = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, name: true, email: true, phone: true, verificationStatus: true, role: true, createdAt: true },
  });

  // Content created per day, last 7 days — a real growth signal, no fakes.
  const week = await Promise.all(
    Array.from({ length: 7 }, async (_, i) => {
      const start = new Date(now.getTime() - (6 - i) * 86_400_000);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start.getTime() + 86_400_000);
      const [p, d, e, r, l, m] = await Promise.all([
        db.post.count({ where: { createdAt: { gte: start, lt: end } } }),
        db.deal.count({ where: { createdAt: { gte: start, lt: end } } }),
        db.event.count({ where: { createdAt: { gte: start, lt: end } } }),
        db.resource.count({ where: { createdAt: { gte: start, lt: end } } }),
        db.lostFoundItem.count({ where: { createdAt: { gte: start, lt: end } } }),
        db.marketplaceListing.count({ where: { createdAt: { gte: start, lt: end } } }),
      ]);
      return { day: start.toLocaleDateString("en-IN", { weekday: "short" }), total: p + d + e + r + l + m };
    }),
  );
  const maxDay = Math.max(...week.map((w) => w.total), 1);

  const integrations: Array<{ label: string; ok: boolean; hint: string }> = [
    { label: "Google OAuth", ok: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), hint: "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET; redirect URI is {APP_URL}/api/auth/callback/google" },
    { label: "Twilio SMS (OTP)", ok: process.env.PHONE_AUTH_PROVIDER === "twilio" && Boolean(process.env.TWILIO_ACCOUNT_SID), hint: "Console mode: OTPs print to server logs. Set PHONE_AUTH_PROVIDER=twilio + the three TWILIO_* vars for real SMS." },
    { label: "Email (SMTP)", ok: Boolean(process.env.SMTP_HOST), hint: "Without SMTP_HOST, admin alerts arrive as in-app notifications only." },
    { label: "Admin account", ok: Boolean(process.env.ADMIN_EMAIL), hint: "ADMIN_EMAIL receives the ADMIN role on Google sign-in." },
    { label: "PostgreSQL", ok: true, hint: "Connected via DATABASE_URL." },
  ];

  const stats: Array<{ label: string; value: number; icon: IconName }> = [
    { label: "Users", value: users, icon: "users" },
    { label: "Posts", value: posts, icon: "file" },
    { label: "Comments", value: comments, icon: "comment" },
    { label: "Deals", value: deals, icon: "tag" },
    { label: "Events", value: events, icon: "calendar" },
    { label: "Resources", value: resources, icon: "book" },
    { label: "Listings", value: listings, icon: "box" },
    { label: "Lost & found", value: lostFound, icon: "pin" },
    { label: "Groups", value: groups, icon: "sparkles" },
    { label: "Group members", value: memberships, icon: "users" },
    { label: "Group posts", value: groupPosts, icon: "comment" },
    { label: "Conversations", value: conversations, icon: "message" },
    { label: "Messages", value: messages, icon: "message" },
    { label: "Notifications", value: notifications, icon: "bell" },
    { label: "Campuses", value: campuses, icon: "building" },
    { label: "Open reports", value: reports, icon: "flag" },
  ];

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-bold tracking-tight">Developer settings</h1>
        <p className="mt-0.5 text-[13px] text-white/50">
          Platform internals: live data stats, feature flags, maintenance tools, integration status.
        </p>
      </header>

      {/* Platform stats */}
      <section className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <h2 className="text-[14px] font-bold">Database — every table, live</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {stats.map((s) => {
            const Ico = Icon[s.icon];
            return (
              <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-white/40">
                  <Ico size={11} /> {s.label}
                </dt>
                <dd className="mt-1 font-display text-[18px] font-bold leading-none">{s.value}</dd>
              </div>
            );
          })}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
            <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-white/40">OTP sends (24h)</dt>
            <dd className="mt-1 font-display text-[18px] font-bold leading-none">{otpTokens}</dd>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
            <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-white/40">Pending verifications</dt>
            <dd className="mt-1 font-display text-[18px] font-bold leading-none">{verifications}</dd>
          </div>
        </dl>

        {/* Content per day, last 7 days */}
        <h3 className="mt-5 text-[12px] font-bold uppercase tracking-wider text-white/40">New content, last 7 days</h3>
        <div className="mt-2 flex items-end gap-2" aria-hidden>
          {week.map((w) => (
            <div key={w.day} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-[#3f7f63]/70"
                style={{ height: `${Math.max(4, (w.total / maxDay) * 64)}px` }}
                title={`${w.total} items`}
              />
              <span className="text-[10px] text-white/40">{w.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent signups */}
      <section className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <h2 className="text-[14px] font-bold">Recent signups</h2>
        <ul className="mt-3 divide-y divide-white/10 rounded-lg border border-white/10">
          {signupRows.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-3.5 py-2.5 text-[12.5px]">
              <span className="font-medium">{u.name}</span>
              <span className="truncate text-white/40">{u.email ?? u.phone ?? "—"}</span>
              <span className={`ml-auto rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${
                u.verificationStatus === "APPROVED"
                  ? "border-[#3f7f63]/40 bg-[#3f7f63]/25 text-[#8fd0b1]"
                  : u.verificationStatus === "PENDING"
                    ? "border-[#e8c46a]/30 bg-[#e8c46a]/15 text-[#e8c46a]"
                    : "border-white/20 bg-white/10 text-white/50"
              }`}>
                {u.verificationStatus}
              </span>
              {u.role === "ADMIN" ? (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70">admin</span>
              ) : null}
              <span className="shrink-0 text-[11px] text-white/35">
                {u.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Feature flags */}
      <section className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <h2 className="text-[14px] font-bold">Feature flags</h2>
        <p className="mt-0.5 text-[12px] text-white/45">Toggle platform features live — no redeploy needed.</p>
        <DevFlagToggles flags={flags} />
      </section>

      {/* Maintenance */}
      <section className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <h2 className="text-[14px] font-bold">Maintenance</h2>
        <p className="mt-0.5 text-[12px] text-white/45">One-off cleanups. Every action is confirmed first.</p>
        <DevMaintenance />
      </section>

      {/* Integrations */}
      <section className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <h2 className="text-[14px] font-bold">Integrations</h2>
        <ul className="mt-3 space-y-2.5">
          {integrations.map((i) => (
            <li key={i.label} className="flex items-start gap-2.5">
              <span className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                i.ok ? "bg-[#3f7f63]/25 text-[#8fd0b1]" : "bg-[#e8c46a]/15 text-[#e8c46a]"
              }`}>
                {i.ok ? "✓" : "!"}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-white/80">{i.label}</span>
                <span className="block text-[11.5px] leading-relaxed text-white/40">{i.hint}</span>
              </span>
              <span className={`ml-auto shrink-0 text-[11px] font-semibold uppercase tracking-wider ${i.ok ? "text-[#8fd0b1]" : "text-[#e8c46a]"}`}>
                {i.ok ? "Active" : "Off"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
