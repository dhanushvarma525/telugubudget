
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  RefreshCw,
  Search,
  ExternalLink,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Blog = {
  id: number;
  title: string;
  slug: string;
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

const TITLES_PER_PAGE = 25;

export default function AdminTitlesPage() {
  const router = useRouter();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [copyingAll, setCopyingAll] = useState(false);
  const [copyingFiltered, setCopyingFiltered] = useState(false);

  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedFiltered, setCopiedFiltered] = useState(false);

  const [userEmail, setUserEmail] = useState("");

  // =====================================================
  // GET ACCESS TOKEN
  // =====================================================

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Get session error:", error);
      return null;
    }

    return session?.access_token || null;
  }

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
        console.error("Article titles initialization error:", error);

        if (mounted) {
          router.replace("/admin/login");
        }
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

      const accessToken = await getAccessToken();

      if (!accessToken) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(
        "/api/blogs?admin=true&limit=1000",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-cache",
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        await supabase.auth.signOut();

        router.replace("/admin/login");
        return;
      }

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
      console.error("Article titles load error:", error);

      setBlogs([]);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load article titles."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...blogs]
      .filter((blog) => {
        if (!query) {
          return true;
        }

        return (
          blog.title?.toLowerCase().includes(query) ||
          blog.slug?.toLowerCase().includes(query)
        );
      })
      .filter((blog) => {
        if (category === "All") {
          return true;
        }

        return (
          blog.category?.toLowerCase() ===
          category.toLowerCase()
        );
      })
      .filter((blog) => {
        if (status === "All") {
          return true;
        }

        if (status === "Published") {
          return blog.published === true;
        }

        if (status === "Draft") {
          return blog.published === false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.published_at ||
            a.created_at ||
            a.updated_at
        ).getTime();

        const dateB = new Date(
          b.published_at ||
            b.created_at ||
            b.updated_at
        ).getTime();

        return dateB - dateA;
      });
  }, [blogs, search, category, status]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredBlogs.length / TITLES_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * TITLES_PER_PAGE;

  const endIndex =
    startIndex + TITLES_PER_PAGE;

  const visibleBlogs = filteredBlogs.slice(
    startIndex,
    endIndex
  );

  // =====================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, status]);

  // =====================================================
  // COPY HELPER
  // =====================================================

  async function copyTitles(
    titleList: Blog[],
    type: "all" | "filtered"
  ) {
    const titles = titleList
      .map((blog) => blog.title?.trim())
      .filter(Boolean)
      .join("\n");

    if (!titles) {
      alert("There are no article titles to copy.");
      return;
    }

    try {
      if (type === "all") {
        setCopyingAll(true);
      } else {
        setCopyingFiltered(true);
      }

      await navigator.clipboard.writeText(titles);

      if (type === "all") {
        setCopiedAll(true);

        window.setTimeout(() => {
          setCopiedAll(false);
        }, 2000);
      } else {
        setCopiedFiltered(true);

        window.setTimeout(() => {
          setCopiedFiltered(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Copy titles error:", error);

      alert(
        "Unable to copy titles. Please allow clipboard access in your browser."
      );
    } finally {
      if (type === "all") {
        setCopyingAll(false);
      } else {
        setCopyingFiltered(false);
      }
    }
  }

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setStatus("All");
    setCurrentPage(1);
  }

  const hasFilters =
    search.trim() !== "" ||
    category !== "All" ||
    status !== "All";

  // =====================================================
  // PAGE BUTTONS
  // =====================================================

  function getPageNumbers() {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (safeCurrentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      safeCurrentPage - 1
    );

    const end = Math.min(
      totalPages - 1,
      safeCurrentPage + 1
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (safeCurrentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading article titles...
        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <Link
                href="/admin"
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-zinc-500
                  transition
                  hover:text-zinc-950
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>

              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-950" />

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  AnantaGo Publishing
                </p>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                Article Titles
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Search, filter and copy your article titles.
              </p>

              {userEmail && (
                <p className="mt-2 text-xs text-zinc-400">
                  {userEmail}
                </p>
              )}

            </div>

            <div className="flex flex-wrap items-center gap-2">

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
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
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
                + New Article
              </Link>

            </div>

          </div>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Total Articles
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                  {blogs.length}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-100 p-2.5">
                <FileText className="h-5 w-5 text-zinc-700" />
              </div>

            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Matching Articles
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                  {filteredBlogs.length}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-100 p-2.5">
                <Search className="h-5 w-5 text-zinc-700" />
              </div>

            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-zinc-500">
                  Showing
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                  {visibleBlogs.length}
                </p>
              </div>

              <div className="rounded-lg bg-zinc-100 p-2.5">
                <FileText className="h-5 w-5 text-zinc-700" />
              </div>

            </div>

            <p className="mt-2 text-xs text-zinc-400">
              Page {safeCurrentPage} of {totalPages}
            </p>
          </div>

        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">

          <div className="flex flex-col gap-4">

            {/* SEARCH */}

            <div className="relative">

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
                  setSearch(event.target.value)
                }
                placeholder="Search article titles or slugs..."
                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-zinc-200
                  bg-white
                  pl-10
                  pr-10
                  text-sm
                  text-zinc-950
                  outline-none
                  transition
                  placeholder:text-zinc-400
                  focus:border-zinc-400
                  focus:ring-2
                  focus:ring-zinc-100
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-zinc-400
                    transition
                    hover:text-zinc-900
                  "
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

            </div>

            {/* FILTER ROW */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              {/* CATEGORY */}

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-zinc-200
                  bg-white
                  px-3
                  text-sm
                  font-medium
                  text-zinc-700
                  outline-none
                  transition
                  focus:border-zinc-400
                  focus:ring-2
                  focus:ring-zinc-100
                  sm:w-48
                "
              >
                <option value="All">
                  All Categories
                </option>

                {CATEGORIES.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>

              {/* STATUS */}

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-zinc-200
                  bg-white
                  px-3
                  text-sm
                  font-medium
                  text-zinc-700
                  outline-none
                  transition
                  focus:border-zinc-400
                  focus:ring-2
                  focus:ring-zinc-100
                  sm:w-40
                "
              >
                <option value="All">
                  All Status
                </option>

                <option value="Published">
                  Published
                </option>

                <option value="Draft">
                  Draft
                </option>
              </select>

              {/* CLEAR */}

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    inline-flex
                    h-10
                    shrink-0
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
                    text-zinc-600
                    transition
                    hover:bg-zinc-50
                    hover:text-zinc-950
                  "
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              )}

              <div className="hidden flex-1 sm:block" />

              {/* COPY FILTERED */}

              <button
                type="button"
                onClick={() =>
                  copyTitles(
                    filteredBlogs,
                    "filtered"
                  )
                }
                disabled={
                  copyingFiltered ||
                  filteredBlogs.length === 0
                }
                className="
                  inline-flex
                  h-10
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-zinc-200
                  bg-white
                  px-4
                  text-sm
                  font-semibold
                  text-zinc-700
                  transition
                  hover:bg-zinc-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {copiedFiltered ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    Copied
                  </>
                ) : copyingFiltered ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Filtered
                  </>
                )}
              </button>

              {/* COPY ALL */}

              <button
                type="button"
                onClick={() =>
                  copyTitles(blogs, "all")
                }
                disabled={
                  copyingAll ||
                  blogs.length === 0
                }
                className="
                  inline-flex
                  h-10
                  shrink-0
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
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {copiedAll ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : copyingAll ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy All Titles
                  </>
                )}
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            RESULTS
        ================================================= */}

        {visibleBlogs.length > 0 ? (
          <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">

            {/* DESKTOP HEADER */}

            <div
              className="
                hidden
                border-b
                border-zinc-200
                bg-zinc-50
                px-5
                py-3
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-zinc-500
                sm:grid
                sm:grid-cols-[60px_1fr_120px_110px_40px]
                sm:gap-4
              "
            >
              <span>#</span>
              <span>Article Title</span>
              <span>Category</span>
              <span>Status</span>
              <span />
            </div>

            {/* ARTICLE LIST */}

            <div className="divide-y divide-zinc-100">

              {visibleBlogs.map((blog, index) => {
                const number =
                  startIndex + index + 1;

                return (
                  <div
                    key={blog.id}
                    className="
                      group
                      px-4
                      py-4
                      transition
                      hover:bg-zinc-50
                      sm:px-5
                    "
                  >

                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-3
                        sm:grid-cols-[60px_1fr_120px_110px_40px]
                        sm:items-center
                        sm:gap-4
                      "
                    >

                      {/* NUMBER */}

                      <span className="text-xs font-medium text-zinc-400">
                        {number}
                      </span>

                      {/* TITLE */}

                      <div className="min-w-0">

                        <Link
                          href={`/admin/blogs/${blog.slug}/edit`}
                          className="
                            block
                            text-sm
                            font-semibold
                            leading-6
                            text-zinc-950
                            transition
                            hover:text-blue-600
                          "
                        >
                          {blog.title}
                        </Link>

                        <p className="mt-1 truncate text-xs text-zinc-400">
                          {blog.slug}
                        </p>

                      </div>

                      {/* CATEGORY */}

                      <div>

                        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                          {blog.category || "Uncategorized"}
                        </span>

                      </div>

                      {/* STATUS */}

                      <div>

                        {blog.published ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                            <Clock3 className="h-3.5 w-3.5" />
                            Draft
                          </span>
                        )}

                      </div>

                      {/* OPEN */}

                      <div className="hidden sm:flex sm:justify-end">

                        <Link
                          href={`/admin/blogs/${blog.slug}/edit`}
                          className="
                            inline-flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-zinc-400
                            transition
                            hover:bg-zinc-100
                            hover:text-zinc-900
                          "
                          title="Edit article"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          </section>
        ) : (
          <section className="rounded-xl border border-zinc-200 bg-white px-5 py-14 text-center">

            <Search className="mx-auto h-8 w-8 text-zinc-300" />

            <h2 className="mt-3 text-sm font-semibold text-zinc-900">
              No matching articles
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Try changing your search or filters.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-zinc-950
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-zinc-800
                "
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}

          </section>
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {filteredBlogs.length > 0 && totalPages > 1 && (
          <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-zinc-500">
              Showing{" "}
              <span className="font-semibold text-zinc-900">
                {startIndex + 1}
              </span>
              {" "}–{" "}
              <span className="font-semibold text-zinc-900">
                {Math.min(
                  endIndex,
                  filteredBlogs.length
                )}
              </span>
              {" "}of{" "}
              <span className="font-semibold text-zinc-900">
                {filteredBlogs.length}
              </span>
            </p>

            <div className="flex items-center gap-1">

              {/* PREVIOUS */}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                disabled={safeCurrentPage === 1}
                className="
                  inline-flex
                  h-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-zinc-200
                  bg-white
                  px-3
                  text-sm
                  font-medium
                  text-zinc-600
                  transition
                  hover:bg-zinc-50
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Previous
              </button>

              {/* PAGE NUMBERS */}

              <div className="hidden items-center gap-1 sm:flex">

                {getPageNumbers().map(
                  (page, index) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            text-sm
                            text-zinc-400
                          "
                        >
                          …
                        </span>
                      );
                    }

                    const active =
                      page === safeCurrentPage;

                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          setCurrentPage(page)
                        }
                        className={`
                          inline-flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          text-sm
                          font-semibold
                          transition
                          ${
                            active
                              ? "bg-zinc-950 text-white"
                              : "text-zinc-600 hover:bg-zinc-100"
                          }
                        `}
                      >
                        {page}
                      </button>
                    );
                  }
                )}

              </div>

              {/* MOBILE PAGE */}

              <span className="px-2 text-sm font-medium text-zinc-500 sm:hidden">
                {safeCurrentPage} / {totalPages}
              </span>

              {/* NEXT */}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                disabled={
                  safeCurrentPage === totalPages
                }
                className="
                  inline-flex
                  h-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-zinc-200
                  bg-white
                  px-3
                  text-sm
                  font-medium
                  text-zinc-600
                  transition
                  hover:bg-zinc-50
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Next
              </button>

            </div>

          </section>
        )}

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div className="mt-8 border-t border-zinc-200 pt-5">
          <p className="text-xs text-zinc-400">
            AnantaGo Publishing Dashboard · Article Titles
          </p>
        </div>

      </div>

    </main>
  );
}

