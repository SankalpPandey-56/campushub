import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { DealCard, type DealCardData } from "@/components/cards/deal-card";
import { EmptyState } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { DEAL_CATEGORIES, type DealCategoryKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Deals" };
export const dynamic = "force-dynamic";

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const viewer = await requireMember();
  const { cat } = await searchParams;
  const active = DEAL_CATEGORIES.some((c) => c.key === cat) ? (cat as DealCategoryKey) : null;

  const deals = await db.deal.findMany({
    where: { campusId: viewer.campusId ?? undefined, ...(active ? { category: active } : {}) },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  const savedSet = new Set(
    (await db.savedDeal.findMany({ where: { userId: viewer.id }, select: { dealId: true } })).map((s) => s.dealId),
  );

  const cards: DealCardData[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    business: d.business,
    location: d.location,
    originalPrice: d.originalPrice,
    discountedPrice: d.discountedPrice,
    discountPercent: d.discountPercent,
    category: d.category,
    expiresAt: d.expiresAt?.toISOString() ?? null,
    imageUrl: d.imageUrl,
    author: d.author,
    likeCount: d.likes,
    liked: d.likedBy.includes(viewer.id),
    createdAt: d.createdAt.toISOString(),
  }));

  const live = cards.filter((c) => !c.expiresAt || new Date(c.expiresAt) >= new Date());
  const expired = cards.filter((c) => c.expiresAt && new Date(c.expiresAt) < new Date());

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight">Deals nearby</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-soft)]">
            Offers students actually use — cafés, salons, shops around campus.
          </p>
        </div>
        <Link href="/deals/new" className="btn-solid h-9 shrink-0 px-3.5 text-[13px]">
          <Icon.plus size={15} /> Share a deal
        </Link>
      </div>

      <nav aria-label="Deal categories" className="mb-4 -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max items-center gap-1.5">
          <li>
            <CatLink href="/deals" active={!active}>All</CatLink>
          </li>
          {DEAL_CATEGORIES.map((c) => (
            <li key={c.key}>
              <CatLink href={`/deals?cat=${c.key}`} active={active === c.key}>{c.label}</CatLink>
            </li>
          ))}
        </ul>
      </nav>

      {cards.length === 0 ? (
        <EmptyState
          icon={<Icon.tag size={20} />}
          title="No deals here yet."
          body="Spotted a student offer around campus? Be the first to share it."
          action={<Link href="/deals/new" className="btn-solid">Share the first deal</Link>}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {live.map((deal) => (
              <li key={deal.id}>
                <DealCard deal={deal} saved={savedSet.has(deal.id)} />
              </li>
            ))}
          </ul>
          {expired.length > 0 ? (
            <>
              <h2 className="font-display mb-2 mt-8 text-[14px] font-bold text-[color:var(--color-ink-faint)]">
                Expired
              </h2>
              <ul className="space-y-3 opacity-70">
                {expired.map((deal) => (
                  <li key={deal.id}>
                    <DealCard deal={deal} saved={savedSet.has(deal.id)} />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function CatLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition",
        active
          ? "border-[color:var(--color-pine)] bg-[color:var(--color-pine)] text-white"
          : "border-[color:var(--color-line-strong)] bg-[color:var(--color-card)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink-faint)]",
      )}
    >
      {children}
    </Link>
  );
}
