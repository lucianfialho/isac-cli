import { log } from "../ui/logger.js";
import { printBanner } from "../ui/banner.js";
import { readConfig } from "../license/store.js";
import { validateLicense } from "../license/client.js";

export async function statusCommand(): Promise<void> {
  printBanner();

  const config = readConfig();
  const license = validateLicense();

  console.log("  Version:   0.1.0");
  console.log(
    `  License:   ${license.valid ? `valid (${license.key?.slice(0, 8)}...)` : "not configured"}`
  );
  console.log(
    `  Provider:  ${config.provider ?? "not configured"}`
  );
  console.log(
    `  API Key:   ${config.apiKey ? "configured" : "not configured"}`
  );
  console.log();
}
