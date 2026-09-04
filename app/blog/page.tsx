import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { supabase } from "@/lib/supabase";

/* =========================================================
   CONFIGURATION
========================================================= */

const BASE_URL = "https://www.anatago.com";

const BLOGS_PER_PAGE = 10;

/* =========================================================
   METADATA
========================================================= */

export const metadata: Metadata = {
  title: "All Articles | AnantaGo",
  description:
    "Discover the latest technology stories, AI news, practical how-to guides, app tips, security advice, and technology explainers from AnantaGo.",

  alternates: {
    canonical: `${BASE_URL}/blog`,
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    url: `${BASE_URL}/blog`,
    siteName: "AnantaGo",
    title: "All Articles | AnantaGo",
    description:
      "Discover the latest technology stories, AI news, practical how-to guides, app tips, security advice, and technology explainers from AnantaGo.",
    locale: "en_IN",
  },

  twitter: {
    card: "summary",
    title: "All Articles | AnantaGo",
    description:
      "Discover the latest technology stories, AI news, practical how-to guides, app tips, security advice, and technology explainers from AnantaGo.",
  },
};

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   CATEGORIES
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
   HELPERS
========================================================= */

function formatDate(date?: string | null) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}

function getCategorySlug(category?: string | null) {
  if (!category) return "";

  return category
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function getBlogUrl(slug: string) {
  return `/blog/${encodeURIComponent(slug)}`;
}

/* =========================================================
   FETCH PUBLISHED BLOGS
========================================================= */

async function getPublishedBlogs(page: number) {
  const from = (page - 1) * BLOGS_PER_PAGE;
  const to = from + BLOGS_PER_PAGE - 1;

  /*
   * Fetch the current page and the total count
   * in one Supabase request.
   *
   * This runs on the server.
   */
  const {
    data,
    count,
    error,
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
    .not("slug", "is", null)
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
      nullsFirst: false,
    })
    .range(from, to);

  if (error) {
    console.error(
      "Error loading published blogs:",
      error.message
    );

    return {
      blogs: [] as Blog[],
      totalBlogs: 0,
      error: true,
    };
  }

  return {
    blogs: (data || []) as Blog[],
    totalBlogs: count || 0,
    error: false,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const params = await searchParams;

  /* -------------------------------------------------------
     PARSE PAGE
  ------------------------------------------------------- */

  const rawPage = params?.page;

  const parsedPage = rawPage
    ? Number.parseInt(rawPage, 10)
    : 1;

  const requestedPage =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  /* -------------------------------------------------------
     FETCH BLOGS SERVER-SIDE
  ------------------------------------------------------- */

  const {
    blogs,
    totalBlogs,
    error,
  } = await getPublishedBlogs(requestedPage);

  /* -------------------------------------------------------
     CALCULATE PAGINATION
  ------------------------------------------------------- */

  const totalPages = Math.max(
    1,
    Math.ceil(totalBlogs / BLOGS_PER_PAGE)
  );

  /*
   * If someone visits /blog?page=999,
   * keep the page safe.
   */
  const currentPage =
    requestedPage > totalPages
      ? totalPages
      : requestedPage;

  /*
   * If the requested page was invalid/out of range,
   * fetch the correct final page again.
   */
  let finalBlogs = blogs;

  if (
    !error &&
    requestedPage !== currentPage
  ) {
    const fallback = await getPublishedBlogs(
      currentPage
    );

    finalBlogs = fallback.blogs;
  }

  /* =======================================================
     STRUCTURED DATA
  ======================================================= */

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",

    "@id": `${BASE_URL}/blog#collection`,

    url:
      currentPage === 1
        ? `${BASE_URL}/blog`
        : `${BASE_URL}/blog?page=${currentPage}`,

    name:
      currentPage === 1
        ? "All Articles | AnantaGo"
        : `Articles - Page ${currentPage} | AnantaGo`,

    description:
      "Discover the latest technology stories, AI news, practical how-to guides, app tips, security advice, and technology explainers from AnantaGo.",

    isPartOf: {
      "@type": "WebSite",
      name: "AnantaGo",
      url: BASE_URL,
    },
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* =====================================================
          STRUCTURED DATA
      ====================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogListSchema),
        }}
      />

      <main className="min-h-screen bg-white">

        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="border-b border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
            <div className="max-w-3xl">

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                AnantaGo
              </p>

              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                All Articles
              </h1>

              <p className="mt-5 text-lg leading-8 text-gray-600">
                Discover the latest stories, guides,
                explainers, and practical insights from
                AnantaGo.
              </p>

            </div>
          </div>
        </section>

        {/* ===================================================
            CATEGORY NAVIGATION
        ==================================================== */}

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

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">

          {/* =================================================
              ERROR
          ================================================== */}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">

              <h2 className="text-xl font-semibold text-gray-900">
                Something went wrong
              </h2>

              <p className="mt-2 text-gray-600">
                We were unable to load the articles.
              </p>

              <Link
                href="/blog"
                className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Try Again
              </Link>

            </div>
          ) : finalBlogs.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================== */

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">

              <h2 className="text-2xl font-semibold text-gray-900">
                No articles found
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-gray-600">
                There are no published articles on this
                page yet.
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
              {/* =============================================
                  SECTION HEADER
              ============================================== */}

              <div className="mb-8 flex items-end justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Latest Articles
                  </h2>

                  <p className="mt-2 text-gray-600">
                    Fresh stories and useful guides from
                    AnantaGo.
                  </p>

                </div>

                <p className="hidden text-sm text-gray-500 sm:block">
                  Page {currentPage} of {totalPages}
                </p>

              </div>

              {/* =============================================
                  ARTICLE GRID
              ============================================== */}

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

                {finalBlogs.map((blog) => {

                  const date =
                    blog.published_at ||
                    blog.created_at;

                  const categorySlug =
                    getCategorySlug(blog.category);

                  const blogUrl =
                    getBlogUrl(blog.slug);

                  return (
                    <article
                      key={blog.id}
                      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >

                      {/* =====================================
                          IMAGE
                      ====================================== */}

                      <Link
                        href={blogUrl}
                        className="block"
                        aria-label={`Read ${blog.title}`}
                      >

                        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">

                          {blog.cover_image ? (
                            <Image
                              src={blog.cover_image}
                              alt={blog.title}
                              fill
                              priority={
                                currentPage === 1
                                  ? true
                                  : false
                              }
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

                      {/* =====================================
                          CARD CONTENT
                      ====================================== */}

                      <div className="p-6">

                        {/* ===================================
                            CATEGORY
                        ==================================== */}

                        {blog.category &&
                          categorySlug && (
                            <Link
                              href={`/${categorySlug}`}
                              className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 transition hover:text-blue-700"
                            >
                              {blog.category}
                            </Link>
                          )}

                        {/* ===================================
                            TITLE
                        ==================================== */}

                        <h3 className="mt-3 text-xl font-bold leading-snug text-gray-900">

                          <Link
                            href={blogUrl}
                            className="transition hover:text-blue-600"
                          >
                            {blog.title}
                          </Link>

                        </h3>

                        {/* ===================================
                            EXCERPT
                        ==================================== */}

                        {blog.excerpt && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                            {blog.excerpt}
                          </p>
                        )}

                        {/* ===================================
                            FOOTER
                        ==================================== */}

                        <div className="mt-5 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">

                          <div className="min-w-0">

                            {blog.author && (
                              <p className="truncate text-sm font-medium text-gray-700">
                                {blog.author}
                              </p>
                            )}

                            {date && (
                              <time
                                dateTime={date}
                                className="mt-1 block text-xs text-gray-500"
                              >
                                {formatDate(date)}
                              </time>
                            )}

                          </div>

                          <Link
                            href={blogUrl}
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

              {/* =============================================
                  PAGINATION
              ============================================== */}

              {totalPages > 1 && (
                <nav
                  aria-label="Blog pagination"
                  className="mt-14 flex flex-wrap items-center justify-center gap-2"
                >

                  {/* =========================================
                      PREVIOUS
                  ======================================== */}

                  {currentPage > 1 ? (
                    <Link
                      href={
                        currentPage === 2
                          ? "/blog"
                          : `/blog?page=${
                              currentPage - 1
                            }`
                      }
                      rel="prev"
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-300">
                      ← Previous
                    </span>
                  )}

                  {/* =========================================
                      PAGE NUMBERS
                  ======================================== */}

                  <div className="flex items-center gap-2">

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
                          pageNumber -
                            currentPage
                        ) <= 2;

                      if (!shouldShow) {
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
                            pageNumber ===
                            currentPage
                              ? "page"
                              : undefined
                          }
                          className={`min-w-10 rounded-lg px-3 py-2.5 text-center text-sm font-medium transition ${
                            pageNumber ===
                            currentPage
                              ? "bg-gray-900 text-white"
                              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      );
                    })}

                  </div>

                  {/* =========================================
                      NEXT
                  ======================================== */}

                  {currentPage < totalPages ? (
                    <Link
                      href={`/blog?page=${
                        currentPage + 1
                      }`}
                      rel="next"
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
    </>
  );
}