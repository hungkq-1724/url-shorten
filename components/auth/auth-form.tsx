"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        router.replace("/dashboard");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Dang ky thanh cong. Vui long kiem tra email de xac nhan tai khoan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSignIn = mode === "sign-in";

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {isSignIn ? "Dang nhap" : "Dang ky"}
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        {isSignIn
          ? "Dang nhap de tao short link va xem analytics."
          : "Tao tai khoan moi de bat dau su dung URL Shortener."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-ink"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-md bg-cyan px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan/90 disabled:opacity-50"
        >
          {isSubmitting
            ? "Please wait..."
            : isSignIn
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>

      {errorMessage && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      <div className="mt-6 text-sm text-gray-600">
        {isSignIn ? "Chua co tai khoan?" : "Da co tai khoan?"}{" "}
        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-semibold text-cyan hover:underline"
        >
          {isSignIn ? "Dang ky" : "Dang nhap"}
        </Link>
      </div>
    </div>
  );
}
