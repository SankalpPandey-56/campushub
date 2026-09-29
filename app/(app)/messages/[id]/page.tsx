import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { MessageComposer } from "@/components/cards/message-composer";
import { relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireMember();
  const { id } = await params;

  const membership = await db.conversationMember.findFirst({
    where: { conversationId: id, userId: viewer.id },
    include: {
      conversation: {
        include: {
          members: { include: { user: { select: { id: true, name: true, image: true } } } },
          messages: { orderBy: { createdAt: "asc" }, take: 200 },
        },
      },
    },
  });
  if (!membership) notFound();

  // Opening the thread marks it read.
  await db.conversationMember.update({
    where: { id: membership.id },
    data: { lastReadAt: new Date() },
  });

  const other = membership.conversation.members.find((m) => m.userId !== viewer.id)?.user;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-xl flex-col">
      <div className="mb-3 flex items-center gap-3">
        <Link
          href="/messages"
          aria-label="Back to messages"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-card)] text-[color:var(--color-ink-soft)]"
        >
          <Icon.arrowLeft size={16} />
        </Link>
        {other ? (
          <>
            <Avatar name={other.name} image={other.image} size={32} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">{other.name}</p>
              <p className="text-[11.5px] text-[color:var(--color-ink-faint)]">CampusHub message</p>
            </div>
          </>
        ) : (
          <p className="text-[14px] font-semibold">Conversation</p>
        )}
      </div>

      <ul className="flex-1 space-y-2 pb-4">
        {membership.conversation.messages.map((m) => {
          const mine = m.senderId === viewer.id;
          return (
            <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed ${
                  mine
                    ? "rounded-br-md bg-[color:var(--color-pine)] text-white"
                    : "rounded-bl-md border border-[color:var(--color-line)] bg-[color:var(--color-card)]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-0.5 text-[10.5px] ${mine ? "text-white/70" : "text-[color:var(--color-ink-faint)]"}`}>
                  {relativeTime(m.createdAt.toISOString())}
                </p>
              </div>
            </li>
          );
        })}
        {membership.conversation.messages.length === 0 ? (
          <li className="py-10 text-center text-[13px] text-[color:var(--color-ink-faint)]">No messages yet. Say hi —</li>
        ) : null}
      </ul>

      <div className="sticky bottom-20 lg:bottom-4">
        <MessageComposer conversationId={membership.conversation.id} />
      </div>
    </div>
  );
}
