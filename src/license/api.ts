const API_BASE = "https://thedevhype.online";

interface DeviceCodeResponse {
  userCode: string;
  deviceCode: string;
  expiresIn: number;
  interval: number;
  verificationUri: string;
}

interface PollResponse {
  status: "pending" | "authorized" | "expired";
  apiKey?: string;
  userId?: string;
}

interface ValidateResponse {
  valid: boolean;
  status: string;
  email?: string;
  subscriptionExpiresAt?: string;
  referralCode?: string;
  message?: string;
}

interface ReferralStatsResponse {
  referralCode: string;
  shareUrl: string;
  referralCredits: number;
}

interface PortalResponse {
  url: string;
}

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const res = await fetch(`${API_BASE}/api/device/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to request device code: ${res.status}`);
  }

  return res.json();
}

export async function pollDeviceCode(deviceCode: string): Promise<PollResponse> {
  const res = await fetch(`${API_BASE}/api/device/poll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceCode }),
  });

  if (!res.ok) {
    throw new Error(`Poll failed: ${res.status}`);
  }

  return res.json();
}

export async function validateLicenseRemote(apiKey: string): Promise<ValidateResponse> {
  const res = await fetch(`${API_BASE}/api/license/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  if (!res.ok && res.status !== 401) {
    throw new Error(`Validation failed: ${res.status}`);
  }

  return res.json();
}

export async function fetchReferralStats(apiKey: string): Promise<ReferralStatsResponse> {
  const res = await fetch(`${API_BASE}/api/referral/stats`, {
    headers: { "x-api-key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch referral stats: ${res.status}`);
  }

  return res.json();
}

export async function fetchBillingPortalUrl(apiKey: string): Promise<PortalResponse> {
  const res = await fetch(`${API_BASE}/api/stripe/portal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to get billing portal: ${res.status}`);
  }

  return res.json();
}
