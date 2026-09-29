import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { EmptyState, Chip } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { LostFoundContactButton } from "@/components/cards/lostfound-extras";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Lost & Found" };
export const dynamic = "force-dynamic";

export default async function LostFoundPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const viewer = await requireMember();
  const { type } = await searchParams;
  const filter = type === "LOST" || type === "FOUND" ? type : null;

  const items = await db.lostFoundItem.findMany({
    where: { campusId: viewer.campusId ?? undefined, ...(filter ? { type: filter } : {}) },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight">Lost &amp; Found</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-soft)]">
            The whole campus is looking. Post it here, not in six group chats.
          </p>
        </div>
        <Link href="/lost-found/new" className="btn-solid h-9 shrink-0 px-3.5 text-[13px]">
          <Icon.plus size={15} /> Post
        </Link>
      </div>

      <nav aria-label="Item type" className="mb-4 flex items-center gap-1.5">
        <TabLink href="/lost-found" active={!filter}>Everything</TabLink>
        <TabLink href="/lost-found?type=LOST" active={filter === "LOST"}>Lost</TabLink>
        <TabLink href="/lost-found?type=FOUND" active={filter === "FOUND"}>Found</TabLink>
      </nav>

      {items.length === 0 ? (
        <EmptyState
          icon={<Icon.pin size={20} />}
          title={filter === "LOST" ? "No lost items reported." : filter === "FOUND" ? "Nothing found yet." : "Nothing here yet."}
          body="Lost something on campus? Post it — someone has probably seen it."
          action={<Link href="/lost-found/new" className="btn-solid">Post an item</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const lost = item.type === "LOST";
            return (
              <li key={item.id} className={cn("card-surface flex gap-3.5 px-4 py-3.5", item.status === "RESOLVED" && "opacity-65")}>
                {item.imageUrl ? (
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-[color:var(--color-line)]">
                    <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                ) : (
                  <span
                    className={`flex size-20 shrink-0 items-center justify-center rounded-lg border ${
                      lost
                        ? "border-[#ecc8c0] bg-[#faeeea] text-[color:var(--color-danger)]"
                        : "border-[#bfdccf] bg-[#eaf4ef] text-[color:var(--color-pine-deep)]"
                    }`}
                  >
                    {lost ? <Icon.search size={20} /> : <Icon.sparkles size={20} />}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Chip bg={lost ? "#faeeea" : "#eaf4ef"} color={lost ? "#b3402f" : "#174d3f"}>
                      {lost ? "Lost" : "Found"}
                    </Chip>
                    <h3 className="text-[14.5px] font-semibold leading-snug">{item.title}</h3>
                    {item.status === "RESOLVED" ? <Chip className="bg-[color:var(--color-paper-deep)] text-[color:var(--color-ink-faint)]">Resolved</Chip> : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">{item.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[color:var(--color-ink-faint)]">
                    {item.location ? (
                      <span className="inline-flex items-center gap-0.5">
                        <Icon.pin size={11} /> {item.location}
                      </span>
                    ) : null}
                    {item.lastSeenAt ? <span>{item.lastSeenAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span> : null}
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar name={item.author.name} image={item.author.image} size={16} />
                      {item.author.name.split(" ")[0]}
                    </span>
                    <span className="ml-auto">
                      <LostFoundContactButton itemId={item.id} authorId={item.authorId} authorName={item.author.name} mine={item.authorId === viewer.id} />
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
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
