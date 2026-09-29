import { requireMember } from "@/lib/auth/guard";
import { BackHeader } from "@/components/shell/back-header";
import { EventForm } from "@/components/cards/event-form";

export const metadata = { title: "Post an event" };

export default async function NewEventPage() {
  await requireMember();
  return (
    <div className="mx-auto max-w-xl">
      <BackHeader title="Post an event" />
      <EventForm />
    </div>
  );
}
