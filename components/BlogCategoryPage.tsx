
import Image from "next/image";
import Link from "next/link";

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

type Props = {
  category: string;
  title: string;
  description: string;
  page?: number;
};

const BLOGS_PER_PAGE = 10;

/* =========================================================
   CATEGORY ROUTES
========================================================= */

const CATEGORY_PATHS: Record<string, string> = {
  AI: "/ai",
  Tech: "/tech",
  "How-To": "/how-to",
  Apps: "/apps",
  Security: "/security",
  Explained: "/explained",
};

/* =========================================================
   CATEGORY NAVIGATION
========================================================= */

const categories = [
  {
    name: "All",
    href: "/blog",
  },
  {
    name: "AI",
    href: "/ai",
  },
  {
    name: "Tech",
    href: "/tech",
  },
  {
    name: "How-To",
    href: "/how-to",
  },
  {
    name: "Apps",
    href: "/apps",
  },
  {
    name: "Security",
    href: "/security",
  },
  {
    name: "Explained",
    href: "/explained",
  },
];

/* =========================================================
   GET CATEGORY PATH
========================================================= */

function getCategoryPath(category: string): string {
  return (
    CATEGORY_PATHS[category] ||
    `/${category
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")}`
  );
}

/* =========================================================
   GET CATEGORY BLOGS DIRECTLY FROM SUPABASE
========================================================= */

async function getBlogs(
  category: string,
  page: number
): Promise<{
  blogs: Blog[];
  total: number;
}> {
  const normalizedCategory = category.trim();

  const from = (page - 1) * BLOGS_PER_PAGE;
  const to = from + BLOGS_PER_PAGE - 1;

  try {
    const {
      data,
      error,
      count,
    } = await supabase
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
        {
          count: "exact",
        }
      )
      .eq("published", true)
      .eq("category", normalizedCategory)
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: false,
      })
      .range(from, to);

    if (error) {
      console.error(
        "CATEGORY SUPABASE ERROR:",
        error
      );

      return {
        blogs: [],
        total: 0,
      };
    }

    /*
     * Extra safety:
     *
     * Even though Supabase already filters by category,
     * keep only blogs whose category exactly matches
     * the current category.
     */
    const filteredBlogs = (data || []).filter(
      (blog) =>
        blog.category?.trim() ===
        normalizedCategory
    );

    return {
      blogs: filteredBlogs as Blog[],
      total: count || 0,
    };
  } catch (error) {
    console.error(
      "CATEGORY BLOG FETCH ERROR:",
      error
    );

    return {
      blogs: [],
      total: 0,
    };
  }
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
  dateString?: string | null
): string {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

/* =========================================================
   BLOG URL
========================================================= */

function getBlogUrl(slug: string): string {
  return `/blog/${encodeURIComponent(slug)}`;
}

/* =========================================================
   PAGE URL
========================================================= */

function getPageUrl(
  categoryPath: string,
  page: number
): string {
  return page <= 1
    ? categoryPath
    : `${categoryPath}?page=${page}`;
}

/* =========================================================
   PAGE
========================================================= */

export default async function BlogCategoryPage({
  category,
  title,
  description,
  page = 1,
}: Props) {
  /* -------------------------------------------------------
     NORMALIZE PAGE
  ------------------------------------------------------- */

  const currentPage =
    Number.isInteger(page) && page > 0
      ? page
      : 1;

  /* -------------------------------------------------------
     FETCH CATEGORY BLOGS
  ------------------------------------------------------- */

  const {
    blogs,
    total,
  } = await getBlogs(
    category,
    currentPage
  );

  /* -------------------------------------------------------
     PAGINATION
  ------------------------------------------------------- */

  const totalPages = Math.max(
    1,
    Math.ceil(total / BLOGS_PER_PAGE)
  );

  /*
   * Protect against invalid page numbers.
   */

  const safePage =
    currentPage > totalPages
      ? totalPages
      : currentPage;

  let finalBlogs = blogs;

  /*
   * If the requested page is beyond the available
   * pages, fetch the final valid page.
   */

  if (safePage !== currentPage) {
    const fallback = await getBlogs(
      category,
      safePage
    );

    finalBlogs = fallback.blogs;
  }

  const categoryPath =
    getCategoryPath(category);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50/60">

      {/* =====================================================
          CATEGORY HEADER
      ====================================================== */}

      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="max-w-3xl">

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-sm">
              AnantaGo
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              {description}
            </p>

          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY NAVIGATION
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">

          <nav
            aria-label="Article categories"
            className="flex min-w-max gap-2 py-4"
          >
            {categories.map((item) => {
              const isActive =
                item.name === category;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

        </div>
      </section>

      {/* =====================================================
          ARTICLES
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

        {finalBlogs.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto max-w-md">

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                {title}
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                No articles yet
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                There are no published articles
                in this category yet.
              </p>

              <Link
                href="/blog"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Browse all articles
              </Link>

            </div>
          </div>

        ) : (

          <>

            {/* =================================================
                SECTION HEADER
            ================================================== */}

            <div className="mb-7 flex items-end justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                  {title}
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Latest {title} Articles
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                  Explore the latest stories, guides,
                  and useful insights from AnantaGo.
                </p>

              </div>

              {totalPages > 1 && (
                <p className="hidden shrink-0 text-sm font-medium text-slate-500 sm:block">
                  Page {safePage} of {totalPages}
                </p>
              )}

            </div>

            {/* =================================================
                ARTICLE GRID
            ================================================== */}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {finalBlogs.map((blog) => {

                const date =
                  blog.published_at ||
                  blog.created_at;

                const blogUrl =
                  getBlogUrl(blog.slug);

                return (
                  <article
                    key={blog.id}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  >

                    {/* IMAGE */}

                    <Link
                      href={blogUrl}
                      className="block"
                      aria-label={`Read ${blog.title}`}
                    >

                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">

                        {blog.cover_image ? (
                          <Image
                            src={blog.cover_image}
                            alt={blog.title}
                            fill
                            priority={safePage === 1}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-slate-100">
                            <span className="text-sm font-semibold text-slate-400">
                              AnantaGo
                            </span>
                          </div>
                        )}

                      </div>
                    </Link>

                    {/* CONTENT */}

                    <div className="flex flex-1 flex-col p-5 sm:p-6">

                      {/* CATEGORY */}

                      {blog.category && (
                        <Link
                          href={categoryPath}
                          className="w-fit text-xs font-bold uppercase tracking-[0.14em] text-blue-600 transition hover:text-blue-700"
                        >
                          {blog.category}
                        </Link>
                      )}

                      {/* TITLE */}

                      <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-slate-950">

                        <Link
                          href={blogUrl}
                          className="transition-colors duration-200 hover:text-blue-600"
                        >
                          {blog.title}
                        </Link>

                      </h2>

                      {/* EXCERPT */}

                      {blog.excerpt && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                          {blog.excerpt}
                        </p>
                      )}

                      {/* FOOTER */}

                      <div className="mt-auto pt-5">

                        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">

                          <div className="min-w-0">

                            {blog.author && (
                              <p className="truncate text-sm font-medium text-slate-700">
                                {blog.author}
                              </p>
                            )}

                            {date && (
                              <time
                                dateTime={date}
                                className="mt-1 block text-xs text-slate-500"
                              >
                                {formatDate(date)}
                              </time>
                            )}

                          </div>

                          <Link
                            href={blogUrl}
                            className="shrink-0 text-sm font-semibold text-slate-700 transition-colors group-hover:text-blue-600"
                          >
                            Read more
                            <span
                              aria-hidden="true"
                              className="ml-1"
                            >
                              →
                            </span>
                          </Link>

                        </div>
                      </div>

                    </div>
                  </article>
                );
              })}

            </div>

            {/* =================================================
                PAGINATION
            ================================================== */}

            {totalPages > 1 && (
              <nav
                aria-label={`${title} pagination`}
                className="mt-12 flex flex-wrap items-center justify-center gap-2"
              >

                {/* PREVIOUS */}

                {safePage > 1 ? (
                  <Link
                    href={getPageUrl(
                      categoryPath,
                      safePage - 1
                    )}
                    rel="prev"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-300">
                    ← Previous
                  </span>
                )}

                {/* PAGE NUMBERS */}

                <div className="flex items-center gap-1.5">

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => index + 1
                  ).map((pageNumber) => {

                    const shouldShow =
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(
                        pageNumber - safePage
                      ) <= 2;

                    if (!shouldShow) {
                      return null;
                    }

                    return (
                      <Link
                        key={pageNumber}
                        href={getPageUrl(
                          categoryPath,
                          pageNumber
                        )}
                        aria-current={
                          pageNumber === safePage
                            ? "page"
                            : undefined
                        }
                        className={`min-w-10 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition ${
                          pageNumber === safePage
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {pageNumber}
                      </Link>
                    );
                  })}

                </div>

                {/* NEXT */}

                {safePage < totalPages ? (
                  <Link
                    href={getPageUrl(
                      categoryPath,
                      safePage + 1
                    )}
                    rel="next"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-300">
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

