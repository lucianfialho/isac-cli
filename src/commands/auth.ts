import { log } from "../ui/logger.js";
import { readConfig, updateConfig } from "../license/store.js";
import { validateLicense } from "../license/client.js";
import { requestDeviceCode, pollDeviceCode } from "../license/api.js";
import { createSpinner } from "../ui/spinner.js";
import { exec } from "node:child_process";

export async function authCommand(action: string): Promise<void> {
  switch (action) {
    case "login":
      await loginFlow();
      break;

    case "logout":
      updateConfig({ apiKey: undefined, user: undefined, licenseCache: undefined });
      log.success("Logged out.");
      break;

    case "status":
    default:
      await showStatus();
      break;
  }
}

async function loginFlow(): Promise<void> {
  const config = readConfig();
  if (config.apiKey) {
    log.info("Already logged in. Run 'isac auth logout' first to switch accounts.");
    return;
  }

  log.info("Starting authentication...");

  const { userCode, deviceCode, verificationUri } = await requestDeviceCode();

  console.log("");
  log.info(`Open ${verificationUri}?code=${userCode} and sign in:`);
  console.log("");
  console.log(`    ${userCode}`);
  console.log("");

  openBrowser(`${verificationUri}?code=${userCode}`);

  const spinner = createSpinner("Waiting for browser authorization...");
  spinner.start();

  const timeout = Date.now() + 5 * 60 * 1000;
  let authorized = false;

  while (Date.now() < timeout) {
    await sleep(5000);

    try {
      const result = await pollDeviceCode(deviceCode);

      if (result.status === "authorized" && result.apiKey) {
        spinner.succeed("Authenticated!");
        updateConfig({ apiKey: result.apiKey });
        authorized = true;
        break;
      }

      if (result.status === "expired") {
        spinner.fail("Code expired. Run 'isac auth login' to try again.");
        break;
      }
    } catch {
      // Network error during poll — keep trying
    }
  }

  if (!authorized && Date.now() >= timeout) {
    spinner.fail("Timed out waiting for authorization.");
  }

  if (authorized) {
    const license = await validateLicense();
    console.log("");
    if (license.email) {
      updateConfig({ user: { email: license.email } });
    }
    if (license.valid) {
      log.success(`Subscription: ${license.status}`);
      if (license.email) log.dim(`  Email: ${license.email}`);
      if (license.subscriptionExpiresAt) {
        log.dim(`  Renews: ${new Date(license.subscriptionExpiresAt).toLocaleDateString()}`);
      }
    } else {
      log.warn("No active subscription. Visit https://isac.dev/pricing to subscribe.");
    }
  }
}

async function showStatus(): Promise<void> {
  const config = readConfig();

  if (!config.apiKey) {
    log.warn("Not logged in. Run: isac auth login");
    return;
  }

  const license = await validateLicense();

  if (license.valid) {
    log.success(`Subscription: ${license.status}`);
    if (license.email) log.dim(`  Email: ${license.email}`);
    if (license.subscriptionExpiresAt) {
      log.dim(`  Renews: ${new Date(license.subscriptionExpiresAt).toLocaleDateString()}`);
    }
    if (license.message) log.dim(`  ${license.message}`);
  } else {
    log.warn(license.message || "No active subscription.");
  }
}

function openBrowser(url: string): void {
  const cmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  exec(`${cmd} "${url}"`, () => {});
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
