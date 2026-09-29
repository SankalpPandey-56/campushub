import Link from "next/link";
import Image from "next/image";
import { DealActions } from "@/components/cards/deal-actions";
import { Chip } from "@/components/ui/primitives";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { DEAL_CATEGORY_LABEL } from "@/lib/constants";
import { formatINR, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export type DealCardData = {
  id: string;
  title: string;
  business: string;
  location: string | null;
  originalPrice: number | null;
  discountedPrice: number | null;
  discountPercent: number | null;
  category: string;
  expiresAt: string | null;
  imageUrl: string | null;
  author: { id: string; name: string; image: string | null };
  likeCount: number;
  liked: boolean;
  createdAt: string;
};

export function DealCard({ deal, saved }: { deal: DealCardData; saved?: boolean }) {
  const expired = deal.expiresAt ? new Date(deal.expiresAt) < new Date() : false;
  const daysLeft = deal.expiresAt
    ? Math.ceil((new Date(deal.expiresAt).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <article className="card-surface overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-[color:var(--color-ink-faint)]">
            <Icon.tag size={12} /> {deal.business}
            {deal.location ? (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-0.5">
                  <Icon.pin size={11} /> {deal.location}
                </span>
              </>
            ) : null}
          </p>
          <h3 className="font-display mt-1 text-[16px] font-bold leading-snug tracking-tight">
            {deal.title}
          </h3>
        </div>
        {deal.discountPercent && deal.discountPercent > 0 ? (
          <span className="shrink-0 rounded-md bg-[color:var(--color-marigold)] px-2 py-1 text-[13px] font-bold text-white">
            −{deal.discountPercent}%
          </span>
        ) : null}
      </div>

      {deal.imageUrl ? (
        <span className="relative mt-2.5 block aspect-[16/7] w-full overflow-hidden border-y border-[color:var(--color-line)] bg-[color:var(--color-paper-deep)]">
          <Image src={deal.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 560px" className="object-cover" />
        </span>
      ) : null}

      <div className="px-4 py-3">
        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          {deal.discountedPrice != null ? (
            <span className="text-[19px] font-bold tracking-tight">{formatINR(deal.discountedPrice)}</span>
          ) : null}
          {deal.originalPrice != null ? (
            <span className={cn("text-[13.5px] text-[color:var(--color-ink-faint)]", deal.discountedPrice != null && "line-through")}>
              {formatINR(deal.originalPrice)}
            </span>
          ) : null}
          <Chip bg="#faf0dd" color="#8a5a13" className="ml-auto">
            {DEAL_CATEGORY_LABEL[deal.category] ?? deal.category}
          </Chip>
        </p>

        <p className="mt-2 flex items-center gap-2 text-[12.5px]">
          {expired ? (
            <span className="inline-flex items-center gap-1 font-medium text-[color:var(--color-danger)]">
              <Icon.clock size={12} /> Expired
            </span>
          ) : daysLeft != null ? (
            <span className="inline-flex items-center gap-1 font-medium text-[color:var(--color-ink-soft)]">
              <Icon.clock size={12} />
              {daysLeft <= 0 ? "Last day" : daysLeft === 1 ? "Ends tomorrow" : `${daysLeft} days left`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[color:var(--color-ink-faint)]">
              <Icon.check size={12} /> Ongoing
            </span>
          )}
          <span className="text-[color:var(--color-ink-faint)]">
            · shared by{" "}
            <Link href={`/profile/${deal.author.id}`} className="link-underline font-medium">
              {deal.author.name.split(" ")[0]}
            </Link>
          </span>
        </p>
      </div>

      <DealActions deal={deal} saved={saved} />
    </article>
  );
}
