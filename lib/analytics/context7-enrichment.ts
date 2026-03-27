import { env, isContext7Enabled } from "@/lib/env";
import { logger } from "@/lib/observability/logger";
import type { SourceCategory, DeviceCategory } from "./categorize";

export interface EnrichmentResult {
  sourceCategory: SourceCategory;
  deviceCategory: DeviceCategory;
  enriched: boolean;
}

export interface EnrichmentBatchResult {
  processed: number;
  enriched: number;
  fallbackUsed: number;
}

/**
 * Call Context7 MCP for single-record classification guidance.
 * Falls back to provided local values when Context7 is unavailable.
 */
export async function enrichClassification(
  localSource: SourceCategory,
  localDevice: DeviceCategory,
  referrerHost: string | null,
  rawUserAgent: string | null,
): Promise<EnrichmentResult> {
  if (!isContext7Enabled() || !env.CONTEXT7_MCP_URL) {
    return {
      sourceCategory: localSource,
      deviceCategory: localDevice,
      enriched: false,
    };
  }

  try {
    const response = await fetch(`${env.CONTEXT7_MCP_URL}/classify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.CONTEXT7_MCP_TOKEN
          ? { Authorization: `Bearer ${env.CONTEXT7_MCP_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ referrerHost, userAgent: rawUserAgent }),
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      logger.warn("Context7 returned non-OK response", {
        status: response.status,
        referrerHost,
      });
      return {
        sourceCategory: localSource,
        deviceCategory: localDevice,
        enriched: false,
      };
    }

    const data = (await response.json()) as {
      sourceCategory?: string;
      deviceCategory?: string;
    };

    return {
      sourceCategory: (data.sourceCategory as SourceCategory) ?? localSource,
      deviceCategory: (data.deviceCategory as DeviceCategory) ?? localDevice,
      enriched: true,
    };
  } catch (error) {
    logger.warn("Context7 enrichment failed, using local fallback", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      sourceCategory: localSource,
      deviceCategory: localDevice,
      enriched: false,
    };
  }
}
