import { requireMember } from "@/lib/auth/guard";
import { BackHeader } from "@/components/shell/back-header";
import { ListingForm } from "@/components/cards/listing-form";

export const metadata = { title: "List an item" };

export default async function NewListingPage() {
  await requireMember();
  return (
    <div className="mx-auto max-w-xl">
      <BackHeader title="List an item" />
      <ListingForm />
    </div>
  );
}
