import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function SignInPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-12">
      <div className="w-full">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-gray-600 hover:text-cyan"
        >
          ← Back to home
        </Link>
        <AuthForm mode="sign-in" />
      </div>
    </main>
  );
}
