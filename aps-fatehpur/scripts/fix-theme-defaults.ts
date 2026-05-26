/**
 * Fix script: Clear Mongoose-defaulted theme fields so they fall through to static config.
 * Run with: npx tsx scripts/fix-theme-defaults.ts
 * 
 * This resets theme fields that match the old apsfatehpur defaults back to empty strings,
 * so each school correctly uses its config/schools.ts theme as fallback.
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

// Old default values that Mongoose auto-filled
const OLD_DEFAULTS: Record<string, string> = {
  "theme.primaryDarkColor": "#3d8a37",
  "theme.accentBlueColor": "#9ab5db",
  "theme.accentLimeColor": "#d4e96e",
  "theme.bgLightColor": "#f6faf5",
  "theme.textDarkColor": "#22235b",
  "theme.textMutedColor": "#6B7280",
};

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const School = mongoose.connection.collection("schools");
  const schools = await School.find({}).toArray();

  for (const school of schools) {
    // For non-apsfatehpur schools, clear fields that still have the old default
    if (school.slug === "apsfatehpur") continue;

    const updates: Record<string, string> = {};
    for (const [field, defaultVal] of Object.entries(OLD_DEFAULTS)) {
      const keys = field.split(".");
      const currentVal = keys.reduce((obj: any, k) => obj?.[k], school);
      if (currentVal === defaultVal) {
        updates[field] = "";
      }
    }

    if (Object.keys(updates).length > 0) {
      await School.updateOne({ _id: school._id }, { $set: updates });
      console.log(`🔧 ${school.slug}: cleared ${Object.keys(updates).length} default theme fields`);
    } else {
      console.log(`✓ ${school.slug}: no stale defaults found`);
    }
  }

  await mongoose.disconnect();
  console.log("✅ Done!");
}

main().catch(console.error);
