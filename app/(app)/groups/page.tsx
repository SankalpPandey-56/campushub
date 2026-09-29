import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { GroupJoinButton } from "@/components/cards/group-extras";
import { relativeTime } from "@/lib/format";

export const metadata = { title: "Study groups" };
export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const viewer = await requireMember();

  const groups = await db.group.findMany({
    where: { campusId: viewer.campusId ?? undefined },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { members: true, posts: true } },
      members: { where: { userId: viewer.id }, select: { id: true } },
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight">Study groups</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-soft)]">
            Find your people — DSA grind, placement prep, or that one elective nobody understands.
          </p>
        </div>
        <Link href="/groups/new" className="btn-solid h-9 shrink-0 px-3.5 text-[13px]">
          <Icon.plus size={15} /> Start a group
        </Link>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Icon.users size={20} />}
          title="No groups yet."
          body="Be the reason someone finally understands OS. Start the first group."
          action={<Link href="/groups/new" className="btn-solid">Start the first group</Link>}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <li key={g.id} className="card-surface flex flex-col px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/groups/${g.id}`} className="min-w-0">
                  <h3 className="font-display truncate text-[15.5px] font-bold tracking-tight hover:underline">{g.name}</h3>
                  {g.subject ? (
                    <p className="mt-0.5 text-[12px] font-medium text-[color:var(--color-ink-faint)]">{g.subject}</p>
                  ) : null}
                </Link>
                <GroupJoinButton groupId={g.id} initialJoined={g.members.length > 0} />
              </div>
              <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">
                {g.description}
              </p>
              <div className="mt-3 flex items-center gap-2 border-t border-[color:var(--color-line)] pt-2.5 text-[12px] text-[color:var(--color-ink-faint)]">
                <Avatar name={g.creator.name} image={g.creator.image} size={18} />
                <span>{g.creator.name.split(" ")[0]}</span>
                <span aria-hidden>·</span>
                <span>{g._count.members} members</span>
                <span className="ml-auto">{relativeTime(g.createdAt.toISOString())}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
