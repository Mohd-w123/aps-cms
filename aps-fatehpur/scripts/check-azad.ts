import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
async function main() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const s = await mongoose.connection.collection("schools").findOne({ slug: "azadschool" });
  console.log("theme:", JSON.stringify(s?.theme, null, 2));
  console.log("isActive:", s?.isActive);
  await mongoose.disconnect();
}
main();
