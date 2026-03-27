"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyticsSeries } from "@/components/analytics/analytics-series";
import { BreakdownCards } from "@/components/analytics/breakdown-cards";
import type { AnalyticsSummary } from "@/lib/analytics/aggregate";

type Range = "day" | "week";

interface LinkAnalyticsProps {
  linkId: string;
}

export function LinkAnalytics({ linkId }: LinkAnalyticsProps) {
  const [range, setRange] = useState<Range>("day");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (r: Range) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/analytics/link/${encodeURIComponent(linkId)}?range=${r}`,
        );
        if (!res.ok) throw new Error("Failed to load analytics");
        const data = (await res.json()) as AnalyticsSummary;
        setSummary(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics",
        );
      } finally {
        setLoading(false);
      }
    },
    [linkId],
  );

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Link Analytics</h3>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
          <RangeButton active={range === "day"} onClick={() => setRange("day")}>
            Daily
          </RangeButton>
          <RangeButton
            active={range === "week"}
            onClick={() => setRange("week")}
          >
            Weekly
          </RangeButton>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 rounded-lg bg-gray-100" />
          <div className="h-44 rounded-lg bg-gray-100" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-36 rounded-lg bg-gray-100" />
            <div className="h-36 rounded-lg bg-gray-100" />
          </div>
        </div>
      ) : summary ? (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Clicks</p>
            <p className="text-3xl font-bold tabular-nums">
              {summary.totals.clicks.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {summary.from} — {summary.to}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <AnalyticsSeries series={summary.series} range={range} />
          </div>

          <BreakdownCards
            sourceBreakdown={summary.breakdown.source}
            deviceBreakdown={summary.breakdown.device}
          />
        </>
      ) : null}
    </section>
  );
}

function RangeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan ${
        active
          ? "bg-cyan text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
