import { log } from "../ui/logger.js";
import { readConfig } from "../license/store.js";
import { fetchBillingPortalUrl } from "../license/api.js";
import { exec } from "node:child_process";

export async function billingCommand(): Promise<void> {
  const config = readConfig();

  if (!config.apiKey) {
    log.warn("Not logged in. Run: isac auth login");
    return;
  }

  try {
    log.info("Opening billing portal...");
    const { url } = await fetchBillingPortalUrl(config.apiKey);

    const cmd =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
          ? "start"
          : "xdg-open";

    exec(`${cmd} "${url}"`, (err) => {
      if (err) {
        log.info(`Open this URL in your browser: ${url}`);
      }
    });
  } catch {
    log.error("Failed to open billing portal. Check your connection.");
  }
}
