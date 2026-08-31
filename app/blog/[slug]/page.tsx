import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import AdOne from "@/components/AdOne";

type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  introduction: string | null;

  cover_image: string | null;
  cover_image_alt: string | null;

  category: string | null;
  author: string | null;
  tags: string[] | null;

  published: boolean;
  featured: boolean;

  reading_time: number | null;
  views: number | null;

  content_blocks: unknown;
  faqs: unknown;

  published_at: string | null;
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

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string | null) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function getCategorySlug(category: string) {
  return category
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getString(
  object: Record<string, unknown>,
  keys: string[]
): string {
  for (const key of keys) {
    const value = object[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}

function getArray(
  object: Record<string, unknown>,
  keys: string[]
): unknown[] {
  for (const key of keys) {
    const value = object[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

/* =========================================================
   JSON PARSER
========================================================= */

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

/* =========================================================
   FAQ NORMALIZER
========================================================= */

type NormalizedFAQ = {
  question: string;
  answer: string;
};

function normalizeFaqs(value: unknown): NormalizedFAQ[] {
  if (value === null || value === undefined) {
    return [];
  }

  let parsed: unknown = value;

  /*
   * If Supabase returns JSON as a string,
   * try to parse it.
   */
  if (typeof parsed === "string") {
    const trimmed = parsed.trim();

    if (!trimmed) {
      return [];
    }

    try {
      parsed = JSON.parse(trimmed);
    } catch {
      /*
       * Plain text FAQ fallback.
       *
       * Example:
       *
       * Question: What is AI?
       * Answer: AI means Artificial Intelligence.
       *
       * Question: Is AI useful?
       * Answer: Yes.
       */

      const lines = trimmed
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const faqList: NormalizedFAQ[] = [];

      let currentQuestion = "";
      let currentAnswer = "";

      for (const line of lines) {
        const lower = line.toLowerCase();

        if (
          lower.startsWith("question:") ||
          lower.startsWith("q:")
        ) {
          if (currentQuestion && currentAnswer) {
            faqList.push({
              question: currentQuestion,
              answer: currentAnswer,
            });
          }

          currentQuestion = line
            .substring(line.indexOf(":") + 1)
            .trim();

          currentAnswer = "";
        } else if (
          lower.startsWith("answer:") ||
          lower.startsWith("a:")
        ) {
          currentAnswer = line
            .substring(line.indexOf(":") + 1)
            .trim();
        } else if (currentQuestion) {
          currentAnswer +=
            (currentAnswer ? " " : "") + line;
        }
      }

      if (currentQuestion && currentAnswer) {
        faqList.push({
          question: currentQuestion,
          answer: currentAnswer,
        });
      }

      return faqList;
    }
  }

  /*
   * Handle:
   *
   * {
   *   "faqs": [...]
   * }
   *
   * {
   *   "items": [...]
   * }
   *
   * {
   *   "questions": [...]
   * }
   *
   * {
   *   "data": [...]
   * }
   */

  if (isObject(parsed)) {
    if (Array.isArray(parsed.faqs)) {
      parsed = parsed.faqs;
    } else if (Array.isArray(parsed.items)) {
      parsed = parsed.items;
    } else if (Array.isArray(parsed.questions)) {
      parsed = parsed.questions;
    } else if (Array.isArray(parsed.data)) {
      parsed = parsed.data;
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const result: NormalizedFAQ[] = [];

  for (const item of parsed) {
    /*
     * Object format:
     *
     * {
     *   question: "...",
     *   answer: "..."
     * }
     */

    if (isObject(item)) {
      const question = getString(item, [
        "question",
        "title",
        "q",
        "Question",
      ]);

      const answer = getString(item, [
        "answer",
        "content",
        "a",
        "description",
        "Answer",
      ]);

      if (question && answer) {
        result.push({
          question,
          answer,
        });
      }

      continue;
    }

    /*
     * Array format:
     *
     * [
     *   ["Question", "Answer"],
     *   ["Question 2", "Answer 2"]
     * ]
     */

    if (Array.isArray(item)) {
      const question =
        typeof item[0] === "string"
          ? item[0].trim()
          : "";

      const answer =
        typeof item[1] === "string"
          ? item[1].trim()
          : "";

      if (question && answer) {
        result.push({
          question,
          answer,
        });
      }
    }
  }

  return result;
}

/* =========================================================
   BLOG FETCH
========================================================= */

async function getBlog(
  slug: string
): Promise<Blog | null> {
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

/* =========================================================
   RELATED BLOGS
========================================================= */

async function getRelatedBlogs(
  blog: Blog
): Promise<Blog[]> {
  let related: Blog[] = [];

  if (blog.category) {
    const { data } = await supabase
      .from("blogs")
      .select(`
        id,
        title,
        slug,
        excerpt,
        cover_image,
        cover_image_alt,
        category,
        author,
        tags,
        published,
        featured,
        reading_time,
        views,
        published_at,
        created_at,
        updated_at,
        content_blocks,
        faqs,
        introduction,
        content,
        seo_title,
        seo_description
      `)
      .eq("published", true)
      .eq("category", blog.category)
      .neq("id", blog.id)
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(6);

    if (data) {
      related = data as Blog[];
    }
  }

  if (related.length < 6) {
    const existingIds = [
      blog.id,
      ...related.map((item) => item.id),
    ];

    const { data } = await supabase
      .from("blogs")
      .select(`
        id,
        title,
        slug,
        excerpt,
        cover_image,
        cover_image_alt,
        category,
        author,
        tags,
        published,
        featured,
        reading_time,
        views,
        published_at,
        created_at,
        updated_at,
        content_blocks,
        faqs,
        introduction,
        content,
        seo_title,
        seo_description
      `)
      .eq("published", true)
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(12);

    if (data) {
      const additional = (
        data as Blog[]
      ).filter(
        (item) =>
          !existingIds.includes(item.id)
      );

      related = [
        ...related,
        ...additional,
      ].slice(0, 6);
    }
  }

  return related;
}

/* =========================================================
   CONTENT BLOCK RENDERER
========================================================= */

function RenderBlock({
  block,
  index,
}: {
  block: unknown;
  index: number;
}) {
  if (typeof block === "string") {
    return (
      <p
        key={index}
        className="my-6 whitespace-pre-line"
      >
        {block}
      </p>
    );
  }

  if (!isObject(block)) {
    return null;
  }

  const type = getString(block, [
    "type",
    "block_type",
    "kind",
  ]).toLowerCase();

  /* TEXT */

  if (
    type === "text" ||
    type === "paragraph" ||
    type === "rich-text" ||
    type === "richtext"
  ) {
    const text = getString(block, [
      "text",
      "content",
      "value",
      "body",
      "html",
    ]);

    if (!text) {
      return null;
    }

    if (
      text.includes("<p") ||
      text.includes("<strong") ||
      text.includes("<em") ||
      text.includes("<a ")
    ) {
      return (
        <div
          key={index}
          className="my-6"
          dangerouslySetInnerHTML={{
            __html: text,
          }}
        />
      );
    }

    return (
      <p
        key={index}
        className="my-6 whitespace-pre-line"
      >
        {text}
      </p>
    );
  }

  /* HEADING */

  if (
    type === "heading" ||
    type === "h2" ||
    type === "section"
  ) {
    const heading = getString(block, [
      "text",
      "content",
      "title",
      "heading",
      "value",
    ]);

    if (!heading) {
      return null;
    }

    return (
      <h2
        key={index}
        className="mt-14 mb-5 text-2xl font-black leading-tight tracking-tight sm:text-3xl"
      >
        {heading}
      </h2>
    );
  }

  /* H3 */

  if (
    type === "h3" ||
    type === "subheading"
  ) {
    const heading = getString(block, [
      "text",
      "content",
      "title",
      "heading",
      "value",
    ]);

    if (!heading) {
      return null;
    }

    return (
      <h3
        key={index}
        className="mt-10 mb-4 text-xl font-extrabold leading-tight sm:text-2xl"
      >
        {heading}
      </h3>
    );
  }

  /* IMAGE */

  if (
    type === "image" ||
    type === "photo" ||
    type === "picture"
  ) {
    const image = getString(block, [
      "url",
      "src",
      "image",
      "image_url",
      "value",
    ]);

    const alt =
      getString(block, [
        "alt",
        "alt_text",
        "caption",
        "title",
      ]) ||
      "AnantaGo article image";

    const caption = getString(block, [
      "caption",
      "description",
    ]);

    if (!image) {
      return null;
    }

    return (
      <figure
        key={index}
        className="my-10"
      >
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
          <img
            src={image}
            alt={alt}
            className="block h-auto w-full object-contain"
            loading="lazy"
          />
        </div>

        {caption && (
          <figcaption className="mt-3 text-center text-sm leading-6 text-zinc-500">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  /* BULLET LIST */

  if (
    type === "bullet-list" ||
    type === "bullets" ||
    type === "unordered-list" ||
    type === "list"
  ) {
    const items = getArray(block, [
      "items",
      "list",
      "content",
      "values",
    ]);

    if (items.length === 0) {
      return null;
    }

    return (
      <ul
        key={index}
        className="my-7 list-disc space-y-3 pl-6 text-[1.08rem] leading-8"
      >
        {items.map(
          (item, itemIndex) => {
            if (
              typeof item ===
              "string"
            ) {
              return (
                <li key={itemIndex}>
                  {item}
                </li>
              );
            }

            if (isObject(item)) {
              return (
                <li key={itemIndex}>
                  {getString(item, [
                    "text",
                    "content",
                    "value",
                    "title",
                  ])}
                </li>
              );
            }

            return null;
          }
        )}
      </ul>
    );
  }

  /* ORDERED LIST */

  if (
    type === "ordered-list" ||
    type === "numbered-list" ||
    type === "steps"
  ) {
    const items = getArray(block, [
      "items",
      "list",
      "content",
      "values",
    ]);

    if (items.length === 0) {
      return null;
    }

    return (
      <ol
        key={index}
        className="my-7 list-decimal space-y-3 pl-6 text-[1.08rem] leading-8"
      >
        {items.map(
          (item, itemIndex) => {
            if (
              typeof item ===
              "string"
            ) {
              return (
                <li key={itemIndex}>
                  {item}
                </li>
              );
            }

            if (isObject(item)) {
              return (
                <li key={itemIndex}>
                  {getString(item, [
                    "text",
                    "content",
                    "value",
                    "title",
                  ])}
                </li>
              );
            }

            return null;
          }
        )}
      </ol>
    );
  }

  /* QUOTE */

  if (
    type === "quote" ||
    type === "blockquote"
  ) {
    const text = getString(block, [
      "text",
      "content",
      "quote",
      "value",
    ]);

    if (!text) {
      return null;
    }

    const author = getString(block, [
      "author",
      "source",
      "name",
    ]);

    return (
      <blockquote
        key={index}
        className="my-10 rounded-r-2xl border-l-4 border-zinc-900 bg-zinc-50 px-6 py-5"
      >
        <p className="text-lg font-medium italic leading-8 text-zinc-600">
          {text}
        </p>

        {author && (
          <footer className="mt-3 text-sm font-semibold text-zinc-500">
            — {author}
          </footer>
        )}
      </blockquote>
    );
  }

  /* CALLOUT */

  if (
    type === "callout" ||
    type === "note" ||
    type === "tip" ||
    type === "warning"
  ) {
    const title = getString(block, [
      "title",
      "heading",
      "label",
    ]);

    const text = getString(block, [
      "text",
      "content",
      "message",
      "description",
    ]);

    if (!text && !title) {
      return null;
    }

    return (
      <aside
        key={index}
        className="my-9 rounded-2xl border border-zinc-200 bg-zinc-50 p-6"
      >
        {title && (
          <h3 className="mb-2 text-base font-extrabold text-zinc-950">
            {title}
          </h3>
        )}

        {text && (
          <p className="whitespace-pre-line text-[1rem] leading-7 text-zinc-700">
            {text}
          </p>
        )}
      </aside>
    );
  }

  /* TABLE */

  if (type === "table") {
    const headers = getArray(block, [
      "headers",
      "columns",
    ]);

    const rows = getArray(block, [
      "rows",
      "data",
    ]);

    if (
      headers.length === 0 &&
      rows.length === 0
    ) {
      return null;
    }

    return (
      <div
        key={index}
        className="my-10 overflow-x-auto rounded-2xl border border-zinc-200"
      >
        <table className="w-full min-w-[600px] border-collapse text-sm">
          {headers.length > 0 && (
            <thead className="bg-zinc-100">
              <tr>
                {headers.map(
                  (
                    header,
                    headerIndex
                  ) => (
                    <th
                      key={
                        headerIndex
                      }
                      className="border-b border-zinc-200 px-5 py-4 text-left font-bold text-zinc-900"
                    >
                      {typeof header ===
                      "string"
                        ? header
                        : isObject(
                            header
                          )
                        ? getString(
                            header,
                            [
                              "text",
                              "title",
                              "value",
                            ]
                          )
                        : ""}
                    </th>
                  )
                )}
              </tr>
            </thead>
          )}

          <tbody>
            {rows.map(
              (
                row,
                rowIndex
              ) => {
                const cells =
                  Array.isArray(row)
                    ? row
                    : isObject(row)
                    ? getArray(
                        row,
                        [
                          "cells",
                          "values",
                        ]
                      )
                    : [];

                return (
                  <tr
                    key={rowIndex}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    {cells.map(
                      (
                        cell,
                        cellIndex
                      ) => (
                        <td
                          key={
                            cellIndex
                          }
                          className="px-5 py-4 align-top leading-6 text-zinc-700"
                        >
                          {typeof cell ===
                          "string"
                            ? cell
                            : isObject(
                                cell
                              )
                            ? getString(
                                cell,
                                [
                                  "text",
                                  "value",
                                  "content",
                                ]
                              )
                            : ""}
                        </td>
                      )
                    )}
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    );
  }

  /* HTML */

  if (
    type === "html" ||
    type === "raw"
  ) {
    const html = getString(block, [
      "html",
      "content",
      "value",
    ]);

    if (!html) {
      return null;
    }

    return (
      <div
        key={index}
        className="my-6"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    );
  }

  /* FALLBACK */

  const fallbackText = getString(
    block,
    [
      "text",
      "content",
      "body",
      "description",
      "value",
    ]
  );

  if (fallbackText) {
    return (
      <p
        key={index}
        className="my-6 whitespace-pre-line"
      >
        {fallbackText}
      </p>
    );
  }

  return null;
}

/* =========================================================
   FAQ RENDERER
========================================================= */

function RenderFAQs({
  faqs,
}: {
  faqs: NormalizedFAQ[];
}) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section
      id="faq"
      className="mt-16 scroll-mt-24 border-t border-zinc-200 pt-12"
    >
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
          FAQ
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map(
          (faq, index) => (
            <details
              key={`${faq.question}-${index}`}
              className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white"
            >
              <summary className="cursor-pointer list-none px-5 py-5 font-bold text-zinc-950 sm:px-6">
                <div className="flex items-center justify-between gap-5">
                  <span>
                    {faq.question}
                  </span>

                  <span className="shrink-0 text-xl text-zinc-400 transition group-open:rotate-45">
                    +
                  </span>
                </div>
              </summary>

              <div className="border-t border-zinc-100 px-5 py-5 text-base leading-7 text-zinc-600 sm:px-6">
                {faq.answer}
              </div>
            </details>
          )
        )}
      </div>
    </section>
  );
}

/* =========================================================
   RELATED BLOG CARD
========================================================= */

function RelatedBlogCard({
  blog,
}: {
  blog: Blog;
}) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg"
    >
      {blog.cover_image ? (
        <div className="aspect-[16/9] overflow-hidden bg-zinc-100">
          <img
            src={blog.cover_image}
            alt={
              blog.cover_image_alt ||
              blog.title
            }
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-zinc-100 text-sm font-semibold text-zinc-400">
          AnantaGo
        </div>
      )}

      <div className="p-5">
        {blog.category && (
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
            {blog.category}
          </p>
        )}

        <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-tight tracking-tight text-zinc-950">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-4 text-xs font-semibold text-zinc-400">
          {formatDate(
            blog.published_at ||
              blog.created_at
          )}
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function BlogArticlePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs =
    await getRelatedBlogs(blog);

  /* =====================================================
     CONTENT BLOCKS
  ===================================================== */

  let contentBlocks: unknown[] = [];

  const parsedBlocks =
    parseJsonValue(
      blog.content_blocks
    );

  if (Array.isArray(parsedBlocks)) {
    contentBlocks = parsedBlocks;
  }

  /* =====================================================
     FAQ
  ===================================================== */

  const normalizedFaqs =
    normalizeFaqs(blog.faqs);

  const hasFaqs =
    normalizedFaqs.length > 0;

  console.log(
    "BLOG FAQ:",
    blog.slug,
    normalizedFaqs
  );

  /* =====================================================
     DATE
  ===================================================== */

  const articleDate =
    blog.published_at ||
    blog.created_at;

  return (
    <main className="min-h-screen bg-white text-zinc-950">

      {/* =================================================
          TOP AD
          Uses your AdOne.tsx
      ================================================= */}

      <section
        className="w-full border-b border-zinc-100 bg-white"
        aria-label="Advertisement"
      >
        <div className="mx-auto flex w-full max-w-[1100px] justify-center px-2 py-4">
          <AdOne />
        </div>
      </section>

      {/* =================================================
          ARTICLE HEADER
      ================================================= */}

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8 lg:pt-20">

          {blog.category && (
            <Link
              href={`/${getCategorySlug(
                blog.category
              )}`}
              className="inline-flex rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-80"
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

            <time dateTime={articleDate}>
              {formatDate(articleDate)}
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

      {/* =================================================
          COVER IMAGE
      ================================================= */}

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
              loading="eager"
            />
          </div>
        </section>
      )}

      {/* =================================================
          ARTICLE
      ================================================= */}

      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">

        {/* INTRODUCTION */}

        {blog.introduction && (
          <div className="mb-10 text-[1.08rem] leading-8 text-zinc-700 sm:text-[1.12rem]">
            <p className="whitespace-pre-line">
              {blog.introduction}
            </p>
          </div>
        )}

        {/* =================================================
            CONTENT BLOCKS
        ================================================= */}

        {contentBlocks.length > 0 && (
          <div className="article-content">
            {contentBlocks.map(
              (block, index) => (
                <RenderBlock
                  key={index}
                  block={block}
                  index={index}
                />
              )
            )}
          </div>
        )}

        {/* =================================================
            OLD CONTENT FALLBACK
        ================================================= */}

        {contentBlocks.length === 0 &&
          blog.content && (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{
                __html: blog.content,
              }}
            />
          )}

        {/* =================================================
            FAQ
        ================================================= */}

        {hasFaqs && (
          <RenderFAQs
            faqs={normalizedFaqs}
          />
        )}

        {/* =================================================
            TAGS
        ================================================= */}

        {blog.tags &&
          blog.tags.length > 0 && (
            <div className="mt-16 border-t border-zinc-200 pt-8">

              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                Topics
              </p>

              <div className="flex flex-wrap gap-2">
                {blog.tags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>

            </div>
          )}

      </article>

      {/* =================================================
          RELATED ARTICLES
      ================================================= */}

      {relatedBlogs.length > 0 && (
        <section className="border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8">

            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Keep Reading
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                  More from AnantaGo
                </h2>
              </div>

              <Link
                href="/blog"
                className="text-sm font-bold text-zinc-600"
              >
                Explore more →
              </Link>

            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {relatedBlogs.map(
                (relatedBlog) => (
                  <RelatedBlogCard
                    key={
                      relatedBlog.id
                    }
                    blog={
                      relatedBlog
                    }
                  />
                )
              )}

            </div>
          </div>
        </section>
      )}

      {/* =================================================
          BOTTOM CTA
      ================================================= */}

      <section className="border-t border-zinc-800 bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            AnantaGo
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Technology, made easier.
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Useful AI and technology
            stories, practical guides
            and clear explanations for
            the digital world.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:opacity-90"
          >
            Explore AnantaGo

            <span className="ml-2">
              →
            </span>
          </Link>

        </div>
      </section>

      {/* =================================================
          ARTICLE STYLES
      ================================================= */}

      <style>{`
        .article-content {
          color: #3f3f46;
          font-size: 1.08rem;
          line-height: 1.9;
          overflow-wrap: break-word;
        }

        .article-content p {
          margin: 1.35rem 0;
          color: #3f3f46;
        }

        .article-content h2 {
          margin-top: 3.75rem;
          margin-bottom: 1.25rem;
          color: #09090b;
          font-size: 2rem;
          line-height: 1.2;
          font-weight: 850;
          letter-spacing: -0.035em;
        }

        .article-content h3 {
          margin-top: 2.75rem;
          margin-bottom: 1rem;
          color: #09090b;
          font-size: 1.45rem;
          line-height: 1.3;
          font-weight: 800;
          letter-spacing: -0.025em;
        }

        .article-content strong {
          color: #09090b;
          font-weight: 750;
        }

        .article-content em {
          font-style: italic;
        }

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

        .article-content blockquote {
          margin: 2.5rem 0;
          border-left: 4px solid #18181b;
          border-radius: 0 1rem 1rem 0;
          background: #f4f4f5;
          padding: 1.25rem 1.5rem;
          color: #52525b;
          font-style: italic;
        }

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
          color: #18181b;
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
          color: #f4f4f5;
          padding: 0;
        }

        .article-content img {
          display: block;
          width: 100%;
          max-width: 100%;
          height: auto;
          max-height: 700px;
          object-fit: contain;
          border-radius: 1rem;
          margin: 0 auto;
        }

        .article-content figure {
          width: 100%;
          margin: 3rem 0;
        }

        .article-content figcaption {
          margin-top: 0.75rem;
          text-align: center;
          color: #71717a;
          font-size: 0.8rem;
          line-height: 1.5;
        }

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

        .article-content td {
          color: #3f3f46;
        }

        .article-content tr:nth-child(even) td {
          background: #fafafa;
        }

        .article-content hr {
          margin: 3rem 0;
          border: 0;
          border-top: 1px solid #e4e4e7;
        }

        .article-content iframe,
        .article-content video {
          display: block;
          width: 100%;
          max-width: 100%;
          margin: 2rem 0;
          border-radius: 1rem;
        }

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
    </main>
  );
}