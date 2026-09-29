import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { Chip } from "@/components/ui/primitives";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { CommentThread } from "@/components/feed/comment-thread";
import { CATEGORY_TINT, POST_CATEGORY_LABEL } from "@/lib/constants";
import { relativeTime } from "@/lib/format";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireMember();
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, course: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        take: 100,
        include: { author: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { likes: true } },
      likes: { where: { userId: viewer.id }, select: { id: true } },
    },
  });
  if (!post) notFound();

  const tint = CATEGORY_TINT[post.category] ?? { bg: "#ecefe4", text: "#4a5d3a" };

  return (
    <div className="mx-auto max-w-2xl">
      <article className="card-surface px-5 py-4">
        <header className="flex items-center gap-2.5">
          <Link href={`/profile/${post.author.id}`} className="rounded-full">
            <Avatar name={post.author.name} image={post.author.image} size={38} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/profile/${post.author.id}`} className="text-[14px] font-semibold hover:underline">
              {post.author.name}
            </Link>
            <p className="text-[12px] text-[color:var(--color-ink-faint)]">
              {post.author.course ? `${post.author.course} · ` : ""}
              {relativeTime(post.createdAt.toISOString())}
            </p>
          </div>
          <Chip bg={tint.bg} color={tint.text}>
            {POST_CATEGORY_LABEL[post.category] ?? post.category}
          </Chip>
        </header>

        {post.title ? <h1 className="font-display mt-3 text-[20px] font-bold leading-snug tracking-tight">{post.title}</h1> : null}
        <p className="mt-2 whitespace-pre-wrap text-[14.5px] leading-relaxed">{post.content}</p>
        {post.location ? (
          <p className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-[color:var(--color-ink-soft)]">
            <Icon.pin size={13} /> {post.location}
          </p>
        ) : null}
        {post.imageUrl ? (
          <span className="relative mt-3 block aspect-[16/9] overflow-hidden rounded-lg border border-[color:var(--color-line)]">
            <Image src={post.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 640px" className="object-cover" priority />
          </span>
        ) : null}
        <p className="mt-3 border-t border-[color:var(--color-line)] pt-2.5 text-[12.5px] text-[color:var(--color-ink-faint)]">
          {post._count.likes} {post._count.likes === 1 ? "like" : "likes"} · {post.comments.length}{" "}
          {post.comments.length === 1 ? "comment" : "comments"}
        </p>
      </article>

      <CommentThread
        postId={post.id}
        comments={post.comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          author: { id: c.author.id, name: c.author.name, image: c.author.image },
          mine: c.authorId === viewer.id,
        }))}
      />
    </div>
  );
}
