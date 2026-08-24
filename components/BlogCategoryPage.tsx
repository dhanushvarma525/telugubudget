"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Blog = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image?: string | null;
  category?: string;
  author?: string;
  published_at?: string | null;
  created_at?: string | null;
};

type Props = {
  category: string;
  title: string;
  description: string;
};

const BLOGS_PER_PAGE = 10;

export default function BlogCategoryPage({
  category,
  title,
  description,
}: Props) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadBlogs(pageNumber: number) {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        category,
        page: String(pageNumber),
        limit: String(BLOGS_PER_PAGE),
      });

      const response = await fetch(
        `/api/blogs?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const rawText = await response.text();

      let data: any = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        console.error(
          "BLOG CATEGORY API RETURNED NON-JSON:",
          rawText
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Failed to load blogs. Server returned ${response.status}.`
        );
      }

      const nextBlogs = Array.isArray(data?.blogs)
        ? data.blogs
        : [];

      setBlogs(nextBlogs);

      setTotal(
        Number.isFinite(Number(data?.total))
          ? Number(data.total)
          : 0
      );
    } catch (error) {
      console.error(
        "CATEGORY BLOG ERROR:",
        error
      );

      setBlogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs(page);
  }, [page, category]);

  const totalPages = Math.ceil(
    total / BLOGS_PER_PAGE
  );

  function changePage(newPage: number) {
    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {
      return;
    }

    setPage(newPage);

    /*
     * Use instant scrolling here.
     *
     * This avoids the Next.js warning caused by
     * global scroll-behavior: smooth.
     */
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          CATEGORY HEADER
      ====================================================== */}

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 sm:text-sm">
              AnantaGo
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          ARTICLES
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                >
                  <div className="aspect-[16/9] animate-pulse bg-gray-200" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />

                    <div className="h-5 animate-pulse rounded bg-gray-200" />

                    <div className="h-4 animate-pulse rounded bg-gray-200" />

                    <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              No articles yet
            </h2>

            <p className="mt-2 text-gray-500">
              There are no published articles
              in this category.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* IMAGE */}

                  {blog.cover_image ? (
                    <div className="overflow-hidden">
                      <img
                        src={blog.cover_image}
                        alt={blog.title}
                        loading="lazy"
                        className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-400">
                      AnantaGo
                    </div>
                  )}

                  {/* CONTENT */}

                  <div className="p-5">
                    {blog.category && (
                      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                        {blog.category}
                      </div>
                    )}

                    <h2 className="text-lg font-bold leading-snug text-gray-900 transition group-hover:text-gray-600 sm:text-xl">
                      {blog.title}
                    </h2>

                    {blog.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                        {blog.excerpt}
                      </p>
                    )}

                    <div className="mt-4 text-xs font-semibold text-gray-400">
                      Read article →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* =================================================
                PAGINATION
            ================================================== */}

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    changePage(page - 1)
                  }
                  disabled={page === 1}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="px-3 text-sm font-semibold text-gray-700">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    changePage(page + 1)
                  }
                  disabled={
                    page === totalPages
                  }
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}