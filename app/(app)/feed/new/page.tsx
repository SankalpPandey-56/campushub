import { requireMember } from "@/lib/auth/guard";
import { Composer } from "@/components/feed/composer";
import { BackHeader } from "@/components/shell/back-header";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireMember();
  return (
    <div className="mx-auto max-w-xl">
      <BackHeader title="New post" />
      <Composer mode="create" />
    </div>
  );
}
