
import Link from "next/link";
import FeaturedSlider from "@/components/FeaturedSlider";

/* =========================================================
   CONFIG
========================================================= */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://anatago.com";

const CATEGORY_ORDER = [
  {
    name: "AI",
    description: "AI news, tools, models and practical insights.",
    href: "/ai",
  },
  {
    name: "Tech",
    description: "Technology news, trends and useful developments.",
    href: "/tech",
  },
  {
    name: "How-To",
    description: "Simple guides that help you solve everyday tech problems.",
    href: "/how-to",
  },
  {
    name: "Apps",
    description: "Useful apps, updates and practical recommendations.",
    href: "/apps",
  },
  {
    name: "Security",
    description: "Stay safer online with practical security advice.",
    href: "/security",
  },
  {
    name: "Explained",
    description: "Complex technology explained in simple language.",
    href: "/explained",
  },
];

/* =========================================================
   TYPES

   Keep these compatible with FeaturedSlider.
========================================================= */

type Blog = {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string | null | undefined;
  cover_image: string | null;
  cover_image_alt?: string | null;
  category: string | null;
  author: string | null;
  featured: boolean | null;
  published: boolean | null;
  views?: number | null;
  reading_time?: number | null;
  published_at?: string | null;
  created_at?: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeBlog(blog: Blog) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt ?? null,
    cover_image: blog.cover_image ?? null,
    cover_image_alt: blog.cover_image_alt ?? null,
    category: blog.category ?? null,
    author: blog.author ?? null,
    reading_time: blog.reading_time ?? null,
    created_at: blog.created_at ?? "",
    published_at: blog.published_at ?? null,
  };
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   ARTICLE CARD
========================================================= */

function ArticleCard({
  blog,
  compact = false,
}: {
  blog: Blog;
  compact?: boolean;
}) {
  return (
    <article
      className={`
        group
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200
        bg-white
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-zinc-300
        hover:shadow-[0_12px_35px_rgba(0,0,0,0.07)]
        ${compact ? "" : ""}
      `}
    >
      <Link
        href={`/blog/${blog.slug}`}
        className="block"
        aria-label={`Read ${blog.title}`}
      >
        {/* IMAGE */}

        <div
          className={`
            relative
            w-full
            overflow-hidden
            bg-zinc-100
            ${compact ? "aspect-[16/9]" : "aspect-[16/9]"}
          `}
        >
          {blog.cover_image ? (
            <img
              src={blog.cover_image}
              alt={blog.cover_image_alt || blog.title}
              loading="lazy"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.025]
              "
            />
          ) : (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-zinc-100
                text-sm
                font-bold
                text-zinc-400
              "
            >
              AnantaGo
            </div>
          )}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/20
              via-transparent
              to-transparent
            "
          />
        </div>

        {/* CONTENT */}

        <div className="p-5 sm:p-6">
          {blog.category && (
            <span
              className="
                inline-flex
                rounded-full
                bg-zinc-100
                px-2.5
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-zinc-600
              "
            >
              {blog.category}
            </span>
          )}

          <h3
            className="
              mt-3
              line-clamp-3
              text-lg
              font-extrabold
              leading-[1.22]
              tracking-[-0.02em]
              text-zinc-950
              transition-colors
              group-hover:text-blue-700
              sm:text-xl
            "
          >
            {blog.title}
          </h3>

          {blog.excerpt && (
            <p
              className="
                mt-2.5
                line-clamp-2
                text-sm
                leading-6
                text-zinc-600
              "
            >
              {blog.excerpt}
            </p>
          )}

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-2
              text-[10px]
              font-medium
              text-zinc-500
              sm:text-xs
            "
          >
            {blog.author && <span>{blog.author}</span>}

            {blog.author && blog.published_at && (
              <span className="text-zinc-300">•</span>
            )}

            {blog.published_at && (
              <span>{formatDate(blog.published_at)}</span>
            )}

            {blog.reading_time && (
              <>
                <span className="text-zinc-300">•</span>
                <span>{blog.reading_time} min read</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero() {
  return (
    <section
      className="
        border-b
        border-zinc-200
        bg-white
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1280px]
          flex-col
          px-5
          py-9
          sm:px-6
          sm:py-11
          lg:flex-row
          lg:items-end
          lg:justify-between
          lg:px-8
          lg:py-12
        "
      >
        <div className="max-w-[760px]">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-zinc-500
                sm:text-[11px]
              "
            >
              AnantaGo
            </span>
          </div>

          <h1
            className="
              text-[38px]
              font-black
              leading-[0.98]
              tracking-[-0.055em]
              text-zinc-950
              sm:text-5xl
              lg:text-[60px]
            "
          >
            Technology,
            <br />
            <span className="text-blue-600">
              made easier.
            </span>
          </h1>

          <p
            className="
              mt-4
              max-w-[650px]
              text-sm
              leading-6
              text-zinc-600
              sm:text-base
              sm:leading-7
            "
          >
            Practical technology news, guides and insights
            designed to help you understand what matters
            without the unnecessary complexity.
          </p>
        </div>

        <div
          className="
            mt-7
            flex
            shrink-0
            items-center
            gap-2
            lg:mb-1
            lg:mt-0
          "
        >
          <Link
            href="/blog"
            className="
              inline-flex
              h-10
              items-center
              rounded-lg
              border
              border-zinc-300
              bg-white
              px-4
              text-sm
              font-bold
              text-zinc-900
              transition-all
              hover:border-zinc-400
              hover:bg-zinc-50
            "
          >
            Explore stories
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   LATEST STORIES
========================================================= */

function LatestStories({
  blogs,
}: {
  blogs: Blog[];
}) {
  if (!blogs.length) return null;

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[1280px]
        px-5
        py-10
        sm:px-6
        sm:py-12
        lg:px-8
        lg:py-14
      "
    >
      <div
        className="
          mb-6
          flex
          items-end
          justify-between
          gap-5
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-zinc-500
                sm:text-[11px]
              "
            >
              Latest
            </p>
          </div>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              tracking-tight
              text-zinc-950
              sm:text-3xl
            "
          >
            Latest stories
          </h2>
        </div>

        <Link
          href="/blog"
          className="
            hidden
            text-sm
            font-bold
            text-zinc-500
            transition-colors
            hover:text-blue-600
            sm:block
          "
        >
          View all →
        </Link>
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-5
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {blogs.slice(0, 6).map((blog) => (
          <ArticleCard
            key={blog.id}
            blog={blog}
          />
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/blog"
          className="
            text-xs
            font-bold
            text-zinc-500
            transition-colors
            hover:text-blue-600
          "
        >
          View all articles →
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   BROWSE TOPICS
========================================================= */

function BrowseTopics() {
  return (
    <section
      className="
        border-y
        border-zinc-200
        bg-zinc-50/70
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1280px]
          px-5
          py-9
          sm:px-6
          sm:py-11
          lg:px-8
          lg:py-12
        "
      >
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-zinc-500
              "
            >
              Browse topics
            </p>
          </div>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              tracking-tight
              text-zinc-950
              sm:text-3xl
            "
          >
            Find what you need
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            lg:grid-cols-6
          "
        >
          {CATEGORY_ORDER.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="
                group
                rounded-xl
                border
                border-zinc-200
                bg-white
                p-4
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-blue-200
                hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)]
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                "
              >
                <span
                  className="
                    text-sm
                    font-extrabold
                    text-zinc-950
                    transition-colors
                    group-hover:text-blue-600
                  "
                >
                  {category.name}
                </span>

                <span
                  className="
                    text-sm
                    text-zinc-400
                    transition-transform
                    group-hover:translate-x-0.5
                    group-hover:text-blue-600
                  "
                >
                  →
                </span>
              </div>

              <p
                className="
                  mt-2
                  line-clamp-2
                  text-[11px]
                  leading-5
                  text-zinc-500
                "
              >
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CATEGORY SECTION
========================================================= */

function CategoryFeature({
  category,
  blogs,
}: {
  category: (typeof CATEGORY_ORDER)[number];
  blogs: Blog[];
}) {
  if (!blogs.length) return null;

  const main = blogs[0];
  const secondary = blogs.slice(1, 4);

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[1280px]
        px-5
        py-10
        sm:px-6
        sm:py-12
        lg:px-8
        lg:py-14
      "
    >
      <div
        className="
          mb-6
          flex
          items-end
          justify-between
          gap-5
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-zinc-500
              "
            >
              {category.name}
            </p>
          </div>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              tracking-tight
              text-zinc-950
              sm:text-3xl
            "
          >
            {category.name} stories
          </h2>
        </div>

        <Link
          href={category.href}
          className="
            hidden
            text-sm
            font-bold
            text-zinc-500
            transition-colors
            hover:text-blue-600
            sm:block
          "
        >
          View {category.name} →
        </Link>
      </div>

      <div
        className="
          grid
          gap-5
          lg:grid-cols-[1.18fr_0.82fr]
        "
      >
        {/* MAIN STORY */}

        <ArticleCard
          blog={main}
        />

        {/* SECONDARY STORIES */}

        {secondary.length > 0 && (
          <div className="grid gap-4">
            {secondary.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="
                  group
                  grid
                  grid-cols-[120px_1fr]
                  gap-4
                  rounded-xl
                  border
                  border-zinc-200
                  bg-white
                  p-3
                  transition-all
                  duration-200
                  hover:border-zinc-300
                  hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)]
                  sm:grid-cols-[150px_1fr]
                "
              >
                <div
                  className="
                    relative
                    aspect-[4/3]
                    overflow-hidden
                    rounded-lg
                    bg-zinc-100
                  "
                >
                  {blog.cover_image ? (
                    <img
                      src={blog.cover_image}
                      alt={
                        blog.cover_image_alt ||
                        blog.title
                      }
                      loading="lazy"
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-300
                        group-hover:scale-[1.03]
                      "
                    />
                  ) : (
                    <div
                      className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        text-[10px]
                        font-bold
                        text-zinc-400
                      "
                    >
                      AnantaGo
                    </div>
                  )}
                </div>

                <div className="min-w-0 py-0.5">
                  {blog.category && (
                    <span
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-blue-600
                      "
                    >
                      {blog.category}
                    </span>
                  )}

                  <h3
                    className="
                      mt-1.5
                      line-clamp-3
                      text-sm
                      font-extrabold
                      leading-5
                      tracking-[-0.01em]
                      text-zinc-950
                      transition-colors
                      group-hover:text-blue-700
                      sm:text-base
                    "
                  >
                    {blog.title}
                  </h3>

                  <div
                    className="
                      mt-2
                      text-[10px]
                      font-medium
                      text-zinc-500
                    "
                  >
                    {formatDate(
                      blog.published_at ||
                        blog.created_at
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 sm:hidden">
        <Link
          href={category.href}
          className="
            text-xs
            font-bold
            text-zinc-500
            transition-colors
            hover:text-blue-600
          "
        >
          View all {category.name} stories →
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function HomePage() {
  let blogs: Blog[] = [];

  try {
    const response = await fetch(
      `${SITE_URL}/api/blogs?published=true&limit=40`,
      {
        next: {
          revalidate: 60,
          tags: ["homepage-blogs"],
        },
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (Array.isArray(data)) {
        blogs = data as Blog[];
      } else if (Array.isArray(data?.blogs)) {
        blogs = data.blogs as Blog[];
      }
    }
  } catch (error) {
    console.error(
      "Homepage blog fetch failed:",
      error
    );
  }

  /* =======================================================
     ONLY USE PUBLISHED ARTICLES
  ====================================================== */

  const publishedBlogs = blogs.filter(
    (blog) => blog.published !== false
  );

  /* =======================================================
     FEATURED

     FeaturedSlider expects:
       excerpt: string | null
       created_at: string

     We normalize those fields here.
  ====================================================== */

  const featuredBlogs = publishedBlogs
    .filter((blog) => blog.featured === true)
    .slice(0, 5)
    .map((blog) => normalizeBlog(blog));

  /* =======================================================
     LATEST

     Exclude featured articles from the latest section.
  ====================================================== */

  const featuredIds = new Set(
    featuredBlogs.map((blog) => blog.id)
  );

  const latestBlogs = publishedBlogs
    .filter((blog) => !featuredIds.has(blog.id))
    .sort((a, b) => {
      const dateA = new Date(
        a.published_at || a.created_at || 0
      ).getTime();

      const dateB = new Date(
        b.published_at || b.created_at || 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 6);

  /* =======================================================
     CATEGORY DATA
  ====================================================== */

  const categoryBlogs = CATEGORY_ORDER.map(
    (category) => {
      const matchingBlogs = publishedBlogs
        .filter((blog) => {
          if (!blog.category) return false;

          return (
            blog.category.toLowerCase().trim() ===
            category.name.toLowerCase().trim()
          );
        })
        .sort((a, b) => {
          const dateA = new Date(
            a.published_at || a.created_at || 0
          ).getTime();

          const dateB = new Date(
            b.published_at || b.created_at || 0
          ).getTime();

          return dateB - dateA;
        })
        .slice(0, 4);

      return {
        category,
        blogs: matchingBlogs,
      };
    }
  );

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {/* ===================================================
          HERO
      ==================================================== */}

      <Hero />

      {/* ===================================================
          FEATURED

          Adsterra / AdBanner removed.
          No intrusive advertisement is rendered here.
      ==================================================== */}

      {featuredBlogs.length > 0 && (
        <FeaturedSlider blogs={featuredBlogs} />
      )}

      {/* ===================================================
          LATEST STORIES
      ==================================================== */}

      {latestBlogs.length > 0 && (
        <LatestStories blogs={latestBlogs} />
      )}

      {/* ===================================================
          BROWSE TOPICS
      ==================================================== */}

      <BrowseTopics />

      {/* ===================================================
          CATEGORY SECTIONS
      ==================================================== */}

      {categoryBlogs.map(
        ({ category, blogs: categoryArticles }) => (
          <CategoryFeature
            key={category.name}
            category={category}
            blogs={categoryArticles}
          />
        )
      )}

      {/* ===================================================
          SIMPLE FOOTER SPACING
      ==================================================== */}

      <div className="h-4 sm:h-6" />
    </main>
  );
}

