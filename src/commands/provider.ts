import { log } from "../ui/logger.js";
import { readConfig, updateConfig } from "../license/store.js";

export async function providerCommand(action: string): Promise<void> {
  switch (action) {
    case "setup":
    default: {
      const provider = process.argv[4] || "anthropic";
      const apiKey = process.argv[5] || process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        log.error(
          "API key required. Usage: isac provider setup <provider> <api-key>"
        );
        log.dim("  Or set ANTHROPIC_API_KEY environment variable.");
        return;
      }

      updateConfig({ provider, apiKey });
      log.success(`Provider configured: ${provider}`);
      log.dim("  API key saved to ~/.isac/config.json");
      break;
    }
  }
}
