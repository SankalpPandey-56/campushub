"use client";

import { useState, useTransition } from "react";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/icons";
import { updateProfileAction } from "@/components/profile/profile-actions";
import { cn } from "@/lib/utils";

export function ProfileEditor({
  initialBio,
  initialName,
  initialCourse,
  initialYear,
}: {
  initialBio: string;
  initialName: string;
  initialCourse: string;
  initialYear: string;
}) {
  const [editing, setEditing] = useState(!initialBio);
  const [pending, startTransition] = useTransition();
  const [bio, setBio] = useState(initialBio);

  function save(formData: FormData) {
    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.ok) {
        setBio(String(formData.get("bio") ?? ""));
        setEditing(false);
        toast.success("Profile updated");
      } else {
        toast.error(res.error);
      }
    });
  }

  if (!editing) {
    return (
      <div className="card-surface group px-4 py-3.5">
        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[color:var(--color-ink-soft)]">{bio || "No bio yet."}</p>
        <button
          onClick={() => setEditing(true)}
          className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[color:var(--color-pine)]"
        >
          <Icon.edit size={13} /> Edit profile
        </button>
      </div>
    );
  }

  return (
    <form action={save} className="card-surface space-y-3 px-4 py-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold">Name</span>
          <input name="name" defaultValue={initialName} maxLength={80} className="input-base" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold">Course</span>
          <input name="course" defaultValue={initialCourse} maxLength={60} className="input-base" placeholder="B.Tech CSE" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold">Year</span>
          <select name="year" defaultValue={initialYear} className="input-base">
            <option value="">—</option>
            <option value="1">First</option>
            <option value="2">Second</option>
            <option value="3">Third</option>
            <option value="4">Fourth</option>
            <option value="5">Fifth</option>
            <option value="PG">Postgraduate</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold">Bio</span>
          <textarea name="bio" defaultValue={bio} rows={2} maxLength={280} className="input-base resize-y" placeholder="Two lines about you" />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={() => setEditing(false)} className="btn-outline h-8 text-[12.5px]">
          Cancel
        </button>
        <button type="submit" disabled={pending} className={cn("btn-solid h-8 text-[12.5px]", pending && "opacity-70")}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
