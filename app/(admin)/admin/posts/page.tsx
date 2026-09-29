import { AdminContentList } from "@/app/(admin)/admin/content";

export const metadata = { title: "Admin — Posts" };
export const dynamic = "force-dynamic";

export default function AdminPostsPage() {
  return <AdminContentList type="POST" title="Posts" emptyLabel="No posts yet." />;
}
