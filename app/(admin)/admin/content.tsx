import Link from "next/link";
import { db } from "@/lib/db";
import { ContentRow } from "@/components/admin/content-row";
import { relativeTime } from "@/lib/format";

type ContentType = "POST" | "DEAL" | "EVENT" | "RESOURCE" | "LISTING" | "LOST_FOUND";

/** Shared server-side list for each admin content type. */
export async function AdminContentList({
  type,
  title,
  emptyLabel,
}: {
  type: ContentType;
  title: string;
  emptyLabel: string;
}) {
  const take = 60;

  let items: Array<{ id: string; label: string; meta: string; author: string; when: Date }> = [];

  if (type === "POST") {
    const rows = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: { author: { select: { name: true } } },
    });
    items = rows.map((r) => ({
      id: r.id,
      label: r.title ?? r.content.slice(0, 80),
      meta: r.content.length > 80 ? r.content.slice(0, 80) + "…" : r.content,
      author: r.author.name,
      when: r.createdAt,
    }));
  } else if (type === "DEAL") {
    const rows = await db.deal.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: { author: { select: { name: true } } },
    });
    items = rows.map((r) => ({
      id: r.id,
      label: r.title,
      meta: `${r.business}${r.discountPercent ? ` · −${r.discountPercent}%` : ""}`,
      author: r.author.name,
      when: r.createdAt,
    }));
  } else if (type === "EVENT") {
    const rows = await db.event.findMany({
      orderBy: { startsAt: "desc" },
      take,
      include: { organizer: { select: { name: true } } },
    });
    items = rows.map((r) => ({
      id: r.id,
      label: r.title,
      meta: `${r.location} · ${r.startsAt.toLocaleDateString("en-IN")}`,
      author: r.organizer.name,
      when: r.createdAt,
    }));
  } else if (type === "RESOURCE") {
    const rows = await db.resource.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: { author: { select: { name: true } } },
    });
    items = rows.map((r) => ({
      id: r.id,
      label: r.title,
      meta: r.subject,
      author: r.author.name,
      when: r.createdAt,
    }));
  } else if (type === "LISTING") {
    const rows = await db.marketplaceListing.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: { seller: { select: { name: true } } },
    });
    items = rows.map((r) => ({
      id: r.id,
      label: r.title,
      meta: `₹${r.price.toLocaleString("en-IN")} · ${r.status}`,
      author: r.seller.name,
      when: r.createdAt,
    }));
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-bold tracking-tight">{title}</h1>
        <p className="mt-0.5 text-[13px] text-white/50">
          {items.length > 0 ? `${items.length} most recent` : "Nothing here yet."}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-[13.5px] text-white/50">
          {emptyLabel}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-white/10">
          {items.map((item) => (
            <li key={item.id} className="border-b border-white/10 last:border-b-0">
              <ContentRow
                targetType={type}
                targetId={item.id}
                label={item.label}
                meta={item.meta}
                author={item.author}
                when={relativeTime(item.when.toISOString())}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-white/30">
        <Link href="/admin/reports" className="underline">Open reports</Link> surface here automatically after moderation.
      </p>
    </div>
  );
}
