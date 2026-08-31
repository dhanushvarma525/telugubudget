
import Link from "next/link";
import FeaturedSlider from "@/components/FeaturedSlider";
import AdBanner from "@/components/AdBanner";

const categories = [
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
    description: "Simple guides that help you get things done.",
    href: "/how-to",
  },
  {
    name: "Apps",
    description: "Useful apps, software and digital tools.",
    href: "/apps",
  },
  {
    name: "Security",
    description: "Privacy, cybersecurity, scams and online safety.",
    href: "/security",
  },
  {
    name: "Explained",
    description: "Complex technology explained in simple language.",
    href: "/explained",
  },
];

type Blog = {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  cover_image_alt?: string | null;
  category: string | null;
  author: string | null;
  featured: boolean;
  published: boolean;
  reading_time?: number | null;
  created_at: string;
  published_at?: string | null;
};

/* =========================================================
   BLOG FETCH
========================================================= */

async function getBlogs(): Promise<Blog[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.anatago.com";

    const response = await fetch(
      `${baseUrl}/api/blogs?published=true&limit=100`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "HOME BLOG API ERROR:",
        response.status
      );

      return [];
    }

    const data = await response.json();

    const articles: Blog[] = Array.isArray(data?.blogs)
      ? data.blogs
      : [];

    return articles
      .filter(
        (article) => article.published !== false
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.published_at || a.created_at
        ).getTime();

        const dateB = new Date(
          b.published_at || b.created_at
        ).getTime();

        return dateB - dateA;
      });
  } catch (error) {
    console.error(
      "HOME BLOG FETCH ERROR:",
      error
    );

    return [];
  }
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
  dateString?: string | null
) {
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
  article,
}: {
  article: Blog;
}) {
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-xl
        border
        border-zinc-200
        bg-white
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-zinc-300
        hover:shadow-lg
        sm:rounded-xl
      "
    >
      <Link
        href={`/blog/${article.slug}`}
        className="block"
        aria-label={`Read ${article.title}`}
      >
        {/* IMAGE */}

        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
          {article.cover_image ? (
            <img
              src={article.cover_image}
              alt={
                article.cover_image_alt ||
                article.title
              }
              loading="lazy"
              decoding="async"
              className="
                h-full
                w-full
                object-cover
                transition
                duration-500
                group-hover:scale-[1.04]
              "
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-medium text-zinc-400">
              AnantaGo
            </div>
          )}
        </div>

        {/* CONTENT */}

        <div
          className="
            p-3
            sm:p-5
          "
        >
          {/* CATEGORY */}

          {article.category && (
            <span
              className="
                block
                truncate
                text-[8px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-zinc-500
                sm:text-[10px]
                sm:tracking-[0.14em]
              "
            >
              {article.category}
            </span>
          )}

          {/* TITLE */}

          <h3
            className="
              mt-1.5
              line-clamp-2
              text-[12px]
              font-black
              leading-[1.35]
              tracking-tight
              text-zinc-950
              sm:mt-2
              sm:text-lg
              sm:leading-tight
            "
          >
            {article.title}
          </h3>

          {/* EXCERPT */}

          {article.excerpt && (
            <p
              className="
                mt-2
                hidden
                line-clamp-2
                text-xs
                leading-5
                text-zinc-600
                sm:block
                sm:text-sm
                sm:leading-6
              "
            >
              {article.excerpt}
            </p>
          )}

          {/* DATE / READING TIME */}

          <div
            className="
              mt-2.5
              flex
              items-center
              gap-1.5
              text-[8px]
              font-medium
              text-zinc-400
              sm:mt-4
              sm:gap-1.5
              sm:text-[10px]
            "
          >
            <span>
              {formatDate(
                article.published_at ||
                  article.created_at
              )}
            </span>

            {article.reading_time && (
              <>
                <span aria-hidden="true">
                  •
                </span>

                <span className="truncate">
                  {article.reading_time} min
                </span>
              </>
            )}
          </div>

          {/* READ MORE — DESKTOP */}

          <div className="mt-3 hidden text-sm font-bold text-zinc-950 sm:block">
            Read more

            <span
              aria-hidden="true"
              className="
                ml-1
                inline-block
                transition-transform
                group-hover:translate-x-1
              "
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   CATEGORY SECTION
========================================================= */

function CategorySection({
  category,
  articles,
}: {
  category: (typeof categories)[number];
  articles: Blog[];
}) {
  if (!articles.length) {
    return null;
  }

  return (
    <section
      aria-labelledby={`category-${category.name.toLowerCase()}`}
      className="border-t border-zinc-200"
    >
      <div
        className="
          mx-auto
          max-w-[1280px]
          px-5
          py-12
          sm:px-6
          sm:py-14
          lg:px-8
          lg:py-16
        "
      >
        {/* CATEGORY HEADER */}

        <div
          className="
            mb-5
            flex
            items-end
            justify-between
            gap-3
            sm:mb-6
            sm:gap-4
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />

              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-zinc-500
                  sm:text-[10px]
                  sm:tracking-[0.18em]
                "
              >
                {category.name}
              </p>
            </div>

            <h2
              id={`category-${category.name.toLowerCase()}`}
              className="
                mt-2
                text-xl
                font-black
                tracking-tight
                text-zinc-950
                sm:text-3xl
              "
            >
              Latest {category.name}
            </h2>
          </div>

          <Link
            href={category.href}
            className="
              shrink-0
              text-[10px]
              font-bold
              text-zinc-500
              transition
              hover:text-zinc-950
              sm:text-sm
            "
          >
            View all →
          </Link>
        </div>

        {/* 
          MOBILE:
          2 ARTICLES PER ROW

          DESKTOP:
          3 ARTICLES PER ROW
        */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-2
            sm:gap-5
            lg:grid-cols-3
            lg:gap-6
          "
        >
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

export default async function HomePage() {
  const blogs = await getBlogs();

  /* =======================================================
     FEATURED
  ======================================================= */

  const featuredBlogs = blogs
    .filter((blog) => blog.featured)
    .slice(0, 5);

  const featuredIds = new Set(
    featuredBlogs.map((blog) => blog.id)
  );

  /* =======================================================
     LATEST
  ======================================================= */

  const latestArticles = blogs
    .filter(
      (blog) => !featuredIds.has(blog.id)
    )
    .slice(0, 6);

  /* =======================================================
     CATEGORY ARTICLES

     EACH CATEGORY = LATEST 4 ARTICLES

     Mobile:
     1  2
     3  4

     Desktop:
     1  2  3
     4
  ======================================================= */

  const categoryArticles: Record<
    string,
    Blog[]
  > = {};

  categories.forEach((category) => {
    categoryArticles[category.name] =
      blogs
        .filter(
          (blog) =>
            blog.category
              ?.trim()
              .toLowerCase() ===
            category.name.toLowerCase()
        )
        .slice(0, 4);
  });

  return (
    <main className="bg-white text-zinc-950">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#0b0b0d] text-white">

        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/[0.035] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/[0.025] blur-3xl" />

        <div className="relative mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-8">

          <div
            className="
              grid
              min-h-[520px]
              items-center
              gap-10
              py-16
              lg:grid-cols-[1.1fr_0.9fr]
              lg:py-20
            "
          >

            <div className="animate-home-fade-up max-w-3xl">

              <div
                className="
                  inline-flex
                  items-center
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-3.5
                  py-1.5
                "
              >

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
                  AI
                </span>

                <span className="mx-2.5 h-1 w-1 rounded-full bg-zinc-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
                  TECH
                </span>

                <span className="mx-2.5 h-1 w-1 rounded-full bg-zinc-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
                  DIGITAL LIFE
                </span>

              </div>

              <h1
                className="
                  mt-6
                  text-5xl
                  font-black
                  leading-[0.96]
                  tracking-[-0.05em]
                  text-white
                  sm:text-6xl
                  lg:text-7xl
                "
              >
                Technology,
                <br />

                <span className="text-zinc-400">
                  made easier.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                Useful technology stories, AI updates,
                practical how-to guides and simple
                explanations of the digital world.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/ai"
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    px-5
                    text-sm
                    font-bold
                    text-black
                    transition
                    hover:bg-zinc-200
                  "
                >
                  Explore AI

                  <span className="ml-2">
                    →
                  </span>
                </Link>

                <Link
                  href="/blog"
                  className="
                    inline-flex
                    h-11
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-white/20
                    bg-white/[0.06]
                    px-5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-white/10
                  "
                >
                  Latest Articles

                  <span className="ml-2">
                    →
                  </span>
                </Link>

              </div>

            </div>

            {/* DESKTOP HERO VISUAL */}

            <div className="hidden justify-end animate-home-fade-in lg:flex">

              <div className="relative w-full max-w-[390px]">

                <div className="absolute inset-8 rounded-full bg-white/[0.04] blur-3xl" />

                <div className="relative rounded-3xl border border-white/10 bg-white/[0.035] p-2 shadow-2xl">

                  <div className="rounded-2xl border border-white/10 bg-[#111114] p-7">

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        ANANTAGO
                      </span>

                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                        Digital
                      </span>

                    </div>

                    <div className="my-12">

                      <div className="mb-4 h-px w-12 bg-white/30" />

                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        Understand
                      </p>

                      <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white">
                        What matters
                        <br />
                        in technology.
                      </h2>

                      <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500">
                        Clear stories. Useful guides.
                        Better digital decisions.
                      </p>

                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4">

                      <span className="text-[10px] text-zinc-500">
                        AI & Technology
                      </span>

                      <span className="text-sm text-white">
                        →
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          HOMEPAGE AD
          ONLY ONE HOMEPAGE AD
      ===================================================== */}

      <AdBanner position="top" />

      {/* =====================================================
          FEATURED STORIES
      ===================================================== */}

      {featuredBlogs.length > 0 && (
        <FeaturedSlider
          blogs={featuredBlogs}
        />
      )}

      {/* =====================================================
          LATEST STORIES
      ===================================================== */}

      <section className="border-y border-zinc-200 bg-zinc-50">

        <div
          className="
            mx-auto
            max-w-[1280px]
            px-5
            py-12
            sm:px-6
            sm:py-14
            lg:px-8
            lg:py-16
          "
        >

          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-7">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Latest
                </p>

              </div>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Latest stories
              </h2>

            </div>

            <Link
              href="/blog"
              className="
                shrink-0
                text-[10px]
                font-bold
                text-zinc-500
                transition
                hover:text-zinc-950
                sm:text-sm
              "
            >
              View all →
            </Link>

          </div>

          {latestArticles.length > 0 ? (

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-2
                sm:gap-5
                lg:grid-cols-3
                lg:gap-6
              "
            >

              {latestArticles.map(
                (article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                  />
                )
              )}

            </div>

          ) : (

            <div
              className="
                rounded-xl
                border
                border-dashed
                border-zinc-300
                bg-white
                px-6
                py-12
                text-center
              "
            >

              <h3 className="font-bold">
                Articles are coming soon.
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                AnantaGo is preparing useful
                technology stories.
              </p>

            </div>

          )}

        </div>
      </section>

      {/* =====================================================
          CATEGORY SECTIONS
      ===================================================== */}

      {categories.map((category) => (
        <CategorySection
          key={category.href}
          category={category}
          articles={
            categoryArticles[
              category.name
            ] || []
          }
        />
      ))}

      {/* =====================================================
          BROWSE TOPICS
      ===================================================== */}

      <section className="border-t border-zinc-200 bg-zinc-50">

        <div
          className="
            mx-auto
            max-w-[1280px]
            px-5
            py-14
            sm:px-6
            sm:py-16
            lg:px-8
          "
        >

          <div className="mb-7">

            <div className="flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Explore
              </p>

            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Browse by topic
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Find useful stories and guides across
              the topics covered by AnantaGo.
            </p>

          </div>

          <div
            className="
              grid
              grid-cols-2
              overflow-hidden
              rounded-xl
              border
              border-zinc-200
              bg-white
              sm:grid-cols-3
            "
          >

            {categories.map(
              (category, index) => (

                <Link
                  key={category.href}
                  href={category.href}
                  className={`
                    group
                    border-zinc-200
                    p-5
                    transition
                    hover:bg-zinc-50
                    sm:p-6

                    ${
                      index < 4
                        ? "border-b"
                        : ""
                    }

                    ${
                      index % 3 !== 2
                        ? "sm:border-r"
                        : ""
                    }

                    ${
                      index % 2 === 0
                        ? "border-r sm:border-r"
                        : ""
                    }
                  `}
                >

                  <div className="flex items-center justify-between gap-3">

                    <h3 className="text-lg font-black text-zinc-950">
                      {category.name}
                    </h3>

                    <span className="text-zinc-400 transition-transform group-hover:translate-x-1">
                      →
                    </span>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm">
                    {category.description}
                  </p>

                </Link>

              )
            )}

          </div>

        </div>
      </section>

      {/* =====================================================
          EDITORIAL
      ===================================================== */}

      <section className="bg-zinc-950 text-white">

        <div
          className="
            mx-auto
            max-w-4xl
            px-5
            py-16
            text-center
            sm:px-6
            sm:py-20
            lg:px-8
          "
        >

          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            Our approach
          </p>

          <h2
            className="
              mt-4
              text-3xl
              font-black
              leading-tight
              tracking-tight
              text-white
              sm:text-4xl
            "
          >
            Useful technology content without
            unnecessary noise.
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-zinc-400
              sm:text-base
            "
          >
            Clear information, practical guides and
            genuinely useful stories for the rapidly
            changing digital world.
          </p>

          <Link
            href="/about"
            className="
              mt-6
              inline-flex
              h-10
              items-center
              rounded-lg
              border
              border-white/20
              px-4
              text-sm
              font-bold
              text-white
              transition
              hover:bg-white
              hover:text-black
            "
          >
            Learn about AnantaGo

            <span className="ml-2">
              →
            </span>
          </Link>

        </div>

      </section>

    </main>
  );
}

