import { readConfig, updateConfig, type LicenseCache } from "./store.js";
import { validateLicenseRemote } from "./api.js";

export interface LicenseStatus {
  valid: boolean;
  status?: string;
  email?: string;
  subscriptionExpiresAt?: string;
  message?: string;
}

const FRESH_CACHE_MS = 24 * 60 * 60 * 1000; // 24 hours
const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function validateLicense(): Promise<LicenseStatus> {
  const config = readConfig();

  if (!config.apiKey) {
    return { valid: false, message: "Not authenticated. Run: isac auth login" };
  }

  // Try remote validation
  try {
    const result = await validateLicenseRemote(config.apiKey);

    const cache: LicenseCache = {
      valid: result.valid,
      status: result.status,
      email: result.email,
      subscriptionExpiresAt: result.subscriptionExpiresAt,
      cachedAt: new Date().toISOString(),
    };
    updateConfig({ licenseCache: cache });

    return result;
  } catch {
    // Network error — fall back to cache
    return validateFromCache(config.licenseCache);
  }
}

function validateFromCache(cache: LicenseCache | undefined): LicenseStatus {
  if (!cache) {
    return {
      valid: false,
      message: "No cached license. Connect to the internet and try again.",
    };
  }

  const cacheAge = Date.now() - new Date(cache.cachedAt).getTime();

  if (cacheAge < FRESH_CACHE_MS && cache.valid) {
    return {
      valid: true,
      status: cache.status,
      email: cache.email,
      subscriptionExpiresAt: cache.subscriptionExpiresAt,
      message: "Using cached license (offline mode)",
    };
  }

  if (cacheAge < GRACE_PERIOD_MS && cache.valid) {
    return {
      valid: true,
      status: cache.status,
      email: cache.email,
      subscriptionExpiresAt: cache.subscriptionExpiresAt,
      message: "Offline grace period — connect soon to re-validate",
    };
  }

  return {
    valid: false,
    message: "License cache expired. Connect to the internet and try again.",
  };
}
