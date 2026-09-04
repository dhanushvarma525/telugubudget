"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  FilePenLine,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
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
};

const BLOGS_PER_PAGE = 20;

function formatDate(
  value: string
) {
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

export default function DraftsPage() {
  const router = useRouter();

  const [blogs, setBlogs] =
    useState<Blog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [publishingId, setPublishingId] =
    useState<number | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  async function loadDrafts(
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
        "status",
        "draft"
      );

      params.set(
        "limit",
        String(BLOGS_PER_PAGE)
      );

      params.set(
        "page",
        String(requestedPage)
      );

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
            "Failed to load drafts."
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
        "LOAD DRAFTS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load drafts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrafts(1);
  }, []);

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

      await loadDrafts(
        blogs.length === 1 &&
          page > 1
          ? page - 1
          : page
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

      await loadDrafts(
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

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
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

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <FilePenLine className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Drafts
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Review and publish unfinished articles.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                loadDrafts(page)
              }
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            <Link
              href="/admin/blogs/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              New Article
            </Link>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Count */}

        <div className="mb-4">
          <p className="text-sm text-zinc-500">
            {loading
              ? "Loading drafts..."
              : `${total} draft${
                  total === 1
                    ? ""
                    : "s"
                }`}
          </p>
        </div>

        {/* Draft list */}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />

              <h2 className="mt-4 text-base font-semibold text-zinc-900">
                No drafts
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                You have no unpublished articles.
              </p>

              <Link
                href="/admin/blogs/new"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Create Article
              </Link>
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

                          <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Draft
                          </span>
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
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}

                          Publish
                        </button>

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
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  loadDrafts(
                    page - 1
                  )
                }
                disabled={page === 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="px-3 text-sm font-medium text-zinc-500">
                Page {page} of{" "}
                {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  loadDrafts(
                    page + 1
                  )
                }
                disabled={
                  page ===
                  totalPages
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
      </div>
    </main>
  );
}