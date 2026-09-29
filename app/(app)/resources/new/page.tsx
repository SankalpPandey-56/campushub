import { requireMember } from "@/lib/auth/guard";
import { BackHeader } from "@/components/shell/back-header";
import { ResourceForm } from "@/components/cards/resource-form";

export const metadata = { title: "Add a resource" };

export default async function NewResourcePage() {
  await requireMember();
  return (
    <div className="mx-auto max-w-xl">
      <BackHeader title="Add a resource" />
      <ResourceForm />
    </div>
  );
}
