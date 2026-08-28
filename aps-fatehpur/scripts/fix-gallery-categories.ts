/**
 * One-time script: normalise all gallery categories to trimmed lowercase.
 * Run with:  npx ts-node -r tsconfig-paths/register scripts/fix-gallery-categories.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const col = mongoose.connection.collection("galleries");

  // Fetch all distinct categories
  const docs = await col.find({}, { projection: { _id: 1, category: 1 } }).toArray();

  // Group by normalized value to show duplicates before fixing
  const grouped: Record<string, string[]> = {};
  for (const doc of docs) {
    const norm = (doc.category as string | undefined || "general").trim().toLowerCase();
    grouped[norm] = grouped[norm] || [];
    if (!grouped[norm].includes(doc.category)) grouped[norm].push(doc.category);
  }

  console.log("\n=== Duplicate categories found ===");
  let hasDuplicates = false;
  for (const [norm, originals] of Object.entries(grouped)) {
    if (originals.length > 1 || originals[0] !== norm) {
      hasDuplicates = true;
      console.log(`  "${originals.join('", "')}"  →  "${norm}"`);
    }
  }
  if (!hasDuplicates) {
    console.log("  None — all categories are already normalised.");
    await mongoose.disconnect();
    return;
  }

  // Update each document whose category differs from its normalised form
  let updated = 0;
  for (const doc of docs) {
    const norm = (doc.category as string | undefined || "general").trim().toLowerCase();
    if (doc.category !== norm) {
      await col.updateOne({ _id: doc._id }, { $set: { category: norm } });
      updated++;
    }
  }

  console.log(`\n✅ Fixed ${updated} gallery document(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
