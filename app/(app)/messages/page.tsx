import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { relativeTime } from "@/lib/format";

export const metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const viewer = await requireMember();

  const memberships = await db.conversationMember.findMany({
    where: { userId: viewer.id },
    include: {
      conversation: {
        include: {
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          members: { include: { user: { select: { id: true, name: true, image: true } } } },
        },
      },
    },
  });

  const conversations = memberships
    .map((m) => {
      const other = m.conversation.members.find((x) => x.userId !== viewer.id)?.user;
      const last = m.conversation.messages[0];
      return {
        id: m.conversation.id,
        other,
        last,
        unread: m.lastReadAt == null || (last ? last.createdAt > m.lastReadAt : false),
        mine: last?.senderId === viewer.id,
      };
    })
    .filter((c) => c.other) // hide empty 1:1 threads with nobody
    .sort((a, b) => (b.last?.createdAt.getTime() ?? 0) - (a.last?.createdAt.getTime() ?? 0));

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display mb-4 text-[22px] font-bold tracking-tight">Messages</h1>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<Icon.message size={20} />}
          title="No conversations yet."
          body="Message a seller from Marketplace or reply to a lost & found post — threads start here."
        />
      ) : (
        <ul className="card-surface divide-y divide-[color:var(--color-line)]">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/messages/${c.id}`} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-[color:var(--color-paper-deep)]">
                <Avatar name={c.other!.name} image={c.other!.image} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`truncate text-[14px] ${c.unread ? "font-bold" : "font-semibold"}`}>{c.other!.name}</span>
                    {c.last ? (
                      <span className="ml-auto shrink-0 text-[11px] text-[color:var(--color-ink-faint)]">
                        {relativeTime(c.last.createdAt.toISOString())}
                      </span>
                    ) : null}
                  </span>
                  <span className={`mt-0.5 block truncate text-[12.5px] ${c.unread ? "font-medium text-[color:var(--color-ink)]" : "text-[color:var(--color-ink-faint)]"}`}>
                    {c.last ? `${c.mine ? "You: " : ""}${c.last.body}` : "Say hi —"}
                  </span>
                </span>
                {c.unread ? <span className="size-2 shrink-0 rounded-[3px] bg-[color:var(--color-marigold)]" aria-label="Unread" /> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
