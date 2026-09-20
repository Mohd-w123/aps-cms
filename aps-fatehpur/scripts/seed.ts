/**
 * Seed script — run with: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed.ts
 * Or: npx tsx scripts/seed.ts
 *
 * Creates: 5 Schools, 1 Superadmin, 5 School Admins, default CMS Pages per school.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// ── Inline schemas (avoid Next.js alias issues in ts-node) ──

const SchoolSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    domain: String,
    subdomain: String,
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    theme: {
      primaryColor: String,
      secondaryColor: String,
      accentColor: String,
    },
    contactInfo: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      mapEmbed: String,
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      youtube: String,
      twitter: String,
    },
    stats: {
      students: { type: Number, default: 0 },
      teachers: { type: Number, default: 0 },
      years: { type: Number, default: 0 },
      awards: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    name: String,
    email: { type: String, unique: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["superadmin", "school_admin", "editor"] },
    lastLogin: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PageSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    slug: String,
    title: String,
    content: { type: String, default: "" },
    featuredImage: String,
    seo: { metaTitle: String, metaDescription: String },
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
PageSchema.index({ schoolId: 1, slug: 1 }, { unique: true });

const School =
  mongoose.models.School || mongoose.model("School", SchoolSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Page = mongoose.models.Page || mongoose.model("Page", PageSchema);

// ── Data ──

const schoolsData = [
  {
    name: "APS Fatehpur",
    slug: "apsfatehpur",
    domain: "apsfatehpur.com",
    subdomain: "",
    theme: {
      primaryColor: "#2F3E8F",
      secondaryColor: "#1a2556",
      accentColor: "#F4D21F",
    },
    contactInfo: {
      phone: "+91 7023190190",
      email: "info@apsfatehpur.com",
      address: "APS SCHOOL, FATEHPUR, SIKAR.-332301",
    },
    stats: { students: 1200, teachers: 80, years: 25, awards: 50 },
  },
  {
    name: "APS Girls School",
    slug: "apsgirls",
    domain: "apsgirls.apsfatehpur.com",
    subdomain: "apsgirls",
    theme: {
      primaryColor: "#6b21a8",
      secondaryColor: "#3b0764",
      accentColor: "#F4D21F",
    },
    contactInfo: {
      phone: "+91 9876543211",
      email: "girls@apsfatehpur.com",
      address: "APS SCHOOL, FATEHPUR, SIKAR.-332301",
    },
    stats: { students: 450, teachers: 30, years: 15, awards: 20 },
  },
  {
    name: "APS Boys School",
    slug: "apsboys",
    domain: "apsboys.apsfatehpur.com",
    subdomain: "apsboys",
    theme: {
      primaryColor: "#1e40af",
      secondaryColor: "#172554",
      accentColor: "#F4D21F",
    },
    contactInfo: {
      phone: "+91 9876543212",
      email: "boys@apsfatehpur.com",
      address: "APS SCHOOL, FATEHPUR, SIKAR.-332301",
    },
    stats: { students: 500, teachers: 35, years: 15, awards: 25 },
  },
  {
    name: "Ashrafululum Madrasa",
    slug: "madrasa",
    domain: "madrasa.apsfatehpur.com",
    subdomain: "madrasa",
    theme: {
      primaryColor: "#047857",
      secondaryColor: "#022c22",
      accentColor: "#F4D21F",
    },
    contactInfo: {
      phone: "+91 9876543213",
      email: "madrasa@apsfatehpur.com",
      address: "APS SCHOOL, FATEHPUR, SIKAR.-332301",
    },
    stats: { students: 300, teachers: 20, years: 20, awards: 10 },
  },
  {
    name: "Azad School",
    slug: "azadschool",
    domain: "azadschool.apsfatehpur.com",
    subdomain: "azadschool",
    theme: {
      primaryColor: "#ea580c",
      secondaryColor: "#431407",
      accentColor: "#F4D21F",
    },
    contactInfo: {
      phone: "+91 7023190190",
      email: "info@azadschool.in",
      address: "APS SCHOOL, FATEHPUR, SIKAR.-332301",
    },
    stats: { students: 350, teachers: 25, years: 10, awards: 15 },
  },
];

const defaultPageSlugs = [
  { slug: "about", title: "About Us" },
  { slug: "fees", title: "Fee Structure" },
  { slug: "bus-routes", title: "Bus Routes" },
  { slug: "calendar", title: "Academic Calendar" },
  { slug: "uniforms", title: "Uniforms" },
  { slug: "curriculum", title: "Curriculum" },
  { slug: "affiliation", title: "Affiliation" },
  { slug: "rte", title: "Right to Education (RTE)" },
  { slug: "career-counseling", title: "Career Counseling" },
  { slug: "facilities", title: "Facilities" },
  { slug: "tours", title: "Tours & Visits" },
  { slug: "highlights", title: "Highlights" },
  { slug: "awards", title: "Awards & Achievements" },
  { slug: "infrastructure", title: "Infrastructure" },
  { slug: "admissions", title: "Admissions" },
];

// ── Seed function ──

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  // Clear existing data
  await School.deleteMany({});
  await User.deleteMany({});
  await Page.deleteMany({});
  console.log("🗑️  Cleared existing schools, users, and pages\n");

  // Hash password
  const passwordHash = await bcrypt.hash("admin123", 12);

  // Create schools
  const createdSchools = await School.insertMany(schoolsData);
  console.log(`📚 Created ${createdSchools.length} schools`);

  // Create superadmin
  await User.create({
    name: "Super Admin",
    email: "admin@apsfatehpur.com",
    passwordHash,
    role: "superadmin",
    schoolId: createdSchools[0]._id,
    isActive: true,
  });
  console.log("👑 Created superadmin: admin@apsfatehpur.com / admin123");

  // Create school admins
  for (const school of createdSchools) {
    await User.create({
      name: `${school.name} Admin`,
      email: `admin@${school.slug}.local`,
      passwordHash,
      role: "school_admin",
      schoolId: school._id,
      isActive: true,
    });
    console.log(`👤 Created school_admin: admin@${school.slug}.local`);
  }

  // Create default CMS pages for each school
  let pageCount = 0;
  for (const school of createdSchools) {
    const pages = defaultPageSlugs.map(({ slug, title }) => ({
      schoolId: school._id,
      slug,
      title,
      content: `<h2>${title}</h2><p>Welcome to the ${title} page of ${school.name}. This content is managed from the admin CMS panel. Edit this page to add your school's information.</p>`,
      isPublished: true,
      seo: {
        metaTitle: `${title} — ${school.name}`,
        metaDescription: `${title} information for ${school.name}`,
      },
    }));
    await Page.insertMany(pages);
    pageCount += pages.length;
  }
  console.log(`📄 Created ${pageCount} CMS pages (${defaultPageSlugs.length} per school)\n`);

  // Summary
  console.log("═══════════════════════════════════════");
  console.log("  ✅ SEED COMPLETE");
  console.log("═══════════════════════════════════════");
  console.log("  Schools:       5");
  console.log("  Superadmin:    admin@apsfatehpur.com");
  console.log("  School admins: admin@{slug}.local");
  console.log("  Password:      admin123 (for all)");
  console.log(`  CMS Pages:     ${pageCount}`);
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
