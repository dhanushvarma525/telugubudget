
"use client";

import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    console.log("LOGIN BUTTON CLICKED");

    setError("");
    setLoading(true);

    try {
      const cleanEmail = email.trim();

      console.log("Attempting Supabase login...");
      console.log("Email:", cleanEmail);

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginError) {
        console.error(
          "SUPABASE LOGIN ERROR:",
          loginError
        );

        setError(loginError.message);
        return;
      }

      console.log(
        "SUPABASE LOGIN SUCCESS:",
        data.user?.email
      );

      /*
       * Supabase login has succeeded.
       *
       * Use a full browser navigation instead of
       * router.replace() so we can completely
       * reload the admin dashboard.
       */
      console.log(
        "Redirecting to /admin/blogs..."
      );

      window.location.href = "/admin/blogs";
    } catch (error) {
      console.error(
        "ADMIN LOGIN UNEXPECTED ERROR:",
        error
      );

      setError(
        "Something went wrong while signing in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-950">
            <LockKeyhole className="h-6 w-6" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            AnantaGo
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Admin Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">

          <div className="mb-7">
            <h2 className="text-xl font-semibold text-white">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Sign in to manage your AnantaGo publication.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@example.com"
                autoComplete="email"
                required
                disabled={loading}
                className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-zinc-500 transition hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>

              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-3 text-sm leading-relaxed text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

          </form>

          <p className="mt-6 text-center text-xs leading-5 text-zinc-500">
            AnantaGo Admin · AI • TECH • DIGITAL LIFE
          </p>

        </div>
      </div>
    </main>
  );
}

