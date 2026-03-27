"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyticsSeries } from "@/components/analytics/analytics-series";
import { BreakdownCards } from "@/components/analytics/breakdown-cards";
import { TopLinksTable } from "@/components/analytics/top-links-table";
import type { AnalyticsSummary, TopLinkItem } from "@/lib/analytics/aggregate";

type Range = "day" | "week";

export function DashboardAnalytics() {
  const [range, setRange] = useState<Range>("day");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topLinks, setTopLinks] = useState<TopLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (r: Range) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, topLinksRes] = await Promise.all([
        fetch(`/api/analytics/summary?range=${r}`),
        fetch(`/api/analytics/top-links?range=${r}&limit=10`),
      ]);

      if (!summaryRes.ok || !topLinksRes.ok) {
        throw new Error("Failed to load analytics");
      }

      const [summaryData, topLinksData] = await Promise.all([
        summaryRes.json() as Promise<AnalyticsSummary>,
        topLinksRes.json() as Promise<{ items: TopLinkItem[] }>,
      ]);

      setSummary(summaryData);
      setTopLinks(topLinksData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Analytics Overview</h2>
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
        <AnalyticsSkeleton />
      ) : summary ? (
        <>
          {/* Total clicks */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Clicks</p>
            <p className="text-3xl font-bold tabular-nums">
              {summary.totals.clicks.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {summary.from} — {summary.to}
            </p>
          </div>

          {/* Trend chart */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <AnalyticsSeries series={summary.series} range={range} />
          </div>

          {/* Breakdowns */}
          <BreakdownCards
            sourceBreakdown={summary.breakdown.source}
            deviceBreakdown={summary.breakdown.device}
          />

          {/* Top links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Top Links
            </h3>
            <TopLinksTable items={topLinks} />
          </div>
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

function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-24 rounded-lg bg-gray-100" />
      <div className="h-48 rounded-lg bg-gray-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-lg bg-gray-100" />
        <div className="h-40 rounded-lg bg-gray-100" />
      </div>
      <div className="h-48 rounded-lg bg-gray-100" />
    </div>
  );
}
