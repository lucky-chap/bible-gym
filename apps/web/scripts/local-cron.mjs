import cron from "node-cron";
import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const CRON_SECRET = process.env.CRON_SECRET;
const PORT = process.env.PORT || 3000;
const ENDPOINT = `http://localhost:${PORT}/api/cron/daily-workout`;

if (!CRON_SECRET) {
  console.error("❌ CRON_SECRET is not defined in .env.local");
  process.exit(1);
}

console.log("🚀 Starting local cron job simulator...");
// Log the schedule we are going to use.
console.log(`⏰ Scheduled to ping ${ENDPOINT} every day at midnight UTC (0 0 * * *)`);

async function triggerCron() {
  console.log(`\n[${new Date().toISOString()}] 🔄 Executing daily workout cron job...`);
  try {
    const response = await fetch(ENDPOINT, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${CRON_SECRET}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      console.log("✅ Cron job executed successfully:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error("❌ Cron job failed with status:", response.status);
      console.error(data);
    }
  } catch (error) {
    console.error("❌ Failed to reach the cron endpoint. Is the Next.js server running in another terminal?");
    console.error(error.message);
  }
}

// 1. Run it immediately once on startup so you don't have to wait 24 hours to test
triggerCron();

// 2. Schedule it to run exactly like production (Midnight UTC)
cron.schedule("0 0 * * *", triggerCron, {
  scheduled: true,
  timezone: "UTC"
});
