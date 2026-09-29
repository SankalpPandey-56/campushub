import { db } from "@/lib/db";
import { UserRow } from "@/components/admin/user-row";

export const metadata = { title: "Admin — Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const query = q?.trim();
  const statusFilter = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status ?? "") ? status : null;

  const users = await db.user.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
            ],
          }
        : {}),
      ...(statusFilter ? { verificationStatus: statusFilter as "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { campus: { select: { name: true } }, _count: { select: { posts: true, comments: true } } },
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-bold tracking-tight">Users</h1>
        <p className="mt-0.5 text-[13px] text-white/50">Search, review status, and moderate members.</p>
      </header>

      <form action="/admin/users" className="mb-4 flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by name, email, phone…"
          className="w-full max-w-xs rounded-lg border border-white/15 bg-white/[0.05] px-3.5 py-2 text-[13px] text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-[13px] text-white focus:border-white/40 focus:outline-none"
        >
          <option value="" className="text-black">All statuses</option>
          {["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map((s) => (
            <option key={s} value={s} className="text-black">
              {s}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#141a17]">Filter</button>
      </form>

      {users.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-[13.5px] text-white/50">
          No users match.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-white/10">
          {users.map((u) => (
            <li key={u.id} className="border-b border-white/10 last:border-b-0">
              <UserRow
                id={u.id}
                name={u.name}
                email={u.email}
                phone={u.phone}
                image={u.image}
                role={u.role}
                status={u.verificationStatus}
                course={u.course}
                year={u.year}
                campus={u.campus?.name ?? null}
                postCount={u._count.posts}
                commentCount={u._count.comments}
                joined={u.createdAt.toISOString()}
                suspendedReason={u.suspensionReason}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
