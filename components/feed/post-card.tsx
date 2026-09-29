"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/toaster";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { Chip } from "@/components/ui/primitives";
import { CATEGORY_TINT, POST_CATEGORY_LABEL } from "@/lib/constants";
import { relativeTime } from "@/lib/format";
import { toggleLikeAction, toggleSaveAction, deletePostAction } from "@/components/feed/actions";
import { ReportDialog } from "@/components/moderation/report-dialog";
import { cn } from "@/lib/utils";

export type PostCardData = {
  id: string;
  category: string;
  title: string | null;
  content: string;
  imageUrl: string | null;
  location: string | null;
  createdAt: string;
  author: { id: string; name: string; image: string | null };
  likeCount: number;
  commentCount: number;
  liked: boolean;
  saved: boolean;
  mine: boolean;
};

export function PostCard({ post, priority }: { post: PostCardData; priority?: boolean }) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saved, setSaved] = useState(post.saved);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, startTransition] = useTransition();

  const tint = CATEGORY_TINT[post.category] ?? { bg: "#ecefe4", text: "#4a5d3a" };

  function toggleLike() {
    // Optimistic — flips immediately, server action reconciles.
    setLiked(!liked);
    setLikeCount((c) => c + (liked ? -1 : 1));
    startTransition(async () => {
      const res = await toggleLikeAction(post.id);
      if (!res.ok) {
        setLiked(liked);
        setLikeCount(post.likeCount);
        toast.error(res.error ?? "Something went wrong");
      }
    });
  }

  function toggleSave() {
    setSaved(!saved);
    startTransition(async () => {
      const res = await toggleSaveAction(post.id);
      if (!res.ok) {
        setSaved(saved);
        toast.error(res.error ?? "Something went wrong");
      }
    });
  }

  async function share() {
    const url = `${location.origin}/feed?post=${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title ?? "CampusHub post", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }

  function remove() {
    setConfirmDelete(false);
    startTransition(async () => {
      const res = await deletePostAction(post.id);
      if (res.ok) toast.success("Post deleted");
      else toast.error(res.error ?? "Could not delete");
    });
  }

  return (
    <article className="card-surface px-4 py-3.5">
      <header className="flex items-center gap-2.5">
        <Link href={`/profile/${post.author.id}`} className="rounded-full">
          <Avatar name={post.author.name} image={post.author.image} size={34} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={`/profile/${post.author.id}`} className="truncate text-[13.5px] font-semibold hover:underline">
              {post.author.name}
            </Link>
            {post.mine ? <span className="chip bg-[color:var(--color-paper-deep)] text-[color:var(--color-ink-faint)]">you</span> : null}
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[color:var(--color-ink-faint)]">
            <span>{relativeTime(post.createdAt)}</span>
            {post.location ? (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-0.5 truncate">
                  <Icon.pin size={11} /> {post.location}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <Chip bg={tint.bg} color={tint.text}>{POST_CATEGORY_LABEL[post.category] ?? post.category}</Chip>

        <div className="relative">
          <button
            aria-label="Post options"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex size-8 items-center justify-center rounded-lg text-[color:var(--color-ink-faint)] hover:bg-[color:var(--color-paper-deep)]"
          >
            <Icon.dots size={16} />
          </button>
          {menuOpen ? (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 top-9 z-40 w-40 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-card)] p-1 shadow-[0_10px_28px_-12px_rgba(31,42,36,0.25)]">
                {post.mine ? (
                  <>
                    <Link
                      href={`/feed/${post.id}/edit`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium hover:bg-[color:var(--color-paper-deep)]"
                    >
                      <Icon.edit size={14} /> Edit
                    </Link>
                    {confirmDelete ? (
                      <button
                        onClick={remove}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-[color:var(--color-danger)] hover:bg-[#faeeea]"
                      >
                        <Icon.trash size={14} /> Really delete?
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-[color:var(--color-danger)] hover:bg-[#faeeea]"
                      >
                        <Icon.trash size={14} /> Delete
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setReportOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium hover:bg-[color:var(--color-paper-deep)]"
                  >
                    <Icon.flag size={14} /> Report
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </header>

      <Link href={`/feed/${post.id}`} className="mt-2.5 block">
        {post.title ? <h3 className="text-[15px] font-semibold leading-snug">{post.title}</h3> : null}
        <p className={cn("mt-0.5 text-[14px] leading-relaxed text-[color:var(--color-ink-soft)]", !post.title && "text-[color:var(--color-ink)]")}>
          {post.content.length > 320 ? post.content.slice(0, 320) + "…" : post.content}
        </p>
        {post.imageUrl ? (
          <span className="relative mt-2.5 block aspect-[16/9] overflow-hidden rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-paper-deep)]">
            <Image
              src={post.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 560px"
              className="object-cover"
              priority={priority}
            />
          </span>
        ) : null}
      </Link>

      <footer className="mt-2 flex items-center gap-1 border-t border-[color:var(--color-line)] pt-1.5">
        <CardAction onClick={toggleLike} active={liked} label={likeCount > 0 ? String(likeCount) : "Like"}>
          {liked ? <Icon.heartFilled size={16} /> : <Icon.heart size={16} />}
        </CardAction>
        <Link href={`/feed/${post.id}`} className={cn(actionBase, "hover:bg-[color:var(--color-paper-deep)]")}>
          <Icon.comment size={16} />
          {post.commentCount > 0 ? <span className="text-[12.5px]">{post.commentCount}</span> : <span className="text-[12.5px]">Comment</span>}
        </Link>
        <CardAction onClick={toggleSave} active={saved} label={saved ? "Saved" : "Save"}>
          {saved ? <Icon.bookmarkFilled size={16} /> : <Icon.bookmark size={16} />}
        </CardAction>
        <CardAction onClick={share} label="Share" className="ml-auto">
          <Icon.share size={16} />
        </CardAction>
      </footer>

      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="POST" targetId={post.id} />
    </article>
  );
}

const actionBase =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-[color:var(--color-ink-soft)] transition select-none";

function CardAction({
  children,
  label,
  onClick,
  active,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-pressed={active}
      className={cn(actionBase, active && "text-[color:var(--color-pine-deep)]", className)}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
