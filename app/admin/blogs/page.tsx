"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock3,
  Plus,
  List,
  RefreshCw,
  LogOut,
  Sparkles,
  Cpu,
  Lightbulb,
  Smartphone,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Blog = {
  id: number;
  title: string;
  category: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const CATEGORIES = [
  "AI",
  "Tech",
  "How-To",
  "Apps",
  "Security",
  "Explained",
];

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  AI: Sparkles,
  Tech: Cpu,
  "How-To": Lightbulb,
  Apps: Smartphone,
  Security: ShieldCheck,
  Explained: BookOpen,
};

export default function AdminBlogsPage() {
  const router = useRouter();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // =====================================================
  // AUTH + LOAD
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.replace("/admin/login");
          return;
        }

        if (!mounted) {
          return;
        }

        setUserEmail(user.email || "");

        await loadBlogs();
      } catch (error) {
        console.error(
          "Admin initialization error:",
          error
        );

        router.replace("/admin/login");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [router]);

  // =====================================================
  // LOAD BLOGS
  // =====================================================

  async function loadBlogs() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/blogs?admin=true&limit=100",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load articles."
        );
      }

      const blogList = Array.isArray(data?.blogs)
        ? data.blogs
        : Array.isArray(data)
        ? data
        : [];

      setBlogs(blogList);
    } catch (error) {
      console.error(
        "Dashboard load error:",
        error
      );

      setBlogs([]);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SIGN OUT
  // =====================================================

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
    }
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalArticles = blogs.length;

  const publishedArticles = blogs.filter(
    (blog) => blog.published === true
  ).length;

  const draftArticles = blogs.filter(
    (blog) => blog.published === false
  ).length;

  function categoryCount(category: string) {
    return blogs.filter(
      (blog) =>
        blog.category?.toLowerCase() ===
        category.toLowerCase()
    ).length;
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <RefreshCw className="h-4 w-4 animate-spin" />

          Loading publishing dashboard...
        </div>
      </main>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* BRAND / TITLE */}

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-950" />

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  AnantaGo Publishing
                </p>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Manage your articles and publishing activity.
              </p>

              {userEmail && (
                <p className="mt-2 text-xs text-zinc-400">
                  {userEmail}
                </p>
              )}
            </div>

            {/* HEADER ACTIONS */}

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={loadBlogs}
                disabled={loading}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-zinc-200
                  bg-white
                  px-3
                  text-sm
                  font-medium
                  text-zinc-700
                  transition
                  hover:bg-zinc-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                title="Refresh dashboard"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>

              <Link
                href="/admin/blogs/new"
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-zinc-950
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-zinc-800
                "
              >
                <Plus className="h-4 w-4" />

                New Article
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="
                  inline-flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-red-200
                  bg-white
                  text-red-600
                  transition
                  hover:bg-red-50
                "
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>
          </div>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

        {/* =================================================
            PRIMARY STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* TOTAL */}

          <Link
            href="/admin/blogs/all"
            className="
              group
              rounded-xl
              border
              border-zinc-200
              bg-white
              p-5
              transition
              hover:border-zinc-300
              hover:shadow-sm
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Total Articles
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                  {totalArticles}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-100 p-2.5">
                <FileText className="h-5 w-5 text-zinc-700" />
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-900">
              View all articles →
            </p>
          </Link>

          {/* PUBLISHED */}

          <Link
            href="/admin/blogs/all?status=published"
            className="
              group
              rounded-xl
              border
              border-zinc-200
              bg-white
              p-5
              transition
              hover:border-zinc-300
              hover:shadow-sm
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Published
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                  {publishedArticles}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-100 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-zinc-700" />
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-900">
              View published articles →
            </p>
          </Link>

          {/* DRAFTS */}

          <Link
            href="/admin/blogs/drafts"
            className="
              group
              rounded-xl
              border
              border-zinc-200
              bg-white
              p-5
              transition
              hover:border-zinc-300
              hover:shadow-sm
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Drafts
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                  {draftArticles}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-100 p-2.5">
                <Clock3 className="h-5 w-5 text-zinc-700" />
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-zinc-500 group-hover:text-zinc-900">
              Manage drafts →
            </p>
          </Link>

        </section>

        {/* =================================================
            CATEGORY STATISTICS
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">
              Articles by Category
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Overview of your publishing categories.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

            {CATEGORIES.map((category) => {
              const Icon =
                CATEGORY_ICONS[category];

              const count =
                categoryCount(category);

              return (
                <Link
                  key={category}
                  href={`/admin/blogs/all?category=${encodeURIComponent(
                    category
                  )}`}
                  className="
                    group
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    p-4
                    transition
                    hover:border-zinc-300
                    hover:shadow-sm
                  "
                >

                  <div className="flex items-center justify-between">

                    <div className="rounded-lg bg-zinc-100 p-2">
                      <Icon className="h-4 w-4 text-zinc-700" />
                    </div>

                    <span className="text-2xl font-bold text-zinc-950">
                      {count}
                    </span>

                  </div>

                  <p className="mt-4 text-sm font-semibold text-zinc-900">
                    {category}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {count === 1
                      ? "article"
                      : "articles"}
                  </p>

                </Link>
              );
            })}

          </div>

        </section>

        {/* =================================================
            MANAGEMENT
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">
              Manage Content
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Keep article management separate from your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* ALL ARTICLES */}

            <Link
              href="/admin/blogs/all"
              className="
                group
                flex
                items-center
                gap-4
                rounded-xl
                border
                border-zinc-200
                bg-white
                p-5
                transition
                hover:border-zinc-300
                hover:shadow-sm
              "
            >
              <div className="rounded-xl bg-zinc-100 p-3">
                <List className="h-5 w-5 text-zinc-700" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-zinc-950">
                  All Articles
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  Search, edit and delete articles
                </p>
              </div>

              <span className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-900">
                →
              </span>
            </Link>

            {/* DRAFTS */}

            <Link
              href="/admin/blogs/drafts"
              className="
                group
                flex
                items-center
                gap-4
                rounded-xl
                border
                border-zinc-200
                bg-white
                p-5
                transition
                hover:border-zinc-300
                hover:shadow-sm
              "
            >
              <div className="rounded-xl bg-zinc-100 p-3">
                <Clock3 className="h-5 w-5 text-zinc-700" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-zinc-950">
                  Drafts
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  Review and publish drafts
                </p>
              </div>

              <span className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-900">
                →
              </span>
            </Link>

            {/* NEW ARTICLE */}

            <Link
              href="/admin/blogs/new"
              className="
                group
                flex
                items-center
                gap-4
                rounded-xl
                border
                border-zinc-900
                bg-zinc-950
                p-5
                text-white
                transition
                hover:bg-zinc-800
              "
            >
              <div className="rounded-xl bg-white/10 p-3">
                <Plus className="h-5 w-5 text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">
                  New Article
                </h3>

                <p className="mt-1 text-xs text-zinc-400">
                  Create a new publication
                </p>
              </div>

              <span className="text-zinc-400 transition group-hover:translate-x-1">
                →
              </span>
            </Link>

          </div>

        </section>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div className="mt-8 border-t border-zinc-200 pt-5">
          <p className="text-xs text-zinc-400">
            AnantaGo Publishing Dashboard
          </p>
        </div>

      </div>

    </main>
  );
}