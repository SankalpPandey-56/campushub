import { AdminContentList } from "@/app/(admin)/admin/content";

export const metadata = { title: "Admin — Deals" };
export const dynamic = "force-dynamic";

export default function AdminDealsPage() {
  return <AdminContentList type="DEAL" title="Deals" emptyLabel="No deals shared yet." />;
}
