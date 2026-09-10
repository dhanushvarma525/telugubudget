
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

const BASE_URL = "https://www.anatago.com";
const ARTICLES_PER_PAGE = 20;

type Author = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  role: string | null;
  avatar_url: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
};

type Blog = {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  author: string | null;
  published_at: string | null;
};

type BlogResult = {
  blogs: Blog[];
  total: number;
};

/* =========================================================
   GET AUTHOR
========================================================= */

async function getAuthor(slug: string): Promise<Author | null> {
  const { data, error } = await supabase
    .from("authors")
    .select(
      `
        id,
        name,
        slug,
        bio,
        role,
        avatar_url,
        website_url,
        facebook_url,
        instagram_url,
        whatsapp_url
      `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error loading author:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return null;
  }

  return data as Author | null;
}

/* =========================================================
   GET AUTHOR BLOGS
========================================================= */

async function getAuthorBlogs(
  authorName: string,
  page: number,
): Promise<BlogResult> {
  const from = (page - 1) * ARTICLES_PER_PAGE;
  const to = from + ARTICLES_PER_PAGE - 1;

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
        published_at
      `,
      {
        count: "exact",
      },
    )
    .eq("published", true)
    .eq("author", authorName)
    .order("published_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    console.error("Error loading author blogs:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return {
      blogs: [],
      total: 0,
    };
  }

  return {
    blogs: (data || []) as Blog[],
    total: count ?? 0,
  };
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string | null): string {
  if (!date) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "";
  }
}

function getCategoryHref(category: string | null): string {
  if (!category) {
    return "/blog";
  }

  const normalized = category.toLowerCase().trim();

  const categoryMap: Record<string, string> = {
    ai: "/ai",
    tech: "/tech",
    "how-to": "/how-to",
    howto: "/how-to",
    apps: "/apps",
    security: "/security",
    explained: "/explained",
  };

  return categoryMap[normalized] || "/blog";
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }

    return pages;
  }

  pages.push(1);

  if (currentPage > 4) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (currentPage < totalPages - 3) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const author = await getAuthor(slug);

  if (!author) {
    return {
      title: "Author Not Found | AnantaGo",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    author.bio ||
    `${author.name} writes about AI, technology, apps, cybersecurity, and practical digital guides at AnantaGo.`;

  const authorUrl = `${BASE_URL}/author/${encodeURIComponent(
    author.slug,
  )}`;

  return {
    title: `${author.name} | ${
      author.role || "Technology Writer"
    } | AnantaGo`,

    description,

    alternates: {
      canonical: authorUrl,
    },

    openGraph: {
      title: `${author.name} | AnantaGo`,
      description,
      url: authorUrl,
      type: "profile",

      ...(author.avatar_url
        ? {
            images: [
              {
                url: author.avatar_url,
                width: 800,
                height: 800,
                alt: author.name,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: `${author.name} | AnantaGo`,
      description,

      ...(author.avatar_url
        ? {
            images: [author.avatar_url],
          }
        : {}),
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const parsedPage = Number.parseInt(pageParam || "1", 10);

  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  /* -------------------------------------------------------
     LOAD AUTHOR
  ------------------------------------------------------- */

  const author = await getAuthor(slug);

  if (!author) {
    notFound();
  }

  /*
    IMPORTANT:
    After notFound(), TypeScript may still consider `author`
    nullable in some expressions/configurations.

    This explicit variable guarantees a non-null Author.
  */
  const authorData: Author = author;

  /* -------------------------------------------------------
     LOAD ARTICLES
  ------------------------------------------------------- */

  const { blogs, total } = await getAuthorBlogs(
    authorData.name,
    currentPage,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(total / ARTICLES_PER_PAGE),
  );

  if (currentPage > totalPages && total > 0) {
    notFound();
  }

  /* -------------------------------------------------------
     AUTHOR URL
  ------------------------------------------------------- */

  const authorUrl = `${BASE_URL}/author/${encodeURIComponent(
    authorData.slug,
  )}`;

  /* -------------------------------------------------------
     PERSON SCHEMA
  ------------------------------------------------------- */

  const sameAs = [
    authorData.website_url,
    authorData.facebook_url,
    authorData.instagram_url,
    authorData.whatsapp_url,
  ].filter((url): url is string => Boolean(url));

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${authorUrl}#person`,
    name: authorData.name,
    url: authorUrl,

    ...(authorData.role
      ? {
          jobTitle: authorData.role,
        }
      : {}),

    ...(authorData.bio
      ? {
          description: authorData.bio,
        }
      : {}),

    ...(authorData.avatar_url
      ? {
          image: authorData.avatar_url,
        }
      : {}),

    ...(sameAs.length > 0
      ? {
          sameAs,
        }
      : {}),
  };

  /* -------------------------------------------------------
     PAGINATION
  ------------------------------------------------------- */

  const pageNumbers = getPageNumbers(
    currentPage,
    totalPages,
  );

  const pageStart =
    total === 0
      ? 0
      : (currentPage - 1) * ARTICLES_PER_PAGE + 1;

  const pageEnd = Math.min(
    currentPage * ARTICLES_PER_PAGE,
    total,
  );

  function pageHref(page: number): string {
    const encodedSlug = encodeURIComponent(
      authorData.slug,
    );

    if (page === 1) {
      return `/author/${encodedSlug}`;
    }

    return `/author/${encodedSlug}?page=${page}`;
  }

  return (
    <>
      {/* =====================================================
          PERSON STRUCTURED DATA
      ====================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema),
        }}
      />

      <main className="min-h-screen bg-slate-50">
        {/* ===================================================
            BREADCRUMB
        ==================================================== */}

        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm text-slate-500"
            >
              <Link
                href="/"
                className="transition-colors hover:text-blue-600"
              >
                Home
              </Link>

              <span>/</span>

              <Link
                href="/blog"
                className="transition-colors hover:text-blue-600"
              >
                Blog
              </Link>

              <span>/</span>

              <span className="font-medium text-slate-800">
                {authorData.name}
              </span>
            </nav>
          </div>
        </div>

        {/* ===================================================
            AUTHOR PROFILE
        ==================================================== */}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:items-center sm:text-left">
              {/* Profile Image */}

              <div className="shrink-0">
                {authorData.avatar_url ? (
                  <img
                    src={authorData.avatar_url}
                    alt={`${authorData.name} profile photo`}
                    width={144}
                    height={144}
                    className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg ring-1 ring-slate-200 sm:h-36 sm:w-36"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-950 text-4xl font-bold text-white shadow-lg sm:h-36 sm:w-36">
                    {authorData.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              {/* Author Details */}

              <div className="min-w-0 flex-1">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Author
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {authorData.name}
                </h1>

                {authorData.role && (
                  <p className="mt-2 text-base font-medium text-slate-600 sm:text-lg">
                    {authorData.role}
                  </p>
                )}

                {authorData.bio && (
                  <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:mx-0">
                    {authorData.bio}
                  </p>
                )}

                {/* Social / Website Links */}

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  {authorData.website_url && (
                    <a
                      href={authorData.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      Website
                    </a>
                  )}

                  {authorData.facebook_url && (
                    <a
                      href={authorData.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      Facebook
                    </a>
                  )}

                  {authorData.instagram_url && (
                    <a
                      href={authorData.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      Instagram
                    </a>
                  )}

                  {authorData.whatsapp_url && (
                    <a
                      href={authorData.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            ARTICLES
        ==================================================== */}

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                From the author
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Latest articles
              </h2>

              {total > 0 && (
                <p className="mt-2 text-sm text-slate-500">
                  Showing {pageStart}–{pageEnd} of {total}{" "}
                  {total === 1 ? "article" : "articles"}
                </p>
              )}
            </div>

            <span className="hidden rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 sm:inline-flex">
              {total}{" "}
              {total === 1 ? "article" : "articles"}
            </span>
          </div>

          {/* =================================================
              NO ARTICLES
          ================================================== */}

          {blogs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                No published articles yet
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Articles written by {authorData.name} will
                appear here once they are published.
              </p>

              <Link
                href="/blog"
                className="mt-5 inline-flex rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Browse all articles
              </Link>
            </div>
          ) : (
            <>
              {/* =================================================
                  ARTICLE GRID
              ================================================== */}

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                  <article
                    key={blog.id}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    {/* Cover */}

                    <Link
                      href={`/blog/${encodeURIComponent(
                        blog.slug,
                      )}`}
                      className="block overflow-hidden"
                    >
                      {blog.cover_image ? (
                        <img
                          src={blog.cover_image}
                          alt={`${blog.title} cover image`}
                          loading="lazy"
                          width={800}
                          height={450}
                          className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex aspect-[16/9] items-center justify-center bg-slate-100">
                          <span className="text-sm font-medium text-slate-400">
                            AnantaGo
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Content */}

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
                        {blog.category && (
                          <Link
                            href={getCategoryHref(
                              blog.category,
                            )}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {blog.category}
                          </Link>
                        )}

                        {blog.category &&
                          blog.published_at && (
                            <span className="text-slate-300">
                              •
                            </span>
                          )}

                        {blog.published_at && (
                          <time
                            dateTime={blog.published_at}
                            className="text-slate-500"
                          >
                            {formatDate(
                              blog.published_at,
                            )}
                          </time>
                        )}
                      </div>

                      <h3 className="text-lg font-bold leading-snug text-slate-950">
                        <Link
                          href={`/blog/${encodeURIComponent(
                            blog.slug,
                          )}`}
                          className="transition-colors hover:text-blue-600"
                        >
                          {blog.title}
                        </Link>
                      </h3>

                      {blog.excerpt && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                          {blog.excerpt}
                        </p>
                      )}

                      <div className="mt-auto pt-5">
                        <Link
                          href={`/blog/${encodeURIComponent(
                            blog.slug,
                          )}`}
                          className="inline-flex items-center text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                        >
                          Read article

                          <span
                            aria-hidden="true"
                            className="ml-1 transition-transform group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* =================================================
                  PAGINATION
              ================================================== */}

              {totalPages > 1 && (
                <nav
                  aria-label="Author articles pagination"
                  className="mt-10 flex flex-wrap items-center justify-center gap-2"
                >
                  {/* Previous */}

                  {currentPage > 1 ? (
                    <Link
                      href={pageHref(currentPage - 1)}
                      rel="prev"
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-slate-100 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400">
                      ← Previous
                    </span>
                  )}

                  {/* Page Numbers */}

                  <div className="flex items-center gap-1">
                    {pageNumbers.map(
                      (pageNumber, index) => {
                        if (pageNumber === "...") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-2 text-sm font-medium text-slate-400"
                            >
                              …
                            </span>
                          );
                        }

                        if (
                          pageNumber === currentPage
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              aria-current="page"
                              className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-slate-950 px-3 text-sm font-bold text-white"
                            >
                              {pageNumber}
                            </span>
                          );
                        }

                        return (
                          <Link
                            key={pageNumber}
                            href={pageHref(
                              pageNumber,
                            )}
                            className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            {pageNumber}
                          </Link>
                        );
                      },
                    )}
                  </div>

                  {/* Next */}

                  {currentPage < totalPages ? (
                    <Link
                      href={pageHref(currentPage + 1)}
                      rel="next"
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-slate-100 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400">
                      Next →
                    </span>
                  )}
                </nav>
              )}
            </>
          )}
        </section>

        {/* ===================================================
            BOTTOM CTA
        ==================================================== */}

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Explore more from AnantaGo
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Practical technology guides, AI insights, useful
              apps, cybersecurity tips, and easy-to-understand
              tech explanations.
            </p>

            <Link
              href="/blog"
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Browse all articles
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

