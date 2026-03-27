import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTopLinks } from "@/lib/analytics/aggregate";
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
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const parsed = querySchema.safeParse({
    range: searchParams.get("range"),
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
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

  const items = await getTopLinks(supabase, user.id, {
    range: parsed.data.range,
    ...(parsed.data.from !== undefined && { from: parsed.data.from }),
    ...(parsed.data.to !== undefined && { to: parsed.data.to }),
    ...(parsed.data.limit !== undefined && { limit: parsed.data.limit }),
  });
  return NextResponse.json({ range: parsed.data.range, items });
}
