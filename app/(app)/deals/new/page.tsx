import { requireMember } from "@/lib/auth/guard";
import { BackHeader } from "@/components/shell/back-header";
import { DealForm } from "@/components/cards/deal-form";

export const metadata = { title: "Share a deal" };

export default async function NewDealPage() {
  await requireMember();
  return (
    <div className="mx-auto max-w-xl">
      <BackHeader title="Share a deal" />
      <DealForm mode="create" />
    </div>
  );
}
