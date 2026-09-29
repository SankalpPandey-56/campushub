import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth/guard";
import { EmptyState, Chip } from "@/components/ui/primitives";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { ResourceReportButton } from "@/components/cards/resource-extras";
import { relativeTime } from "@/lib/format";

export const metadata = { title: "Resources" };
export const dynamic = "force-dynamic";

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string }> }) {
  const viewer = await requireMember();
  const { q, subject } = await searchParams;

  const resources = await db.resource.findMany({
    where: {
      campusId: viewer.campusId ?? undefined,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { subject: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(subject ? { subject } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  const subjects = [...new Set(resources.map((r) => r.subject))].slice(0, 8);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight">Resources</h1>
          <p className="mt-0.5 text-[13px] text-[color:var(--color-ink-soft)]">Notes and guides from students who took the course.</p>
        </div>
        <Link href="/resources/new" className="btn-solid h-9 shrink-0 px-3.5 text-[13px]">
          <Icon.plus size={15} /> Add resource
        </Link>
      </div>

      <form action="/resources" className="relative mb-4">
        <Icon.search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-ink-faint)]" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title, subject…"
          className="w-full rounded-lg border border-[color:var(--color-line-strong)] bg-[color:var(--color-card)] py-2 pl-9 pr-3 text-[13.5px] focus:border-[color:var(--color-pine)] focus:outline-none"
        />
      </form>

      {subjects.length > 0 ? (
        <nav aria-label="Subjects" className="mb-4 -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max items-center gap-1.5">
            <li>
              <Link href="/resources" className="chip border border-[color:var(--color-line-strong)] bg-[color:var(--color-card)] text-[color:var(--color-ink-soft)]">
                All subjects
              </Link>
            </li>
            {subjects.map((s) => (
              <li key={s}>
                <Link
                  href={`/resources?subject=${encodeURIComponent(s)}`}
                  className={`chip border ${
                    subject === s
                      ? "border-[color:var(--color-pine)] bg-[color:var(--color-pine)] text-white"
                      : "border-[color:var(--color-line-strong)] bg-[color:var(--color-card)] text-[color:var(--color-ink-soft)]"
                  }`}
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {resources.length === 0 ? (
        <EmptyState
          icon={<Icon.book size={20} />}
          title={q ? "Nothing matches that search." : "No resources shared yet."}
          body={q ? "Try a different keyword." : "Share the notes that got you through last semester."}
          action={q ? undefined : <Link href="/resources/new" className="btn-solid">Share a resource</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.id} className="card-surface px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-semibold leading-snug">{r.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">{r.description}</p>
                </div>
                <Chip bg="#e3efe9" color="#1e5c48">{r.subject}</Chip>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[color:var(--color-ink-faint)]">
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={r.author.name} image={r.author.image} size={18} />
                  {r.author.name.split(" ")[0]}
                </span>
                {r.course ? <span>{r.course}</span> : null}
                {r.semester ? <span>Sem {r.semester}</span> : null}
                <span>{relativeTime(r.createdAt.toISOString())}</span>
                <span className="ml-auto flex items-center gap-2">
                  {r.link ? (
                    <a href={r.link} target="_blank" rel="noopener noreferrer" className="btn-outline h-7 px-2.5 text-[12px]">
                      Open <Icon.link size={12} />
                    </a>
                  ) : null}
                  <ResourceReportButton resourceId={r.id} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
