import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { PostCard, type PostCardData } from "@/components/feed/post-card";
import { DealCard, type DealCardData } from "@/components/cards/deal-card";

export const metadata = { title: "Saved" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const viewer = await requireMember();

  const savedPosts = await db.savedPost.findMany({
    where: { userId: viewer.id },
    orderBy: { id: "desc" },
    take: 40,
    include: {
      post: {
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: true, likes: true } },
          likes: { where: { userId: viewer.id }, select: { id: true } },
          saves: { where: { userId: viewer.id }, select: { id: true } },
        },
      },
    },
  });

  const savedDeals = await db.savedDeal.findMany({
    where: { userId: viewer.id },
    take: 40,
    include: { deal: { include: { author: { select: { id: true, name: true, image: true } } } } },
  });

  const posts: PostCardData[] = savedPosts
    .filter((s) => s.post)
    .map((s) => ({
      id: s.post.id,
      category: s.post.category,
      title: s.post.title,
      content: s.post.content,
      imageUrl: s.post.imageUrl,
      location: s.post.location,
      createdAt: s.post.createdAt.toISOString(),
      author: s.post.author,
      likeCount: s.post._count.likes,
      commentCount: s.post._count.comments,
      liked: s.post.likes.length > 0,
      saved: true,
      mine: s.post.authorId === viewer.id,
    }));

  const deals: DealCardData[] = savedDeals
    .filter((s) => s.deal)
    .map((s) => ({
      id: s.deal.id,
      title: s.deal.title,
      business: s.deal.business,
      location: s.deal.location,
      originalPrice: s.deal.originalPrice,
      discountedPrice: s.deal.discountedPrice,
      discountPercent: s.deal.discountPercent,
      category: s.deal.category,
      expiresAt: s.deal.expiresAt?.toISOString() ?? null,
      imageUrl: s.deal.imageUrl,
      author: s.deal.author,
      likeCount: s.deal.likes,
      liked: s.deal.likedBy.includes(viewer.id),
      createdAt: s.deal.createdAt.toISOString(),
    }));

  const empty = posts.length === 0 && deals.length === 0;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display mb-4 text-[22px] font-bold tracking-tight">Saved</h1>

      {empty ? (
        <EmptyState
          icon={<Icon.bookmark size={20} />}
          title="Nothing saved yet."
          body="Tap the bookmark on any post or deal to keep it here for later."
          action={<Link href="/feed" className="btn-outline">Browse the feed</Link>}
        />
      ) : (
        <div className="space-y-3">
          {deals.length > 0 ? (
            <ul className="space-y-3">
              {deals.map((d) => (
                <li key={d.id}>
                  <DealCard deal={d} saved />
                </li>
              ))}
            </ul>
          ) : null}
          {posts.length > 0 ? (
            <ul className="space-y-3">
              {posts.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
