"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BlogBlockEditor from "@/components/blog/BlogBlockEditor";
import BlogPreview from "@/components/blog/BlogPreview";

import type {
  BlogContentBlock,
  BlogFAQ,
  BlogFormData,
} from "@/types/blog";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/*
 * =========================================================
 * TITLE SIMILARITY HELPERS
 * =========================================================
 */

function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(value: string) {
  return new Set(
    normalizeTitle(value)
      .split(" ")
      .filter((word) => word.length > 1)
  );
}

function calculateTitleSimilarity(
  titleA: string,
  titleB: string
) {
  const a = normalizeTitle(titleA);
  const b = normalizeTitle(titleB);

  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 100;
  }

  /*
   * Exact phrase containment.
   */
  if (a.includes(b) || b.includes(a)) {
    const shorter = a.length < b.length ? a : b;
    const longer = a.length >= b.length ? a : b;

    return Math.min(
      99,
      Math.round(
        (shorter.length / longer.length) * 100
      )
    );
  }

  /*
   * Word overlap.
   */
  const wordsA = getWords(a);
  const wordsB = getWords(b);

  if (wordsA.size === 0 || wordsB.size === 0) {
    return 0;
  }

  let commonWords = 0;

  wordsA.forEach((word) => {
    if (wordsB.has(word)) {
      commonWords++;
    }
  });

  const unionSize =
    new Set([
      ...Array.from(wordsA),
      ...Array.from(wordsB),
    ]).size;

  if (unionSize === 0) {
    return 0;
  }

  return Math.round(
    (commonWords / unionSize) * 100
  );
}

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type ExistingBlogTitle = {
  id: number;
  title: string;
};

/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function NewBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("Dhanush Varma");
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [introduction, setIntroduction] = useState("");

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  const [coverImagePreview, setCoverImagePreview] =
    useState("");

  const [contentBlocks, setContentBlocks] =
    useState<BlogContentBlock[]>([]);

  const [faqs, setFaqs] =
    useState<BlogFAQ[]>([]);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] =
    useState("");

  const [featured, setFeatured] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showPreview, setShowPreview] =
    useState(false);

  /*
   * =========================================================
   * EXISTING ARTICLE TITLES
   * =========================================================
   */

  const [existingTitles, setExistingTitles] =
    useState<ExistingBlogTitle[]>([]);

  const [titlesLoading, setTitlesLoading] =
    useState(true);

  /*
   * =========================================================
   * LOAD EXISTING TITLES
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadExistingTitles() {
      try {
        setTitlesLoading(true);

        const response = await fetch(
          "/api/blogs?admin=true&limit=1000",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load previous article titles."
          );
        }

        const data = await response.json();

        const blogList = Array.isArray(data)
          ? data
          : Array.isArray(data.blogs)
            ? data.blogs
            : [];

        const titles: ExistingBlogTitle[] =
          blogList
            .filter(
              (blog: unknown) =>
                blog &&
                typeof blog === "object" &&
                typeof (
                  blog as {
                    id?: unknown;
                  }
                ).id === "number" &&
                typeof (
                  blog as {
                    title?: unknown;
                  }
                ).title === "string"
            )
            .map(
              (blog: {
                id: number;
                title: string;
              }) => ({
                id: blog.id,
                title: blog.title.trim(),
              })
            )
            .filter(
              (blog: ExistingBlogTitle) =>
                blog.title.length > 0
            );

        if (mounted) {
          setExistingTitles(titles);
        }
      } catch (err) {
        console.error(
          "TITLE LOAD ERROR:",
          err
        );

        if (mounted) {
          setExistingTitles([]);
        }
      } finally {
        if (mounted) {
          setTitlesLoading(false);
        }
      }
    }

    loadExistingTitles();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================================================
   * TITLE MATCHES
   * =========================================================
   */

  const titleMatches = useMemo(() => {
    const currentTitle = title.trim();

    if (!currentTitle) {
      return [];
    }

    return existingTitles
      .map((blog) => ({
        ...blog,
        similarity:
          calculateTitleSimilarity(
            currentTitle,
            blog.title
          ),
      }))
      .filter(
        (blog) => blog.similarity >= 35
      )
      .sort(
        (a, b) =>
          b.similarity -
          a.similarity
      )
      .slice(0, 8);
  }, [title, existingTitles]);

  const highestTitleMatch =
    titleMatches.length > 0
      ? titleMatches[0].similarity
      : 0;

  /*
   * =========================================================
   * CLEANUP IMAGE PREVIEW
   * =========================================================
   */

  useEffect(() => {
    return () => {
      if (
        coverImagePreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          coverImagePreview
        );
      }
    };
  }, [coverImagePreview]);

  /*
   * =========================================================
   * TITLE / SLUG
   * =========================================================
   */

  function handleTitleChange(
    value: string
  ) {
    setTitle(value);

    if (!slug) {
      setSlug(createSlug(value));
    }
  }

  /*
   * =========================================================
   * COVER IMAGE
   * =========================================================
   */

  function handleCoverImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a PNG, JPG, JPEG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Cover image must be smaller than 5MB."
      );

      event.target.value = "";
      return;
    }

    setError("");

    if (
      coverImagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        coverImagePreview
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setCoverImage(file);
    setCoverImagePreview(
      previewUrl
    );

    event.target.value = "";
  }

  function removeCoverImage() {
    if (
      coverImagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        coverImagePreview
      );
    }

    setCoverImage(null);
    setCoverImagePreview("");
  }

  /*
   * =========================================================
   * FAQ
   * =========================================================
   */

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
    field:
      | "question"
      | "answer",
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

  function deleteFAQ(
    index: number
  ) {
    setFaqs((current) =>
      current.filter(
        (_, faqIndex) =>
          faqIndex !== index
      )
    );
  }

  /*
   * =========================================================
   * PREVIEW BLOG
   * =========================================================
   */

  const previewBlog: BlogFormData =
    useMemo(
      () => ({
        title,
        slug,
        excerpt,
        introduction,

        cover_image:
          coverImagePreview ||
          null,

        category,
        author,

        tags: tags
          .split(",")
          .map((tag) =>
            tag.trim()
          )
          .filter(Boolean),

        content_blocks:
          contentBlocks,

        faqs,

        published: false,
        featured,

        views: 0,

        meta_title:
          metaTitle || title,

        meta_description:
          metaDescription ||
          excerpt,

        published_at: null,
        created_at: null,
        updated_at: null,
      }),
      [
        title,
        slug,
        excerpt,
        introduction,
        coverImagePreview,
        category,
        author,
        tags,
        contentBlocks,
        faqs,
        featured,
        metaTitle,
        metaDescription,
      ]
    );

  /*
   * =========================================================
   * SAFE API RESPONSE PARSER
   * =========================================================
   */

  async function readApiResponse(
    response: Response
  ): Promise<{
    data:
      | Record<
          string,
          unknown
        >
      | null;
    rawText: string;
  }> {
    const rawText =
      await response.text();

    if (!rawText.trim()) {
      return {
        data: null,
        rawText: "",
      };
    }

    try {
      const parsed =
        JSON.parse(rawText);

      if (
        parsed &&
        typeof parsed ===
          "object" &&
        !Array.isArray(parsed)
      ) {
        return {
          data:
            parsed as Record<
              string,
              unknown
            >,
          rawText,
        };
      }

      return {
        data: null,
        rawText,
      };
    } catch {
      return {
        data: null,
        rawText,
      };
    }
  }

  /*
   * =========================================================
   * SAVE BLOG
   * =========================================================
   */

  async function saveBlog(
    publish: boolean
  ) {
    setError("");
    setSuccess("");

    /*
     * VALIDATION
     */

    if (!title.trim()) {
      setError(
        "Please enter a blog title."
      );
      return;
    }

    if (!slug.trim()) {
      setError(
        "Please enter a valid slug."
      );
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
        "Please enter an article excerpt."
      );
      return;
    }

    if (!author.trim()) {
      setError(
        "Please enter an author name."
      );
      return;
    }

    if (!introduction.trim()) {
      setError(
        "Please write an article introduction."
      );
      return;
    }

    /*
     * FAQ VALIDATION
     */

    const invalidFAQ =
      faqs.some(
        (faq) =>
          !faq.question.trim() ||
          !faq.answer.trim()
      );

    if (invalidFAQ) {
      setError(
        "Please complete all FAQ questions and answers, or delete empty FAQs."
      );
      return;
    }

    /*
     * DUPLICATE TITLE WARNING
     *
     * We do NOT block publishing.
     * We only warn if another title is
     * extremely similar.
     */

    if (
      highestTitleMatch >= 90
    ) {
      const confirmed =
        window.confirm(
          `This title is very similar to an existing article:\n\n"${titleMatches[0].title}"\n\nDo you want to continue?`
        );

      if (!confirmed) {
        return;
      }
    }

    setSaving(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "slug",
        slug.trim()
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
        category.trim()
      );

      formData.append(
        "author",
        author.trim()
      );

      /*
       * TAGS
       */

      const cleanTags =
        tags
          .split(",")
          .map((tag) =>
            tag.trim()
          )
          .filter(Boolean);

      formData.append(
        "tags",
        JSON.stringify(
          cleanTags
        )
      );

      /*
       * CONTENT BLOCKS
       */

      const cleanContentBlocks =
        contentBlocks.map(
          (block) => ({
            ...block,
          })
        );

      formData.append(
        "content_blocks",
        JSON.stringify(
          cleanContentBlocks
        )
      );

      /*
       * FAQ
       */

      const cleanFaqs =
        faqs.map((faq) => ({
          id: faq.id,
          question:
            faq.question.trim(),
          answer:
            faq.answer.trim(),
        }));

      formData.append(
        "faqs",
        JSON.stringify(
          cleanFaqs
        )
      );

      /*
       * PUBLICATION
       */

      formData.append(
        "published",
        publish
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
       * SEO
       */

      formData.append(
        "meta_title",
        metaTitle.trim() ||
          title.trim()
      );

      formData.append(
        "meta_description",
        metaDescription.trim() ||
          excerpt.trim()
      );

      /*
       * PUBLISHED DATE
       */

      if (publish) {
        formData.append(
          "published_at",
          new Date().toISOString()
        );
      }

      /*
       * COVER IMAGE
       */

      if (coverImage) {
        formData.append(
          "cover_image",
          coverImage,
          coverImage.name
        );
      }

      /*
       * API REQUEST
       */

      const response =
        await fetch(
          "/api/blogs",
          {
            method: "POST",
            body: formData,
          }
        );

      /*
       * SAFE RESPONSE
       */

      const {
        data,
        rawText,
      } =
        await readApiResponse(
          response
        );

      /*
       * API ERROR
       */

      if (!response.ok) {
        const apiError =
          typeof data?.error ===
          "string"
            ? data.error
            : typeof data?.message ===
                "string"
              ? data.message
              : rawText.trim();

        throw new Error(
          apiError ||
            `Failed to save blog. Server returned ${response.status}.`
        );
      }

      /*
       * SUCCESS
       */

      setSuccess(
        publish
          ? "Article published successfully."
          : "Article saved as draft."
      );

      /*
       * REDIRECT
       */

      setTimeout(() => {
        router.push(
          "/admin/blogs"
        );

        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "BLOG SAVE ERROR:",
        err
      );

      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Something went wrong while saving the article."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================================================
   * PREVIEW
   * =========================================================
   */

  if (showPreview) {
    return (
      <main className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-bold text-gray-900">
                Article Preview
              </p>

              <p className="text-xs text-gray-500">
                Preview your article before publishing.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowPreview(
                  false
                )
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Back to Editor
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <BlogPreview
            blog={previewBlog}
          />
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * EDITOR
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Create New Article
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create a premium AnantaGo technology article.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowPreview(
                    true
                  )
                }
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Preview
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  saveBlog(false)
                }
                className="rounded-xl border border-gray-900 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
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
                className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving
                  ? "Publishing..."
                  : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MESSAGES */}

      {(error ||
        success) && (
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  ⚠️
                </span>

                <div className="min-w-0">
                  <p className="font-semibold">
                    Unable to save article
                  </p>

                  <p className="mt-1 break-words">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {success}
            </div>
          )}
        </div>
      )}

      {/* MAIN */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {/* ARTICLE INFORMATION */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Article Information
              </h2>

              <div className="mt-6 space-y-5">
                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(
                      event
                    ) =>
                      handleTitleChange(
                        event.target
                          .value
                      )
                    }
                    placeholder="Enter article title..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  />

                  {/* TITLE MATCHES */}

                  {title.trim() && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Previous Title Check
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Comparing against all existing articles
                          </p>
                        </div>

                        {!titlesLoading && (
                          <span className="text-xs font-medium text-gray-400">
                            {existingTitles.length}{" "}
                            titles checked
                          </span>
                        )}
                      </div>

                      {titlesLoading ? (
                        <p className="mt-4 text-sm text-gray-500">
                          Checking previous titles...
                        </p>
                      ) : titleMatches.length ===
                        0 ? (
                        <p className="mt-4 text-sm font-medium text-green-700">
                          ✓ No similar article titles found.
                        </p>
                      ) : (
                        <div className="mt-4 space-y-2">
                          {titleMatches.map(
                            (match) => (
                              <div
                                key={
                                  match.id
                                }
                                className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-3 py-2.5"
                              >
                                <p className="min-w-0 flex-1 text-sm font-medium text-gray-800">
                                  {match.title}
                                </p>

                                <span
                                  className={`shrink-0 text-xs font-bold ${
                                    match.similarity >=
                                    90
                                      ? "text-red-600"
                                      : match.similarity >=
                                          70
                                        ? "text-amber-600"
                                        : "text-gray-500"
                                  }`}
                                >
                                  {
                                    match.similarity
                                  }
                                  %
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SLUG */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Slug
                  </label>

                  <input
                    type="text"
                    value={slug}
                    onChange={(
                      event
                    ) =>
                      setSlug(
                        createSlug(
                          event.target
                            .value
                        )
                      )
                    }
                    placeholder="article-url-slug"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    URL: /blog/
                    {slug ||
                      "article-slug"}
                  </p>
                </div>

                {/* CATEGORY + AUTHOR */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Category
                    </label>

                    <select
                      value={category}
                      onChange={(
                        event
                      ) =>
                        setCategory(
                          event.target
                            .value
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

                      <option value="Explained">
                        Explained
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
                      onChange={(
                        event
                      ) =>
                        setAuthor(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                {/* TAGS */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tags
                  </label>

                  <input
                    type="text"
                    value={tags}
                    onChange={(
                      event
                    ) =>
                      setTags(
                        event.target
                          .value
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

              <p className="mt-1 text-sm text-gray-500">
                Main image displayed at the beginning of the article.
              </p>

              <div className="mt-5">
                {!coverImagePreview ? (
                  <label
                    htmlFor="cover-image"
                    className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-gray-900 hover:bg-gray-100"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                      📷
                    </div>

                    <p className="text-sm font-semibold text-gray-900">
                      Select Cover Image
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, JPEG or WEBP
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Maximum file size: 5MB
                    </p>

                    <input
                      id="cover-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={
                        handleCoverImageChange
                      }
                    />
                  </label>
                ) : (
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          Selected Image
                        </p>

                        {coverImage && (
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {
                              coverImage.name
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <label
                          htmlFor="cover-image-change"
                          className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Change

                          <input
                            id="cover-image-change"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={
                              handleCoverImageChange
                            }
                          />
                        </label>

                        <button
                          type="button"
                          onClick={
                            removeCoverImage
                          }
                          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                      <img
                        src={
                          coverImagePreview
                        }
                        alt={
                          title ||
                          "Cover preview"
                        }
                        className="max-h-[420px] w-full object-cover"
                      />
                    </div>
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
                    onChange={(
                      event
                    ) =>
                      setExcerpt(
                        event.target
                          .value
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
                    value={
                      introduction
                    }
                    onChange={(
                      event
                    ) =>
                      setIntroduction(
                        event.target
                          .value
                      )
                    }
                    rows={8}
                    placeholder="Write the article introduction..."
                    className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
                  />
                </div>
              </div>
            </section>

            {/* CONTENT BUILDER */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <BlogBlockEditor
                blocks={
                  contentBlocks
                }
                onChange={
                  setContentBlocks
                }
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
                    Add useful questions and answers for readers.
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
                {faqs.length ===
                  0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-500">
                    No FAQs added yet.
                  </div>
                )}

                {faqs.map(
                  (
                    faq,
                    index
                  ) => (
                    <div
                      key={
                        faq.id ||
                        `faq-${index}`
                      }
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">
                          FAQ{" "}
                          {index +
                            1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            deleteFAQ(
                              index
                            )
                          }
                          className="text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="mt-4 space-y-4">
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
                          placeholder="Enter question..."
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                        />

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
                          placeholder="Enter answer..."
                          rows={5}
                          className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* SEO */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                SEO
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Customize how the article appears in search engines.
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    SEO Title
                  </label>

                  <input
                    type="text"
                    value={
                      metaTitle
                    }
                    onChange={(
                      event
                    ) =>
                      setMetaTitle(
                        event.target
                          .value
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
                    value={
                      metaDescription
                    }
                    onChange={(
                      event
                    ) =>
                      setMetaDescription(
                        event.target
                          .value
                      )
                    }
                    rows={4}
                    placeholder="SEO description..."
                    className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}

          <aside>
            <div className="sticky top-6 space-y-6">
              {/* PUBLICATION */}

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-gray-900">
                  Publication
                </h3>

                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      saveBlog(
                        false
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Draft"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPreview(
                        true
                      )
                    }
                    className="w-full rounded-xl border border-gray-900 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Preview Article
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      saveBlog(
                        true
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving
                      ? "Publishing..."
                      : "Publish Article"}
                  </button>
                </div>
              </section>

              {/* FEATURED */}

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={
                      featured
                    }
                    onChange={(
                      event
                    ) =>
                      setFeatured(
                        event.target
                          .checked
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Featured Article
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Mark this article as featured on the homepage.
                    </p>
                  </div>
                </label>
              </section>

              {/* SUMMARY */}

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-gray-900">
                  Article Summary
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Blocks
                    </span>

                    <span className="font-semibold">
                      {
                        contentBlocks.length
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      FAQs
                    </span>

                    <span className="font-semibold">
                      {
                        faqs.length
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Tags
                    </span>

                    <span className="font-semibold">
                      {
                        tags
                          .split(
                            ","
                          )
                          .filter(
                            (
                              tag
                            ) =>
                              tag.trim()
                          ).length
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Category
                    </span>

                    <span className="font-semibold">
                      {category ||
                        "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Cover Image
                    </span>

                    <span className="font-semibold">
                      {coverImage
                        ? "Selected"
                        : "None"}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}