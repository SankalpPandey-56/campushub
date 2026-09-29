"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/icons";
import { sendMessageAction } from "@/components/cards/message-actions";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;
    formRef.current?.reset();
    startTransition(async () => {
      const res = await sendMessageAction(conversationId, formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form ref={formRef} action={submit} className="card-surface flex items-end gap-2 p-2">
      <textarea
        name="body"
        rows={1}
        required
        maxLength={2000}
        placeholder="Write a message…"
        className="input-base max-h-32 flex-1 resize-none border-0 focus:border-0"
        style={{ border: "none" }}
      />
      <button type="submit" disabled={pending} className="btn-solid h-9 w-9 !px-0" aria-label="Send message">
        <Icon.arrowRight size={16} />
      </button>
    </form>
  );
}
