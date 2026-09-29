import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { relativeTime } from "@/lib/format";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

const TYPE_TONE: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  VERIFICATION: { bg: "#e3efe9", color: "#174d3f", icon: <Icon.shield size={15} /> },
  COMMENT: { bg: "#e7ecf2", color: "#3d5673", icon: <Icon.comment size={15} /> },
  LIKE: { bg: "#f7e8e1", color: "#8f4a2c", icon: <Icon.heartFilled size={15} /> },
  EVENT: { bg: "#faf0dd", color: "#8a5a13", icon: <Icon.calendar size={15} /> },
  GROUP: { bg: "#efe7f2", color: "#5d4470", icon: <Icon.users size={15} /> },
  MODERATION: { bg: "#faeeea", color: "#b3402f", icon: <Icon.shield size={15} /> },
  SYSTEM: { bg: "#ecefe4", color: "#4a5d3a", icon: <Icon.sparkles size={15} /> },
};

export default async function NotificationsPage() {
  const viewer = await requireMember();

  const [notifications, _marked] = await Promise.all([
    db.notification.findMany({ where: { userId: viewer.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.notification.updateMany({
      where: { userId: viewer.id, readAt: null },
      data: { readAt: new Date() },
    }),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display mb-4 text-[22px] font-bold tracking-tight">Notifications</h1>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Icon.bell size={20} />}
          title="You're all caught up."
          body="Comments, likes, event updates and moderation news will land here."
        />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const tone = TYPE_TONE[n.type] ?? TYPE_TONE.SYSTEM;
            const body = (
              <span className="card-surface flex items-start gap-3 px-4 py-3">
                <span
                  className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: tone.bg, color: tone.color }}
                >
                  {tone.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[13.5px] leading-snug ${n.readAt ? "text-[color:var(--color-ink-soft)]" : "font-semibold"}`}>
                    {n.title}
                  </span>
                  {n.body ? (
                    <span className="mt-0.5 block text-[12.5px] text-[color:var(--color-ink-faint)]">{n.body}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[11px] text-[color:var(--color-ink-faint)]">
                  {relativeTime(n.createdAt.toISOString())}
                </span>
              </span>
            );
            return <li key={n.id}>{n.link ? <Link href={n.link}>{body}</Link> : body}</li>;
          })}
        </ul>
      )}
    </div>
  );
}
