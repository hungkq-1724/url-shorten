"use client";

import type { SeriesBucket } from "@/lib/analytics/aggregate";

interface AnalyticsSeriesProps {
  series: SeriesBucket[];
  range: "day" | "week";
}

export function AnalyticsSeries({ series, range }: AnalyticsSeriesProps) {
  if (series.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No click data for this period
      </div>
    );
  }

  const maxClicks = Math.max(...series.map((s) => s.clicks), 1);

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Clicks by {range === "day" ? "Day" : "Week"}
      </h3>
      <div className="flex items-end gap-1" style={{ height: 160 }}>
        {series.map((bucket) => {
          const heightPct = (bucket.clicks / maxClicks) * 100;
          return (
            <div
              key={bucket.bucket}
              className="group relative flex flex-1 flex-col items-center"
              style={{ height: "100%" }}
            >
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-cyan transition-opacity group-hover:opacity-80"
                  style={{ height: `${heightPct}%`, minHeight: 2 }}
                />
              </div>
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-xs text-white opacity-0 shadow group-hover:opacity-100">
                {bucket.clicks} clicks
                <br />
                {formatBucketLabel(bucket.bucket, range)}
              </div>
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="mt-1 flex gap-1">
        {series.map((bucket, i) => {
          const showLabel =
            series.length <= 14 ||
            i === 0 ||
            i === series.length - 1 ||
            i % Math.ceil(series.length / 7) === 0;
          return (
            <div key={bucket.bucket} className="flex-1 text-center">
              {showLabel && (
                <span className="text-[10px] text-gray-400">
                  {formatBucketLabel(bucket.bucket, range)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatBucketLabel(bucket: string, range: "day" | "week"): string {
  const date = new Date(bucket + "T00:00:00");
  if (range === "day") {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  return `W${getISOWeek(date)}`;
}

function getISOWeek(date: Date): number {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}
