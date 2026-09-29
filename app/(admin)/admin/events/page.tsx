import { AdminContentList } from "@/app/(admin)/admin/content";

export const metadata = { title: "Admin — Events" };
export const dynamic = "force-dynamic";

export default function AdminEventsPage() {
  return <AdminContentList type="EVENT" title="Events" emptyLabel="No events posted yet." />;
}
