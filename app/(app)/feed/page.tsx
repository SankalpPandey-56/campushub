import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { PostCard } from "@/components/feed/post-card";
import { EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { POST_CATEGORIES, type PostCategoryKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Home" };
export const dynamic = "force-dynamic";

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const viewer = await requireMember();
  const { tab } = await searchParams;
  const active = POST_CATEGORIES.some((c) => c.key === tab) ? (tab as PostCategoryKey) : null;

  const posts = await db.post.findMany({
    where: {
      campusId: viewer.campusId ?? undefined,
      ...(active ? { category: active } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      author: { select: { id: true, name: true, image: true, course: true } },
      _count: { select: { comments: true, likes: true } },
      likes: { where: { userId: viewer.id }, select: { id: true } },
      saves: { where: { userId: viewer.id }, select: { id: true } },
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      {/* Composer entry */}
      <Link
        href="/feed/new"
        className="card-surface mb-4 flex items-center gap-3 px-4 py-3 transition hover:border-[color:var(--color-line-strong)]"
      >
        <Avatar name={viewer.name} image={viewer.image} size={34} />
        <span className="flex-1 text-[13.5px] text-[color:var(--color-ink-faint)]">
          Share something with your campus…
        </span>
        <span className="btn-outline h-8 px-3 text-[12.5px]">Post</span>
      </Link>

      {/* Category tabs */}
      <nav aria-label="Feed categories" className="mb-4 -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max items-center gap-1.5">
          <li>
            <TabLink href="/feed" active={!active}>
              For you
            </TabLink>
          </li>
          {POST_CATEGORIES.map((c) => (
            <li key={c.key}>
              <TabLink href={`/feed?tab=${c.key}`} active={active === c.key}>
                {c.label}
              </TabLink>
            </li>
          ))}
        </ul>
      </nav>

      {posts.length === 0 ? (
        <EmptyState
          icon={<Icon.sparkles size={20} />}
          title={active ? `No ${active.toLowerCase().replace("_", " ")} posts yet` : "Nothing here yet"}
          body="Be the first to post something for your campus."
          action={
            <Link href="/feed/new" className="btn-solid">
              Create the first post
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {posts.map((post, i) => (
            <li key={post.id}>
              <PostCard
                post={{
                  id: post.id,
                  category: post.category,
                  title: post.title,
                  content: post.content,
                  imageUrl: post.imageUrl,
                  location: post.location,
                  createdAt: post.createdAt.toISOString(),
                  author: { id: post.author.id, name: post.author.name, image: post.author.image },
                  likeCount: post._count.likes,
                  commentCount: post._count.comments,
                  liked: post.likes.length > 0,
                  saved: post.saves.length > 0,
                  mine: post.authorId === viewer.id,
                }}
                priority={i === 0}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition",
        active
          ? "border-[color:var(--color-pine)] bg-[color:var(--color-pine)] text-white"
          : "border-[color:var(--color-line-strong)] bg-[color:var(--color-card)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink-faint)]",
      )}
    >
      {children}
    </Link>
  );
}
