import { drizzle } from "drizzle-orm/mysql2";
import { venues } from "./schema";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
const databaseUrl = dbUrlMatch ? dbUrlMatch[1].trim() : "";

if (!databaseUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const db = drizzle(databaseUrl, { mode: "planetscale" });

async function seed() {
  const jsonPath = path.resolve(__dirname, "../public/venues.json");
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const venueList = data.venues || data;

  console.log(`Importing ${venueList.length} venues...`);

  // 清空表
  await db.delete(venues);

  // 批量导入
  for (const v of venueList) {
    await db.insert(venues).values({
      name: v.name,
      address: v.address,
      district: v.district,
      type: v.type,
      courtType: v.court_type,
      courtsCount: v.courts_count || 1,
      priceWeekday: v.price_weekday || "",
      priceWeekend: v.price_weekend || "",
      priceEvening: v.price_evening || "",
      phone: v.phone || "",
      hours: v.hours || "",
      bookingUrl: v.booking_url || null,
      bookingMiniProgram: v.booking_mini_program || "",
      tags: Array.isArray(v.tags) ? JSON.stringify(v.tags) : (v.tags || null),
      lat: v.lat || null,
      lng: v.lng || null,
      source: v.source || "",
    });
  }

  const all = await db.select().from(venues);
  console.log(`✅ Imported ${all.length} venues`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
