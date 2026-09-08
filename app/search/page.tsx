"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Blog = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image?: string;
  category?: string;
  author?: string;
  published_at?: string;
  created_at?: string;
};

const BLOGS_PER_PAGE = 10;

export default function SearchPage() {
  const searchParams = useSearchParams();

  const initialQuery =
    searchParams.get("q") || "";

  const [query, setQuery] =
    useState(initialQuery);

  const [blogs, setBlogs] =
    useState<Blog[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(Boolean(initialQuery));

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  async function searchBlogs(
    searchValue = query,
    pageNumber = page
  ) {
    const value =
      searchValue.trim();

    if (!value) {
      setBlogs([]);
      setTotal(0);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      const response =
        await fetch(
          `/api/blogs/search?q=${encodeURIComponent(
            value
          )}&page=${pageNumber}&limit=${BLOGS_PER_PAGE}`,
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Search failed"
        );
      }

      setBlogs(
        Array.isArray(data.blogs)
          ? data.blogs
          : []
      );

      setTotal(
        Number(data.total || 0)
      );
    } catch (error) {
      console.error(
        "SEARCH ERROR:",
        error
      );

      setBlogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery) {
      searchBlogs(
        initialQuery,
        1
      );
    }
  }, [initialQuery]);

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setPage(1);

    searchBlogs(
      query,
      1
    );
  }

  function changePage(
    newPage: number
  ) {
    if (
      newPage < 1 ||
      newPage >
        Math.ceil(
          total / BLOGS_PER_PAGE
        )
    ) {
      return;
    }

    setPage(newPage);

    searchBlogs(
      query,
      newPage
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const totalPages =
    Math.ceil(
      total / BLOGS_PER_PAGE
    );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}

      <section className="bg-white border-b">
        <div
          className="
            max-w-6xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-12
            sm:py-16
          "
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-bold
                tracking-tight
                text-gray-900
              "
            >
              Search AnantaGo
            </h1>

            <p
              className="
                mt-4
                text-base
                sm:text-lg
                text-gray-600
              "
            >
              Search guides, AI tools,
              technology news and
              useful articles.
            </p>

            <form
              onSubmit={handleSubmit}
              className="
                mt-8
                flex
                flex-col
                sm:flex-row
                gap-3
              "
            >
              <input
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value
                  )
                }
                placeholder="Search AI, gadgets, apps, security..."
                className="
                  flex-1
                  min-w-0
                  border
                  border-gray-300
                  rounded-xl
                  px-4
                  py-3.5
                  text-base
                  outline-none
                  focus:ring-2
                  focus:ring-black
                "
              />

              <button
                type="submit"
                className="
                  px-6
                  py-3.5
                  rounded-xl
                  bg-black
                  text-white
                  font-semibold
                  hover:bg-gray-800
                  transition
                "
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* RESULTS */}

      <section
        className="
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-8
          sm:py-10
        "
      >
        {!searched && (
          <div
            className="
              bg-white
              border
              rounded-2xl
              p-8
              sm:p-12
              text-center
            "
          >
            <div className="text-4xl mb-4">
              🔎
            </div>

            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-gray-900
              "
            >
              What are you looking for?
            </h2>

            <p className="mt-2 text-gray-600">
              Search for AI tools,
              technology guides,
              apps, security topics
              and more.
            </p>
          </div>
        )}

        {searched && (
          <>
            <div className="mb-6">
              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-bold
                  text-gray-900
                "
              >
                Search results
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {total}{" "}
                {total === 1
                  ? "article"
                  : "articles"}{" "}
                found
                {query
                  ? ` for "${query}"`
                  : ""}
              </p>
            </div>

            {loading ? (
              <div
                className="
                  bg-white
                  border
                  rounded-2xl
                  p-10
                  text-center
                  text-gray-500
                "
              >
                Searching...
              </div>
            ) : blogs.length === 0 ? (
              <div
                className="
                  bg-white
                  border
                  rounded-2xl
                  p-10
                  text-center
                "
              >
                <h3 className="text-xl font-bold">
                  No articles found
                </h3>

                <p className="mt-2 text-gray-500">
                  Try a different search term.
                </p>
              </div>
            ) : (
              <>
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-5
                  "
                >
                  {blogs.map(
                    (blog) => (
                      <Link
                        key={blog.id}
                        href={`/blog/${blog.slug}`}
                        className="
                          group
                          bg-white
                          border
                          rounded-2xl
                          overflow-hidden
                          hover:shadow-lg
                          transition
                        "
                      >
                        {blog.cover_image ? (
                          <img
                            src={
                              blog.cover_image
                            }
                            alt={
                              blog.title
                            }
                            className="
                              w-full
                              aspect-[16/9]
                              object-cover
                              group-hover:scale-[1.02]
                              transition
                            "
                          />
                        ) : (
                          <div
                            className="
                              w-full
                              aspect-[16/9]
                              bg-gray-100
                              flex
                              items-center
                              justify-center
                              text-gray-400
                            "
                          >
                            AnantaGo
                          </div>
                        )}

                        <div className="p-5">
                          {blog.category && (
                            <div
                              className="
                                text-xs
                                font-bold
                                uppercase
                                tracking-wide
                                text-gray-500
                                mb-2
                              "
                            >
                              {
                                blog.category
                              }
                            </div>
                          )}

                          <h3
                            className="
                              text-lg
                              font-bold
                              leading-snug
                              text-gray-900
                              group-hover:underline
                            "
                          >
                            {
                              blog.title
                            }
                          </h3>

                          {blog.excerpt && (
                            <p
                              className="
                                mt-2
                                text-sm
                                leading-6
                                text-gray-600
                                line-clamp-3
                              "
                            >
                              {
                                blog.excerpt
                              }
                            </p>
                          )}
                        </div>
                      </Link>
                    )
                  )}
                </div>

                {totalPages > 1 && (
                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      gap-3
                      mt-10
                    "
                  >
                    <button
                      onClick={() =>
                        changePage(
                          page - 1
                        )
                      }
                      disabled={
                        page === 1
                      }
                      className="
                        px-4
                        py-2.5
                        border
                        rounded-xl
                        bg-white
                        disabled:opacity-40
                      "
                    >
                      Previous
                    </button>

                    <span
                      className="
                        text-sm
                        font-semibold
                      "
                    >
                      {page} /{" "}
                      {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        changePage(
                          page + 1
                        )
                      }
                      disabled={
                        page ===
                        totalPages
                      }
                      className="
                        px-4
                        py-2.5
                        border
                        rounded-xl
                        bg-white
                        disabled:opacity-40
                      "
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}