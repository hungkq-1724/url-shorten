"use client";

import type { CategoryBreakdown } from "@/lib/analytics/aggregate";

interface BreakdownCardsProps {
  sourceBreakdown: CategoryBreakdown[];
  deviceBreakdown: CategoryBreakdown[];
}

export function BreakdownCards({
  sourceBreakdown,
  deviceBreakdown,
}: BreakdownCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <BreakdownCard title="Sources" items={sourceBreakdown} />
      <BreakdownCard title="Devices" items={deviceBreakdown} />
    </div>
  );
}

interface BreakdownCardProps {
  title: string;
  items: CategoryBreakdown[];
}

function BreakdownCard({ title, items }: BreakdownCardProps) {
  const total = items.reduce((sum, i) => sum + i.clicks, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const pct = total > 0 ? (item.clicks / total) * 100 : 0;
            return (
              <li key={item.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.category}</span>
                  <span className="font-medium tabular-nums text-gray-900">
                    {item.clicks.toLocaleString()}
                    <span className="ml-1 text-xs text-gray-400">
                      ({pct.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-cyan"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
