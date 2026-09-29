"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/icons";
import { startConversationAction } from "@/components/cards/listing-actions";

export function ProfileContactButton({ userId, userName }: { userId: string; userName: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await startConversationAction(userId, "profile");
          if (res.ok) router.push("/messages");
          else toast.error(res.error);
        })
      }
      className="btn-outline h-9 px-3.5 text-[13px]"
    >
      <Icon.message size={14} /> {pending ? "…" : "Message"}
    </button>
  );
}
