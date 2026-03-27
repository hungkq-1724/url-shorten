import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { enrichClassification } from "@/lib/analytics/context7-enrichment";
import { logger } from "@/lib/observability/logger";
import { z } from "zod";
import type {
  SourceCategory,
  DeviceCategory,
} from "@/lib/analytics/categorize";

const requestSchema = z.object({
  batchSize: z.number().int().min(1).max(1000).optional().default(500),
  olderThanMinutes: z.number().int().min(1).optional().default(2),
});

export async function POST(request: NextRequest) {
  // Verify internal service token
  const authHeader = request.headers.get("authorization");
  const expectedToken = env.SUPABASE_SERVICE_ROLE_KEY;

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { batchSize, olderThanMinutes } = parsed.data;
  const admin = createAdminClient();

  // Find un-enriched click events older than threshold
  const cutoff = new Date(
    Date.now() - olderThanMinutes * 60 * 1000,
  ).toISOString();

  const { data: events, error: fetchError } = await admin
    .from("click_events")
    .select("id, source_category, device_category, referrer_host, user_agent")
    .eq("context7_enriched", false)
    .lt("clicked_at", cutoff)
    .limit(batchSize);

  if (fetchError) {
    logger.error("Failed to fetch events for enrichment", {
      error: fetchError.message,
    });
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }

  if (!events || events.length === 0) {
    return NextResponse.json(
      { status: "accepted", processed: 0, updated: 0 },
      { status: 202 },
    );
  }

  let updated = 0;

  for (const event of events) {
    try {
      const result = await enrichClassification(
        event.source_category as SourceCategory,
        event.device_category as DeviceCategory,
        event.referrer_host as string | null,
        event.user_agent as string | null,
      );

      if (result.enriched) {
        const { error: updateError } = await admin
          .from("click_events")
          .update({
            source_category: result.sourceCategory,
            device_category: result.deviceCategory,
            context7_enriched: true,
          })
          .eq("id", event.id);

        if (!updateError) {
          updated++;
        }
      } else {
        // Mark as attempted even if fallback used
        await admin
          .from("click_events")
          .update({ context7_enriched: true })
          .eq("id", event.id);
      }
    } catch (err) {
      logger.warn("Enrichment failed for event", {
        eventId: event.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info("Context7 enrichment batch complete", {
    processed: events.length,
    updated,
  });

  return NextResponse.json(
    { status: "accepted", processed: events.length, updated },
    { status: 202 },
  );
}
