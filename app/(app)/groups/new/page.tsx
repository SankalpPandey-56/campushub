import { requireMember } from "@/lib/auth/guard";
import { BackHeader } from "@/components/shell/back-header";
import { GroupForm } from "@/components/cards/group-form";

export const metadata = { title: "Start a group" };

export default async function NewGroupPage() {
  await requireMember();
  return (
    <div className="mx-auto max-w-xl">
      <BackHeader title="Start a study group" />
      <GroupForm />
    </div>
  );
}
