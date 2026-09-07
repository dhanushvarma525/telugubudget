
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import BlogBlockEditor from "@/components/blog/BlogBlockEditor";
import BlogPreview from "@/components/blog/BlogPreview";

import type {
  BlogContentBlock,
  BlogFAQ,
  BlogFormData,
} from "@/types/blog";

/* =========================================================
   HELPERS
========================================================= */

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

  if (a.includes(b) || b.includes(a)) {
    const shorter =
      a.length < b.length ? a : b;

    const longer =
      a.length >= b.length ? a : b;

    return Math.min(
      99,
      Math.round(
        (shorter.length / longer.length) *
          100
      )
    );
  }

  const wordsA = getWords(a);
  const wordsB = getWords(b);

  if (
    wordsA.size === 0 ||
    wordsB.size === 0
  ) {
    return 0;
  }

  let commonWords = 0;

  wordsA.forEach((word) => {
    if (wordsB.has(word)) {
      commonWords++;
    }
  });

  const unionSize = new Set([
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

/* =========================================================
   TYPES
========================================================= */

type ExistingBlogTitle = {
  id: number;
  title: string;
};

type ExistingBlog = {
  id: number;
  title: string;
  slug: string | null;
  excerpt: string | null;
  introduction: string | null;
  cover_image: string | null;
  category: string | null;
  author: string | null;
  tags: string[] | null;
  content_blocks:
    | BlogContentBlock[]
    | null;
  faqs: BlogFAQ[] | null;
  published: boolean | null;
  featured: boolean | null;
  views: number | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/* =========================================================
   PAGE
========================================================= */

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();

  const originalSlug = Array.isArray(
    params?.slug
  )
    ? params.slug[0]
    : String(params?.slug ?? "");

  /* =======================================================
     LOADING
  ======================================================= */

  const [loadingArticle, setLoadingArticle] =
    useState(true);

  /* =======================================================
     ARTICLE STATE
  ======================================================= */

  const [blogId, setBlogId] =
    useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] =
    useState("");

  const [author, setAuthor] =
    useState("Dhanush Varma");

  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] =
    useState("");

  const [introduction, setIntroduction] =
    useState("");

  /* =======================================================
     COVER IMAGE
  ======================================================= */

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  const [
    coverImagePreview,
    setCoverImagePreview,
  ] = useState("");

  const [
    existingCoverImage,
    setExistingCoverImage,
  ] = useState<string | null>(null);

  const [
    removeExistingCover,
    setRemoveExistingCover,
  ] = useState(false);

  /* =======================================================
     CONTENT
  ======================================================= */

  const [
    contentBlocks,
    setContentBlocks,
  ] = useState<BlogContentBlock[]>([]);

  const [faqs, setFaqs] =
    useState<BlogFAQ[]>([]);

  /* =======================================================
     SEO
  ======================================================= */

  const [metaTitle, setMetaTitle] =
    useState("");

  const [
    metaDescription,
    setMetaDescription,
  ] = useState("");

  /* =======================================================
     PUBLICATION
  ======================================================= */

  const [published, setPublished] =
    useState(false);

  const [featured, setFeatured] =
    useState(false);

  const [
    originalPublishedAt,
    setOriginalPublishedAt,
  ] = useState<string | null>(null);

  const [views, setViews] =
    useState(0);

  /* =======================================================
     UI
  ======================================================= */

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showPreview, setShowPreview] =
    useState(false);

  /* =======================================================
     EXISTING TITLES
  ======================================================= */

  const [
    existingTitles,
    setExistingTitles,
  ] = useState<ExistingBlogTitle[]>([]);

  const [
    titlesLoading,
    setTitlesLoading,
  ] = useState(true);

  /* =========================================================
     LOAD ARTICLE
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadArticle() {
      if (!originalSlug) {
        if (mounted) {
          setError(
            "Article slug is missing."
          );
          setLoadingArticle(false);
        }

        return;
      }

      try {
        setLoadingArticle(true);
        setError("");

        /*
         * Fetch the article using the public/admin
         * blogs API.
         */
        const response = await fetch(
          `/api/blogs?slug=${encodeURIComponent(
            originalSlug
          )}&admin=true`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control":
                "no-cache",
            },
          }
        );

        const rawText =
          await response.text();

        let data: unknown = null;

        if (rawText.trim()) {
          try {
            data = JSON.parse(rawText);
          } catch {
            data = null;
          }
        }

        if (!response.ok) {
          let message =
            "Failed to load article.";

          if (
            data &&
            typeof data === "object"
          ) {
            const object =
              data as Record<
                string,
                unknown
              >;

            if (
              typeof object.error ===
              "string"
            ) {
              message = object.error;
            } else if (
              typeof object.message ===
              "string"
            ) {
              message =
                object.message;
            }
          }

          throw new Error(message);
        }

        /*
         * Support multiple common API
         * response shapes.
         */
        let article: unknown = null;

        if (
          data &&
          typeof data === "object"
        ) {
          const object =
            data as Record<
              string,
              unknown
            >;

          if (
            object.blog &&
            typeof object.blog ===
              "object"
          ) {
            article = object.blog;
          } else if (
            Array.isArray(object.blogs)
          ) {
            article =
              object.blogs.find(
                (item) =>
                  item &&
                  typeof item ===
                    "object"
              ) ?? null;
          } else if (
            Array.isArray(data)
          ) {
            article =
              data.find(
                (item) =>
                  item &&
                  typeof item ===
                    "object"
              ) ?? null;
          } else {
            article = data;
          }
        }

        if (
          !article ||
          typeof article !==
            "object"
        ) {
          throw new Error(
            "Article could not be found."
          );
        }

        const blog =
          article as ExistingBlog;

        if (
          typeof blog.id !==
          "number"
        ) {
          throw new Error(
            "Invalid article data returned by the server."
          );
        }

        if (!mounted) {
          return;
        }

        /*
         * Populate all fields.
         */
        setBlogId(blog.id);

        setTitle(blog.title ?? "");

        setSlug(
          blog.slug ||
            originalSlug
        );

        setCategory(
          blog.category ?? ""
        );

        setAuthor(
          blog.author ||
            "Dhanush Varma"
        );

        setTags(
          Array.isArray(blog.tags)
            ? blog.tags.join(", ")
            : ""
        );

        setExcerpt(
          blog.excerpt ?? ""
        );

        setIntroduction(
          blog.introduction ?? ""
        );

        /*
         * Existing cover.
         */
        setExistingCoverImage(
          blog.cover_image ?? null
        );

        setCoverImagePreview(
          blog.cover_image ?? ""
        );

        setRemoveExistingCover(false);

        /*
         * Content blocks.
         */
        setContentBlocks(
          Array.isArray(
            blog.content_blocks
          )
            ? blog.content_blocks
            : []
        );

        /*
         * FAQs.
         */
        setFaqs(
          Array.isArray(blog.faqs)
            ? blog.faqs.map(
                (faq, index) => ({
                  id:
                    faq.id ||
                    crypto.randomUUID(),
                  question:
                    faq.question ??
                    "",
                  answer:
                    faq.answer ??
                    "",
                })
              )
            : []
        );

        /*
         * SEO.
         */
        setMetaTitle(
          blog.meta_title ?? ""
        );

        setMetaDescription(
          blog.meta_description ??
            ""
        );

        /*
         * Publication.
         */
        setPublished(
          Boolean(blog.published)
        );

        setFeatured(
          Boolean(blog.featured)
        );

        setOriginalPublishedAt(
          blog.published_at ??
            null
        );

        setViews(
          typeof blog.views ===
            "number"
            ? blog.views
            : 0
        );
      } catch (err) {
        console.error(
          "LOAD ARTICLE ERROR:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load article."
          );
        }
      } finally {
        if (mounted) {
          setLoadingArticle(false);
        }
      }
    }

    loadArticle();

    return () => {
      mounted = false;
    };
  }, [originalSlug]);

  /* =========================================================
     LOAD EXISTING TITLES
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadExistingTitles() {
      try {
        setTitlesLoading(true);

        const response =
          await fetch(
            "/api/blogs?admin=true&limit=1000",
            {
              method: "GET",
              cache: "no-store",
              headers: {
                "Cache-Control":
                  "no-cache",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load previous article titles."
          );
        }

        const data =
          await response.json();

        const blogList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data.blogs
                )
              ? data.blogs
              : [];

        const titles: ExistingBlogTitle[] =
          blogList
            .filter(
              (blog: unknown) =>
                blog &&
                typeof blog ===
                  "object" &&
                typeof (
                  blog as {
                    id?: unknown;
                  }
                ).id ===
                  "number" &&
                typeof (
                  blog as {
                    title?: unknown;
                  }
                ).title ===
                  "string"
            )
            .map(
              (blog: {
                id: number;
                title: string;
              }) => ({
                id: blog.id,
                title:
                  blog.title.trim(),
              })
            )
           .filter(
  (blog: ExistingBlogTitle) =>
    blog.title.length > 0
);

        if (mounted) {
          setExistingTitles(
            titles
          );
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

  /* =========================================================
     TITLE MATCHES
  ========================================================= */

  const titleMatches = useMemo(() => {
    const currentTitle =
      title.trim();

    if (!currentTitle) {
      return [];
    }

    return existingTitles
      /*
       * IMPORTANT:
       * Exclude the article being edited.
       */
      .filter(
        (blog) =>
          blog.id !== blogId
      )
      .map((blog) => ({
        ...blog,
        similarity:
          calculateTitleSimilarity(
            currentTitle,
            blog.title
          ),
      }))
      .filter(
        (blog) =>
          blog.similarity >= 35
      )
      .sort(
        (a, b) =>
          b.similarity -
          a.similarity
      )
      .slice(0, 8);
  }, [
    title,
    existingTitles,
    blogId,
  ]);

  const highestTitleMatch =
    titleMatches.length > 0
      ? titleMatches[0].similarity
      : 0;

  /* =========================================================
     IMAGE PREVIEW CLEANUP
  ========================================================= */

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

  /* =========================================================
     TITLE / SLUG
  ========================================================= */

  function handleTitleChange(
    value: string
  ) {
    setTitle(value);

    /*
     * Only auto-generate the slug when
     * there was no original/custom slug.
     *
     * Existing article slugs are preserved.
     */
    if (
      !slug &&
      !originalSlug
    ) {
      setSlug(createSlug(value));
    }
  }

  /* =========================================================
     COVER IMAGE
  ========================================================= */

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

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
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
    setRemoveExistingCover(
      false
    );

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

    /*
     * Tell API that the existing
     * Supabase image should also
     * be removed from the article.
     */
    setRemoveExistingCover(true);
  }

  /* =========================================================
     FAQ
  ========================================================= */

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

  /* =========================================================
     PREVIEW BLOG
  ========================================================= */

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

        published,
        featured,

        views,

        meta_title:
          metaTitle || title,

        meta_description:
          metaDescription ||
          excerpt,

        published_at:
          originalPublishedAt,

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
        published,
        featured,
        views,
        metaTitle,
        metaDescription,
        originalPublishedAt,
      ]
    );

  /* =========================================================
     SAFE API RESPONSE PARSER
  ========================================================= */

  async function readApiResponse(
    response: Response
  ): Promise<{
    data:
      | Record<string, unknown>
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

  /* =========================================================
     SAVE / UPDATE BLOG
  ========================================================= */

  async function saveBlog(
    publish: boolean
  ) {
    setError("");
    setSuccess("");

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!blogId) {
      setError(
        "Article is still loading. Please wait a moment and try again."
      );
      return;
    }

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

    /* -------------------------------------------------------
       FAQ VALIDATION
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       DUPLICATE TITLE WARNING
    ------------------------------------------------------- */

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

      /* -----------------------------------------------------
         BASIC INFORMATION
      ----------------------------------------------------- */

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

      /*
       * Send original slug so the API can locate
       * the article even if the slug was changed.
       */
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
        category.trim()
      );

      formData.append(
        "author",
        author.trim()
      );

      /* -----------------------------------------------------
         TAGS
      ----------------------------------------------------- */

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

      /* -----------------------------------------------------
         CONTENT BLOCKS
      ----------------------------------------------------- */

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

      /* -----------------------------------------------------
         FAQ
      ----------------------------------------------------- */

      const cleanFaqs =
        faqs.map((faq) => ({
          id:
            faq.id ||
            crypto.randomUUID(),
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

      /* -----------------------------------------------------
         PUBLICATION
      ----------------------------------------------------- */

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
       * Preserve existing publication date when
       * the article is already published.
       *
       * If a draft is published for the first
       * time, create a new publication timestamp.
       */
      if (publish) {
        formData.append(
          "published_at",
          originalPublishedAt ||
            new Date().toISOString()
        );
      } else {
        /*
         * Keep existing publication date if
         * saving an already-published article
         * as draft is not desired.
         *
         * For a draft, explicitly send null.
         */
        formData.append(
          "published_at",
          ""
        );
      }

      /* -----------------------------------------------------
         SEO
      ----------------------------------------------------- */

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

      /* -----------------------------------------------------
         COVER IMAGE
      ----------------------------------------------------- */

      if (coverImage) {
        formData.append(
          "cover_image",
          coverImage,
          coverImage.name
        );
      }

      /*
       * Only tell the API to remove the old
       * image when the user actually clicked Remove.
       */
      formData.append(
        "remove_cover_image",
        removeExistingCover
          ? "true"
          : "false"
      );

      /* -----------------------------------------------------
         UPDATE REQUEST
      ----------------------------------------------------- */

      /*
       * IMPORTANT:
       * This is an UPDATE, not a new article.
       *
       * The endpoint receives the existing blog ID.
       */
      const response =
        await fetch(
          "/api/blogs",
          {
            method: "PUT",
            body: formData,
          }
        );

      /* -----------------------------------------------------
         SAFE RESPONSE
      ----------------------------------------------------- */

      const {
        data,
        rawText,
      } =
        await readApiResponse(
          response
        );

      /* -----------------------------------------------------
         API ERROR
      ----------------------------------------------------- */

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
            `Failed to update article. Server returned ${response.status}.`
        );
      }

      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      setPublished(publish);

      setSuccess(
        publish
          ? "Article updated and published successfully."
          : "Article updated and saved as draft."
      );

      /*
       * If the image was removed, clear
       * local removal state.
       */
      if (
        removeExistingCover
      ) {
        setExistingCoverImage(
          null
        );
        setRemoveExistingCover(
          false
        );
      }

      /*
       * If a new cover was uploaded,
       * it is now the existing cover.
       */
      if (coverImage) {
        setExistingCoverImage(
          coverImagePreview
        );
        setCoverImage(null);
      }

      /*
       * Update publication timestamp
       * in local state.
       */
      if (publish) {
        if (!originalPublishedAt) {
          setOriginalPublishedAt(
            new Date().toISOString()
          );
        }
      }

      /*
       * Redirect back to article list.
       */
      setTimeout(() => {
        router.push(
          "/admin/blogs"
        );

        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "BLOG UPDATE ERROR:",
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
          "Something went wrong while updating the article."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loadingArticle) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

            <h1 className="mt-5 text-lg font-bold text-gray-900">
              Loading Article
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Loading your article and
              editor content...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR WITHOUT ARTICLE
  ========================================================= */

  if (!blogId) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">
              ⚠️
            </div>

            <h1 className="mt-4 text-xl font-bold text-gray-900">
              Unable to Load Article
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {error ||
                "The requested article could not be found."}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/blogs"
                )
              }
              className="mt-6 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              ← Back to Articles
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     PREVIEW
  ========================================================= */

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
                Preview your article before
                updating or publishing.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowPreview(false)
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

  /* =========================================================
     EDITOR
  ========================================================= */

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Edit Article
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    published
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {published
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Update your AnantaGo technology
                article.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowPreview(true)
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
                  ? "Updating..."
                  : published
                    ? "Update Article"
                    : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {(error || success) && (
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  ⚠️
                </span>

                <div className="min-w-0">
                  <p className="font-semibold">
                    Unable to update article
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

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            {/* =================================================
                ARTICLE INFORMATION
            ================================================= */}

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
                    onChange={(event) =>
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
                            Your current article is
                            excluded from this check.
                          </p>
                        </div>

                        {!titlesLoading && (
                          <span className="text-xs font-medium text-gray-400">
                            {
                              existingTitles.filter(
                                (item) =>
                                  item.id !==
                                  blogId
                              ).length
                            }{" "}
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
                          ✓ No similar article
                          titles found.
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
                                  {
                                    match.title
                                  }
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
                    onChange={(event) =>
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

                  {slug !==
                    originalSlug && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                      ⚠️ Changing the slug will
                      change the article URL.
                    </p>
                  )}
                </div>

                {/* CATEGORY + AUTHOR */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Category
                    </label>

                    <select
                      value={category}
                      onChange={(event) =>
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
                      onChange={(event) =>
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
                    onChange={(event) =>
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

            {/* =================================================
                COVER IMAGE
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Cover Image
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Main image displayed at the beginning
                of the article.
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
                          Current Cover Image
                        </p>

                        {coverImage && (
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {
                              coverImage.name
                            }
                          </p>
                        )}

                        {!coverImage &&
                          existingCoverImage && (
                            <p className="mt-1 text-xs text-green-600">
                              Existing image
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

            {/* =================================================
                INTRODUCTION
            ================================================= */}

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
                    onChange={(event) =>
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

            {/* =================================================
                CONTENT BUILDER
            ================================================= */}

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

            {/* =================================================
                FAQ
            ================================================= */}

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
                              event
                                .target
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
                              event
                                .target
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

            {/* =================================================
                SEO
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                SEO
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Customize how the article appears in
                search engines.
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
                    onChange={(event) =>
                      setMetaTitle(
                        event.target
                          .value
                      )
                    }
                    placeholder="SEO title..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    {metaTitle.length} characters
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    SEO Description
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
                    placeholder="SEO description..."
                    className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    {
                      metaDescription.length
                    }{" "}
                    characters
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ===================================================
              SIDEBAR
          =================================================== */}

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
                      ? "Updating..."
                      : published
                        ? "Update Article"
                        : "Publish Article"}
                  </button>
                </div>
              </section>

              {/* STATUS */}

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-gray-900">
                  Status
                </h3>

                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-500">
                      Current status
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {published
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  {originalPublishedAt && (
                    <p className="mt-3 text-xs text-gray-500">
                      Published:{" "}
                      {new Date(
                        originalPublishedAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  )}
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
                    onChange={(event) =>
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
                      Mark this article as featured on
                      the homepage.
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
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Article ID
                    </span>

                    <span className="font-semibold">
                      {blogId}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Blocks
                    </span>

                    <span className="font-semibold">
                      {
                        contentBlocks.length
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      FAQs
                    </span>

                    <span className="font-semibold">
                      {faqs.length}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
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
                          )
                          .length
                      }
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Category
                    </span>

                    <span className="text-right font-semibold">
                      {category ||
                        "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Views
                    </span>

                    <span className="font-semibold">
                      {views}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Cover Image
                    </span>

                    <span className="font-semibold">
                      {coverImagePreview
                        ? "Available"
                        : "None"}
                    </span>
                  </div>
                </div>
              </section>

              {/* BACK */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/blogs"
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                ← Back to Articles
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

