import * as UAParser from "ua-parser-js";

export type SourceCategory =
  | "Direct"
  | "Referral"
  | "Social"
  | "Search"
  | "Unknown";
export type DeviceCategory = "Desktop" | "Mobile" | "Tablet" | "Other";

const SOCIAL_HOSTS = new Set([
  "facebook.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "reddit.com",
  "instagram.com",
  "tiktok.com",
  "youtube.com",
  "pinterest.com",
  "threads.net",
]);

const SEARCH_HOSTS = new Set([
  "google.com",
  "bing.com",
  "yahoo.com",
  "duckduckgo.com",
  "baidu.com",
  "yandex.com",
  "ecosia.org",
]);

function extractRootDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split(".");
  if (parts.length <= 2) return parts.join(".");
  return parts.slice(-2).join(".");
}

export function classifySource(referrer: string | null): SourceCategory {
  if (!referrer) return "Direct";

  try {
    const url = new URL(referrer);
    const root = extractRootDomain(url.hostname);
    if (SOCIAL_HOSTS.has(root)) return "Social";
    if (SEARCH_HOSTS.has(root)) return "Search";
    return "Referral";
  } catch {
    return "Unknown";
  }
}

export function classifyDevice(userAgent: string | null): DeviceCategory {
  if (!userAgent) return "Other";

  try {
    const result = UAParser.UAParser(userAgent);
    const deviceType = result.device?.type;

    switch (deviceType) {
      case "mobile":
        return "Mobile";
      case "tablet":
        return "Tablet";
      default:
        return "Desktop";
    }
  } catch {
    return "Other";
  }
}

export interface ClickClassification {
  sourceCategory: SourceCategory;
  deviceCategory: DeviceCategory;
  referrerHost: string | null;
}

export function classifyClick(
  referrer: string | null,
  userAgent: string | null,
): ClickClassification {
  let referrerHost: string | null = null;
  if (referrer) {
    try {
      referrerHost = new URL(referrer).hostname;
    } catch {
      // invalid referrer
    }
  }

  return {
    sourceCategory: classifySource(referrer),
    deviceCategory: classifyDevice(userAgent),
    referrerHost,
  };
}
