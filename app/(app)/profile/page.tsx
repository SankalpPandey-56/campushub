import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { Chip, EmptyState } from "@/components/ui/primitives";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { relativeTime } from "@/lib/format";

export const metadata = { title: "Your profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const viewer = await requireMember();

  const [postCount, resourceCount, groupCount, eventsHosted, recentPosts] = await Promise.all([
    db.post.count({ where: { authorId: viewer.id } }),
    db.resource.count({ where: { authorId: viewer.id } }),
    db.groupMember.count({ where: { userId: viewer.id } }),
    db.event.count({ where: { organizerId: viewer.id } }),
    db.post.findMany({
      where: { authorId: viewer.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header block — intentionally not a card; sits on the paper background */}
      <div className="flex items-start gap-4 px-1">
        <Avatar name={viewer.name} image={viewer.image} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-[22px] font-bold tracking-tight">{viewer.name}</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-soft)]">
            {[viewer.course, viewer.year ? `${viewer.year}${viewer.year === "PG" ? "" : getOrdinalSuffix(Number(viewer.year))} year` : null]
              .filter(Boolean)
              .join(" · ") || "Student"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Chip bg="#e3efe9" color="#174d3f">
              <Icon.shield size={11} /> Verified
            </Chip>
            {viewer.bio ? null : <span className="text-[12px] text-[color:var(--color-ink-faint)]">Add a short bio ↓</span>}
          </div>
        </div>
      </div>

      {/* Counts strip */}
      <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
        {[
          ["Posts", postCount],
          ["Resources", resourceCount],
          ["Groups", groupCount],
          ["Events", eventsHosted],
        ].map(([label, n]) => (
          <div key={label as string} className="card-surface px-2 py-3">
            <dt className="order-2 mt-0.5 text-[11px] font-medium uppercase tracking-wide text-[color:var(--color-ink-faint)]">{label}</dt>
            <dd className="font-display order-1 text-[18px] font-bold leading-none">{n}</dd>
          </div>
        ))}
      </dl>

      {/* Bio editor */}
      <section className="mt-6">
        <h2 className="font-display mb-2 px-1 text-[14px] font-bold">About</h2>
        <ProfileEditor initialBio={viewer.bio ?? ""} initialName={viewer.name} initialCourse={viewer.course ?? ""} initialYear={viewer.year ?? ""} />
      </section>

      {/* Recent activity */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="font-display text-[14px] font-bold">Your recent posts</h2>
          {recentPosts.length > 0 ? null : null}
        </div>
        {recentPosts.length === 0 ? (
          <EmptyState
            icon={<Icon.file size={18} />}
            title="You haven't posted yet."
            body="Your campus can't wait forever — share something."
            action={<Link href="/feed/new" className="btn-outline">Write a post</Link>}
          />
        ) : (
          <ul className="card-surface divide-y divide-[color:var(--color-line)]">
            {recentPosts.map((p) => (
              <li key={p.id}>
                <Link href={`/feed/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[color:var(--color-paper-deep)]">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium">{p.title ?? p.content.slice(0, 70)}</span>
                    <span className="text-[11.5px] text-[color:var(--color-ink-faint)]">{relativeTime(p.createdAt.toISOString())}</span>
                  </span>
                  <Icon.chevronRight size={14} className="text-[color:var(--color-ink-faint)]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function getOrdinalSuffix(n: number): string {
  if (isNaN(n)) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}
