import { CreateLinkForm } from "@/components/links/create-link-form";
import { LinkList } from "@/components/links/link-list";
import { DashboardAnalytics } from "@/components/analytics/dashboard-analytics";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ShortLink } from "@/lib/links/types";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  let links: ShortLink[] = [];
  const { data } = await supabase
    .from("short_links")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  links = (data as ShortLink[] | null) ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold">Create Short Link</h2>
        <p className="mt-1 text-sm text-gray-500">
          Paste a long URL and get a short one
        </p>
        <div className="mt-4">
          <CreateLinkForm />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">My Links</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your short URLs</p>
        <div className="mt-4">
          <LinkList links={links} />
        </div>
      </section>

      <DashboardAnalytics />
    </div>
  );
}
