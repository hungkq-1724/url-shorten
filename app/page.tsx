import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-16">
      <section className="w-full rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
          URL Shortener
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Shorten links and track clicks in real time
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
          Create short URLs, share instantly, and view source/device breakdowns
          with top links directly in your personal dashboard.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-md bg-cyan px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan/90"
          >
            Sign Up
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
