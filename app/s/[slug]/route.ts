import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { classifyClick } from "@/lib/analytics/categorize";
import { enrichClassification } from "@/lib/analytics/context7-enrichment";
import { logger } from "@/lib/observability/logger";
import { checkRateLimit, extractClientIp } from "@/lib/security/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Rate-limit by client IP to prevent redirect abuse
  const clientIp = extractClientIp(request);
  const rateLimit = checkRateLimit(`redirect:${clientIp}`);
  if (!rateLimit.allowed) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(
          Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        ),
      },
    });
  }

  const supabase = await createServerSupabaseClient();
  const { data: link, error } = await supabase
    .from("short_links")
    .select("id, destination_url, is_active")
    .eq("slug", slug)
    .single();

  if (error || !link) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!link.is_active) {
    return new NextResponse("Gone", { status: 410 });
  }

  // Classify click from request headers
  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");
  const classification = classifyClick(referrer, userAgent);

  // Attempt Context7 enrichment for ambiguous classifications
  const shouldEnrich =
    classification.sourceCategory === "Unknown" ||
    classification.sourceCategory === "Referral";

  try {
    const enriched = shouldEnrich
      ? await enrichClassification(
          classification.sourceCategory,
          classification.deviceCategory,
          classification.referrerHost,
          userAgent,
        )
      : {
          sourceCategory: classification.sourceCategory,
          deviceCategory: classification.deviceCategory,
          enriched: false,
        };

    // Persist click event before redirecting to avoid losing events.
    const admin = createAdminClient();
    const { error: insertError } = await admin.from("click_events").insert({
      short_link_id: link.id,
      source_category: enriched.sourceCategory,
      device_category: enriched.deviceCategory,
      referrer_host: classification.referrerHost,
      user_agent: userAgent,
      context7_enriched: enriched.enriched,
    });

    if (insertError) {
      logger.error("Failed to record click event", {
        slug,
        error: insertError.message,
      });
    }
  } catch (err: unknown) {
    logger.error("Click event pipeline failed", {
      slug,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return NextResponse.redirect(link.destination_url as string, 307);
}
