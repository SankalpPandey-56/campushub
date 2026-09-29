import "server-only";
import nodemailer from "nodemailer";

type MailInput = { to: string; subject: string; html: string; text?: string };

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

/** Best-effort send. Never throws — email must not take down a request. */
export async function sendMail({ to, subject, html, text }: MailInput) {
  const tx = getTransporter();
  if (!tx) {
    console.log(`[CampusHub mail] SMTP not configured; skipping "${subject}" to ${to}`);
    return false;
  }
  try {
    await tx.sendMail({
      from: process.env.EMAIL_FROM ?? "CampusHub <no-reply@campushub.app>",
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, " "),
    });
    return true;
  } catch (err) {
    console.error("[CampusHub mail] send failed:", err);
    return false;
  }
}

function layout(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f7f6f2;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2a24">
  <div style="max-width:520px;margin:0 auto;background:#fffefb;border:1px solid #e4e1d8;border-radius:10px;overflow:hidden">
    <div style="padding:20px 28px;border-bottom:1px solid #e4e1d8">
      <span style="font-weight:700;font-size:15px;letter-spacing:-0.01em">Campus<span style="color:#226b57">Hub</span></span>
    </div>
    <div style="padding:28px">
      <h1 style="margin:0 0 12px;font-size:19px;letter-spacing:-0.02em">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#55645c">${body}</div>
      ${
        cta
          ? `<div style="margin-top:24px"><a href="${cta.url}" style="display:inline-block;background:#226b57;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:8px">${cta.label}</a></div>`
          : ""
      }
    </div>
    <div style="padding:16px 28px;border-top:1px solid #e4e1d8;font-size:12px;color:#8a978f">
      CampusHub — your campus, connected.
    </div>
  </div></body></html>`;
}

/** Notify the admin that a verification request arrived. */
export async function sendAdminVerificationEmail(input: {
  name: string;
  email: string | null;
  phone: string | null;
  course: string;
  year: string;
  campus: string;
  submittedAt: Date;
  reviewUrl: string;
}) {
  const admin = process.env.ADMIN_EMAIL;
  if (!admin) return false;
  const rows: Array<[string, string]> = [
    ["Name", input.name],
    ["Email", input.email ?? "—"],
    ["Phone", input.phone ?? "—"],
    ["Course", input.course],
    ["Year", input.year],
    ["Campus", input.campus],
    ["Submitted", input.submittedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
  ];
  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#8a978f;font-size:13px;white-space:nowrap">${k}</td><td style="padding:6px 0;font-size:14px;font-weight:550">${v}</td></tr>`,
    )
    .join("");
  return sendMail({
    to: admin,
    subject: `New verification request — ${input.name}`,
    html: layout(
      "New verification request",
      `<p>A student just applied to join CampusHub:</p>
       <table style="border-collapse:collapse;margin:8px 0">${table}</table>
       <p style="font-size:13px;color:#8a978f">You can also review all requests in the admin dashboard.</p>`,
      { label: "Review request", url: input.reviewUrl },
    ),
  });
}

/** Notify a student about their verification outcome. */
export async function sendVerificationDecisionEmail(input: {
  to: string | null;
  name: string;
  approved: boolean;
  note?: string | null;
  appUrl: string;
}) {
  if (!input.to) return false;
  return sendMail({
    to: input.to,
    subject: input.approved ? "You're in — CampusHub verification approved" : "CampusHub verification update",
    html: layout(
      input.approved ? `Welcome aboard, ${input.name.split(" ")[0]}!` : "Verification update",
      input.approved
        ? `<p>Your CampusHub verification for <b>${input.name}</b> has been approved. You now have full access to your campus community.</p>${
            input.note ? `<p>Note from the team: ${input.note}</p>` : ""
          }`
        : `<p>Unfortunately your CampusHub verification wasn't approved this time.${
            input.note ? ` Reason: <b>${input.note}</b>` : ""
          }</p><p>If you think this is a mistake, you can submit a new request with clearer details.</p>`,
      { label: input.approved ? "Open CampusHub" : "Back to CampusHub", url: input.appUrl },
    ),
  });
}
