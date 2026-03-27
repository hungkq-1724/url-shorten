"use client";

import type { TopLinkItem } from "@/lib/analytics/aggregate";

interface TopLinksTableProps {
  items: TopLinkItem[];
}

export function TopLinksTable({ items }: TopLinksTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No click data to rank links
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Short URL</th>
            <th className="px-4 py-3">Destination</th>
            <th className="px-4 py-3 text-right">Clicks</th>
            <th className="px-4 py-3 text-right">Last Click</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr key={item.linkId} className="hover:bg-gray-50">
              <td className="px-4 py-3 tabular-nums text-gray-400">{i + 1}</td>
              <td className="px-4 py-3">
                <a
                  href={`/links/${item.linkId}`}
                  className="font-mono text-cyan hover:underline focus:outline-none focus:ring-2 focus:ring-cyan rounded"
                >
                  /s/{item.slug}
                </a>
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 text-gray-500">
                {item.destinationUrl}
              </td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {item.totalClicks.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-gray-400">
                {item.lastClickedAt
                  ? formatRelativeTime(item.lastClickedAt)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
