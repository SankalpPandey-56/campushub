import { db } from "@/lib/db";
import { Icon } from "@/components/icons";
import { AdminCampusForm } from "@/components/admin/campus-form";

export const metadata = { title: "Admin — Settings" };
export const dynamic = "force-dynamic";

function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <p className="flex items-center gap-2 text-[13px]">
      <span
        className={`inline-flex size-5 items-center justify-center rounded-full ${
          ok ? "bg-[#3f7f63]/25 text-[#8fd0b1]" : "bg-[#e8c46a]/15 text-[#e8c46a]"
        }`}
      >
        {ok ? <Icon.check size={11} /> : "!"}
      </span>
      <span className="text-white/75">{label}</span>
      <span className={`ml-auto text-[11.5px] font-semibold uppercase tracking-wider ${ok ? "text-[#8fd0b1]" : "text-[#e8c46a]"}`}>
        {ok ? "Active" : "Not configured"}
      </span>
    </p>
  );
}

export default async function AdminSettingsPage() {
  const campuses = await db.campus.findMany({ orderBy: { createdAt: "asc" }, include: { _count: { select: { users: true } } } });

  const emailConfigured = Boolean(process.env.SMTP_HOST);
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const twilioConfigured = process.env.PHONE_AUTH_PROVIDER === "twilio" && Boolean(process.env.TWILIO_ACCOUNT_SID);
  const adminEmail = process.env.ADMIN_EMAIL;

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-bold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-[13px] text-white/50">
          Configuration status reads from server environment variables — secrets are never displayed.
        </p>
      </header>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <h2 className="text-[14px] font-bold">Environment</h2>
        <div className="mt-3 space-y-2.5">
          <Status ok={Boolean(adminEmail)} label={`Admin account${adminEmail ? `: ${adminEmail}` : " (ADMIN_EMAIL)"}`} />
          <Status ok={googleConfigured} label="Google sign-in (GOOGLE_CLIENT_ID / SECRET)" />
          <Status ok={emailConfigured} label="Outbound email (SMTP_HOST)" />
          <Status ok={twilioConfigured} label="SMS OTP (Twilio Verify)" />
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">
          Without SMTP, admin notifications fall back to the reporter&apos;s notification list. Without Twilio,
          phone OTP runs in console mode (codes print in server logs) — fine for local development, not production.
        </p>
      </section>

      <section className="mt-5">
        <AdminCampusForm campuses={campuses.map((c) => ({ id: c.id, name: c.name, city: c.city, users: c._count.users }))} />
      </section>
    </div>
  );
}
