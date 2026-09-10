
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

type Author = {
  id: string;
  name: string;
  slug: string;
};

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

  authorProfile?: Author | null;
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

function formatDate(
  date?: string | null
) {
  if (!date) {
    return "";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(parsedDate);
}

function getCategorySlug(
  category?: string | null
) {
  if (!category) {
    return "";
  }

  return category
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function getBlogUrl(
  slug: string
) {
  return `/blog/${encodeURIComponent(
    slug
  )}`;
}

/* =========================================================
   GET AUTHOR PROFILES
========================================================= */

async function getAuthorProfiles(
  blogs: Blog[]
) {
  const authorNames = Array.from(
    new Set(
      blogs
        .map((blog) =>
          blog.author?.trim()
        )
        .filter(
          (
            name
          ): name is string =>
            Boolean(name)
        )
    )
  );

  if (
    authorNames.length === 0
  ) {
    return new Map<
      string,
      Author
    >();
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from("authors")
      .select(
        `
          id,
          name,
          slug
        `
      )
      .in(
        "name",
        authorNames
      );

    if (error) {
      console.error(
        "Error loading author profiles:",
        error.message
      );

      return new Map<
        string,
        Author
      >();
    }

    const authorMap =
      new Map<string, Author>();

    for (
      const author of data || []
    ) {
      if (
        author.name &&
        author.slug
      ) {
        authorMap.set(
          author.name
            .trim()
            .toLowerCase(),
          author as Author
        );
      }
    }

    return authorMap;
  } catch (error) {
    console.error(
      "Unexpected author profile error:",
      error
    );

    return new Map<
      string,
      Author
    >();
  }
}

/* =========================================================
   FETCH PUBLISHED BLOGS
========================================================= */

async function getPublishedBlogs(
  page: number
) {
  const from =
    (page - 1) *
    BLOGS_PER_PAGE;

  const to =
    from +
    BLOGS_PER_PAGE -
    1;

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
    .eq(
      "published",
      true
    )
    .not(
      "slug",
      "is",
      null
    )
    .order(
      "published_at",
      {
        ascending: false,
        nullsFirst: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
        nullsFirst: false,
      }
    )
    .range(
      from,
      to
    );

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

  const blogs =
    (data || []) as Blog[];

  /* -------------------------------------------------------
     LOAD AUTHOR PROFILES
  ------------------------------------------------------- */

  const authorMap =
    await getAuthorProfiles(
      blogs
    );

  const blogsWithAuthors =
    blogs.map((blog) => {
      const authorName =
        blog.author
          ?.trim()
          .toLowerCase();

      return {
        ...blog,

        authorProfile:
          authorName
            ? authorMap.get(
                authorName
              ) || null
            : null,
      };
    });

  return {
    blogs:
      blogsWithAuthors,
    totalBlogs:
      count || 0,
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
  const params =
    await searchParams;

  /* -------------------------------------------------------
     PARSE PAGE
  ------------------------------------------------------- */

  const rawPage =
    params?.page;

  const parsedPage =
    rawPage
      ? Number.parseInt(
          rawPage,
          10
        )
      : 1;

  const requestedPage =
    Number.isInteger(
      parsedPage
    ) &&
    parsedPage > 0
      ? parsedPage
      : 1;

  /* -------------------------------------------------------
     FETCH BLOGS
  ------------------------------------------------------- */

  const {
    blogs,
    totalBlogs,
    error,
  } =
    await getPublishedBlogs(
      requestedPage
    );

  /* -------------------------------------------------------
     PAGINATION
  ------------------------------------------------------- */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalBlogs /
          BLOGS_PER_PAGE
      )
    );

  const currentPage =
    requestedPage >
    totalPages
      ? totalPages
      : requestedPage;

  let finalBlogs =
    blogs;

  if (
    !error &&
    requestedPage !==
      currentPage
  ) {
    const fallback =
      await getPublishedBlogs(
        currentPage
      );

    finalBlogs =
      fallback.blogs;
  }

  /* =======================================================
     STRUCTURED DATA
  ======================================================= */

  const blogListSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "CollectionPage",

    "@id":
      `${BASE_URL}/blog#collection`,

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
      "@type":
        "WebSite",

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
          __html:
            JSON.stringify(
              blogListSchema
            ),
        }}
      />

      <main className="min-h-screen bg-slate-50/60">

        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">

            <div className="max-w-3xl">

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 sm:text-sm">
                AnantaGo
              </p>

              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                All Articles
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Discover the latest
                technology stories,
                practical guides,
                useful explainers,
                and insights from
                AnantaGo.
              </p>

            </div>

          </div>
        </section>

        {/* ===================================================
            CATEGORY NAVIGATION
        ==================================================== */}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">

            <nav
              aria-label="Article categories"
              className="flex min-w-max gap-2 py-4"
            >

              {categories.map(
                (category) => (
                  <Link
                    key={
                      category.name
                    }
                    href={
                      category.href
                    }
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      category.name ===
                      "All"
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {
                      category.name
                    }
                  </Link>
                )
              )}

            </nav>

          </div>
        </section>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

          {/* =================================================
              ERROR
          ================================================== */}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">

              <div className="mx-auto max-w-md">

                <h2 className="text-xl font-bold text-slate-950">
                  Something went wrong
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  We were unable to
                  load the articles.
                  Please try again.
                </p>

                <Link
                  href="/blog"
                  className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Try Again
                </Link>

              </div>

            </div>
          ) : finalBlogs.length ===
            0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

              <h2 className="text-2xl font-bold text-slate-950">
                No articles found
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                There are no
                published articles
                on this page yet.
              </p>

              {currentPage >
                1 && (
                <Link
                  href="/blog"
                  className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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

              <div className="mb-7 flex items-end justify-between gap-4">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                    Latest
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Latest Articles
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                    Fresh stories and
                    useful guides from
                    AnantaGo.
                  </p>

                </div>

                <p className="hidden shrink-0 text-sm font-medium text-slate-500 sm:block">
                  Page{" "}
                  {currentPage}{" "}
                  of{" "}
                  {totalPages}
                </p>

              </div>

              {/* =============================================
                  ARTICLE GRID
              ============================================== */}

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {finalBlogs.map(
                  (blog) => {

                    const date =
                      blog.published_at ||
                      blog.created_at;

                    const categorySlug =
                      getCategorySlug(
                        blog.category
                      );

                    const blogUrl =
                      getBlogUrl(
                        blog.slug
                      );

                    const authorProfile =
                      blog.authorProfile;

                    return (
                      <article
                        key={
                          blog.id
                        }
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                      >

                        {/* =================================
                            IMAGE
                        ================================== */}

                        <Link
                          href={
                            blogUrl
                          }
                          className="block"
                          aria-label={`Read ${blog.title}`}
                        >

                          <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">

                            {blog.cover_image ? (
                              <Image
                                src={
                                  blog.cover_image
                                }
                                alt={
                                  blog.title
                                }
                                fill
                                priority={
                                  currentPage ===
                                  1
                                }
                                className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

                        {/* =================================
                            CARD CONTENT
                        ================================== */}

                        <div className="flex flex-1 flex-col p-5 sm:p-6">

                          {/* ===============================
                              CATEGORY
                          ================================= */}

                          {blog.category &&
                            categorySlug && (
                              <Link
                                href={`/${categorySlug}`}
                                className="w-fit text-xs font-bold uppercase tracking-[0.14em] text-blue-600 transition hover:text-blue-700"
                              >
                                {
                                  blog.category
                                }
                              </Link>
                            )}

                          {/* ===============================
                              TITLE
                          ================================= */}

                          <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight text-slate-950">

                            <Link
                              href={
                                blogUrl
                              }
                              className="transition-colors duration-200 hover:text-blue-600"
                            >
                              {
                                blog.title
                              }
                            </Link>

                          </h3>

                          {/* ===============================
                              EXCERPT
                          ================================= */}

                          {blog.excerpt && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                              {
                                blog.excerpt
                              }
                            </p>
                          )}

                          {/* ===============================
                              FOOTER
                          ================================= */}

                          <div className="mt-auto pt-5">

                            <div className="border-t border-slate-100 pt-4">

                              <div className="flex items-center justify-between gap-4">

                                <div className="min-w-0">

                                  {/* =================================
                                      CLICKABLE AUTHOR
                                  ================================= */}

                                  {blog.author && (
                                    <div className="truncate">

                                      {authorProfile ? (
                                        <Link
                                          href={`/author/${encodeURIComponent(
                                            authorProfile.slug
                                          )}`}
                                          className="text-sm font-semibold text-slate-700 underline decoration-transparent underline-offset-4 transition-colors hover:text-blue-600 hover:decoration-blue-200"
                                        >
                                          {
                                            authorProfile.name
                                          }
                                        </Link>
                                      ) : (
                                        <span className="text-sm font-medium text-slate-700">
                                          {
                                            blog.author
                                          }
                                        </span>
                                      )}

                                    </div>
                                  )}

                                  {/* =================================
                                      DATE
                                  ================================= */}

                                  {date && (
                                    <time
                                      dateTime={
                                        date
                                      }
                                      className="mt-1 block text-xs text-slate-500"
                                    >
                                      {formatDate(
                                        date
                                      )}
                                    </time>
                                  )}

                                </div>

                                {/* =================================
                                    READ MORE
                                ================================= */}

                                <Link
                                  href={
                                    blogUrl
                                  }
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

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

              {/* =============================================
                  PAGINATION
              ============================================== */}

              {totalPages >
                1 && (
                <nav
                  aria-label="Blog pagination"
                  className="mt-12 flex flex-wrap items-center justify-center gap-2"
                >

                  {/* =========================================
                      PREVIOUS
                  ======================================== */}

                  {currentPage >
                  1 ? (
                    <Link
                      href={
                        currentPage ===
                        2
                          ? "/blog"
                          : `/blog?page=${
                              currentPage -
                              1
                            }`
                      }
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

                  {/* =========================================
                      PAGE NUMBERS
                  ======================================== */}

                  <div className="flex items-center gap-1.5">

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (
                        _,
                        index
                      ) =>
                        index +
                        1
                    ).map(
                      (
                        pageNumber
                      ) => {

                        const shouldShow =
                          pageNumber ===
                            1 ||
                          pageNumber ===
                            totalPages ||
                          Math.abs(
                            pageNumber -
                              currentPage
                          ) <= 2;

                        if (
                          !shouldShow
                        ) {
                          return null;
                        }

                        return (
                          <Link
                            key={
                              pageNumber
                            }
                            href={
                              pageNumber ===
                              1
                                ? "/blog"
                                : `/blog?page=${pageNumber}`
                            }
                            aria-current={
                              pageNumber ===
                              currentPage
                                ? "page"
                                : undefined
                            }
                            className={`min-w-10 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition ${
                              pageNumber ===
                              currentPage
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            }`}
                          >
                            {
                              pageNumber
                            }
                          </Link>
                        );
                      }
                    )}

                  </div>

                  {/* =========================================
                      NEXT
                  ======================================== */}

                  {currentPage <
                  totalPages ? (
                    <Link
                      href={`/blog?page=${
                        currentPage +
                        1
                      }`}
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
    </>
  );
}

