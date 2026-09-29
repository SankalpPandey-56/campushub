/**
 * Smoke-test helper: mints real session cookies for smoke-testing.
 * Creates the ADMIN_EMAIL user if missing, then prints valid cookies for
 * an approved member and the admin. Not used by the app itself.
 */
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

async function tokenFor(u: {
  id: string;
  email: string | null;
  name: string;
  image: string | null;
  role: string;
}) {
  return new SignJWT({ id: u.id, email: u.email, name: u.name, image: u.image, role: u.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  if (!adminEmail) throw new Error("ADMIN_EMAIL not set");

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: { email: adminEmail, name: "Campus Admin", role: "ADMIN" },
  });

  const member = await db.user.findFirst({ where: { verificationStatus: "APPROVED", role: "USER" } });
  if (!member) throw new Error("No approved member found — run the seed first.");

  console.log("MEMBER_COOKIE=" + (await tokenFor(member)));
  console.log("ADMIN_COOKIE=" + (await tokenFor(admin)));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
