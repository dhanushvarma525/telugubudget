import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  cover_image_alt: string | null;
  category: string | null;
  author: string | null;
  tags: string[] | null;
  published: boolean;
  featured: boolean;
  reading_time: number | null;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getBlog(slug: string): Promise<Blog | null> {
  const decodedSlug = decodeURIComponent(slug);

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("BLOG FETCH ERROR:", error);
    return null;
  }

  return data as Blog | null;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: PageProps) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Article Not Found | AnantaGo",
    };
  }

  return {
    title:
      blog.seo_title ||
      `${blog.title} | AnantaGo`,

    description:
      blog.seo_description ||
      blog.excerpt ||
      "Useful technology stories, AI updates and practical guides from AnantaGo.",

    openGraph: {
      title:
        blog.seo_title ||
        blog.title,

      description:
        blog.seo_description ||
        blog.excerpt ||
        "",

      type: "article",

      publishedTime: blog.created_at,

      modifiedTime: blog.updated_at,

      authors: [
        blog.author ||
          "AnantaGo Editorial",
      ],

      ...(blog.cover_image
        ? {
            images: [
              {
                url: blog.cover_image,
                alt:
                  blog.cover_image_alt ||
                  blog.title,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function BlogArticlePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  return (
    <>
      <Header />

      <main className="bg-white">

        {/* =========================
            ARTICLE HEADER
        ========================== */}

        <header className="border-b border-zinc-200">
          <div className="mx-auto max-w-5xl px-5 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8 lg:pt-20">

            {blog.category && (
              <Link
                href={`/${blog.category
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="inline-flex rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800"
              >
                {blog.category}
              </Link>
            )}

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-zinc-950 sm:text-5xl lg:text-6xl">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 sm:text-xl sm:leading-9">
                {blog.excerpt}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
              <span className="font-semibold text-zinc-900">
                {blog.author ||
                  "AnantaGo Editorial"}
              </span>

              <span className="text-zinc-300">
                •
              </span>

              <time dateTime={blog.created_at}>
                {formatDate(blog.created_at)}
              </time>

              {blog.reading_time && (
                <>
                  <span className="text-zinc-300">
                    •
                  </span>

                  <span>
                    {blog.reading_time} min read
                  </span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* =========================
            COVER IMAGE
        ========================== */}

        {blog.cover_image && (
          <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-6 sm:pt-10 lg:px-8">

            <div className="overflow-hidden rounded-2xl bg-zinc-100 sm:rounded-3xl">

              <img
                src={blog.cover_image}
                alt={
                  blog.cover_image_alt ||
                  blog.title
                }
                className="block h-auto max-h-[650px] w-full object-cover"
              />

            </div>

          </section>
        )}

        {/* =========================
            ARTICLE CONTENT
        ========================== */}

        <article className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

          <div
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: blog.content || "",
            }}
          />

          {/* =========================
              TAGS
          ========================== */}

          {blog.tags &&
            blog.tags.length > 0 && (
              <div className="mt-16 border-t border-zinc-200 pt-8">

                <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                  Topics
                </p>

                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

              </div>
            )}

        </article>

        {/* =========================
            BOTTOM CTA
        ========================== */}

        <section className="border-t border-zinc-200 bg-zinc-950 text-white">

          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              AnantaGo
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Technology, made easier.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Useful AI and technology stories,
              practical guides and clear explanations
              for the digital world.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-200"
            >
              Explore AnantaGo
              <span className="ml-2">
                →
              </span>
            </Link>

          </div>

        </section>

      </main>

      <Footer />

      {/* =========================
          ARTICLE STYLES
      ========================== */}

      <style>{`

        .article-content {
          color: #27272a;
          font-size: 1.08rem;
          line-height: 1.9;
          overflow-wrap: break-word;
        }

        /* H2 */

        .article-content h2 {
          margin-top: 4rem;
          margin-bottom: 1.25rem;
          color: #09090b;
          font-size: 2rem;
          line-height: 1.2;
          font-weight: 850;
          letter-spacing: -0.035em;
        }

        .article-content > h2:first-child {
          margin-top: 0;
        }

        /* H3 */

        .article-content h3 {
          margin-top: 2.75rem;
          margin-bottom: 1rem;
          color: #09090b;
          font-size: 1.45rem;
          line-height: 1.3;
          font-weight: 800;
          letter-spacing: -0.025em;
        }

        /* Paragraph */

        .article-content p {
          margin: 1.25rem 0;
        }

        /* Bold */

        .article-content strong {
          color: #09090b;
          font-weight: 750;
        }

        /* Italic */

        .article-content em {
          font-style: italic;
        }

        /* Links */

        .article-content a {
          color: #18181b;
          font-weight: 650;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 4px;
        }

        .article-content a:hover {
          color: #52525b;
        }

        /* Lists */

        .article-content ul {
          margin: 1.5rem 0;
          padding-left: 1.6rem;
          list-style: disc;
        }

        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 1.6rem;
          list-style: decimal;
        }

        .article-content li {
          margin: 0.55rem 0;
          padding-left: 0.3rem;
        }

        /* Quote */

        .article-content blockquote {
          margin: 2.5rem 0;
          border-left: 4px solid #18181b;
          border-radius: 0 1rem 1rem 0;
          background: #f4f4f5;
          padding: 1.25rem 1.5rem;
          color: #52525b;
          font-style: italic;
        }

        /* Code */

        .article-content pre {
          margin: 2rem 0;
          overflow-x: auto;
          border-radius: 1rem;
          background: #18181b;
          padding: 1.25rem;
          color: #f4f4f5;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;
          font-size: 0.9rem;
          line-height: 1.7;
        }

        .article-content code {
          border-radius: 0.35rem;
          background: #f4f4f5;
          padding: 0.15rem 0.35rem;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;
          font-size: 0.9em;
        }

        .article-content pre code {
          background: transparent;
          padding: 0;
        }

        /* ALL ARTICLE IMAGES */

        .article-content figure {
          width: 100%;
          margin: 3rem 0;
        }

        .article-content img {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          max-height: 700px;
          object-fit: contain;
          border-radius: 1rem;
          margin: 0 auto;
        }

        .article-content figcaption {
          margin-top: 0.75rem;
          text-align: center;
          color: #71717a;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        /* Tables */

        .article-content table {
          width: 100%;
          margin: 2.5rem 0;
          border-collapse: collapse;
          border: 1px solid #e4e4e7;
          font-size: 0.95rem;
        }

        .article-content th,
        .article-content td {
          border: 1px solid #e4e4e7;
          padding: 0.8rem 0.9rem;
          text-align: left;
          vertical-align: top;
        }

        .article-content th {
          background: #f4f4f5;
          color: #18181b;
          font-weight: 700;
        }

        .article-content tr:nth-child(even) td {
          background: #fafafa;
        }

        /* Horizontal rule */

        .article-content hr {
          margin: 3rem 0;
          border: 0;
          border-top: 1px solid #e4e4e7;
        }

        /* Buttons */

        .article-content button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          padding: 0.7rem 1rem;
          border-radius: 0.75rem;
          background: #18181b;
          color: white;
          font-weight: 700;
          text-decoration: none;
        }

        /* Prevent broken wide content */

        .article-content iframe,
        .article-content video {
          display: block;
          width: 100%;
          max-width: 100%;
          margin: 2rem 0;
          border-radius: 1rem;
        }

        /* Mobile */

        @media (max-width: 640px) {

          .article-content {
            font-size: 1rem;
            line-height: 1.8;
          }

          .article-content h2 {
            margin-top: 3rem;
            font-size: 1.55rem;
          }

          .article-content h3 {
            margin-top: 2rem;
            font-size: 1.25rem;
          }

          .article-content img {
            max-height: 500px;
            border-radius: 0.75rem;
          }

          .article-content table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }

        }

      `}</style>
    </>
  );
}