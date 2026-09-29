import { requireMember } from "@/lib/auth/guard";
import { BackHeader } from "@/components/shell/back-header";
import { LostFoundForm } from "@/components/cards/lostfound-form";

export const metadata = { title: "Post lost or found" };

export default async function NewLostFoundPage() {
  await requireMember();
  return (
    <div className="mx-auto max-w-xl">
      <BackHeader title="Lost or found something?" />
      <LostFoundForm />
    </div>
  );
}
