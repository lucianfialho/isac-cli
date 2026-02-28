import { log } from "../ui/logger.js";
import { readConfig, updateConfig } from "../license/store.js";
import { validateLicense } from "../license/client.js";

export async function authCommand(action: string): Promise<void> {
  switch (action) {
    case "login": {
      // In a real implementation, this would open a browser or prompt for input
      const key = process.argv[4] || "isac-dev-key";
      updateConfig({ licenseKey: key });
      log.success(`Logged in with key: ${key.slice(0, 8)}...`);
      break;
    }
    case "logout": {
      updateConfig({ licenseKey: undefined });
      log.success("Logged out.");
      break;
    }
    case "status":
    default: {
      const status = validateLicense();
      if (status.valid) {
        log.success(`License: valid (${status.key?.slice(0, 8)}...)`);
        log.dim(`  Expires: ${status.expiresAt}`);
      } else {
        log.warn("No license key found. Run: isac auth login <key>");
      }
      break;
    }
  }
}
