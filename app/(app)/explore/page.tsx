import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { Chip, EmptyState } from "@/components/ui/primitives";
import { POST_CATEGORY_LABEL, DEAL_CATEGORY_LABEL, EVENT_CATEGORY_LABEL } from "@/lib/constants";
import { formatINR, formatEventDate, relativeTime } from "@/lib/format";

export const metadata = { title: "Search" };
export const dynamic = "force-dynamic";

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const viewer = await requireMember();
  const { q } = await searchParams;
  const query = q?.trim();

  if (!query) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-[22px] font-bold tracking-tight">Explore</h1>
        <p className="mt-1 text-[13.5px] text-[color:var(--color-ink-soft)]">
          Search posts, deals, events, resources, groups and marketplace listings across your campus.
        </p>
        <div className="mt-8">
          <EmptyState
            icon={<Icon.search size={20} />}
            title="What are you looking for?"
            body="Try “graph notes”, “café discount”, “hackathon” — or a friend's name."
          />
        </div>
      </div>
    );
  }

  const like = { contains: query, mode: "insensitive" as const };
  const campusId = viewer.campusId ?? undefined;

  const [posts, deals, events, resources, groups, listings] = await Promise.all([
    db.post.findMany({
      where: { campusId, OR: [{ title: like }, { content: like }] },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, image: true } } },
    }),
    db.deal.findMany({
      where: { campusId, OR: [{ title: like }, { business: like }, { description: like }] },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    db.event.findMany({
      where: { campusId, OR: [{ title: like }, { description: like }, { location: like }] },
      take: 6,
      orderBy: { startsAt: "asc" },
    }),
    db.resource.findMany({
      where: { campusId, OR: [{ title: like }, { subject: like }, { description: like }] },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    db.group.findMany({
      where: { campusId, OR: [{ name: like }, { description: like }, { subject: like }] },
      take: 6,
      include: { _count: { select: { members: true } } },
    }),
    db.marketplaceListing.findMany({
      where: { campusId, OR: [{ title: like }, { description: like }] },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const total = posts.length + deals.length + events.length + resources.length + groups.length + listings.length;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[20px] font-bold tracking-tight">
        Results for &ldquo;{query}&rdquo;
      </h1>
      <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-faint)]">
        {total > 0 ? `${total} ${total === 1 ? "match" : "matches"} on your campus` : "Nothing found"}
      </p>

      <div className="mt-5 space-y-7">
        <ResultSection title="Posts" icon={<Icon.file size={14} />} items={posts.map((p) => ({
          id: p.id,
          href: `/feed/${p.id}`,
          title: p.title ?? p.content.slice(0, 60),
          meta: `${p.author.name} · ${relativeTime(p.createdAt.toISOString())}`,
          tag: POST_CATEGORY_LABEL[p.category],
        }))} />

        <ResultSection title="Deals" icon={<Icon.tag size={14} />} items={deals.map((d) => ({
          id: d.id,
          href: "/deals",
          title: d.title,
          meta: `${d.business}${d.discountedPrice != null ? ` · ${formatINR(d.discountedPrice)}` : ""}`,
          tag: DEAL_CATEGORY_LABEL[d.category],
        }))} />

        <ResultSection title="Events" icon={<Icon.calendar size={14} />} items={events.map((e) => ({
          id: e.id,
          href: "/events",
          title: e.title,
          meta: formatEventDate(e.startsAt),
          tag: EVENT_CATEGORY_LABEL[e.category],
        }))} />

        <ResultSection title="Resources" icon={<Icon.book size={14} />} items={resources.map((r) => ({
          id: r.id,
          href: "/resources",
          title: r.title,
          meta: r.subject,
          tag: null,
        }))} />

        <ResultSection title="Groups" icon={<Icon.users size={14} />} items={groups.map((g) => ({
          id: g.id,
          href: `/groups/${g.id}`,
          title: g.name,
          meta: `${g._count.members} members`,
          tag: g.subject,
        }))} />

        <ResultSection title="Marketplace" icon={<Icon.box size={14} />} items={listings.map((l) => ({
          id: l.id,
          href: "/marketplace",
          title: l.title,
          meta: formatINR(l.price),
          tag: null,
        }))} />

        {total === 0 ? (
          <EmptyState
            icon={<Icon.search size={20} />}
            title={`Nothing for “${query}”`}
            body="Check the spelling, or try a broader word."
          />
        ) : null}
      </div>
    </div>
  );
}

function ResultSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ id: string; href: string; title: string; meta: string; tag: string | null }>;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="font-display mb-2 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-[color:var(--color-ink-faint)]">
        {icon} {title}
      </h2>
      <ul className="card-surface divide-y divide-[color:var(--color-line)]">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={item.href} className="flex items-center gap-3 px-4 py-3 transition hover:bg-[color:var(--color-paper-deep)]">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold">{item.title}</span>
                <span className="block truncate text-[12px] text-[color:var(--color-ink-faint)]">{item.meta}</span>
              </span>
              {item.tag ? <Chip className="bg-[color:var(--color-paper-deep)] text-[color:var(--color-ink-soft)]">{item.tag}</Chip> : null}
              <Icon.chevronRight size={14} className="shrink-0 text-[color:var(--color-ink-faint)]" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
