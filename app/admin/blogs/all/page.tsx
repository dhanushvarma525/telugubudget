"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Blog = {
  id: number;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

const BLOGS_PER_PAGE = 20;

const categories = [
  "All",
  "AI",
  "Tech",
  "How-To",
  "Apps",
  "Security",
  "Explained",
];

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default function AllArticlesPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const initialCategory =
    searchParams.get(
      "category"
    ) || "All";

  const initialStatus =
    searchParams.get(
      "status"
    ) || "all";

  const [blogs, setBlogs] =
    useState<Blog[]>([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState(initialCategory);

  const [status, setStatus] =
    useState(initialStatus);

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [publishingId, setPublishingId] =
    useState<number | null>(null);

  async function loadBlogs(
    requestedPage = page
  ) {
    try {
      setLoading(true);
      setError("");

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.replace(
          "/admin/login"
        );
        return;
      }

      const params =
        new URLSearchParams();

      params.set(
        "admin",
        "true"
      );

      params.set(
        "limit",
        String(BLOGS_PER_PAGE)
      );

      params.set(
        "page",
        String(requestedPage)
      );

      if (
        search.trim()
      ) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (
        category &&
        category !== "All"
      ) {
        params.set(
          "category",
          category
        );
      }

      if (
        status &&
        status !== "all"
      ) {
        params.set(
          "status",
          status
        );
      }

      const response =
        await fetch(
          `/api/blogs?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to load articles."
        );
      }

      setBlogs(
        data.blogs || []
      );

      setTotal(
        data.total || 0
      );

      setTotalPages(
        Math.max(
          1,
          data.totalPages || 1
        )
      );

      setPage(
        data.page ||
          requestedPage
      );
    } catch (err) {
      console.error(
        "LOAD ARTICLES ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load articles."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs(1);
  }, [
    category,
    status,
  ]);

  async function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    loadBlogs(1);
  }

  async function handleDelete(
    id: number,
    title: string
  ) {
    const confirmed =
      window.confirm(
        `Delete "${title}" permanently?\n\nThis cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response =
        await fetch(
          `/api/blogs?id=${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to delete article."
        );
      }

      await loadBlogs(
        blogs.length === 1 &&
          page > 1
          ? page - 1
          : page
      );
    } catch (err) {
      console.error(
        "DELETE ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete article."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handlePublish(
    id: number
  ) {
    try {
      setPublishingId(id);

      const response =
        await fetch(
          "/api/blogs",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id,
              published: true,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to publish article."
        );
      }

      await loadBlogs(
        page
      );
    } catch (err) {
      console.error(
        "PUBLISH ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Failed to publish article."
      );
    } finally {
      setPublishingId(null);
    }
  }

  function goToPage(
    nextPage: number
  ) {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    loadBlogs(
      nextPage
    );
  }

  const pageNumbers =
    useMemo(() => {
      const pages: (
        | number
        | string
      )[] = [];

      if (totalPages <= 7) {
        for (
          let i = 1;
          i <= totalPages;
          i++
        ) {
          pages.push(i);
        }

        return pages;
      }

      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      const start =
        Math.max(
          2,
          page - 1
        );

      const end =
        Math.min(
          totalPages - 1,
          page + 1
        );

      for (
        let i = start;
        i <= end;
        i++
      ) {
        pages.push(i);
      }

      if (
        page <
        totalPages - 2
      ) {
        pages.push("...");
      }

      pages.push(
        totalPages
      );

      return pages;
    }, [
      page,
      totalPages,
    ]);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/blogs"
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              All Articles
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Search, edit and manage all
              your articles.
            </p>
          </div>

          <Link
            href="/admin/blogs/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </div>

        {/* Search */}

        <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={
              handleSearch
            }
            className="flex flex-col gap-3 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search articles..."
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
              />
            </div>

            <select
              value={category}
              onChange={(event) => {
                setCategory(
                  event.target.value
                );
                setPage(1);
              }}
              className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-400"
            >
              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value
                );
                setPage(1);
              }}
              className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-700 outline-none focus:border-zinc-400"
            >
              <option value="all">
                All Status
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Drafts
              </option>
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              <Search className="h-4 w-4" />
              Search
            </button>

            <button
              type="button"
              onClick={() =>
                loadBlogs(page)
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </form>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Count */}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {loading
              ? "Loading..."
              : `${total} article${
                  total === 1
                    ? ""
                    : "s"
                }`}
          </p>
        </div>

        {/* Articles */}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <FileText className="h-10 w-10 text-zinc-300" />

              <h2 className="mt-4 text-base font-semibold text-zinc-900">
                No articles found
              </h2>

              <p className="mt-1 max-w-md text-sm text-zinc-500">
                Try another search or create
                your first article.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {blogs.map(
                (blog) => (
                  <div
                    key={blog.id}
                    className="p-4 transition hover:bg-zinc-50 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                            {blog.category}
                          </span>

                          {blog.published ? (
                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Published
                            </span>
                          ) : (
                            <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Draft
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 line-clamp-2 text-base font-semibold text-zinc-950 sm:text-lg">
                          {blog.title}
                        </h2>

                        <p className="mt-1 truncate text-xs text-zinc-400">
                          /blog/{blog.slug}
                        </p>

                        <p className="mt-2 text-xs text-zinc-500">
                          Created{" "}
                          {formatDate(
                            blog.created_at
                          )}
                          {blog.published_at &&
                            ` • Published ${formatDate(
                              blog.published_at
                            )}`}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/blogs/${blog.id}/edit`}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </Link>

                        {!blog.published && (
                          <button
                            type="button"
                            onClick={() =>
                              handlePublish(
                                blog.id
                              )
                            }
                            disabled={
                              publishingId ===
                              blog.id
                            }
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {publishingId ===
                            blog.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <span>
                                Publish
                              </span>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
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
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId ===
                          blog.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}

                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Pagination */}

        {!loading &&
          totalPages > 1 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  goToPage(
                    page - 1
                  )
                }
                disabled={page === 1}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {pageNumbers.map(
                (
                  pageNumber,
                  index
                ) =>
                  pageNumber ===
                  "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 text-sm text-zinc-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() =>
                        goToPage(
                          pageNumber as number
                        )
                      }
                      className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                        pageNumber ===
                        page
                          ? "bg-zinc-950 text-white"
                          : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {
                        pageNumber
                      }
                    </button>
                  )
              )}

              <button
                type="button"
                onClick={() =>
                  goToPage(
                    page + 1
                  )
                }
                disabled={
                  page ===
                  totalPages
                }
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
      </div>
    </main>
  );
}