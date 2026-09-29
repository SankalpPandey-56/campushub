import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { Composer } from "@/components/feed/composer";
import { BackHeader } from "@/components/shell/back-header";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireMember();
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    select: { id: true, authorId: true, title: true, content: true, category: true, imageUrl: true, location: true },
  });
  if (!post || post.authorId !== viewer.id) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <BackHeader title="Edit post" />
      <Composer mode="edit" post={post} />
    </div>
  );
}
