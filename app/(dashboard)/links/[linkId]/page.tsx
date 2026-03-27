import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { ShortLink } from "@/lib/links/types";
import { LinkAnalytics } from "@/components/analytics/link-analytics";

interface Props {
  params: Promise<{ linkId: string }>;
}

export default async function LinkDetailPage({ params }: Props) {
  const { linkId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: link } = await supabase
    .from("short_links")
    .select("*")
    .eq("id", linkId)
    .eq("owner_id", user.id)
    .single();

  if (!link) {
    notFound();
  }

  const typedLink = link as unknown as ShortLink;

  return (
    <div className="space-y-6">
      <div>
        <a
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan rounded"
        >
          ← Back to dashboard
        </a>
        <h2 className="mt-2 text-xl font-semibold">
          {typedLink.title ?? typedLink.slug}
        </h2>
        <p className="mt-1 text-sm text-gray-500 break-all">
          {typedLink.destination_url}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono text-sm text-cyan">
            /s/{typedLink.slug}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-xs ${
              typedLink.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {typedLink.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <LinkAnalytics linkId={typedLink.id} />
    </div>
  );
}
