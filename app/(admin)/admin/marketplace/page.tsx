import { AdminContentList } from "@/app/(admin)/admin/content";

export const metadata = { title: "Admin — Marketplace" };
export const dynamic = "force-dynamic";

export default function AdminMarketplacePage() {
  return <AdminContentList type="LISTING" title="Marketplace" emptyLabel="No listings yet." />;
}
