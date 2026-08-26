"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Blog = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_image?: string | null;
  category?: string | null;
  author?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

const BLOGS_PER_PAGE = 10;

const categories = [
  { name: "All", href: "/blog" },
  { name: "AI", href: "/ai" },
  { name: "Tech", href: "/tech" },
  { name: "How-To", href: "/how-to" },
  { name: "Apps", href: "/apps" },
  { name: "Security", href: "/security" },
  { name: "Explained", href: "/explained" },
];

function formatDate(date?: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page") || "1");

  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0
      ? Math.floor(pageParam)
      : 1;

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);

  useEffect(() => {
    async function loadBlogs() {
      try {
        setLoading(true);
        setError("");

        const from = (currentPage - 1) * BLOGS_PER_PAGE;
        const to = from + BLOGS_PER_PAGE - 1;

        const { data, error, count } = await supabase
          .from("blogs")
          .select(
            `
              id,
              title,
              slug,
              excerpt,
              cover_image,
              category,
              author,
              published_at,
              created_at
            `,
            { count: "exact" }
          )
          .eq("published", true)
          .order("published_at", {
            ascending: false,
            nullsFirst: false,
          })
          .range(from, to);

        if (error) {
          console.error("Error loading blogs:", error);
          setError("Unable to load articles.");
          setBlogs([]);
          return;
        }

        setBlogs(data || []);
        setTotalBlogs(count || 0);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Unable to load articles.");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    }

    loadBlogs();
  }, [currentPage]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
              AnantaGo
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              All Articles
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              Discover the latest stories, guides, explainers, and practical
              insights from AnantaGo.
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6 sm:px-8 lg:px-10">
          <nav
            aria-label="Article categories"
            className="flex min-w-max gap-2 py-5"
          >
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  category.name === "All"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        {loading ? (
          <>
            <div className="mb-8">
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

              <div className="mt-3 h-5 w-72 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-gray-200"
                >
                  <div className="aspect-[16/9] animate-pulse bg-gray-200" />

                  <div className="space-y-4 p-6">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />

                    <div className="h-6 w-full animate-pulse rounded bg-gray-200" />

                    <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />

                    <div className="h-4 w-2/5 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Something went wrong
            </h2>

            <p className="mt-2 text-gray-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              No articles found
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-600">
              There are no published articles on this page yet.
            </p>

            {currentPage > 1 && (
              <Link
                href="/blog"
                className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Go to Page 1
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Section Heading */}
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Latest Articles
                </h2>

                <p className="mt-2 text-gray-600">
                  Fresh stories and useful guides from AnantaGo.
                </p>
              </div>

              <p className="hidden text-sm text-gray-500 sm:block">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {/* Article Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => {
                const date = blog.published_at || blog.created_at;

                const categorySlug = blog.category
                  ?.toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <article
                    key={blog.id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Cover Image */}
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="block"
                      aria-label={`Read ${blog.title}`}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                        {blog.cover_image ? (
                          <Image
                            src={blog.cover_image}
                            alt={blog.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-sm font-medium text-gray-400">
                              AnantaGo
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Article Content */}
                    <div className="p-6">
                      {blog.category && categorySlug && (
                        <Link
                          href={`/${categorySlug}`}
                          className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                        >
                          {blog.category}
                        </Link>
                      )}

                      <h3 className="mt-3 text-xl font-bold leading-snug text-gray-900">
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="transition hover:text-blue-600"
                        >
                          {blog.title}
                        </Link>
                      </h3>

                      {blog.excerpt && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {blog.excerpt}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                        <div className="min-w-0">
                          {blog.author && (
                            <p className="truncate text-sm font-medium text-gray-700">
                              {blog.author}
                            </p>
                          )}

                          {date && (
                            <p className="mt-1 text-xs text-gray-500">
                              {formatDate(date)}
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/blog/${blog.slug}`}
                          className="shrink-0 text-sm font-semibold text-gray-900 transition group-hover:text-blue-600"
                        >
                          Read more →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Blog pagination"
                className="mt-14 flex flex-wrap items-center justify-center gap-2"
              >
                {/* Previous */}
                {currentPage > 1 ? (
                  <Link
                    href={
                      currentPage === 2
                        ? "/blog"
                        : `/blog?page=${currentPage - 1}`
                    }
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-300">
                    ← Previous
                  </span>
                )}

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;

                    if (
                      pageNumber !== 1 &&
                      pageNumber !== totalPages &&
                      Math.abs(pageNumber - currentPage) > 2
                    ) {
                      return null;
                    }

                    return (
                      <Link
                        key={pageNumber}
                        href={
                          pageNumber === 1
                            ? "/blog"
                            : `/blog?page=${pageNumber}`
                        }
                        aria-current={
                          pageNumber === currentPage ? "page" : undefined
                        }
                        className={`min-w-10 rounded-lg px-3 py-2.5 text-center text-sm font-medium transition ${
                          pageNumber === currentPage
                            ? "bg-gray-900 text-white"
                            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </Link>
                    );
                  })}
                </div>

                {/* Next */}
                {currentPage < totalPages ? (
                  <Link
                    href={`/blog?page=${currentPage + 1}`}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-300">
                    Next →
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}