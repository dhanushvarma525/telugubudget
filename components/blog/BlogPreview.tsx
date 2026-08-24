"use client";

import type {
  BlogFormData,
  BlogContentBlock,
} from "@/types/blog";

type BlogPreviewProps = {
  blog: BlogFormData;
};

/* ============================================================
   HELPERS
============================================================ */

function getBlockText(
  block: BlogContentBlock
): string {
  return block.text || block.content || "";
}

function formatDate(date?: string | null) {
  if (!date) {
    return "August 24, 2026";
  }

  try {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  } catch {
    return "August 24, 2026";
  }
}

/* ============================================================
   ARTICLE BLOCK RENDERER
============================================================ */

function renderBlock(
  block: BlogContentBlock,
  index: number
) {
  const key =
    block.id || `block-${index}`;

  switch (block.type) {
    /* ========================================================
       HEADING
    ======================================================== */

    case "heading": {
      const text = getBlockText(block);

      if (!text.trim()) {
        return null;
      }

      const level = block.level || 2;

      if (level === 3) {
        return (
          <h3
            key={key}
            className="mt-10 mb-4 text-xl font-bold leading-tight tracking-tight text-gray-950 sm:text-2xl"
          >
            {text}
          </h3>
        );
      }

      return (
        <h2
          key={key}
          className="mt-14 mb-5 text-2xl font-bold leading-tight tracking-tight text-gray-950 sm:text-3xl"
        >
          {text}
        </h2>
      );
    }

    /* ========================================================
       PARAGRAPH
    ======================================================== */

    case "text":
    case "paragraph": {
      const text = getBlockText(block);

      if (!text.trim()) {
        return null;
      }

      return (
        <p
          key={key}
          className="mb-6 text-[17px] leading-8 text-gray-700 sm:text-lg sm:leading-9"
        >
          {text}
        </p>
      );
    }

    /* ========================================================
       IMAGE
    ======================================================== */

    case "image": {
      const imageUrl =
        block.url ||
        block.src ||
        block.image ||
        "";

      if (!imageUrl) {
        return null;
      }

      return (
        <figure
          key={key}
          className="my-10"
        >
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
            <img
              src={imageUrl}
              alt={
                block.alt ||
                block.title ||
                "Article image"
              }
              className="h-auto w-full object-cover"
            />
          </div>

          {block.caption && (
            <figcaption className="mt-3 text-center text-sm leading-6 text-gray-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    /* ========================================================
       BULLET LIST
    ======================================================== */

    case "bullet-list":
    case "bullets":
    case "unordered-list": {
      const items =
        block.items?.filter(
          (item) => item.trim()
        ) || [];

      if (items.length === 0) {
        return null;
      }

      return (
        <ul
          key={key}
          className="my-7 list-disc space-y-3 pl-7 text-[17px] leading-8 text-gray-700 sm:text-lg"
        >
          {items.map(
            (item, itemIndex) => (
              <li
                key={itemIndex}
                className="pl-1"
              >
                {item}
              </li>
            )
          )}
        </ul>
      );
    }

    /* ========================================================
       NUMBERED LIST
    ======================================================== */

    case "numbered-list":
    case "ordered-list": {
      const items =
        block.items?.filter(
          (item) => item.trim()
        ) || [];

      if (items.length === 0) {
        return null;
      }

      return (
        <ol
          key={key}
          className="my-7 list-decimal space-y-3 pl-7 text-[17px] leading-8 text-gray-700 sm:text-lg"
        >
          {items.map(
            (item, itemIndex) => (
              <li
                key={itemIndex}
                className="pl-1"
              >
                {item}
              </li>
            )
          )}
        </ol>
      );
    }

    /* ========================================================
       QUOTE
    ======================================================== */

    case "quote": {
      const text = getBlockText(block);

      if (!text.trim()) {
        return null;
      }

      return (
        <blockquote
          key={key}
          className="my-10 border-l-4 border-gray-900 bg-gray-50 px-6 py-6 sm:px-8"
        >
          <p className="text-lg font-medium italic leading-8 text-gray-800 sm:text-xl sm:leading-9">
            “{text}”
          </p>
        </blockquote>
      );
    }

    /* ========================================================
       CALLOUT
    ======================================================== */

    case "callout": {
      const text = getBlockText(block);

      if (!text.trim()) {
        return null;
      }

      return (
        <aside
          key={key}
          className="my-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-7"
        >
          {block.label && (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-gray-900">
              {block.label}
            </p>
          )}

          <p className="text-base leading-8 text-gray-700 sm:text-lg sm:leading-8">
            {text}
          </p>
        </aside>
      );
    }

    /* ========================================================
       LINK
    ======================================================== */

    case "link": {
      const href =
        block.href || "#";

      const text =
        getBlockText(block) ||
        href ||
        "Read more";

      return (
        <p
          key={key}
          className="my-7"
        >
          <a
            href={href}
            target={
              block.external
                ? "_blank"
                : undefined
            }
            rel={
              block.external
                ? "noopener noreferrer"
                : undefined
            }
            className="font-semibold text-gray-950 underline decoration-gray-400 underline-offset-4 transition hover:decoration-gray-950"
          >
            {text}
          </a>
        </p>
      );
    }

    /* ========================================================
       TABLE
    ======================================================== */

    case "table": {
      const headers =
        block.headers || [];

      const rows =
        block.rows || [];

      if (
        headers.length === 0 &&
        rows.length === 0
      ) {
        return null;
      }

      return (
        <div
          key={key}
          className="my-10 overflow-hidden rounded-2xl border border-gray-200"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm sm:text-base">
              {headers.length > 0 && (
                <thead>
                  <tr className="bg-gray-50">
                    {headers.map(
                      (
                        header,
                        headerIndex
                      ) => (
                        <th
                          key={
                            headerIndex
                          }
                          className="border-b border-gray-200 px-4 py-4 text-left font-bold text-gray-950"
                        >
                          {header}
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
                  ) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      {row.map(
                        (
                          cell,
                          cellIndex
                        ) => (
                          <td
                            key={
                              cellIndex
                            }
                            className="px-4 py-4 leading-7 text-gray-700"
                          >
                            {cell}
                          </td>
                        )
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

/* ============================================================
   RELATED ARTICLES PLACEHOLDER
============================================================ */

function PreviewRelatedArticles() {
  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
          Continue Reading
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
          More from AnantaGo
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Related Article
          </p>

          <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />

          <div className="mt-2 h-4 w-full rounded bg-gray-200" />

          <div className="mt-1 h-4 w-5/6 rounded bg-gray-200" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Latest Article
          </p>

          <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />

          <div className="mt-2 h-4 w-full rounded bg-gray-200" />

          <div className="mt-1 h-4 w-5/6 rounded bg-gray-200" />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MAIN PREVIEW
============================================================ */

export default function BlogPreview({
  blog,
}: BlogPreviewProps) {
  const tags =
    Array.isArray(blog.tags)
      ? blog.tags
      : [];

  const blocks =
    Array.isArray(
      blog.content_blocks
    )
      ? blog.content_blocks
      : [];

  const faqs =
    Array.isArray(blog.faqs)
      ? blog.faqs
      : [];

  return (
    <div className="min-h-screen bg-white">

      {/* ======================================================
          ARTICLE
      ====================================================== */}

      <article className="mx-auto w-full max-w-5xl">

        {/* ====================================================
            ARTICLE HEADER
        ==================================================== */}

        <header className="px-5 pb-8 pt-4 sm:px-8 sm:pb-10 sm:pt-8 lg:px-10 lg:pt-10">

          {/* CATEGORY */}

          {blog.category && (
            <div className="mb-5">
              <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-gray-700">
                {blog.category}
              </span>
            </div>
          )}

          {/* TITLE */}

          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-gray-950 sm:text-5xl lg:text-[56px]">
            {blog.title ||
              "Untitled Article"}
          </h1>

          {/* EXCERPT */}

          {blog.excerpt && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl sm:leading-9">
              {blog.excerpt}
            </p>
          )}

          {/* AUTHOR / DATE */}

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">
              {blog.author ||
                "AnantaGo"}
            </span>

            <span className="text-gray-300">
              •
            </span>

            <span>
              {formatDate(
                blog.published_at
              )}
            </span>

            <span className="text-gray-300">
              •
            </span>

            <span>
              Preview
            </span>
          </div>

        </header>

        {/* ====================================================
            COVER IMAGE
        ==================================================== */}

        {blog.cover_image && (
          <div className="px-5 sm:px-8 lg:px-10">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm sm:rounded-3xl">
              <img
                src={blog.cover_image}
                alt={
                  blog.title ||
                  "Article cover"
                }
                className="aspect-video w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* ====================================================
            ARTICLE BODY
        ==================================================== */}

        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-12">

          {/* INTRODUCTION */}

          {blog.introduction && (
            <div className="mb-10">
              <p className="text-[18px] font-medium leading-8 text-gray-800 sm:text-xl sm:leading-9">
                {blog.introduction}
              </p>
            </div>
          )}

          {/* CONTENT */}

          <div>
            {blocks.map(
              (block, index) =>
                renderBlock(
                  block,
                  index
                )
            )}
          </div>

          {/* ==================================================
              FAQ
          ================================================== */}

          {faqs.length > 0 && (
            <section className="mt-16 border-t border-gray-200 pt-10">

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                FAQ
              </p>

              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-gray-950 sm:text-3xl">
                Frequently Asked Questions
              </h2>

              <div className="mt-7 space-y-3">
                {faqs.map(
                  (
                    faq,
                    index
                  ) => (
                    <details
                      key={
                        faq.id ||
                        `faq-${index}`
                      }
                      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-base font-bold text-gray-900 sm:px-6 sm:text-lg">
                        <span>
                          {
                            faq.question
                          }
                        </span>

                        <span className="shrink-0 text-xl text-gray-400 transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>

                      <div className="border-t border-gray-100 px-5 py-5 sm:px-6">
                        <p className="text-base leading-8 text-gray-600 sm:text-lg">
                          {
                            faq.answer
                          }
                        </p>
                      </div>
                    </details>
                  )
                )}
              </div>

            </section>
          )}

          {/* ==================================================
              TAGS
          ================================================== */}

          {tags.length > 0 && (
            <div className="mt-14 border-t border-gray-200 pt-7">

              <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
                Topics
              </p>

              <div className="flex flex-wrap gap-2">
                {tags.map(
                  (
                    tag,
                    index
                  ) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-600"
                    >
                      #{tag}
                    </span>
                  )
                )}
              </div>

            </div>
          )}

          {/* ==================================================
              RELATED ARTICLES
          ================================================== */}

          <PreviewRelatedArticles />

        </div>

      </article>

      {/* ======================================================
          PREVIEW FOOTER
      ====================================================== */}

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-10 text-center sm:px-8">
          <p className="text-sm font-semibold text-gray-900">
            AnantaGo
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Technology, AI, apps and useful digital guides.
          </p>
        </div>
      </footer>

    </div>
  );
}