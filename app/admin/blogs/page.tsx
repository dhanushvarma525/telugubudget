"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  FileText,
  RefreshCw,
  Search,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  author: string | null;
  published: boolean;
  featured: boolean;
  views: number | null;
  created_at: string;
  updated_at: string;
};

export default function AdminBlogsPage() {
  const router = useRouter();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          console.log("No authenticated admin user.");

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
          "Authentication check failed:",
          error
        );

        router.replace("/admin/login");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  // =====================================================
  // LOAD BLOGS
  // =====================================================

  async function loadBlogs() {
    try {
      const response = await fetch(
        "/api/blogs?limit=100",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load blogs");
      }

      const data = await response.json();

      const blogList = Array.isArray(data)
        ? data
        : Array.isArray(data.blogs)
          ? data.blogs
          : [];

      setBlogs(blogList);
    } catch (error) {
      console.error(
        "Error loading blogs:",
        error
      );

      setBlogs([]);
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
  // DELETE BLOG
  // =====================================================

  async function handleDelete(
    id: number,
    title: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        `/api/blogs?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete blog"
        );
      }

      setBlogs((currentBlogs) =>
        currentBlogs.filter(
          (blog) => blog.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting blog:",
        error
      );

      alert(
        "Failed to delete the article. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredBlogs = blogs.filter(
    (blog) => {
      const query = search
        .toLowerCase()
        .trim();

      if (!query) {
        return true;
      }

      return (
        blog.title
          ?.toLowerCase()
          .includes(query) ||
        blog.category
          ?.toLowerCase()
          .includes(query) ||
        blog.author
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  // =====================================================
  // STATS
  // =====================================================

  const publishedCount = blogs.filter(
    (blog) => blog.published
  ).length;

  const draftCount = blogs.filter(
    (blog) => !blog.published
  ).length;

  const featuredCount = blogs.filter(
    (blog) => blog.featured
  ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <RefreshCw className="h-4 w-4 animate-spin" />

          Checking admin access...
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

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            {/* TITLE */}

            <div>

              <div className="mb-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-zinc-950" />

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  AnantaGo Publishing
                </p>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                Articles
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Manage and publish your technology stories.
              </p>

              {userEmail && (
                <p className="mt-2 text-xs text-zinc-400">
                  {userEmail}
                </p>
              )}

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="flex flex-wrap items-center gap-2">

              {/* REFRESH */}

              <button
                type="button"
                onClick={loadBlogs}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-zinc-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-zinc-700
                  transition
                  hover:border-zinc-300
                  hover:bg-zinc-50
                "
              >
                <RefreshCw className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>

              {/* =================================================
                  NEW ARTICLE
              ================================================= */}

              <Link
                href="/admin/blogs/new"
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  bg-zinc-950
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-zinc-800
                  hover:shadow-lg
                  active:translate-y-0
                "
              >

                <span
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-zinc-950
                  "
                >
                  <Plus
                    className="h-4 w-4"
                    strokeWidth={2.5}
                  />
                </span>

                <span className="whitespace-nowrap text-white">
                  New Article
                </span>

              </Link>

              {/* SIGN OUT */}

              <button
                type="button"
                onClick={handleSignOut}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-red-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-red-600
                  transition
                  hover:bg-red-50
                "
              >

                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Sign Out
                </span>

              </button>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5">

            <div className="mb-3 flex items-center justify-between">

              <span className="text-sm font-medium text-zinc-500">
                Total Articles
              </span>

              <FileText className="h-5 w-5 text-zinc-400" />

            </div>

            <p className="text-2xl font-bold text-zinc-950">
              {blogs.length}
            </p>

          </div>

          {/* PUBLISHED */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5">

            <div className="mb-3 flex items-center justify-between">

              <span className="text-sm font-medium text-zinc-500">
                Published
              </span>

              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

            </div>

            <p className="text-2xl font-bold text-zinc-950">
              {publishedCount}
            </p>

          </div>

          {/* DRAFTS */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5">

            <div className="mb-3 flex items-center justify-between">

              <span className="text-sm font-medium text-zinc-500">
                Drafts
              </span>

              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

            </div>

            <p className="text-2xl font-bold text-zinc-950">
              {draftCount}
            </p>

          </div>

          {/* FEATURED */}

          <div className="rounded-xl border border-zinc-200 bg-white p-5">

            <div className="mb-3 flex items-center justify-between">

              <span className="text-sm font-medium text-zinc-500">
                Featured
              </span>

              <Star className="h-5 w-5 text-zinc-400" />

            </div>

            <p className="text-2xl font-bold text-zinc-950">
              {featuredCount}
            </p>

          </div>

        </section>

        {/* =================================================
            ARTICLES SECTION
        ================================================= */}

        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">

          {/* SECTION HEADER */}

          <div className="border-b border-zinc-200 px-4 py-4 sm:px-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="font-semibold text-zinc-950">
                  All Articles
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {filteredBlogs.length} article
                  {filteredBlogs.length === 1
                    ? ""
                    : "s"}{" "}
                  displayed
                </p>

              </div>

              {/* SEARCH */}

              <div className="relative w-full sm:w-72">

                <Search
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-zinc-400
                  "
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search articles..."
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-zinc-200
                    bg-zinc-50
                    pl-9
                    pr-3
                    text-sm
                    text-zinc-900
                    outline-none
                    transition
                    placeholder:text-zinc-400
                    focus:border-zinc-400
                    focus:bg-white
                  "
                />

              </div>

            </div>

          </div>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filteredBlogs.length === 0 ? (

            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

              <FileText className="mb-3 h-8 w-8 text-zinc-300" />

              <h3 className="font-semibold text-zinc-950">
                {search
                  ? "No articles found"
                  : "No articles yet"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-zinc-500">
                {search
                  ? "Try a different search term."
                  : "Create your first AnantaGo article to get started."}
              </p>

              {!search && (
                <Link
                  href="/admin/blogs/new"
                  className="
                    mt-4
                    inline-flex
                    h-10
                    items-center
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
                  <span className="text-white">
                    Create Article
                  </span>
                </Link>
              )}

            </div>

          ) : (

            /* =================================================
               ARTICLE TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="border-b border-zinc-200 bg-zinc-50">

                  <tr>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Article
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Category
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Date
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-zinc-100">

                  {filteredBlogs.map(
                    (blog) => (

                      <tr
                        key={blog.id}
                        className="transition hover:bg-zinc-50/70"
                      >

                        {/* ARTICLE */}

                        <td className="px-6 py-4">

                          <div className="max-w-lg">

                            <div className="flex items-center gap-2">

                              <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">
                                {blog.title ||
                                  "Untitled Article"}
                              </h3>

                              {blog.featured && (
                                <Star
                                  className="
                                    h-4
                                    w-4
                                    shrink-0
                                    fill-current
                                    text-amber-500
                                  "
                                />
                              )}

                            </div>

                            <p className="mt-1 truncate text-xs text-zinc-400">
                              /{blog.slug}
                            </p>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td className="px-6 py-4">

                          <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                            {blog.category ||
                              "Uncategorized"}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          {blog.published ? (

                            <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700">

                              <span className="h-2 w-2 rounded-full bg-green-500" />

                              Published

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700">

                              <span className="h-2 w-2 rounded-full bg-amber-500" />

                              Draft

                            </span>

                          )}

                        </td>

                        {/* DATE */}

                        <td className="px-6 py-4 text-sm text-zinc-500">

                          {blog.created_at
                            ? new Date(
                                blog.created_at
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}

                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <Link
                              href={`/admin/blogs/${blog.id}/edit`}
                              title="Edit article"
                              className="
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-zinc-200
                                text-zinc-600
                                transition
                                hover:border-zinc-300
                                hover:bg-zinc-100
                                hover:text-zinc-900
                              "
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>

                            <button
                              type="button"
                              title="Delete article"
                              onClick={() =>
                                handleDelete(
                                  blog.id,
                                  blog.title
                                )
                              }
                              disabled={
                                deletingId ===
                                blog.id
                              }
                              className="
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-red-100
                                text-red-500
                                transition
                                hover:bg-red-50
                                hover:text-red-600
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >

                              {deletingId ===
                              blog.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}