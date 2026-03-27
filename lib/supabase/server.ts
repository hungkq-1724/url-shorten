import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  console.log("env", env);

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>,
        ) {
          for (const cookie of cookiesToSet) {
            const opts = cookie.options;
            if (opts !== undefined) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cookieStore.set(cookie.name, cookie.value, opts as any);
            } else {
              cookieStore.set(cookie.name, cookie.value);
            }
          }
        },
      },
    },
  );
}
