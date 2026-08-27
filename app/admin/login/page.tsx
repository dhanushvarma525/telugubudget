"use client";

import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000;

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

    setError("");
    setLoading(true);

    try {
      const cleanEmail = email.trim();

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
       * Start the 24-hour admin login period.
       *
       * The timestamp is stored only after
       * Supabase authentication succeeds.
       */
      localStorage.setItem(
        "anatago_admin_login_time",
        Date.now().toString()
      );

      /*
       * Full browser navigation ensures the
       * admin dashboard completely reloads.
       */
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
    <main className="relative flex min-h-screen overflow-hidden bg-[#08080a] text-white">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Large glow */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/[0.035] blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-white/[0.025] blur-3xl" />

        {/* Grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
            [background-size:50px_50px]
          "
        />

        {/* Top line */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-center px-5 py-10 sm:px-8">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">

          {/* =================================================
              LEFT BRAND PANEL
          ================================================== */}

          <div className="relative hidden min-h-[650px] overflow-hidden border-r border-white/10 bg-white/[0.02] p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">

            {/* Decorative circles */}

            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-white/[0.06]" />

            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/[0.05]" />

            <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-white/[0.05]" />

            {/* Brand */}

            <div className="relative">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black shadow-lg">

                  <span className="text-lg font-black">
                    A
                  </span>

                </div>

                <div>

                  <p className="text-lg font-black tracking-tight text-white">
                    AnantaGo
                  </p>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Publishing
                  </p>

                </div>

              </div>

            </div>

            {/* Main message */}

            <div className="relative">

              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">

                <Sparkles className="h-5 w-5 text-white" />

              </div>

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                Editorial workspace
              </p>

              <h2 className="mt-4 max-w-md text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white xl:text-5xl">
                Ideas worth
                <br />
                <span className="text-zinc-500">
                  publishing.
                </span>
              </h2>

              <p className="mt-6 max-w-sm text-sm leading-7 text-zinc-400">
                Manage your stories, publish useful technology
                content and keep AnantaGo moving forward.
              </p>

              {/* Categories */}

              <div className="mt-8 flex flex-wrap gap-2">

                {[
                  "AI",
                  "TECH",
                  "HOW-TO",
                  "APPS",
                  "SECURITY",
                  "EXPLAINED",
                ].map((item) => (
                  <span
                    key={item}
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.035]
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      tracking-[0.12em]
                      text-zinc-400
                    "
                  >
                    {item}
                  </span>
                ))}

              </div>

            </div>

            {/* Footer */}

            <div className="relative flex items-center justify-between border-t border-white/10 pt-6">

              <p className="text-xs text-zinc-600">
                AnantaGo Admin
              </p>

              <div className="flex items-center gap-2 text-xs text-zinc-500">

                <ShieldCheck className="h-4 w-4" />

                Secure workspace

              </div>

            </div>

          </div>

          {/* =================================================
              LOGIN PANEL
          ================================================== */}

          <div className="flex min-h-[650px] items-center justify-center p-6 sm:p-10 lg:p-12">

            <div className="w-full max-w-md">

              {/* Mobile Brand */}

              <div className="mb-10 flex items-center justify-center lg:hidden">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black shadow-lg">

                    <span className="text-lg font-black">
                      A
                    </span>

                  </div>

                  <div>

                    <p className="text-lg font-black tracking-tight text-white">
                      AnantaGo
                    </p>

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                      Publishing
                    </p>

                  </div>

                </div>

              </div>

              {/* Heading */}

              <div className="mb-8">

                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">

                  <LockKeyhole className="h-5 w-5 text-white" />

                </div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Admin access
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
                  Welcome back.
                </h1>

                <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
                  Sign in to manage your AnantaGo publication
                  and create your next story.
                </p>

              </div>

              {/* =================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-zinc-400"
                  >
                    Email address
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
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.045]
                      px-4
                      text-sm
                      text-white
                      outline-none
                      transition
                      duration-200
                      placeholder:text-zinc-600
                      hover:border-white/20
                      focus:border-white/30
                      focus:bg-white/[0.06]
                      focus:ring-4
                      focus:ring-white/[0.04]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  />

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-xs font-bold uppercase tracking-[0.12em] text-zinc-400"
                    >
                      Password
                    </label>

                  </div>

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
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.045]
                        px-4
                        pr-12
                        text-sm
                        text-white
                        outline-none
                        transition
                        duration-200
                        placeholder:text-zinc-600
                        hover:border-white/20
                        focus:border-white/30
                        focus:bg-white/[0.06]
                        focus:ring-4
                        focus:ring-white/[0.04]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
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
                      className="
                        absolute
                        right-1
                        top-1
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-lg
                        text-zinc-500
                        transition
                        hover:bg-white/[0.06]
                        hover:text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>

                </div>

                {/* ERROR */}

                {error && (
                  <div
                    role="alert"
                    className="
                      rounded-xl
                      border
                      border-red-500/20
                      bg-red-500/[0.08]
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-red-300
                    "
                  >
                    {error}
                  </div>
                )}

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-5
                    text-sm
                    font-bold
                    text-black
                    shadow-[0_10px_30px_rgba(255,255,255,0.08)]
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-zinc-200
                    hover:shadow-[0_15px_35px_rgba(255,255,255,0.12)]
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      <span>
                        Signing in...
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Sign in to dashboard
                      </span>

                      <ArrowRight
                        className="
                          h-4
                          w-4
                          transition-transform
                          duration-200
                          group-hover:translate-x-1
                        "
                      />
                    </>
                  )}

                </button>

              </form>

              {/* =================================================
                  SECURITY NOTE
              ================================================== */}

              <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.025] p-4">

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">

                    <ShieldCheck className="h-4 w-4 text-zinc-300" />

                  </div>

                  <div>

                    <p className="text-xs font-semibold text-zinc-300">
                      Protected admin access
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                      For security, your admin login expires
                      after 24 hours and you will need to
                      sign in again.
                    </p>

                  </div>

                </div>

              </div>

              {/* Bottom */}

              <p className="mt-7 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-700">
                AI · TECH · DIGITAL LIFE
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}