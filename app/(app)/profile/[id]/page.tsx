import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { Chip, EmptyState } from "@/components/ui/primitives";
import { ProfileContactButton } from "@/components/profile/profile-contact";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireMember();
  const { id } = await params;
  if (id === viewer.id) notFound(); // own profile lives at /profile

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      course: true,
      year: true,
      verificationStatus: true,
      createdAt: true,
    },
  });
  if (!user || user.verificationStatus !== "APPROVED") notFound();

  const [posts, resources, events] = await Promise.all([
    db.post.findMany({ where: { authorId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
    db.resource.findMany({ where: { authorId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.event.findMany({ where: { organizerId: user.id }, orderBy: { startsAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start gap-4 px-1">
        <Avatar name={user.name} image={user.image} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-[22px] font-bold tracking-tight">{user.name}</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-soft)]">
            {[user.course, user.year ? `${user.year}${/^\d$/.test(user.year) ? getOrdinalSuffix(Number(user.year)) + " year" : ""}` : null]
              .filter(Boolean)
              .join(" · ") || "Student"}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <Chip bg="#e3efe9" color="#174d3f">
              <Icon.shield size={11} /> Verified
            </Chip>
            <span className="text-[12px] text-[color:var(--color-ink-faint)]">
              around since {user.createdAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <ProfileContactButton userId={user.id} userName={user.name} />
        </div>
      </div>

      {user.bio ? (
        <p className="mt-4 whitespace-pre-wrap px-1 text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">{user.bio}</p>
      ) : null}

      {posts.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-display mb-2 px-1 text-[14px] font-bold">Posts</h2>
          <ul className="card-surface divide-y divide-[color:var(--color-line)]">
            {posts.map((p) => (
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
        </section>
      ) : (
        <div className="mt-6">
          <EmptyState icon={<Icon.file size={18} />} title="No posts yet." />
        </div>
      )}

      {resources.length + events.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-display mb-2 px-1 text-[14px] font-bold">Contributions</h2>
          <ul className="card-surface divide-y divide-[color:var(--color-line)]">
            {resources.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <Icon.book size={15} className="shrink-0 text-[color:var(--color-ink-faint)]" />
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{r.title}</span>
                <span className="text-[11.5px] text-[color:var(--color-ink-faint)]">resource</span>
              </li>
            ))}
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <Icon.calendar size={15} className="shrink-0 text-[color:var(--color-ink-faint)]" />
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{e.title}</span>
                <span className="text-[11.5px] text-[color:var(--color-ink-faint)]">event</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}
