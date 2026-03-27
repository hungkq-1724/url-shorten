import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAnalyticsSummary } from "@/lib/analytics/aggregate";
import { z } from "zod";

const querySchema = z.object({
  range: z.enum(["day", "week"]),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date (YYYY-MM-DD)")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date (YYYY-MM-DD)")
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { linkId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify link ownership
  const { data: link } = await supabase
    .from("short_links")
    .select("id")
    .eq("id", linkId)
    .eq("owner_id", user.id)
    .single();

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const parsed = querySchema.safeParse({
    range: searchParams.get("range"),
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parsed.error.issues.map((i) => i.message),
      },
      { status: 400 },
    );
  }

  const summary = await getAnalyticsSummary(supabase, user.id, {
    ...parsed.data,
    linkId,
  });
  return NextResponse.json(summary);
}
