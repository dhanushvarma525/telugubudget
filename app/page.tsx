import Link from "next/link";

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
  id: number;
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
};

async function getBlogs(): Promise<Blog[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

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

    const articles = Array.isArray(data?.blogs)
      ? data.blogs
      : [];

    return articles.sort(
      (a: Blog, b: Blog) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error(
      "HOME BLOG FETCH ERROR:",
      error
    );

    return [];
  }
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default async function HomePage() {
  const blogs = await getBlogs();

  const featuredArticle =
    blogs.find((blog) => blog.featured) ||
    blogs[0] ||
    null;

  const latestArticles = blogs
    .filter(
      (blog) =>
        blog.id !== featuredArticle?.id
    )
    .slice(0, 6);

  const hasMoreArticles = blogs.length > 7;

  return (
    <main className="bg-white text-zinc-950">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#0b0b0d] text-white">

        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-white/[0.025] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">

          <div className="grid min-h-[570px] items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-24">

            {/* LEFT */}

            <div className="max-w-3xl">

              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-2">

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 sm:text-xs">
                  AI
                </span>

                <span className="mx-3 h-1 w-1 rounded-full bg-zinc-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 sm:text-xs">
                  TECH
                </span>

                <span className="mx-3 h-1 w-1 rounded-full bg-zinc-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 sm:text-xs">
                  DIGITAL LIFE
                </span>

              </div>

              <h1 className="mt-7 text-5xl font-black leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl lg:text-8xl">
                Technology,
                <br />
                <span className="text-zinc-400">
                  made easier.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8 lg:text-xl">
                Useful technology stories, AI updates,
                practical how-to guides and simple
                explanations of the digital world.
              </p>

              {/* HERO BUTTONS */}

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                {/* WHITE BUTTON - BLACK TEXT */}

                <Link
                  href="/ai"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold !text-black shadow-lg transition hover:bg-zinc-200 hover:!text-black [&>*]:!text-black"
                >
                  Explore AI
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </Link>

                {/* DARK BUTTON - WHITE TEXT */}

                <Link
                  href="/tech"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-bold !text-white backdrop-blur-sm transition hover:bg-white/20 hover:!text-white [&>*]:!text-white"
                >
                  Latest Tech
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </Link>

              </div>

            </div>

            {/* RIGHT VISUAL */}

            <div className="hidden lg:block">

              <div className="relative mx-auto aspect-square max-w-[430px]">

                <div className="absolute inset-12 rounded-full bg-white/[0.045] blur-3xl" />

                <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 shadow-2xl">

                  <div className="flex h-full flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111114] p-7">

                    <div className="flex items-center justify-between">

                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                        ANANTAGO
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                        Digital
                      </span>

                    </div>

                    <div>

                      <div className="mb-5 h-px w-16 bg-white/30" />

                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                        Understand
                      </p>

                      <h2 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white">
                        What matters
                        <br />
                        in technology.
                      </h2>

                      <p className="mt-5 max-w-xs text-sm leading-6 text-zinc-400">
                        Clear stories. Useful guides.
                        Better digital decisions.
                      </p>

                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-5">

                      <span className="text-xs text-zinc-500">
                        AI & Technology
                      </span>

                      <span className="text-sm font-bold text-white">
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
          FEATURED STORY
      ====================================================== */}

      {featuredArticle && (
        <section className="mx-auto max-w-7xl px-5 py-14 sm:py-16 lg:px-8 lg:py-20">

          <div className="mb-7 flex items-end justify-between gap-5">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Featured story
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                The story to know
              </h2>

            </div>

            <Link
              href="/"
              className="hidden text-sm font-bold !text-zinc-500 transition hover:!text-zinc-950 sm:block"
            >
              AnantaGo
            </Link>

          </div>

          <Link
            href={`/blog/${featuredArticle.slug}`}
            className="group block overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >

            <div className="grid lg:grid-cols-2">

              {/* TEXT */}

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12 xl:p-14">

                {featuredArticle.category && (
                  <span className="w-fit rounded-full bg-zinc-950 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] !text-white">
                    {featuredArticle.category}
                  </span>
                )}

                <h3 className="mt-5 text-3xl font-black leading-[1.08] tracking-[-0.035em] sm:text-4xl xl:text-5xl">
                  {featuredArticle.title}
                </h3>

                {featuredArticle.excerpt && (
                  <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
                    {featuredArticle.excerpt}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-500">

                  <span>
                    {formatDate(
                      featuredArticle.created_at
                    )}
                  </span>

                  {featuredArticle.reading_time && (
                    <>
                      <span className="text-zinc-300">
                        •
                      </span>

                      <span>
                        {featuredArticle.reading_time} min read
                      </span>
                    </>
                  )}

                </div>

                <div className="mt-7">

                  <span className="inline-flex h-11 items-center rounded-xl bg-zinc-950 px-5 text-sm font-bold !text-white transition group-hover:bg-zinc-800 [&>*]:!text-white">
                    Read the story
                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>

                </div>

              </div>

              {/* IMAGE */}

              <div className="relative h-[280px] overflow-hidden bg-zinc-100 sm:h-[380px] lg:h-[520px]">

                {featuredArticle.cover_image ? (
                  <img
                    src={featuredArticle.cover_image}
                    alt={
                      featuredArticle.cover_image_alt ||
                      featuredArticle.title
                    }
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-sm font-semibold text-zinc-400">
                    AnantaGo
                  </div>
                )}

              </div>

            </div>

          </Link>

        </section>
      )}

      {/* =====================================================
          LATEST STORIES
      ====================================================== */}

      <section className="border-y border-zinc-200 bg-zinc-50">

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

          <div className="mb-9 flex items-end justify-between gap-6">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                Latest
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Latest stories
              </h2>

            </div>

            {blogs.length > 0 && (
              <p className="hidden text-sm font-medium text-zinc-500 sm:block">
                {blogs.length} published{" "}
                {blogs.length === 1
                  ? "article"
                  : "articles"}
              </p>
            )}

          </div>

          {latestArticles.length > 0 ? (
            <>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {latestArticles.map(
                  (article) => (
                    <article
                      key={article.id}
                      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >

                      <Link
                        href={`/blog/${article.slug}`}
                        className="block"
                      >

                        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">

                          {article.cover_image ? (
                            <img
                              src={article.cover_image}
                              alt={
                                article.cover_image_alt ||
                                article.title
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-medium text-zinc-400">
                              AnantaGo
                            </div>
                          )}

                        </div>

                        <div className="p-6">

                          {article.category && (
                            <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                              {article.category}
                            </span>
                          )}

                          <h3 className="mt-3 text-2xl font-black leading-tight tracking-tight text-zinc-950">
                            {article.title}
                          </h3>

                          {article.excerpt && (
                            <p className="mt-4 line-clamp-3 leading-7 text-zinc-600">
                              {article.excerpt}
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-400">

                            <span>
                              {formatDate(
                                article.created_at
                              )}
                            </span>

                            {article.reading_time && (
                              <>
                                <span>
                                  •
                                </span>

                                <span>
                                  {article.reading_time} min read
                                </span>
                              </>
                            )}

                          </div>

                          <div className="mt-6 text-sm font-bold !text-zinc-950">
                            Read more
                            <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">
                              →
                            </span>
                          </div>

                        </div>

                      </Link>

                    </article>
                  )
                )}

              </div>

              {hasMoreArticles && (
                <div className="mt-10 text-center">

                  <Link
                    href="/search"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-sm font-bold !text-zinc-950 transition hover:border-zinc-950 hover:bg-zinc-950 hover:!text-white"
                  >
                    View all articles
                    <span className="ml-2">
                      →
                    </span>
                  </Link>

                </div>
              )}

            </>
          ) : (

            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">

              <h3 className="text-2xl font-black text-zinc-950">
                Articles are coming soon.
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-zinc-500">
                AnantaGo is preparing useful AI,
                technology and digital-life stories.
              </p>

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          EXPLORE CATEGORIES
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8 lg:py-24">

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
          Explore
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
          Explore AnantaGo
        </h2>

        <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
          Discover practical technology content organized
          around the topics that matter most in the digital
          world.
        </p>

        <div className="mt-10 grid overflow-hidden rounded-2xl border border-zinc-200 sm:grid-cols-2 lg:grid-cols-3">

          {categories.map(
            (category, index) => (
              <Link
                key={category.href}
                href={category.href}
                className={`group border-zinc-200 bg-white p-7 transition hover:bg-zinc-50 sm:p-8 ${
                  index < 3
                    ? "border-b"
                    : ""
                } ${
                  index % 3 !== 2
                    ? "lg:border-r"
                    : ""
                } ${
                  index % 2 === 0
                    ? "sm:border-r lg:border-r"
                    : ""
                }`}
              >

                <div className="flex items-start justify-between gap-4">

                  <h3 className="text-2xl font-black tracking-tight text-zinc-950">
                    {category.name}
                  </h3>

                  <span className="text-xl !text-zinc-400 transition-transform group-hover:translate-x-1">
                    →
                  </span>

                </div>

                <p className="mt-3 leading-7 text-zinc-600">
                  {category.description}
                </p>

                <span className="mt-6 inline-block text-sm font-bold !text-zinc-950">
                  Explore category
                </span>

              </Link>
            )
          )}

        </div>

      </section>

      {/* =====================================================
          EDITORIAL STATEMENT
      ====================================================== */}

      <section className="bg-zinc-950 text-white">

        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:py-24 lg:px-8 lg:py-28">

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Our approach
          </p>

          <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.035em] !text-white sm:text-5xl lg:text-6xl">
            Useful technology content without
            the unnecessary noise.
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            Clear information, practical guides and genuinely
            useful stories for the rapidly changing digital
            world.
          </p>

          <div className="mt-8">

            <Link
              href="/about"
              className="inline-flex h-11 items-center rounded-xl border border-white/20 px-5 text-sm font-bold !text-white transition hover:bg-white hover:!text-black [&>*]:!text-white hover:[&>*]:!text-black"
            >
              Learn about AnantaGo
              <span className="ml-2">
                →
              </span>
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}