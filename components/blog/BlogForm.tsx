"use client";

import { useState } from "react";

import BlogBlockEditor from "@/components/blog/BlogBlockEditor";

import type {
  BlogContentBlock,
  BlogFAQ,
  BlogFormData,
} from "@/types/blog";

type BlogFormProps = {
  initialData?: Partial<BlogFormData>;
  onSubmit?: (
    data: BlogFormData,
    publish: boolean
  ) => void | Promise<void>;
  submitLabel?: string;
};

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function BlogForm({
  initialData,
  onSubmit,
  submitLabel = "Save Article",
}: BlogFormProps) {
  const [title, setTitle] = useState(
    initialData?.title || ""
  );

  const [slug, setSlug] = useState(
    initialData?.slug || ""
  );

  const [excerpt, setExcerpt] = useState(
    initialData?.excerpt || ""
  );

  const [introduction, setIntroduction] =
    useState(
      initialData?.introduction || ""
    );

  const [coverImage, setCoverImage] =
    useState(
      initialData?.cover_image || ""
    );

  const [category, setCategory] =
    useState(
      initialData?.category || ""
    );

  const [author, setAuthor] = useState(
    initialData?.author || "AnantaGo"
  );

  const [tags, setTags] = useState(
    initialData?.tags?.join(", ") || ""
  );

  const [contentBlocks, setContentBlocks] =
    useState<BlogContentBlock[]>(
      initialData?.content_blocks || []
    );

  const [faqs, setFaqs] = useState<BlogFAQ[]>(
    initialData?.faqs || []
  );

  const [metaTitle, setMetaTitle] =
    useState(
      initialData?.meta_title || ""
    );

  const [metaDescription, setMetaDescription] =
    useState(
      initialData?.meta_description || ""
    );

  const [featured, setFeatured] =
    useState(
      initialData?.featured || false
    );

  const [published, setPublished] =
    useState(
      initialData?.published || false
    );

  const [error, setError] = useState("");

  function handleTitleChange(
    value: string
  ) {
    setTitle(value);

    if (!slug) {
      setSlug(createSlug(value));
    }
  }

  function addFAQ() {
    setFaqs((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        question: "",
        answer: "",
      },
    ]);
  }

  function updateFAQ(
    index: number,
    field: "question" | "answer",
    value: string
  ) {
    setFaqs((current) =>
      current.map((faq, faqIndex) =>
        faqIndex === index
          ? {
              ...faq,
              [field]: value,
            }
          : faq
      )
    );
  }

  function deleteFAQ(index: number) {
    setFaqs((current) =>
      current.filter(
        (_, faqIndex) =>
          faqIndex !== index
      )
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError(
        "Please enter a blog title."
      );
      return;
    }

    if (!slug.trim()) {
      setError("Please enter a slug.");
      return;
    }

    if (!category.trim()) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (!excerpt.trim()) {
      setError(
        "Please enter an excerpt."
      );
      return;
    }

    if (!author.trim()) {
      setError(
        "Please enter an author."
      );
      return;
    }

    const blog: BlogFormData = {
      id: initialData?.id,

      title: title.trim(),

      slug: slug.trim(),

      excerpt: excerpt.trim(),

      introduction:
        introduction.trim(),

      cover_image:
        coverImage.trim() || null,

      category: category.trim(),

      author: author.trim(),

      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),

      content_blocks:
        contentBlocks,

      faqs,

      published,

      featured,

      views:
        initialData?.views ?? 0,

      meta_title:
        (
          metaTitle.trim() ||
          title.trim()
        ),

      meta_description:
        (
          metaDescription.trim() ||
          excerpt.trim()
        ),

      published_at:
        initialData?.published_at ??
        null,

      created_at:
        initialData?.created_at ??
        null,

      updated_at:
        initialData?.updated_at ??
        null,
    };

    if (onSubmit) {
      await onSubmit(
        blog,
        published
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ARTICLE INFORMATION */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Article Information
        </h2>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                handleTitleChange(
                  event.target.value
                )
              }
              placeholder="Enter article title..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(
                  createSlug(
                    event.target.value
                  )
                )
              }
              placeholder="article-url-slug"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />

            <p className="mt-2 text-xs text-gray-500">
              URL: /blog/
              {slug || "article-slug"}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
              >
                <option value="">
                  Select category
                </option>

                <option value="AI">
                  AI
                </option>

                <option value="Tech">
                  Tech
                </option>

                <option value="How-To">
                  How-To
                </option>

                <option value="Apps">
                  Apps
                </option>

                <option value="Security">
                  Security
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Author
              </label>

              <input
                type="text"
                value={author}
                onChange={(event) =>
                  setAuthor(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Tags
            </label>

            <input
              type="text"
              value={tags}
              onChange={(event) =>
                setTags(
                  event.target.value
                )
              }
              placeholder="AI, Google, Gemini, Technology"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />

            <p className="mt-2 text-xs text-gray-500">
              Separate tags with commas.
            </p>
          </div>
        </div>
      </section>

      {/* COVER IMAGE */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Cover Image
        </h2>

        <div className="mt-5">
          <input
            type="url"
            value={coverImage}
            onChange={(event) =>
              setCoverImage(
                event.target.value
              )
            }
            placeholder="Paste cover image URL..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
          />

          {coverImage && (
            <div className="mt-5 overflow-hidden rounded-2xl">
              <img
                src={coverImage}
                alt={
                  title ||
                  "Cover preview"
                }
                className="max-h-96 w-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* INTRODUCTION */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Article Introduction
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(event) =>
                setExcerpt(
                  event.target.value
                )
              }
              rows={3}
              placeholder="Short description of the article..."
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Introduction
            </label>

            <textarea
              value={introduction}
              onChange={(event) =>
                setIntroduction(
                  event.target.value
                )
              }
              rows={8}
              placeholder="Write the article introduction..."
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </section>

      {/* CONTENT */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <BlogBlockEditor
          blocks={contentBlocks}
          onChange={setContentBlocks}
        />
      </section>

      {/* FAQ */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Frequently Asked Questions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add useful questions and
              answers for readers.
            </p>
          </div>

          <button
            type="button"
            onClick={addFAQ}
            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            + Add FAQ
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {faqs.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-500">
              No FAQs added yet.
            </div>
          )}

          {faqs.map((faq, index) => (
            <div
              key={
                faq.id ||
                `faq-${index}`
              }
              className="rounded-xl border border-gray-200 bg-gray-50 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  FAQ {index + 1}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    deleteFAQ(index)
                  }
                  className="text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(event) =>
                    updateFAQ(
                      index,
                      "question",
                      event.target.value
                    )
                  }
                  placeholder="Enter question..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                />

                <textarea
                  value={faq.answer}
                  onChange={(event) =>
                    updateFAQ(
                      index,
                      "answer",
                      event.target.value
                    )
                  }
                  placeholder="Enter answer..."
                  rows={5}
                  className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          SEO
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              SEO Title
            </label>

            <input
              type="text"
              value={metaTitle}
              onChange={(event) =>
                setMetaTitle(
                  event.target.value
                )
              }
              placeholder="SEO title..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              SEO Description
            </label>

            <textarea
              value={metaDescription}
              onChange={(event) =>
                setMetaDescription(
                  event.target.value
                )
              }
              rows={4}
              placeholder="SEO description..."
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </section>

      {/* OPTIONS */}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) =>
                setFeatured(
                  event.target.checked
                )
              }
              className="h-4 w-4"
            />

            <span className="text-sm font-semibold text-gray-900">
              Featured Article
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) =>
                setPublished(
                  event.target.checked
                )
              }
              className="h-4 w-4"
            />

            <span className="text-sm font-semibold text-gray-900">
              Publish Article
            </span>
          </label>
        </div>
      </section>

      {/* SUBMIT */}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}