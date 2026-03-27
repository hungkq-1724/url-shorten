import type { ShortLink } from "@/lib/links/types";

interface LinkRowProps {
  link: ShortLink;
}

export function LinkRow({ link }: LinkRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-sm font-medium text-cyan">
            /s/{link.slug}
          </span>
          {!link.is_active && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
              Inactive
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {link.destination_url}
        </p>
        {link.title && <p className="text-xs text-gray-400">{link.title}</p>}
      </div>
      <div className="ml-4 flex items-center gap-2">
        <a
          href={`/links/${link.id}`}
          className="rounded px-2 py-1 text-xs font-medium text-cyan hover:bg-cyan/10 focus:outline-none focus:ring-2 focus:ring-cyan"
        >
          Analytics
        </a>
      </div>
    </div>
  );
}
