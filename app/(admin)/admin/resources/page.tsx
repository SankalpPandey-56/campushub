import { AdminContentList } from "@/app/(admin)/admin/content";

export const metadata = { title: "Admin — Resources" };
export const dynamic = "force-dynamic";

export default function AdminResourcesPage() {
  return <AdminContentList type="RESOURCE" title="Resources" emptyLabel="No resources added yet." />;
}
