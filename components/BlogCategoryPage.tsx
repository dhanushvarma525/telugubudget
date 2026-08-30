
import Image from "next/image";
import Link from "next/link";

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

type ApiResponse = {
  success?: boolean;
  blogs?: Blog[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: string;
};

function getCategoryPath(category: string) {
  const paths: Record<string, string> = {
    AI: "/ai",
    Tech: "/tech",
    "How-To": "/how-to",
    Apps: "/apps",
    Security: "/security",
    Explained: "/explained",
  };

  return paths[category] || `/${category.toLowerCase()}`;
}

async function getBlogs(
  category: string,
  page: number
): Promise<{
  blogs: Blog[];
  total: number;
}> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.anatago.com";

  const params = new URLSearchParams({
    category,
    page: String(page),
    limit: String(BLOGS_PER_PAGE),
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/blogs?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "CATEGORY BLOG API ERROR:",
        response.status
      );

      return {
        blogs: [],
        total: 0,
      };
    }

    const data =
      (await response.json()) as ApiResponse;

    return {
      blogs: Array.isArray(data.blogs)
        ? data.blogs
        : [],
      total:
        Number.isFinite(Number(data.total))
          ? Number(data.total)
          : 0,
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

function formatDate(
  dateString?: string | null
) {
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

export default async function BlogCategoryPage({
  category,
  title,
  description,
  page = 1,
}: Props) {
  const currentPage = Math.max(
    1,
    Number.isFinite(page)
      ? Math.floor(page)
      : 1
  );

  const {
    blogs,
    total,
  } = await getBlogs(
    category,
    currentPage
  );

  const totalPages = Math.ceil(
    total / BLOGS_PER_PAGE
  );

  const safeCurrentPage =
    totalPages > 0
      ? Math.min(currentPage, totalPages)
      : 1;

  const categoryPath =
    getCategoryPath(category);

  function pageHref(
    pageNumber: number
  ) {
    if (pageNumber <= 1) {
      return categoryPath;
    }

    return `${categoryPath}?page=${pageNumber}`;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* CATEGORY HEADER */}

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

      {/* ARTICLES */}

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {blogs.length === 0 ? (
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
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                      <Image
                        src={blog.cover_image}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
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

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-gray-400">
                        Read article →
                      </span>

                      {blog.published_at && (
                        <span className="text-xs text-gray-400">
                          {formatDate(
                            blog.published_at
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (
              <nav
                aria-label={`${title} pagination`}
                className="mt-10 flex flex-wrap items-center justify-center gap-3"
              >
                {safeCurrentPage > 1 ? (
                  <Link
                    href={pageHref(
                      safeCurrentPage - 1
                    )}
                    rel="prev"
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-300">
                    Previous
                  </span>
                )}

                <span
                  aria-current="page"
                  className="px-3 text-sm font-semibold text-gray-700"
                >
                  Page {safeCurrentPage} of{" "}
                  {totalPages}
                </span>

                {safeCurrentPage <
                totalPages ? (
                  <Link
                    href={pageHref(
                      safeCurrentPage + 1
                    )}
                    rel="next"
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-300">
                    Next
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

