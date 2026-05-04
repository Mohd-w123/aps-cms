/**
 * Seed default navigation for all schools.
 * Run: npx tsx scripts/seed-nav.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const defaultHeaderNav = [
  { label: "Home", href: "/", children: [] },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Mission & Vision", href: "/about" },
      { label: "Director", href: "/about/director" },
      { label: "Chairman", href: "/about/chairman" },
      { label: "Principal", href: "/about/principal" },
      { label: "Infrastructure", href: "/about/infrastructure" },
    ],
  },
  {
    label: "Structure",
    href: "/structure/uniforms",
    children: [
      { label: "Uniforms", href: "/structure/uniforms" },
      { label: "Bus Routes", href: "/structure/bus-routes" },
      { label: "Calendar", href: "/structure/calendar" },
      { label: "Career Counseling", href: "/structure/career-counseling" },
      { label: "Awards", href: "/structure/awards" },
    ],
  },
  {
    label: "Academy",
    href: "/academy/admissions",
    children: [
      { label: "Admissions", href: "/academy/admissions" },
      { label: "Curriculum", href: "/academy/curriculum" },
      { label: "Affiliation", href: "/academy/affiliation" },
      { label: "RTE", href: "/academy/rte" },
      { label: "Fees", href: "/academy/fees" },
    ],
  },
  { label: "Facilities", href: "/facilities", children: [] },
  {
    label: "News",
    href: "/news",
    children: [
      { label: "Announcements", href: "/news" },
      { label: "Tours", href: "/news/tours" },
      { label: "Videos", href: "/news/videos" },
    ],
  },
  { label: "Toppers", href: "/toppers", children: [] },
  { label: "AICU", href: "/aicu", children: [] },
  { label: "Alumni", href: "/alumni", children: [] },
  { label: "Careers", href: "/careers", children: [] },
  { label: "Contact", href: "/contact", children: [] },
];

const defaultFooterLinks = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Admissions", href: "/academy/admissions" },
      { label: "Facilities", href: "/facilities" },
      { label: "News", href: "/news" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Academics",
    links: [
      { label: "Curriculum", href: "/academy/curriculum" },
      { label: "Toppers", href: "/toppers" },
      { label: "AICU", href: "/aicu" },
      { label: "Alumni", href: "/alumni" },
      { label: "Careers", href: "/careers" },
      { label: "Calendar", href: "/structure/calendar" },
    ],
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db!;
  const result = await db.collection("schools").updateMany(
    { $or: [{ headerNav: { $exists: false } }, { headerNav: { $size: 0 } }] },
    { $set: { headerNav: defaultHeaderNav, footerLinks: defaultFooterLinks } }
  );

  console.log(`✅ Updated ${result.modifiedCount} schools with default navigation`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
