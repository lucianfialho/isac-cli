import { log } from "../ui/logger.js";
import { printBanner } from "../ui/banner.js";
import { readConfig } from "../license/store.js";
import { validateLicense } from "../license/client.js";

export async function statusCommand(): Promise<void> {
  printBanner();

  const config = readConfig();
  const license = await validateLicense();

  console.log("  Version:   0.1.0");

  if (config.apiKey) {
    console.log(
      `  Auth:      logged in${config.user?.email ? ` (${config.user.email})` : ""}`
    );
    console.log(
      `  Plan:      ${license.valid ? license.status || "active" : "no active subscription"}`
    );
    if (license.subscriptionExpiresAt) {
      console.log(
        `  Renews:    ${new Date(license.subscriptionExpiresAt).toLocaleDateString()}`
      );
    }
  } else {
    console.log("  Auth:      not logged in");
  }

  console.log(
    `  Provider:  ${config.provider ?? "not configured"}`
  );
  console.log();
}
