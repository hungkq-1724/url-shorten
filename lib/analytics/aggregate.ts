import type { SupabaseClient } from "@supabase/supabase-js";

export type AnalyticsRange = "day" | "week";

export interface AnalyticsFilter {
  range: AnalyticsRange;
  from?: string | undefined;
  to?: string | undefined;
  linkId?: string | undefined;
}

export interface SeriesBucket {
  bucket: string;
  clicks: number;
}

export interface CategoryBreakdown {
  category: string;
  clicks: number;
}

export interface AnalyticsSummary {
  range: AnalyticsRange;
  from: string;
  to: string;
  totals: { clicks: number };
  series: SeriesBucket[];
  breakdown: {
    source: CategoryBreakdown[];
    device: CategoryBreakdown[];
  };
}

export interface TopLinkItem {
  linkId: string;
  slug: string;
  destinationUrl: string;
  totalClicks: number;
  lastClickedAt: string | null;
}

function defaultDateRange(range: AnalyticsRange): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  if (range === "day") {
    from.setDate(from.getDate() - 30);
  } else {
    from.setDate(from.getDate() - 90);
  }
  return {
    from: from.toISOString().split("T")[0] as string,
    to: to.toISOString().split("T")[0] as string,
  };
}

function toDateTimeRange(
  from: string,
  to: string,
): { fromAt: string; toAt: string } {
  return {
    fromAt: `${from}T00:00:00.000Z`,
    toAt: `${to}T23:59:59.999Z`,
  };
}

function startOfWeekIso(dateTime: string): string {
  const date = new Date(dateTime);
  const day = date.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - diffToMonday);
  return date.toISOString().split("T")[0] as string;
}

export async function getAnalyticsSummary(
  supabase: SupabaseClient,
  ownerId: string,
  filter: AnalyticsFilter,
): Promise<AnalyticsSummary> {
  const defaults = defaultDateRange(filter.range);
  const from = filter.from ?? defaults.from;
  const to = filter.to ?? defaults.to;
  const { fromAt, toAt } = toDateTimeRange(from, to);

  // Get owner's link IDs
  let linkQuery = supabase
    .from("short_links")
    .select("id")
    .eq("owner_id", ownerId);

  if (filter.linkId) {
    linkQuery = linkQuery.eq("id", filter.linkId);
  }

  const { data: links } = await linkQuery;
  const linkIds = (links ?? []).map((l) => (l as { id: string }).id);

  if (linkIds.length === 0) {
    return {
      range: filter.range,
      from,
      to,
      totals: { clicks: 0 },
      series: [],
      breakdown: { source: [], device: [] },
    };
  }

  // Read raw click events to keep analytics up to date without view refresh latency.
  const { data: rows } = await supabase
    .from("click_events")
    .select("short_link_id, clicked_at, source_category, device_category")
    .in("short_link_id", linkIds)
    .gte("clicked_at", fromAt)
    .lte("clicked_at", toAt);

  const typedRows = (rows ?? []) as Array<{
    short_link_id: string;
    clicked_at: string;
    source_category: string;
    device_category: string;
  }>;

  // Aggregate series (by bucket date)
  const seriesMap = new Map<string, number>();
  const sourceMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  let totalClicks = 0;

  for (const row of typedRows) {
    const bucket =
      filter.range === "day"
        ? (row.clicked_at.split("T")[0] ?? "")
        : startOfWeekIso(row.clicked_at);
    const clicks = 1;
    totalClicks += 1;

    seriesMap.set(bucket, (seriesMap.get(bucket) ?? 0) + clicks);
    sourceMap.set(
      row.source_category,
      (sourceMap.get(row.source_category) ?? 0) + clicks,
    );
    deviceMap.set(
      row.device_category,
      (deviceMap.get(row.device_category) ?? 0) + clicks,
    );
  }

  const series = Array.from(seriesMap.entries())
    .map(([bucket, clicks]) => ({ bucket, clicks }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket));

  const sourceBreakdown = Array.from(sourceMap.entries())
    .map(([category, clicks]) => ({ category, clicks }))
    .sort((a, b) => b.clicks - a.clicks);

  const deviceBreakdown = Array.from(deviceMap.entries())
    .map(([category, clicks]) => ({ category, clicks }))
    .sort((a, b) => b.clicks - a.clicks);

  return {
    range: filter.range,
    from,
    to,
    totals: { clicks: totalClicks },
    series,
    breakdown: { source: sourceBreakdown, device: deviceBreakdown },
  };
}

export async function getTopLinks(
  supabase: SupabaseClient,
  ownerId: string,
  filter: AnalyticsFilter & { limit?: number },
): Promise<TopLinkItem[]> {
  const defaults = defaultDateRange(filter.range);
  const from = filter.from ?? defaults.from;
  const to = filter.to ?? defaults.to;
  const limit = Math.min(filter.limit ?? 10, 100);
  const { fromAt, toAt } = toDateTimeRange(from, to);

  // Get owner's links
  const { data: links } = await supabase
    .from("short_links")
    .select("id, slug, destination_url")
    .eq("owner_id", ownerId);

  if (!links || links.length === 0) return [];

  const linkMap = new Map(
    (links as Array<{ id: string; slug: string; destination_url: string }>).map(
      (l) => [l.id, l],
    ),
  );
  const linkIds = Array.from(linkMap.keys());

  // Query click events directly for up-to-date rankings.
  const { data: rows } = await supabase
    .from("click_events")
    .select("short_link_id, clicked_at")
    .in("short_link_id", linkIds)
    .gte("clicked_at", fromAt)
    .lte("clicked_at", toAt);

  // Aggregate clicks per link
  const clicksPerLink = new Map<string, number>();
  for (const row of (rows ?? []) as Array<{
    short_link_id: string;
    clicked_at: string;
  }>) {
    clicksPerLink.set(
      row.short_link_id,
      (clicksPerLink.get(row.short_link_id) ?? 0) + 1,
    );
  }

  const lastClickMap = new Map<string, string>();
  for (const row of (rows ?? []) as Array<{
    short_link_id: string;
    clicked_at: string;
  }>) {
    const current = lastClickMap.get(row.short_link_id);
    if (!current || row.clicked_at > current) {
      lastClickMap.set(row.short_link_id, row.clicked_at);
    }
  }

  // Build ranked list
  return Array.from(clicksPerLink.entries())
    .map(([linkId, totalClicks]) => {
      const link = linkMap.get(linkId);
      return {
        linkId,
        slug: link?.slug ?? "",
        destinationUrl: link?.destination_url ?? "",
        totalClicks,
        lastClickedAt: lastClickMap.get(linkId) ?? null,
      };
    })
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, limit);
}
