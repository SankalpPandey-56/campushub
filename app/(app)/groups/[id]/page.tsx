import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { Avatar } from "@/components/avatar";
import { GroupJoinButton } from "@/components/cards/group-extras";
import { GroupWall } from "@/components/cards/group-wall";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireMember();
  const { id } = await params;

  const group = await db.group.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      members: {
        take: 24,
        orderBy: { joinedAt: "asc" },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { members: true } },
    },
  });
  if (!group) notFound();

  const posts = await db.groupPost.findMany({
    where: { groupId: group.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  const isMember = group.members.some((m) => m.userId === viewer.id);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="card-surface px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-[21px] font-bold tracking-tight">{group.name}</h1>
            {group.subject ? <p className="mt-0.5 text-[12.5px] font-medium text-[color:var(--color-ink-faint)]">{group.subject}</p> : null}
          </div>
          <GroupJoinButton groupId={group.id} initialJoined={isMember} />
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">{group.description}</p>
        <p className="mt-3 flex items-center gap-2 text-[12px] text-[color:var(--color-ink-faint)]">
          <Avatar name={group.creator.name} image={group.creator.image} size={18} />
          Created by {group.creator.name} · {group._count.members} members
        </p>
      </header>

      {isMember ? (
        <section className="mt-4">
          <h2 className="font-display mb-2 px-1 text-[14px] font-bold">Group wall</h2>
          <GroupWall
            groupId={group.id}
            posts={posts.map((p) => ({
              id: p.id,
              content: p.content,
              createdAt: p.createdAt.toISOString(),
              author: { id: p.author.id, name: p.author.name, image: p.author.image },
            }))}
          />
        </section>
      ) : (
        <p className="mt-4 rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-paper-deep)] px-4 py-3 text-[13px] text-[color:var(--color-ink-soft)]">
          Join the group to see and post on the wall.
        </p>
      )}

      <section className="mt-6">
        <h2 className="font-display mb-2 px-1 text-[14px] font-bold">Members</h2>
        <ul className="card-surface grid grid-cols-1 gap-x-4 px-4 py-2 sm:grid-cols-2">
          {group.members.map((m) => (
            <li key={m.id} className="flex items-center gap-2.5 border-b border-[color:var(--color-line)] py-2.5 last:border-b-0">
              <Link href={`/profile/${m.user.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                <Avatar name={m.user.name} image={m.user.image} size={28} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">{m.user.name}</span>
                  {m.userId === group.creatorId ? (
                    <span className="text-[11px] text-[color:var(--color-ink-faint)]">creator</span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export const metadata = { title: "Study group" };
