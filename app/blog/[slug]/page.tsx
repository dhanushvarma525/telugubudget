
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import AdOne from "@/components/AdOne";

/* =========================================================
   SITE
========================================================= */

const BASE_URL = "https://anatago.com";

/* =========================================================
   TYPES
========================================================= */

type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  introduction: string | null;
  cover_image: string | null;
  category: string | null;
  author: string | null;
  tags: string[] | null;
  published: boolean;
  featured: boolean;
  views: number | null;
  content_blocks: unknown;
  faqs: unknown;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
};

type RelatedBlog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type NormalizedFAQ = {
  question: string;
  answer: string;
};

/* =========================================================
   BASIC HELPERS
========================================================= */

function formatDate(date: string | null) {
  if (!date) return "";

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

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
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
   SAFE JSON PARSER
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
   FAQ HELPERS
========================================================= */

function extractFaqFromObject(
  object: Record<string, unknown>
): NormalizedFAQ | null {
  const question = getString(object, [
    "question",
    "Question",
    "questions",
    "q",
    "Q",
    "title",
    "Title",
    "heading",
    "Heading",
    "prompt",
    "Prompt",
  ]);

  const answer = getString(object, [
    "answer",
    "Answer",
    "answers",
    "a",
    "A",
    "content",
    "Content",
    "description",
    "Description",
    "response",
    "Response",
    "text",
    "Text",
    "body",
    "Body",
  ]);

  if (question && answer) {
    return {
      question,
      answer,
    };
  }

  const nestedKeys = [
    "faq",
    "FAQ",
    "item",
    "data",
    "value",
    "content",
    "details",
  ];

  for (const key of nestedKeys) {
    const nested = object[key];

    if (isObject(nested)) {
      const nestedFaq =
        extractFaqFromObject(nested);

      if (nestedFaq) {
        return nestedFaq;
      }
    }

    if (Array.isArray(nested)) {
      const nestedFaqs =
        normalizeFaqArray(nested);

      if (nestedFaqs.length > 0) {
        return nestedFaqs[0];
      }
    }
  }

  return null;
}

/* =========================================================
   FAQ ARRAY NORMALIZER
========================================================= */

function normalizeFaqArray(
  items: unknown[]
): NormalizedFAQ[] {
  const result: NormalizedFAQ[] = [];

  for (const item of items) {
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

      continue;
    }

    if (isObject(item)) {
      const faq =
        extractFaqFromObject(item);

      if (faq) {
        result.push(faq);
      }
    }
  }

  return result;
}

/* =========================================================
   FAQ STRING PARSER
========================================================= */

function parseFaqString(
  value: string
): NormalizedFAQ[] {
  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);

    const normalized =
      normalizeFaqValue(parsed);

    if (normalized.length > 0) {
      return normalized;
    }
  } catch {
    // Continue with plain-text parsing.
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result: NormalizedFAQ[] = [];

  let currentQuestion = "";
  let currentAnswer = "";

  const pushCurrent = () => {
    if (
      currentQuestion &&
      currentAnswer
    ) {
      result.push({
        question: currentQuestion,
        answer: currentAnswer,
      });
    }

    currentQuestion = "";
    currentAnswer = "";
  };

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (
      lower.startsWith("question:") ||
      lower.startsWith("q:")
    ) {
      pushCurrent();

      currentQuestion = line
        .substring(
          line.indexOf(":") + 1
        )
        .trim();

      continue;
    }

    if (
      lower.startsWith("answer:") ||
      lower.startsWith("a:")
    ) {
      currentAnswer = line
        .substring(
          line.indexOf(":") + 1
        )
        .trim();

      continue;
    }

    const numberedQuestion =
      line.match(
        /^(\d+)[.)]\s*(.+)$/
      );

    if (numberedQuestion) {
      pushCurrent();

      currentQuestion =
        numberedQuestion[2].trim();

      continue;
    }

    if (currentQuestion) {
      currentAnswer +=
        (currentAnswer ? " " : "") +
        line;
    }
  }

  pushCurrent();

  return result;
}

/* =========================================================
   MASTER FAQ NORMALIZER
========================================================= */

function normalizeFaqValue(
  value: unknown
): NormalizedFAQ[] {
  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  if (typeof value === "string") {
    return parseFaqString(value);
  }

  if (Array.isArray(value)) {
    return normalizeFaqArray(value);
  }

  if (isObject(value)) {
    const directFaq =
      extractFaqFromObject(value);

    if (directFaq) {
      return [directFaq];
    }

    const wrapperKeys = [
      "faqs",
      "FAQ",
      "faq",
      "items",
      "questions",
      "data",
      "results",
      "list",
    ];

    for (const key of wrapperKeys) {
      const nested = value[key];

      if (Array.isArray(nested)) {
        const normalized =
          normalizeFaqArray(nested);

        if (
          normalized.length > 0
        ) {
          return normalized;
        }
      }

      if (
        typeof nested === "string"
      ) {
        const normalized =
          parseFaqString(nested);

        if (
          normalized.length > 0
        ) {
          return normalized;
        }
      }

      if (isObject(nested)) {
        const normalized =
          normalizeFaqValue(nested);

        if (
          normalized.length > 0
        ) {
          return normalized;
        }
      }
    }
  }

  return [];
}

/* =========================================================
   FINAL FAQ NORMALIZER
========================================================= */

function normalizeFaqs(
  value: unknown
): NormalizedFAQ[] {
  const parsed =
    parseJsonValue(value);

  const faqs =
    normalizeFaqValue(parsed);

  const seen =
    new Set<string>();

  const unique: NormalizedFAQ[] =
    [];

  for (const faq of faqs) {
    const question =
      faq.question.trim();

    const answer =
      faq.answer.trim();

    if (!question || !answer) {
      continue;
    }

    const key =
      question.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    unique.push({
      question,
      answer,
    });
  }

  return unique;
}

/* =========================================================
   BLOG DATABASE QUERY
========================================================= */

async function fetchBlog(
  slug: string
): Promise<Blog | null> {
  const decodedSlug =
    decodeURIComponent(slug);

  const { data, error } =
    await supabase
      .from("blogs")
      .select(`
        id,
        title,
        slug,
        excerpt,
        introduction,
        cover_image,
        category,
        author,
        tags,
        published,
        featured,
        views,
        content_blocks,
        faqs,
        published_at,
        created_at,
        updated_at,
        meta_title,
        meta_description
      `)
      .eq("slug", decodedSlug)
      .eq("published", true)
      .maybeSingle();

  if (error) {
    console.error(
      "BLOG FETCH ERROR:",
      error
    );

    return null;
  }

  return data as Blog | null;
}

/* =========================================================
   CACHED BLOG FETCH
========================================================= */

async function getBlog(
  slug: string
): Promise<Blog | null> {
  const decodedSlug =
    decodeURIComponent(slug);

  const getCached =
    unstable_cache(
      async () =>
        fetchBlog(decodedSlug),
      ["blog", decodedSlug],
      {
        revalidate: 60,
        tags: [
          "blogs",
          `blog-${decodedSlug}`,
        ],
      }
    );

  return getCached();
}

/* =========================================================
   SEO METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Article Not Found | AnantaGo",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    blog.meta_title?.trim() ||
    blog.title;

  const description =
    blog.meta_description?.trim() ||
    blog.excerpt?.trim() ||
    blog.introduction?.trim() ||
    "Read the latest technology insights, practical guides and clear explanations on AnantaGo.";

  const canonicalUrl =
    `${BASE_URL}/blog/${blog.slug}`;

  const metadata: Metadata = {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "AnantaGo",
      publishedTime:
        blog.published_at || undefined,
      modifiedTime:
        blog.updated_at || undefined,
      authors: [
        blog.author ||
          "AnantaGo Editorial",
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };

  if (blog.cover_image) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [
        {
          url: blog.cover_image,
          width: 1200,
          height: 675,
          alt: blog.title,
        },
      ],
    };

    metadata.twitter = {
      ...metadata.twitter,
      images: [blog.cover_image],
    };
  }

  return metadata;
}

/* =========================================================
   RELATED BLOGS
========================================================= */

async function fetchRelatedBlogs(
  blog: Blog
): Promise<RelatedBlog[]> {
  let related: RelatedBlog[] =
    [];

  if (blog.category) {
    const { data } =
      await supabase
        .from("blogs")
        .select(`
          id,
          title,
          slug,
          excerpt,
          cover_image,
          category,
          published_at,
          created_at
        `)
        .eq("published", true)
        .eq(
          "category",
          blog.category
        )
        .neq("id", blog.id)
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .limit(6);

    if (data) {
      related =
        data as RelatedBlog[];
    }
  }

  if (related.length < 6) {
    const existingIds =
      new Set([
        blog.id,
        ...related.map(
          (item) => item.id
        ),
      ]);

    const { data } =
      await supabase
        .from("blogs")
        .select(`
          id,
          title,
          slug,
          excerpt,
          cover_image,
          category,
          published_at,
          created_at
        `)
        .eq("published", true)
        .order("published_at", {
          ascending: false,
          nullsFirst: false,
        })
        .limit(12);

    if (data) {
      const additional =
        (data as RelatedBlog[])
          .filter(
            (item) =>
              !existingIds.has(
                item.id
              )
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
   CACHED RELATED BLOGS
========================================================= */

async function getRelatedBlogs(
  blog: Blog
): Promise<RelatedBlog[]> {
  const getCached =
    unstable_cache(
      async () =>
        fetchRelatedBlogs(blog),
      [
        "related-blogs",
        String(blog.id),
        blog.category || "none",
      ],
      {
        revalidate: 300,
        tags: [
          "blogs",
          "related-blogs",
        ],
      }
    );

  return getCached();
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
        className="my-5 whitespace-pre-line"
      >
        {block}
      </p>
    );
  }

  if (!isObject(block)) {
    return null;
  }

  const type =
    getString(block, [
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
    const text =
      getString(block, [
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
          className="my-5"
          dangerouslySetInnerHTML={{
            __html: text,
          }}
        />
      );
    }

    return (
      <p
        key={index}
        className="my-5 whitespace-pre-line"
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
    const heading =
      getString(block, [
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
        className="mt-12 mb-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl"
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
    const heading =
      getString(block, [
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
        className="mt-9 mb-3 text-xl font-extrabold leading-tight sm:text-2xl"
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
    const image =
      getString(block, [
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

    const caption =
      getString(block, [
        "caption",
        "description",
      ]);

    if (!image) {
      return null;
    }

    return (
      <figure
        key={index}
        className="my-8"
      >
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 sm:rounded-2xl">
          <img
            src={image}
            alt={alt}
            width={1200}
            height={675}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full object-contain"
          />
        </div>

        {caption && (
          <figcaption className="mt-2 text-center text-xs leading-5 text-zinc-500">
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
    const items =
      getArray(block, [
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
        className="my-6 list-disc space-y-2 pl-6 text-base leading-7 sm:text-[1.05rem] sm:leading-8"
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

            if (
              isObject(item)
            ) {
              return (
                <li key={itemIndex}>
                  {getString(
                    item,
                    [
                      "text",
                      "content",
                      "value",
                      "title",
                    ]
                  )}
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
    const items =
      getArray(block, [
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
        className="my-6 list-decimal space-y-2 pl-6 text-base leading-7 sm:text-[1.05rem] sm:leading-8"
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

            if (
              isObject(item)
            ) {
              return (
                <li key={itemIndex}>
                  {getString(
                    item,
                    [
                      "text",
                      "content",
                      "value",
                      "title",
                    ]
                  )}
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
    const text =
      getString(block, [
        "text",
        "content",
        "quote",
        "value",
      ]);

    if (!text) {
      return null;
    }

    const author =
      getString(block, [
        "author",
        "source",
        "name",
      ]);

    return (
      <blockquote
        key={index}
        className="my-8 rounded-r-xl border-l-4 border-zinc-900 bg-zinc-50 px-5 py-4 sm:rounded-r-2xl sm:px-6 sm:py-5"
      >
        <p className="text-base font-medium italic leading-7 text-zinc-600 sm:text-lg sm:leading-8">
          {text}
        </p>

        {author && (
          <footer className="mt-2 text-sm font-semibold text-zinc-500">
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
    const title =
      getString(block, [
        "title",
        "heading",
        "label",
      ]);

    const text =
      getString(block, [
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
        className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 p-5 sm:rounded-2xl sm:p-6"
      >
        {title && (
          <h3 className="mb-2 text-base font-extrabold text-zinc-950">
            {title}
          </h3>
        )}

        {text && (
          <p className="whitespace-pre-line text-[0.98rem] leading-7 text-zinc-700">
            {text}
          </p>
        )}
      </aside>
    );
  }

  /* TABLE */

  if (type === "table") {
    const headers =
      getArray(block, [
        "headers",
        "columns",
      ]);

    const rows =
      getArray(block, [
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
        className="my-8 overflow-x-auto rounded-xl border border-zinc-200 sm:rounded-2xl"
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
                      className="border-b border-zinc-200 px-4 py-3 text-left font-bold text-zinc-900"
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
                  Array.isArray(
                    row
                  )
                    ? row
                    : isObject(
                        row
                      )
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
                    key={
                      rowIndex
                    }
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
                          className="px-4 py-3 align-top leading-6 text-zinc-700"
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
    const html =
      getString(block, [
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
        className="my-5"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    );
  }

  /* FALLBACK */

  const fallbackText =
    getString(block, [
      "text",
      "content",
      "body",
      "description",
      "value",
    ]);

  if (fallbackText) {
    return (
      <p
        key={index}
        className="my-5 whitespace-pre-line"
      >
        {fallbackText}
      </p>
    );
  }

  return null;
}

/* =========================================================
   FAQ DISPLAY
========================================================= */

function RenderFAQs({
  faqs,
}: {
  faqs: NormalizedFAQ[];
}) {
  if (
    !faqs ||
    faqs.length === 0
  ) {
    return null;
  }

  return (
    <section
      id="faq"
      className="mt-14 scroll-mt-24 border-t border-zinc-200 pt-10 sm:mt-16 sm:pt-12"
    >
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
          FAQ
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map(
          (faq, index) => (
            <details
              key={`${faq.question}-${index}`}
              className="group overflow-hidden rounded-xl border border-zinc-200 bg-white sm:rounded-2xl"
            >
              <summary className="cursor-pointer list-none px-4 py-4 font-bold text-zinc-950 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between gap-4">
                  <span>
                    {faq.question}
                  </span>

                  <span className="shrink-0 text-xl text-zinc-400 transition group-open:rotate-45">
                    +
                  </span>
                </div>
              </summary>

              <div className="border-t border-zinc-100 px-4 py-4 text-base leading-7 text-zinc-600 sm:px-6 sm:py-5">
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
  blog: RelatedBlog;
}) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg sm:rounded-2xl"
    >
      {blog.cover_image ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100">
          <img
            src={blog.cover_image}
            alt={blog.title}
            width={640}
            height={360}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-zinc-100 text-sm font-semibold text-zinc-400">
          AnantaGo
        </div>
      )}

      <div className="p-4 sm:p-5">
        {blog.category && (
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
            {blog.category}
          </p>
        )}

        <h3 className="mt-2 line-clamp-2 text-base font-extrabold leading-tight tracking-tight text-zinc-950 sm:text-lg">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-3 text-xs font-semibold text-zinc-400">
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
   RELATED ARTICLES
========================================================= */

async function RelatedArticles({
  blog,
}: {
  blog: Blog;
}) {
  const relatedBlogs =
    await getRelatedBlogs(blog);

  if (
    relatedBlogs.length === 0
  ) {
    return null;
  }

  return (
    <section className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}

/* =========================================================
   RELATED SKELETON
========================================================= */

function RelatedArticlesSkeleton() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-7">
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />

          <div className="mt-3 h-8 w-56 animate-pulse rounded bg-zinc-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white sm:rounded-2xl"
              >
                <div className="aspect-[16/9] animate-pulse bg-zinc-200" />

                <div className="p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />

                  <div className="mt-3 h-5 w-full animate-pulse rounded bg-zinc-200" />

                  <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-zinc-200" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function BlogArticlePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const blog =
    await getBlog(slug);

  if (!blog) {
    notFound();
  }

  /* =====================================================
     CONTENT BLOCKS
  ===================================================== */

  let contentBlocks: unknown[] =
    [];

  const parsedBlocks =
    parseJsonValue(
      blog.content_blocks
    );

  if (
    Array.isArray(parsedBlocks)
  ) {
    contentBlocks =
      parsedBlocks;
  }

  /* =====================================================
     FAQ
  ===================================================== */

  const normalizedFaqs =
    normalizeFaqs(blog.faqs);

  const hasFaqs =
    normalizedFaqs.length > 0;

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
      ================================================= */}

      <section
        className="w-full border-b border-zinc-100 bg-white"
        aria-label="Advertisement"
      >
        <div className="mx-auto flex min-h-[90px] w-full max-w-[1100px] items-center justify-center overflow-hidden px-2 py-3">
          <AdOne />
        </div>
      </section>

      {/* =================================================
          ARTICLE HEADER
      ================================================= */}

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 pb-9 pt-10 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8 lg:pt-20">

          {blog.category && (
            <Link
              href={`/${getCategorySlug(
                blog.category
              )}`}
              className="inline-flex rounded-full bg-zinc-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:opacity-80 sm:text-xs"
            >
              {blog.category}
            </Link>
          )}

          <h1 className="mt-5 max-w-4xl text-3xl font-black leading-[1.08] tracking-[-0.04em] text-zinc-950 sm:mt-6 sm:text-5xl lg:text-6xl">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-600 sm:mt-6 sm:text-xl sm:leading-9">
              {blog.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500 sm:mt-7 sm:gap-x-4 sm:text-sm">

            <span className="font-semibold text-zinc-900">
              {blog.author ||
                "AnantaGo Editorial"}
            </span>

            <span className="text-zinc-300">
              •
            </span>

            <time dateTime={articleDate}>
              {formatDate(
                articleDate
              )}
            </time>

          </div>
        </div>
      </header>

      {/* =================================================
          COVER IMAGE
      ================================================= */}

      {blog.cover_image && (
        <section className="mx-auto max-w-6xl px-5 pt-6 sm:px-6 sm:pt-10 lg:px-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-zinc-100 sm:rounded-3xl">

            <img
              src={blog.cover_image}
              alt={blog.title}
              width={1600}
              height={900}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 block h-full w-full object-cover"
            />

          </div>
        </section>
      )}

      {/* =================================================
          ARTICLE CONTENT
      ================================================= */}

      <article className="mx-auto max-w-3xl px-5 py-9 sm:px-6 sm:py-14 lg:px-8 lg:py-16">

        {/* INTRODUCTION */}

        {blog.introduction && (
          <div className="mb-9 text-base leading-7 text-zinc-700 sm:text-[1.12rem] sm:leading-8">
            <p className="whitespace-pre-line">
              {blog.introduction}
            </p>
          </div>
        )}

        {/* CONTENT BLOCKS */}

        {contentBlocks.length > 0 && (
          <div className="article-content">
            {contentBlocks.map(
              (
                block,
                index
              ) => (
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
            FAQ
        ================================================= */}

        {hasFaqs && (
          <RenderFAQs
            faqs={
              normalizedFaqs
            }
          />
        )}

        {/* TAGS */}

        {blog.tags &&
          blog.tags.length > 0 && (
            <div className="mt-14 border-t border-zinc-200 pt-7">

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
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

      <Suspense
        fallback={
          <RelatedArticlesSkeleton />
        }
      >
        <RelatedArticles
          blog={blog}
        />
      </Suspense>

      {/* =================================================
          BOTTOM CTA
      ================================================= */}

      <section className="border-t border-zinc-800 bg-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            AnantaGo
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
            Technology, made easier.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:mt-4 sm:text-base sm:leading-7">
            Useful AI and technology
            stories, practical guides
            and clear explanations for
            the digital world.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 transition hover:opacity-90"
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
          font-size: 1.06rem;
          line-height: 1.85;
          overflow-wrap: break-word;
        }

        .article-content p {
          margin: 1.2rem 0;
          color: #3f3f46;
        }

        .article-content h2 {
          margin-top: 3.25rem;
          margin-bottom: 1rem;
          color: #09090b;
          font-size: 1.9rem;
          line-height: 1.2;
          font-weight: 850;
          letter-spacing: -0.035em;
        }

        .article-content h3 {
          margin-top: 2.4rem;
          margin-bottom: 0.8rem;
          color: #09090b;
          font-size: 1.4rem;
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
          margin: 1.3rem 0;
          padding-left: 1.5rem;
          list-style: disc;
        }

        .article-content ol {
          margin: 1.3rem 0;
          padding-left: 1.5rem;
          list-style: decimal;
        }

        .article-content li {
          margin: 0.45rem 0;
          padding-left: 0.25rem;
        }

        .article-content blockquote {
          margin: 2rem 0;
          border-left: 4px solid #18181b;
          border-radius: 0 0.9rem 0.9rem 0;
          background: #f4f4f5;
          padding: 1rem 1.25rem;
          color: #52525b;
          font-style: italic;
        }

        .article-content pre {
          margin: 1.75rem 0;
          overflow-x: auto;
          border-radius: 0.9rem;
          background: #18181b;
          padding: 1rem;
          color: #f4f4f5;
          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;
          font-size: 0.88rem;
          line-height: 1.65;
        }

        .article-content code {
          border-radius: 0.35rem;
          background: #f4f4f5;
          padding: 0.15rem 0.3rem;
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
          border-radius: 0.9rem;
          margin: 0 auto;
        }

        .article-content figure {
          width: 100%;
          margin: 2.5rem 0;
        }

        .article-content figcaption {
          margin-top: 0.6rem;
          text-align: center;
          color: #71717a;
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .article-content table {
          width: 100%;
          margin: 2rem 0;
          border-collapse: collapse;
          border: 1px solid #e4e4e7;
          font-size: 0.92rem;
        }

        .article-content th,
        .article-content td {
          border: 1px solid #e4e4e7;
          padding: 0.7rem 0.8rem;
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
          margin: 2.5rem 0;
          border: 0;
          border-top: 1px solid #e4e4e7;
        }

        .article-content iframe,
        .article-content video {
          display: block;
          width: 100%;
          max-width: 100%;
          margin: 1.75rem 0;
          border-radius: 0.9rem;
        }

        @media (max-width: 640px) {
          .article-content {
            font-size: 1rem;
            line-height: 1.8;
          }

          .article-content h2 {
            margin-top: 2.75rem;
            margin-bottom: 0.9rem;
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

          .article-content figure {
            margin: 2rem 0;
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

