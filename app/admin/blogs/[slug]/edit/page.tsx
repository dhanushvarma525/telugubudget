"use client";

import {
  ChangeEvent,
  ComponentProps,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import BlogBlockEditor from "@/components/blog/BlogBlockEditor";
import BlogPreview from "@/components/blog/BlogPreview";

import type { BlogContentBlock } from "@/types/blog";

const CATEGORIES = [
  "AI",
  "Tech",
  "How-To",
  "Apps",
  "Security",
  "Explained",
] as const;

type Category = (typeof CATEGORIES)[number];

type FAQ = {
  question: string;
  answer: string;
};

type Blog = {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string | null;
  introduction: string | null;
  cover_image: string | null;
  category: string;
  author: string | null;
  tags: string[] | null;
  content_blocks: BlogContentBlock[] | null;
  faqs: FAQ[] | null;
  published: boolean;
  featured: boolean;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/*
 * IMPORTANT:
 *
 * Get the exact blog type expected by BlogPreview itself.
 *
 * This avoids a mismatch between the API Blog type and
 * BlogPreview's BlogFormData type.
 */
type PreviewBlog = ComponentProps<
  typeof BlogPreview
>["blog"];

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      typeof item === "string" ? item.trim() : ""
    )
    .filter(Boolean);
}

function normalizeFAQs(value: unknown): FAQ[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const faq = item as Record<string, unknown>;

    return {
      question: normalizeString(faq.question),
      answer: normalizeString(faq.answer),
    };
  });
}

/*
 * IMPORTANT:
 * Use the canonical BlogContentBlock type
 * from @/types/blog.
 *
 * Do not create a local BlogBlock type here.
 */
function normalizeBlocks(
  value: unknown
): BlogContentBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as BlogContentBlock[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not published";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Not published";
  }
}

function getPreviewUrl(value: string): string {
  if (!value) {
    return "";
  }

  return value;
}

export default function EditBlogPage() {
  const router = useRouter();

  const params = useParams<{
    slug: string;
  }>();

  /*
   * Despite the folder being named [slug],
   * the current admin URL may be:
   *
   * /admin/blogs/35/edit
   *
   * Therefore this value may be a numeric
   * database ID OR an actual slug.
   */
  const routeIdentifier = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const [blogId, setBlogId] = useState<
    number | string | null
  >(null);

  const [originalSlug, setOriginalSlug] = useState("");

  const [title, setTitle] = useState("");

  const [slug, setSlug] = useState("");

  const [category, setCategory] =
    useState<Category>("Tech");

  const [author, setAuthor] = useState("");

  const [tagsInput, setTagsInput] = useState("");

  const [excerpt, setExcerpt] = useState("");

  const [introduction, setIntroduction] =
    useState("");

  const [coverImage, setCoverImage] = useState("");

  const [existingCoverImage, setExistingCoverImage] =
    useState("");

  const [coverImagePreview, setCoverImagePreview] =
    useState("");

  const [selectedCoverFile, setSelectedCoverFile] =
    useState<File | null>(null);

  const [removeExistingCover, setRemoveExistingCover] =
    useState(false);

  const [contentBlocks, setContentBlocks] =
    useState<BlogContentBlock[]>([]);

  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const [metaTitle, setMetaTitle] = useState("");

  const [metaDescription, setMetaDescription] =
    useState("");

  const [published, setPublished] =
    useState(false);

  const [featured, setFeatured] =
    useState(false);

  const [originalPublishedAt, setOriginalPublishedAt] =
    useState<string | null>(null);

  const [views, setViews] = useState(0);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showPreview, setShowPreview] =
    useState(false);

  const [initialized, setInitialized] =
    useState(false);

  /* =======================================================
     LOAD ARTICLE
  ======================================================= */

  useEffect(() => {
    if (!routeIdentifier || initialized) {
      return;
    }

    let cancelled = false;

    async function loadArticle() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const isNumeric = /^\d+$/.test(
          routeIdentifier
        );

        const query = isNumeric
          ? `id=${encodeURIComponent(
              routeIdentifier
            )}&admin=true`
          : `slug=${encodeURIComponent(
              routeIdentifier
            )}&admin=true`;

        console.log(
          "[Edit Blog] Loading article:",
          `/api/blogs?${query}`
        );

        const response = await fetch(
          `/api/blogs?${query}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Article not found."
          );
        }

        const data: Blog | undefined =
          result?.blog;

        if (!data) {
          throw new Error(
            "Article not found."
          );
        }

        if (cancelled) {
          return;
        }

        setBlogId(data.id);

        setTitle(
          normalizeString(data.title)
        );

        setSlug(
          normalizeString(data.slug)
        );

        setOriginalSlug(
          normalizeString(data.slug)
        );

        if (
          CATEGORIES.includes(
            data.category as Category
          )
        ) {
          setCategory(
            data.category as Category
          );
        }

        setAuthor(
          normalizeString(data.author)
        );

        setTagsInput(
          normalizeTags(data.tags).join(
            ", "
          )
        );

        setExcerpt(
          normalizeString(data.excerpt)
        );

        setIntroduction(
          normalizeString(data.introduction)
        );

        const existingImage =
          normalizeString(
            data.cover_image
          );

        setCoverImage(existingImage);

        setExistingCoverImage(
          existingImage
        );

        setCoverImagePreview(
          existingImage
        );

        setSelectedCoverFile(null);

        setRemoveExistingCover(false);

        setContentBlocks(
          normalizeBlocks(
            data.content_blocks
          )
        );

        setFaqs(
          normalizeFAQs(data.faqs)
        );

        setMetaTitle(
          normalizeString(
            data.meta_title
          )
        );

        setMetaDescription(
          normalizeString(
            data.meta_description
          )
        );

        setPublished(
          Boolean(data.published)
        );

        setFeatured(
          Boolean(data.featured)
        );

        setOriginalPublishedAt(
          data.published_at
        );

        setViews(
          Number(data.views || 0)
        );

        setInitialized(true);
      } catch (err) {
        console.error(
          "[Edit Blog] Failed to load article:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load article."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      cancelled = true;
    };
  }, [
    routeIdentifier,
    initialized,
  ]);

  /* =======================================================
     HANDLE COVER IMAGE
  ======================================================= */

  function handleCoverImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedCoverFile(file);

    setRemoveExistingCover(false);

    const previewUrl =
      URL.createObjectURL(file);

    setCoverImagePreview(previewUrl);
  }

  function removeCoverImage() {
    setSelectedCoverFile(null);

    setCoverImagePreview("");

    setCoverImage("");

    if (existingCoverImage) {
      setRemoveExistingCover(true);
    }
  }

  /* =======================================================
     TITLE / SLUG
  ======================================================= */

  function handleTitleChange(
    value: string
  ) {
    setTitle(value);

    /*
     * Only automatically generate the slug
     * when this is a new/empty slug.
     *
     * Existing article slugs are preserved.
     */
    if (!slug && !originalSlug) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(
    value: string
  ) {
    setSlug(slugify(value));
  }

  /* =======================================================
     FAQ
  ======================================================= */

  function addFAQ() {
    setFaqs((current) => [
      ...current,
      {
        question: "",
        answer: "",
      },
    ]);
  }

  function updateFAQ(
    index: number,
    field: keyof FAQ,
    value: string
  ) {
    setFaqs((current) =>
      current.map(
        (faq, faqIndex) =>
          faqIndex === index
            ? {
                ...faq,
                [field]: value,
              }
            : faq
      )
    );
  }

  function removeFAQ(index: number) {
    setFaqs((current) =>
      current.filter(
        (_, faqIndex) =>
          faqIndex !== index
      )
    );
  }

  /* =======================================================
     TAGS
  ======================================================= */

  const tags = useMemo(() => {
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [tagsInput]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateArticle(): string | null {
    if (
      blogId === null ||
      blogId === undefined ||
      blogId === ""
    ) {
      return "Article ID is missing.";
    }

    if (!title.trim()) {
      return "Please enter an article title.";
    }

    if (!slug.trim()) {
      return "Please enter an article slug.";
    }

    if (!category) {
      return "Please select a category.";
    }

    if (!author.trim()) {
      return "Please enter an author.";
    }

    if (!excerpt.trim()) {
      return "Please enter an excerpt.";
    }

    if (!introduction.trim()) {
      return "Please enter an introduction.";
    }

    for (
      let index = 0;
      index < faqs.length;
      index++
    ) {
      const faq = faqs[index];

      if (
        !faq.question.trim() ||
        !faq.answer.trim()
      ) {
        return `Please complete FAQ ${
          index + 1
        }.`;
      }
    }

    return null;
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function saveBlog(
    publishValue: boolean
  ) {
    const validationError =
      validateArticle();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    if (
      blogId === null ||
      blogId === undefined ||
      blogId === ""
    ) {
      setError(
        "Article ID is missing."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append(
        "id",
        String(blogId)
      );

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "slug",
        slug.trim()
      );

      formData.append(
        "original_slug",
        originalSlug
      );

      formData.append(
        "excerpt",
        excerpt.trim()
      );

      formData.append(
        "introduction",
        introduction.trim()
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "author",
        author.trim()
      );

      formData.append(
        "tags",
        JSON.stringify(tags)
      );

      formData.append(
        "content_blocks",
        JSON.stringify(
          contentBlocks
        )
      );

      formData.append(
        "faqs",
        JSON.stringify(faqs)
      );

      formData.append(
        "published",
        publishValue
          ? "true"
          : "false"
      );

      formData.append(
        "featured",
        featured
          ? "true"
          : "false"
      );

      /*
       * Preserve existing publication date.
       * If publishing an article for the first time,
       * the API can create one.
       */
      formData.append(
        "published_at",
        originalPublishedAt ||
          ""
      );

      formData.append(
        "meta_title",
        metaTitle.trim()
      );

      formData.append(
        "meta_description",
        metaDescription.trim()
      );

      formData.append(
        "remove_cover_image",
        removeExistingCover
          ? "true"
          : "false"
      );

      if (selectedCoverFile) {
        formData.append(
          "cover_image",
          selectedCoverFile
        );
      }

      console.log(
        "[Edit Blog] Updating article:",
        blogId
      );

      const response =
        await fetch(
          "/api/blogs",
          {
            method: "PUT",
            body: formData,
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to update article."
        );
      }

      if (!result?.blog) {
        throw new Error(
          "Article was updated but no article data was returned."
        );
      }

      const updatedBlog: Blog =
        result.blog;

      /*
       * Update local state using the actual
       * URL returned from Supabase.
       *
       * Do NOT store blob: preview URLs as
       * the permanent cover image.
       */
      const returnedCoverImage =
        normalizeString(
          updatedBlog.cover_image
        );

      setCoverImage(
        returnedCoverImage
      );

      setExistingCoverImage(
        returnedCoverImage
      );

      setCoverImagePreview(
        returnedCoverImage
      );

      setSelectedCoverFile(null);

      setRemoveExistingCover(false);

      setOriginalSlug(
        normalizeString(
          updatedBlog.slug
        )
      );

      setSlug(
        normalizeString(
          updatedBlog.slug
        )
      );

      setPublished(
        Boolean(
          updatedBlog.published
        )
      );

      setOriginalPublishedAt(
        updatedBlog.published_at
      );

      setSuccess(
        publishValue
          ? "Article published successfully."
          : "Article saved successfully."
      );

      /*
       * Update URL if the slug changed.
       *
       * We continue using the database ID
       * because the admin route currently
       * supports /admin/blogs/[id]/edit.
       */
      if (
        updatedBlog.id !== null &&
        updatedBlog.id !== undefined
      ) {
        const updatedId =
          String(updatedBlog.id);

        if (
          updatedId !==
          String(routeIdentifier)
        ) {
          router.replace(
            `/admin/blogs/${updatedId}/edit`
          );
        }
      }
    } catch (err) {
      console.error(
        "[Edit Blog] Save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update article."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    await saveBlog(published);
  }

  /* =======================================================
     PREVIEW BLOG
  ======================================================= */

  /*
   * IMPORTANT FIX:
   *
   * BlogPreview expects BlogFormData.
   *
   * Instead of forcing this object into our local Blog type,
   * derive the exact expected type from BlogPreview.
   *
   * The ID is explicitly converted to a number because
   * BlogPreview's BlogFormData expects number | undefined.
   */
  const previewBlog =
    useMemo<PreviewBlog>(() => {
      let numericId:
        | number
        | undefined;

      if (
        blogId !== null &&
        blogId !== undefined &&
        blogId !== ""
      ) {
        const parsedId =
          Number(blogId);

        if (
          Number.isFinite(parsedId)
        ) {
          numericId = parsedId;
        }
      }

      return {
        id: numericId,
        title,
        slug,
        excerpt,
        introduction,
        cover_image:
          coverImagePreview ||
          coverImage ||
          null,
        category,
        author,
        tags,
        content_blocks:
          contentBlocks,
        faqs,
        published,
        featured,
        views,
        meta_title: metaTitle,
        meta_description:
          metaDescription,
        published_at:
          originalPublishedAt,
        created_at: "",
        updated_at: "",
      };
    }, [
      blogId,
      title,
      slug,
      excerpt,
      introduction,
      coverImagePreview,
      coverImage,
      category,
      author,
      tags,
      contentBlocks,
      faqs,
      published,
      featured,
      views,
      metaTitle,
      metaDescription,
      originalPublishedAt,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-5">
              <div className="h-8 w-64 rounded bg-slate-200" />

              <div className="h-12 rounded bg-slate-200" />

              <div className="h-32 rounded bg-slate-200" />

              <div className="h-64 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !blogId) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Unable to load article
            </h1>

            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/blogs"
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Back to Articles
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/blogs"
                )
              }
              className="mb-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Articles
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Edit Article
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Article ID:{" "}
              <span className="font-medium text-slate-700">
                {blogId}
              </span>
            </p>

            {originalPublishedAt && (
              <p className="mt-1 text-xs text-slate-400">
                Published:{" "}
                {formatDate(
                  originalPublishedAt
                )}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setShowPreview(true)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Preview
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveBlog(false)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveBlog(true)
              }
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : published
                  ? "Update Article"
                  : "Publish Article"}
            </button>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* BASIC INFORMATION */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Article Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the main article details.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {/* TITLE */}

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Article Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    handleTitleChange(
                      event.target.value
                    )
                  }
                  placeholder="Enter article title"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* SLUG */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slug
                </label>

                <input
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    handleSlugChange(
                      event.target.value
                    )
                  }
                  placeholder="article-slug"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

                <p className="mt-1 text-xs text-slate-400">
                  URL: /blog/{slug}
                </p>
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value as Category
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  {CATEGORIES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* AUTHOR */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                  placeholder="Author name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* TAGS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tags
                </label>

                <input
                  type="text"
                  value={tagsInput}
                  onChange={(event) =>
                    setTagsInput(
                      event.target.value
                    )
                  }
                  placeholder="AI, technology, apps"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Separate tags with commas.
                </p>
              </div>

              {/* EXCERPT */}

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Excerpt
                </label>

                <textarea
                  value={excerpt}
                  onChange={(event) =>
                    setExcerpt(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Short description of the article"
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* INTRODUCTION */}

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-7 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
          </section>

          {/* COVER IMAGE */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Cover Image
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload or replace the article cover image.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Choose Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleCoverImageChange
                  }
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={
                      removeCoverImage
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remove Cover
                  </button>

                  {selectedCoverFile && (
                    <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
                      New image selected
                    </span>
                  )}
                </div>
              </div>

              <div>
                {coverImagePreview ? (
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <Image
                      src={getPreviewUrl(
                        coverImagePreview
                      )}
                      alt={
                        title ||
                        "Article cover"
                      }
                      width={1200}
                      height={675}
                      unoptimized={coverImagePreview.startsWith(
                        "blob:"
                      )}
                      className="h-auto max-h-[320px] w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                    No cover image
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CONTENT BLOCKS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Article Content
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Build and arrange the article sections.
              </p>
            </div>

            <BlogBlockEditor
              blocks={contentBlocks}
              onChange={setContentBlocks}
            />
          </section>

          {/* FAQ */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Frequently Asked Questions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add useful questions and answers for readers.
                </p>
              </div>

              <button
                type="button"
                onClick={addFAQ}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                + Add FAQ
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No FAQs added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map(
                  (faq, index) => (
                    <div
                      key={`faq-${index}`}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">
                          FAQ {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeFAQ(
                              index
                            )
                          }
                          className="text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Question
                          </label>

                          <input
                            type="text"
                            value={
                              faq.question
                            }
                            onChange={(
                              event
                            ) =>
                              updateFAQ(
                                index,
                                "question",
                                event.target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Answer
                          </label>

                          <textarea
                            value={
                              faq.answer
                            }
                            onChange={(
                              event
                            ) =>
                              updateFAQ(
                                index,
                                "answer",
                                event.target
                                  .value
                              )
                            }
                            rows={5}
                            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* SEO */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                SEO
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure search engine metadata.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Meta Title
                </label>

                <input
                  type="text"
                  value={metaTitle}
                  onChange={(event) =>
                    setMetaTitle(
                      event.target.value
                    )
                  }
                  placeholder={
                    title ||
                    "SEO title"
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

                <p className="mt-1 text-xs text-slate-400">
                  {metaTitle.length}{" "}
                  characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Meta Description
                </label>

                <textarea
                  value={
                    metaDescription
                  }
                  onChange={(event) =>
                    setMetaDescription(
                      event.target
                        .value
                    )
                  }
                  rows={4}
                  placeholder={
                    excerpt ||
                    "SEO description"
                  }
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

                <p className="mt-1 text-xs text-slate-400">
                  {
                    metaDescription.length
                  }{" "}
                  characters
                </p>
              </div>
            </div>
          </section>

          {/* PUBLISH SETTINGS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Publishing
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) =>
                    setPublished(
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 rounded"
                />

                <div>
                  <p className="font-semibold text-slate-800">
                    Published
                  </p>

                  <p className="text-xs text-slate-500">
                    Make this article publicly visible.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    setFeatured(
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 rounded"
                />

                <div>
                  <p className="font-semibold text-slate-800">
                    Featured
                  </p>

                  <p className="text-xs text-slate-500">
                    Show this article in featured areas.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* BOTTOM ACTIONS */}

          <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/blogs"
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveBlog(false)
              }
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveBlog(true)
              }
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : published
                  ? "Update Article"
                  : "Publish Article"}
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
          <div className="mx-auto min-h-full max-w-6xl py-6">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Article Preview
                  </h2>

                  <p className="text-xs text-slate-500">
                    This is a preview of the current article content.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPreview(
                      false
                    )
                  }
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="p-4 sm:p-8">
                <BlogPreview
                  blog={previewBlog}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}