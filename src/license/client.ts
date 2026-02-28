import { readConfig } from "./store.js";

export interface LicenseStatus {
  valid: boolean;
  key?: string;
  expiresAt?: string;
}

export function validateLicense(): LicenseStatus {
  const config = readConfig();

  if (!config.licenseKey) {
    return { valid: false };
  }

  // Stub: accept any key for now
  return {
    valid: true,
    key: config.licenseKey,
    expiresAt: "2099-12-31",
  };
}
