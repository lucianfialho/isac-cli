import { log } from "../ui/logger.js";
import { readConfig } from "../license/store.js";
import { fetchReferralStats } from "../license/api.js";

export async function referralCommand(): Promise<void> {
  const config = readConfig();

  if (!config.apiKey) {
    log.warn("Not logged in. Run: isac auth login");
    return;
  }

  try {
    const stats = await fetchReferralStats(config.apiKey);

    console.log("");
    log.info(`Your referral code: ${stats.referralCode}`);
    console.log("");
    log.dim(`  Share: ${stats.shareUrl}`);
    console.log("");
    log.info("Stats:");
    log.dim(`  Credits earned: ${stats.referralCredits} month(s) free`);
    console.log("");
  } catch {
    log.error("Failed to fetch referral stats. Check your connection.");
  }
}
