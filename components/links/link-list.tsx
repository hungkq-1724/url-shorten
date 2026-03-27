import type { ShortLink } from "@/lib/links/types";
import { LinkRow } from "./link-row";

interface LinkListProps {
  links: ShortLink[];
}

export function LinkList({ links }: LinkListProps) {
  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No links yet. Create your first short URL above.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
      {links.map((link) => (
        <LinkRow key={link.id} link={link} />
      ))}
    </div>
  );
}
