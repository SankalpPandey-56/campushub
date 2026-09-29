/**
 * CampusHub seed — a believable slice of campus life.
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CAMPUS_NAME = process.env.SEED_CAMPUS_NAME ?? "Rishihood University";

async function main() {
  console.log("Seeding…");

  const campus = await db.campus.upsert({
    where: { name: CAMPUS_NAME },
    update: {},
    create: { name: CAMPUS_NAME, shortName: CAMPUS_NAME.split(" ")[0], city: "Sonipat", state: "Haryana" },
  });

  // A second campus so the verification dropdown feels real.
  await db.campus.upsert({
    where: { name: "Ashoka University" },
    update: {},
    create: { name: "Ashoka University", shortName: "Ashoka", city: "Sonipat", state: "Haryana" },
  });

  const people = [
    { name: "Aarav Mehta", course: "B.Tech CSE", year: "3", bio: "Compiling by day, cricket by dusk." },
    { name: "Zoya Khan", course: "BBA", year: "2", bio: "Debate soc. Ask me about the mess menu politics." },
    { name: "Ishaan Verma", course: "B.Tech ECE", year: "4", bio: "Placement season survivor (tell my family I love them)." },
    { name: "Meera Krishnan", course: "BA Psychology", year: "3", bio: "Library seat 42 is mine. This is not a joke." },
    { name: "Kabir Singh", course: "B.Tech CSE", year: "2", bio: "DS mujhse na ho payega. Still trying." },
    { name: "Ananya Rao", course: "B.Des", year: "1", bio: "First-year. Already own three hoodies from fest stalls." },
  ] as const;

  const users = [];
  for (const p of people) {
    const phone = `+9198${String(Math.floor(10_000_000 + Math.random() * 89_999_999))}`;
    users.push(
      await db.user.upsert({
        where: { phone },
        update: {},
        create: {
          phone,
          name: p.name,
          course: p.course,
          year: p.year,
          bio: p.bio,
          campusId: campus.id,
          verificationStatus: "APPROVED",
          phoneVerified: new Date(),
        },
      }),
    );
  }
  const [aarav, zoya, ishaan, meera, kabir, ananya] = users;

  // ── Posts ──────────────────────────────────────────────────────────────────
  const posts = [
    {
      author: meera,
      category: "CAMPUS" as const,
      title: "PSA: the 3rd floor library AC is finally fixed",
      content:
        "After 47 days of endurance camping. The seats by the window are back to being the best seats on campus. You're welcome, mid-sems survivors.",
    },
    {
      author: ishaan,
      category: "RESOURCES" as const,
      title: "Made a one-pager of every ECE formula from sems 1–6",
      content:
        "Link in comments. Print it, tape it above your desk, thank me at convocation. If you find an error, keep it to yourself (kidding — DM me and I'll fix it).",
    },
    {
      author: zoya,
      category: "EVENTS" as const,
      title: "Debate society auditions this Friday",
      content:
        " AUD-2, 5 PM. Prompt will be given on the spot, 2 mins to speak. No, you don't have to be good. Yes, you do have to be loud. See you there.",
    },
    {
      author: aarav,
      category: "MARKETPLACE" as const,
      title: "Selling: study lamp + laptop stand, ₹500 for both",
      content:
        "Graduating, so everything must go. Lamp has 3 brightness settings, stand fits laptops up to 16\". Pickup from Hostel C any evening.",
    },
    {
      author: kabir,
      category: "LOST_FOUND" as const,
      title: "FOUND: one earbud, right side, near the mess entrance",
      content:
        "It's a black round one, case is long gone. Describe the brand and it's yours. Currently living in my pocket and judging me.",
    },
    {
      author: ananya,
      category: "CAMPUS" as const,
      title: "Why does nobody talk about the sunset from the D-block terrace",
      content:
        "Went up to 'sketch the water tank' (lie) and the sky did THAT. Go at 6:10, thank me later. First-years, this is your personality now.",
    },
  ];

  const createdPosts = [];
  for (const p of posts) {
    createdPosts.push(
      await db.post.create({
        data: {
          authorId: p.author.id,
          campusId: campus.id,
          category: p.category,
          title: p.title,
          content: p.content,
        },
      }),
    );
  }

  // Engagement
  await db.like.create({ data: { postId: createdPosts[0].id, userId: aarav.id } });
  await db.like.create({ data: { postId: createdPosts[0].id, userId: kabir.id } });
  await db.like.create({ data: { postId: createdPosts[5].id, userId: meera.id } });
  await db.comment.createMany({
    data: [
      { postId: createdPosts[1].id, authorId: kabir.id, content: "You are carrying the entire batch, thank you." },
      { postId: createdPosts[5].id, authorId: zoya.id, content: "6:10 club, this Friday, I'm in." },
      { postId: createdPosts[3].id, authorId: ananya.id, content: "Is the lamp still there? I'll take it tonight." },
    ],
  });

  // ── Deals ──────────────────────────────────────────────────────────────────
  const inDays = (n: number) => new Date(Date.now() + n * 86_400_000);
  await db.deal.createMany({
    data: [
      {
        authorId: zoya.id,
        campusId: campus.id,
        title: "Student combo — chai + samosa at ₹49",
        description: "Show your ID card between 4–6 PM. The owner's son studies here, hence the love.",
        business: "Sharma Tea Stall",
        location: "Market gate, 5 min walk",
        originalPrice: 70,
        discountedPrice: 49,
        discountPercent: 30,
        category: "FOOD",
        expiresAt: inDays(21),
      },
      {
        authorId: ishaan.id,
        campusId: campus.id,
        title: "20% off on printing, thesis-sized orders",
        description: "Spiral binding free above 50 pages. They know our pain, the shop is run by an alum.",
        business: "Copilot Xerox",
        location: "Main market",
        originalPrice: 250,
        discountedPrice: 200,
        discountPercent: 20,
        category: "SERVICES",
        expiresAt: inDays(45),
      },
      {
        authorId: aarav.id,
        campusId: campus.id,
        title: "Buy 1 Get 1 on Friday movie tickets",
        description: "Book at the counter, not online. Carry student IDs — they actually check here.",
        business: "Cinepolis Rivoli",
        location: "Rivoli Mall, 3 km",
        originalPrice: 440,
        discountedPrice: 220,
        discountPercent: 50,
        category: "ENTERTAINMENT",
        expiresAt: inDays(10),
      },
      {
        authorId: meera.id,
        campusId: campus.id,
        title: "Flat 15% at the stationery shop (expired, reviving soon)",
        description: "The permanent 'exam season' discount. Currently paused, back next month.",
        business: "Gupta Book Depot",
        location: "Behind auditorium",
        originalPrice: 300,
        discountedPrice: 255,
        discountPercent: 15,
        category: "STUDENT_DEALS",
        expiresAt: inDays(-3),
      },
    ],
  });

  // ── Events ─────────────────────────────────────────────────────────────────
  const onDay = (n: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(hour, 0, 0, 0);
    return d;
  };
  const hacknight = await db.event.create({
    data: {
      organizerId: aarav.id,
      campusId: campus.id,
      title: "HackNight 3.0",
      description:
        "12 hours, 4 tracks, unlimited coffee. Teams of 2–4. Beginners welcome — there's a separate beginner track with mentors from the senior batch.",
      startsAt: onDay(6, 18),
      location: "Innovation Lab, Block C",
      category: "TECH",
      regLink: "https://example.org/hacknight",
    },
  });
  await db.event.create({
    data: {
      organizerId: zoya.id,
      campusId: campus.id,
      title: "Open Mic: First Drafts",
      description:
        "Poetry, standup, one good impression of the mess aunty. Sign-up sheet at the door, 5 minutes each.",
      startsAt: onDay(3, 17),
      location: "Amphitheatre",
      category: "CULTURAL",
    },
  });
  await db.event.create({
    data: {
      organizerId: meera.id,
      campusId: campus.id,
      title: "Inter-hostel Football Trials",
      description: "Bring your own shin pads. Selection for the hostel team happening on the spot.",
      startsAt: onDay(-2, 16),
      location: "Sports Ground",
      category: "SPORTS",
    },
  });
  await db.eventAttendee.create({ data: { eventId: hacknight.id, userId: kabir.id } });

  // ── Resources ──────────────────────────────────────────────────────────────
  await db.resource.createMany({
    data: [
      {
        authorId: ishaan.id,
        campusId: campus.id,
        title: "DSA — Graphs master sheet (all 32 patterns)",
        description:
          "Every traversal, cycle detection, and shortest-path template with a one-line 'when to use' note. Compiled across two semesters of TA duties.",
        subject: "Data Structures",
        course: "B.Tech CSE",
        semester: "3",
        link: "https://notes.example.org/graphs-master",
      },
      {
        authorId: meera.id,
        campusId: campus.id,
        title: "Psychology stats cheatsheet — t-tests without tears",
        description: "When to use which test, in one page. Based on the exact past-paper question patterns.",
        subject: "Statistics",
        course: "BA Psychology",
        semester: "4",
        link: "https://notes.example.org/t-tests",
      },
      {
        authorId: kabir.id,
        campusId: campus.id,
        title: "Digital Electronics: K-map walkthrough video",
        description: "Recorded during exam prep. 18 minutes, solves 5 past problems slowly and honestly.",
        subject: "Digital Electronics",
        course: "B.Tech ECE",
        semester: "3",
        link: "https://videos.example.org/kmaps",
      },
    ],
  });

  // ── Marketplace ────────────────────────────────────────────────────────────
  await db.marketplaceListing.createMany({
    data: [
      {
        sellerId: aarav.id,
        campusId: campus.id,
        title: "Casio FX-991EX scientific calculator",
        description: "Two years old, all buttons work, cover included. The exam-hall classic.",
        price: 1100,
        condition: "GOOD",
        category: "ELECTRONICS",
        location: "Hostel C",
      },
      {
        sellerId: meera.id,
        campusId: campus.id,
        title: "DS algo book —CLRS, 3rd edition",
        description: "Lightly annotated in pencil (all erasable). The book that made me switch from CS electives.",
        price: 700,
        condition: "LIKE_NEW",
        category: "BOOKS",
        location: "Library lawns, works too",
      },
      {
        sellerId: kabir.id,
        campusId: campus.id,
        title: "Study table lamp + clip fan combo",
        description: "Survived two semesters of night-outs. Selling because I finally discovered sleeping.",
        price: 500,
        condition: "FAIR",
        category: "FURNITURE",
        location: "Hostel C",
        status: "SOLD",
      },
    ],
  });

  // ── Study groups ───────────────────────────────────────────────────────────
  const dsa = await db.group.create({
    data: {
      name: "DSA Grind — 6 AM Club",
      subject: "Algorithms",
      description:
        "Two problems before breakfast, every day. We share a sheet, argue about time complexity, and celebrate the first correct DP like a festival.",
      creatorId: aarav.id,
      campusId: campus.id,
      members: { create: [{ userId: aarav.id }, { userId: kabir.id }] },
    },
  });
  await db.group.create({
    data: {
      name: "Placement Prep — Batch of '26",
      description:
        "Mock interviews, resume swaps, and a shared tracker of every company visit. Seniors who've been through it drop in on Sundays.",
      subject: "Careers",
      creatorId: ishaan.id,
      campusId: campus.id,
      members: { create: [{ userId: ishaan.id }] },
    },
  });
  await db.groupPost.create({
    data: {
      groupId: dsa.id,
      authorId: kabir.id,
      content: "Day 14: today's graph problem broke me but I got there. Posting proof before anyone asks.",
    },
  });

  console.log("Seed complete:", { campus: campus.name, users: users.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
