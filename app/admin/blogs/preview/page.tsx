"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  BlogFormData,
  BlogContentBlock,
} from "@/types/blog";

function renderBlock(
  block: BlogContentBlock,
  index: number
) {
  const key = block.id || `block-${index}`;

  switch (block.type) {
    case "heading": {
      const text =
        block.text ||
        block.content ||
        "";

      const level = block.level || 2;

      if (level === 3) {
        return (
          <h3
            key={key}
            className="mt-10 mb-4 text-xl font-bold text-gray-950"
          >
            {text}
          </h3>
        );
      }

      return (
        <h2
          key={key}
          className="mt-12 mb-5 text-2xl font-bold text-gray-950 sm:text-3xl"
        >
          {text}
        </h2>
      );
    }

    case "text":
    case "paragraph":
      return (
        <p
          key={key}
          className="mb-6 text-base leading-8 text-gray-700 sm:text-lg"
        >
          {block.text ||
            block.content ||
            ""}
        </p>
      );

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
          className="my-8 overflow-hidden rounded-2xl"
        >
          <img
            src={imageUrl}
            alt={
              block.alt ||
              block.caption ||
              ""
            }
            className="h-auto w-full object-cover"
          />

          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "bullet-list":
    case "bullets":
    case "unordered-list":
      return (
        <ul
          key={key}
          className="my-6 list-disc space-y-3 pl-6 text-base leading-7 text-gray-700 sm:text-lg"
        >
          {(block.items || []).map(
            (item, itemIndex) => (
              <li key={itemIndex}>
                {item}
              </li>
            )
          )}
        </ul>
      );

    case "numbered-list":
    case "ordered-list":
      return (
        <ol
          key={key}
          className="my-6 list-decimal space-y-3 pl-6 text-base leading-7 text-gray-700 sm:text-lg"
        >
          {(block.items || []).map(
            (item, itemIndex) => (
              <li key={itemIndex}>
                {item}
              </li>
            )
          )}
        </ol>
      );

    case "quote":
      return (
        <blockquote
          key={key}
          className="my-8 border-l-4 border-gray-900 bg-gray-50 px-6 py-5 text-lg font-medium italic leading-8 text-gray-800"
        >
          {block.text ||
            block.content ||
            ""}
        </blockquote>
      );

    case "callout":
      return (
        <div
          key={key}
          className="my-8 rounded-2xl border border-gray-200 bg-gray-50 p-6"
        >
          {block.label && (
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-900">
              {block.label}
            </p>
          )}

          <p className="text-base leading-7 text-gray-700">
            {block.text ||
              block.content ||
              ""}
          </p>
        </div>
      );

    case "link":
      return (
        <p key={key} className="my-6">
          <a
            href={block.href || "#"}
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
            className="font-semibold text-gray-900 underline underline-offset-4"
          >
            {block.text ||
              block.content ||
              block.href ||
              "Read more"}
          </a>
        </p>
      );

    case "table":
      return (
        <div
          key={key}
          className="my-8 overflow-x-auto rounded-xl border border-gray-200"
        >
          <table className="min-w-full border-collapse text-sm">
            {block.headers &&
              block.headers.length > 0 && (
                <thead>
                  <tr className="bg-gray-100">
                    {block.headers.map(
                      (
                        header,
                        headerIndex
                      ) => (
                        <th
                          key={
                            headerIndex
                          }
                          className="border-b border-gray-200 px-4 py-3 text-left font-bold text-gray-900"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
              )}

            <tbody>
              {(block.rows || []).map(
                (row, rowIndex) => (
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
                          className="px-4 py-3 text-gray-700"
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
      );

    default:
      return null;
  }
}

export default function BlogPreviewPage() {
  const router = useRouter();

  const [blog, setBlog] =
    useState<BlogFormData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem(
          "anantago-blog-preview"
        );

      if (!stored) {
        setLoading(false);
        return;
      }

      const parsed =
        JSON.parse(
          stored
        ) as Partial<BlogFormData>;

      const normalizedBlog: BlogFormData = {
        id: parsed.id,

        title:
          parsed.title || "",

        slug:
          parsed.slug || "",

        excerpt:
          parsed.excerpt || "",

        introduction:
          parsed.introduction || "",

        cover_image:
          parsed.cover_image || null,

        category:
          parsed.category || "Tech",

        author:
          parsed.author || "AnantaGo",

        tags:
          Array.isArray(parsed.tags)
            ? parsed.tags
            : [],

        content_blocks:
          Array.isArray(
            parsed.content_blocks
          )
            ? parsed.content_blocks
            : [],

        faqs:
          Array.isArray(parsed.faqs)
            ? parsed.faqs
            : [],

        published:
          parsed.published ?? false,

        featured:
          parsed.featured ?? false,

        views:
          parsed.views ?? 0,

        meta_title:
          parsed.meta_title ||
          parsed.title ||
          "",

        meta_description:
          parsed.meta_description ||
          parsed.excerpt ||
          "",

        published_at:
          parsed.published_at ??
          null,

        created_at:
          parsed.created_at ?? null,

        updated_at:
          parsed.updated_at ?? null,
      };

      setBlog(normalizedBlog);
    } catch (error) {
      console.error(
        "Failed to load preview:",
        error
      );

      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              Loading article preview...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">
              No Preview Available
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Please create an article from
              the blog editor first.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/blogs/new"
                )
              }
              className="mt-6 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Create Article
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

          <div>
            <p className="text-sm font-bold text-gray-900">
              Article Preview
            </p>

            <p className="hidden text-xs text-gray-500 sm:block">
              Preview your article before
              publishing.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/blogs/new"
              )
            }
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Back to Editor
          </button>

        </div>
      </header>

      {/* ARTICLE */}

      <div className="bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        <article className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">

            {/* CATEGORY */}

            {blog.category && (
              <div className="mb-4">
                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-700">
                  {blog.category}
                </span>
              </div>
            )}

            {/* TITLE */}

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
              {blog.title ||
                "Untitled Article"}
            </h1>

            {/* EXCERPT */}

            {blog.excerpt && (
              <p className="mt-5 text-lg leading-8 text-gray-600 sm:text-xl">
                {blog.excerpt}
              </p>
            )}

            {/* AUTHOR */}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">

              <span className="font-semibold text-gray-800">
                {blog.author ||
                  "AnantaGo"}
              </span>

              {blog.published_at && (
                <>
                  <span>•</span>

                  <span>
                    {new Date(
                      blog.published_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </>
              )}

            </div>

            {/* COVER */}

            {blog.cover_image && (
              <div className="mt-8 overflow-hidden rounded-2xl">
                <img
                  src={blog.cover_image}
                  alt={
                    blog.title ||
                    "Article cover"
                  }
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}

            {/* BODY */}

            <div className="mt-10">

              {/* INTRODUCTION */}

              {blog.introduction && (
                <p className="mb-8 text-lg leading-8 text-gray-700 sm:text-xl sm:leading-9">
                  {blog.introduction}
                </p>
              )}

              {/* BLOCKS */}

              {blog.content_blocks?.map(
                (block, index) =>
                  renderBlock(
                    block,
                    index
                  )
              )}

              {/* FAQ */}

              {blog.faqs &&
                blog.faqs.length >
                  0 && (
                  <section className="mt-14 border-t border-gray-200 pt-10">

                    <h2 className="text-2xl font-bold text-gray-950 sm:text-3xl">
                      Frequently Asked
                      Questions
                    </h2>

                    <div className="mt-6 space-y-4">

                      {blog.faqs.map(
                        (
                          faq,
                          index
                        ) => (
                          <details
                            key={
                              faq.id ||
                              `faq-${index}`
                            }
                            className="rounded-2xl border border-gray-200 bg-white p-5"
                          >
                            <summary className="cursor-pointer list-none pr-6 text-base font-bold text-gray-900">
                              {
                                faq.question
                              }
                            </summary>

                            <div className="mt-3 text-base leading-7 text-gray-600">
                              {
                                faq.answer
                              }
                            </div>
                          </details>
                        )
                      )}

                    </div>

                  </section>
                )}

              {/* TAGS */}

              {blog.tags &&
                blog.tags.length >
                  0 && (
                  <div className="mt-12 border-t border-gray-200 pt-6">

                    <div className="flex flex-wrap gap-2">

                      {blog.tags.map(
                        (
                          tag,
                          index
                        ) => (
                          <span
                            key={`${tag}-${index}`}
                            className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                          >
                            #{tag}
                          </span>
                        )
                      )}

                    </div>

                  </div>
                )}

            </div>

          </div>

        </article>

      </div>

    </main>
  );
}