import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { EmptyState, Chip } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { EventRsvpButton } from "@/components/cards/event-rsvp";
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABEL, type EventCategoryKey } from "@/lib/constants";
import { formatEventDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const viewer = await requireMember();
  const { cat } = await searchParams;
  const active = EVENT_CATEGORIES.some((c) => c.key === cat) ? (cat as EventCategoryKey) : null;

  const events = await db.event.findMany({
    where: { campusId: viewer.campusId ?? undefined, ...(active ? { category: active } : {}) },
    orderBy: { startsAt: "asc" },
    take: 80,
    include: {
      organizer: { select: { id: true, name: true, image: true } },
      attendees: { where: { userId: viewer.id }, select: { id: true } },
      _count: { select: { attendees: true } },
    },
  });

  const now = new Date();
  const upcoming = events.filter((e) => e.startsAt >= now);
  const past = events.filter((e) => e.startsAt < now).reverse();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight">Events</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-soft)]">Fests, workshops and meetups on your campus.</p>
        </div>
        <Link href="/events/new" className="btn-solid h-9 shrink-0 px-3.5 text-[13px]">
          <Icon.plus size={15} /> Post event
        </Link>
      </div>

      <nav aria-label="Event categories" className="mb-4 -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max items-center gap-1.5">
          <li><CatLink href="/events" active={!active}>All</CatLink></li>
          {EVENT_CATEGORIES.map((c) => (
            <li key={c.key}><CatLink href={`/events?cat=${c.key}`} active={active === c.key}>{c.label}</CatLink></li>
          ))}
        </ul>
      </nav>

      {events.length === 0 ? (
        <EmptyState
          icon={<Icon.calendar size={20} />}
          title="No upcoming events."
          body="Know something happening on campus? Put it on the calendar."
          action={<Link href="/events/new" className="btn-solid">Post the first event</Link>}
        />
      ) : (
        <>
          {upcoming.length > 0 ? (
            <ul className="space-y-3">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <EventItem
                    id={e.id}
                    title={e.title}
                    description={e.description}
                    startsAt={e.startsAt.toISOString()}
                    location={e.location}
                    category={e.category}
                    imageUrl={e.imageUrl}
                    regLink={e.regLink}
                    organizer={e.organizer}
                    attendeeCount={e._count.attendees}
                    rsvp={e.attendees.length > 0}
                    past={false}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Icon.calendar size={20} />} title="Nothing on the calendar." body="Check back soon — or post the next big thing." />
          )}

          {past.length > 0 ? (
            <>
              <h2 className="font-display mb-2 mt-8 text-[14px] font-bold text-[color:var(--color-ink-faint)]">Past events</h2>
              <ul className="space-y-3 opacity-75">
                {past.slice(0, 6).map((e) => (
                  <li key={e.id}>
                    <EventItem
                      id={e.id}
                      title={e.title}
                      description={e.description}
                      startsAt={e.startsAt.toISOString()}
                      location={e.location}
                      category={e.category}
                      imageUrl={e.imageUrl}
                      regLink={e.regLink}
                      organizer={e.organizer}
                      attendeeCount={e._count.attendees}
                      rsvp={e.attendees.length > 0}
                      past
                    />
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

type EventItemProps = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  category: string;
  imageUrl: string | null;
  regLink: string | null;
  organizer: { id: string; name: string; image: string | null };
  attendeeCount: number;
  rsvp: boolean;
  past: boolean;
};

function EventItem(p: EventItemProps) {
  const date = new Date(p.startsAt);
  const day = date.toLocaleDateString("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" });
  const month = date.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" });

  return (
    <article className={cn("card-surface overflow-hidden", p.past && "grayscale-[0.4]")}>
      <div className="flex">
        {/* Date block */}
        <div className="flex w-16 shrink-0 flex-col items-center justify-center border-r border-[color:var(--color-line)] bg-[color:var(--color-paper-deep)] py-4">
          <span className="font-display text-[20px] font-bold leading-none">{day}</span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-ink-faint)]">{month}</span>
        </div>

        <div className="min-w-0 flex-1 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-[15.5px] font-bold leading-snug tracking-tight">{p.title}</h3>
              <p className="mt-0.5 text-[12.5px] text-[color:var(--color-ink-soft)]">
                {formatEventDate(date)} · <span className="inline-flex items-center gap-0.5"><Icon.pin size={11} />{p.location}</span>
              </p>
            </div>
            <Chip bg="#e7ecf2" color="#3d5673">{EVENT_CATEGORY_LABEL[p.category] ?? p.category}</Chip>
          </div>

          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">{p.description}</p>

          <div className="mt-3 flex items-center gap-2">
            <EventRsvpButton eventId={p.id} initialRsvp={p.rsvp} past={p.past} />
            {p.regLink ? (
              <a href={p.regLink} target="_blank" rel="noopener noreferrer" className="btn-outline h-8 px-3 text-[12.5px]">
                Register <Icon.link size={13} />
              </a>
            ) : null}
            <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-[color:var(--color-ink-faint)]">
              <Avatar name={p.organizer.name} image={p.organizer.image} size={18} />
              by {p.organizer.name.split(" ")[0]} · {p.attendeeCount} going
            </span>
          </div>
        </div>
      </div>
      {p.imageUrl ? (
        <span className="relative block aspect-[16/6] w-full overflow-hidden border-t border-[color:var(--color-line)]">
          <Image src={p.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 560px" className="object-cover" />
        </span>
      ) : null}
    </article>
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
