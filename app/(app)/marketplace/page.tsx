import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { isFlagged } from "@/lib/flags";
import { requireMember } from "@/lib/auth/guard";
import { EmptyState, Chip } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { ListingContactButton } from "@/components/cards/listing-extras";
import { LISTING_CATEGORIES, LISTING_CONDITION_LABEL, type ListingCategoryKey } from "@/lib/constants";
import { formatINR, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Marketplace" };
export const dynamic = "force-dynamic";

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const viewer = await requireMember();
  const marketplaceOn = await isFlagged("marketplace");
  const { cat } = await searchParams;
  const active = LISTING_CATEGORIES.some((c) => c.key === cat) ? (cat as ListingCategoryKey) : null;

  const listings = await db.marketplaceListing.findMany({
    where: { campusId: viewer.campusId ?? undefined, ...(active ? { category: active } : {}) },
    // When the flag is off, only listings from the last 30 days stay visible.
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { seller: { select: { id: true, name: true, image: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight">Marketplace</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-soft)]">Buy, sell, pass it on — within your campus only.</p>
        </div>
        {marketplaceOn ? (
          <Link href="/marketplace/new" className="btn-solid h-9 shrink-0 px-3.5 text-[13px]">
            <Icon.plus size={15} /> List an item
          </Link>
        ) : null}
      </div>

      {!marketplaceOn ? (
        <p className="mb-4 rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-paper-deep)] px-4 py-3 text-[13px] text-[color:var(--color-ink-soft)]">
          New listings are paused by the admin. Existing listings stay visible.
        </p>
      ) : null}

      <nav aria-label="Listing categories" className="mb-4 -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max items-center gap-1.5">
          <li><CatLink href="/marketplace" active={!active}>All</CatLink></li>
          {LISTING_CATEGORIES.map((c) => (
            <li key={c.key}><CatLink href={`/marketplace?cat=${c.key}`} active={active === c.key}>{c.label}</CatLink></li>
          ))}
        </ul>
      </nav>

      {listings.length === 0 ? (
        <EmptyState
          icon={<Icon.box size={20} />}
          title="No listings yet."
          body="That calculator you won't need after this sem? Someone in the first year does."
          action={<Link href="/marketplace/new" className="btn-solid">List the first item</Link>}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {listings.map((l) => (
            <li key={l.id} className={cn("card-surface flex flex-col overflow-hidden", l.status === "SOLD" && "opacity-70")}>
              {l.imageUrl ? (
                <span className="relative block aspect-[16/10] w-full overflow-hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-paper-deep)]">
                  <Image src={l.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover" />
                </span>
              ) : (
                <span className="flex aspect-[16/10] w-full items-center justify-center border-b border-[color:var(--color-line)] bg-[color:var(--color-paper-deep)] text-[color:var(--color-ink-faint)]">
                  <Icon.image size={22} />
                </span>
              )}
              <div className="flex flex-1 flex-col px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[14.5px] font-semibold leading-snug">{l.title}</h3>
                  <p className="shrink-0 text-[15px] font-bold tracking-tight">{formatINR(l.price)}</p>
                </div>
                <p className="mt-0.5 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-[color:var(--color-ink-soft)]">{l.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Chip bg="#efe7f2" color="#5d4470">{LISTING_CATEGORIES.find((c) => c.key === l.category)?.label ?? l.category}</Chip>
                  <Chip className="border border-[color:var(--color-line)] bg-[color:var(--color-card)] text-[color:var(--color-ink-soft)]">
                    {LISTING_CONDITION_LABEL[l.condition] ?? l.condition}
                  </Chip>
                  {l.status === "SOLD" ? <Chip className="bg-[#faeeea] text-[color:var(--color-danger)]">Sold</Chip> : null}
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-[color:var(--color-line)] pt-2.5 text-[12px] text-[color:var(--color-ink-faint)]">
                  <Avatar name={l.seller.name} image={l.seller.image} size={18} />
                  <span>{l.seller.name.split(" ")[0]}</span>
                  <span aria-hidden>·</span>
                  <span>{relativeTime(l.createdAt.toISOString())}</span>
                  <span className="ml-auto">
                    <ListingContactButton listingId={l.id} sellerId={l.sellerId} sellerName={l.seller.name} mine={l.sellerId === viewer.id} sold={l.status === "SOLD"} />
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
