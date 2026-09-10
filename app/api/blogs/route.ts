
import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

/* =========================================================
   CONFIGURATION
========================================================= */

const CATEGORIES = [
  "AI",
  "Tech",
  "How-To",
  "Apps",
  "Security",
  "Explained",
] as const;

type BlogCategory = (typeof CATEGORIES)[number];

type BlogRow = {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string | null;
  introduction: string | null;
  cover_image: string | null;
  category: BlogCategory;
  author: string | null;
  tags: string[] | null;
  content_blocks: unknown;
  faqs: unknown;
  published: boolean;
  featured: boolean;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/* =========================================================
   RESPONSE HELPER
========================================================= */

function jsonResponse(
  data: unknown,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

/* =========================================================
   BOOLEAN PARSER
========================================================= */

function parseBoolean(
  value:
    | FormDataEntryValue
    | string
    | null
    | undefined,
  fallback = false
): boolean {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes"
  ) {
    return true;
  }

  if (
    normalized === "false" ||
    normalized === "0" ||
    normalized === "no"
  ) {
    return false;
  }

  return fallback;
}

/* =========================================================
   JSON PARSER
========================================================= */

function parseJsonValue<T>(
  value:
    | FormDataEntryValue
    | null
    | undefined,
  fallback: T
): T {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

/* =========================================================
   SLUG NORMALIZER
========================================================= */

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

/* =========================================================
   CATEGORY VALIDATION
========================================================= */

function isValidCategory(
  value: string
): value is BlogCategory {
  return CATEGORIES.includes(
    value as BlogCategory
  );
}

/* =========================================================
   CATEGORY NORMALIZER
=========================================================

   Public category URLs send values such as:

   AI
   Tech
   How-To
   Apps
   Security
   Explained

   We normalize the incoming value so that accidental
   casing differences do not break category pages.

========================================================= */

function normalizeCategory(
  value: string | null
): BlogCategory | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase();

  const category = CATEGORIES.find(
    (item) =>
      item.toLowerCase() === normalized
  );

  return category ?? null;
}

/* =========================================================
   STORAGE URL -> PATH
========================================================= */

function getStoragePathFromPublicUrl(
  url: string | null | undefined
): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    const marker =
      "/storage/v1/object/public/blog-images/";

    const index =
      parsed.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    const path =
      parsed.pathname.slice(
        index + marker.length
      );

    return path
      ? decodeURIComponent(path)
      : null;
  } catch {
    return null;
  }
}

/* =========================================================
   DELETE COVER IMAGE
========================================================= */

async function deleteCoverImage(
  coverImage: string | null | undefined
) {
  if (!coverImage) {
    return;
  }

  const path =
    getStoragePathFromPublicUrl(
      coverImage
    );

  if (!path) {
    return;
  }

  const { error } =
    await supabaseAdmin.storage
      .from("blog-images")
      .remove([path]);

  if (error) {
    console.error(
      "DELETE COVER IMAGE ERROR:",
      error
    );
  }
}

/* =========================================================
   UPLOAD COVER IMAGE
========================================================= */

async function uploadCoverImage(
  file: File
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error(
      "Cover image file is empty."
    );
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Cover image must be JPG, PNG, or WEBP."
    );
  }

  const maxSize =
    5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Cover image must be smaller than 5MB."
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "jpg";

  const safeExtension =
    [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ].includes(extension)
      ? extension
      : "jpg";

  const fileName = `${crypto.randomUUID()}.${safeExtension}`;

  const filePath = `covers/${fileName}`;

  const arrayBuffer =
    await file.arrayBuffer();

  const { error } =
    await supabaseAdmin.storage
      .from("blog-images")
      .upload(
        filePath,
        arrayBuffer,
        {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        }
      );

  if (error) {
    console.error(
      "SUPABASE COVER UPLOAD ERROR:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to upload cover image."
    );
  }

  const {
    data: publicUrlData,
  } =
    supabaseAdmin.storage
      .from("blog-images")
      .getPublicUrl(
        filePath
      );

  if (
    !publicUrlData?.publicUrl
  ) {
    throw new Error(
      "Cover image uploaded, but public URL could not be created."
    );
  }

  return publicUrlData.publicUrl;
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      request.nextUrl;

    const slug =
      searchParams.get("slug");

    const id =
      searchParams.get("id");

    const admin =
      searchParams.get("admin") === "true";

    const status =
      searchParams.get("status");

    const pageParam =
      searchParams.get("page");

    const limitParam =
      searchParams.get("limit");

    /*
     * IMPORTANT:
     * Read the category parameter.
     *
     * Category pages call:
     *
     * /api/blogs?category=AI
     * /api/blogs?category=Tech
     * /api/blogs?category=How-To
     * etc.
     */
    const categoryParam =
      searchParams.get("category");

    const category =
      normalizeCategory(
        categoryParam
      );

    const page = Math.max(
      1,
      Number(pageParam) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(limitParam) || 10
      )
    );

    /* =====================================================
       ADMIN AUTHENTICATION
    ===================================================== */

    if (admin) {
      const auth =
        await requireAdmin(request);

      if (
        auth.error ||
        !auth.user
      ) {
        return jsonResponse(
          {
            success: false,
            error:
              auth.error ||
              "Authentication required.",
          },
          401
        );
      }
    }

    /* =====================================================
       INVALID CATEGORY
    =====================================================

       If a category was explicitly requested but it does
       not match one of the supported categories, return
       an error instead of accidentally returning ALL blogs.

    ===================================================== */

    if (
      categoryParam &&
      !category
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid article category.",
        },
        400
      );
    }

    /* =====================================================
       SINGLE ARTICLE
    ===================================================== */

    if (slug || id) {
      let query =
        supabaseAdmin
          .from("blogs")
          .select("*")
          .limit(1);

      if (slug) {
        query = query.eq(
          "slug",
          slug
        );
      }

      if (id) {
        query = query.eq(
          "id",
          id
        );
      }

      /*
       * Public requests must only see published
       * articles.
       *
       * Admin requests can see drafts.
       */
      if (!admin) {
        query = query.eq(
          "published",
          true
        );
      }

      const {
        data,
        error,
      } = await query.maybeSingle();

      if (error) {
        console.error(
          "GET SINGLE BLOG ERROR:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              error.message ||
              "Failed to fetch article.",
          },
          500
        );
      }

      if (!data) {
        return jsonResponse(
          {
            success: false,
            error:
              "Article not found.",
          },
          404
        );
      }

      return jsonResponse({
        success: true,
        blog: data,
      });
    }

    /* =====================================================
       BLOG LIST
    ===================================================== */

    const from =
      (page - 1) * limit;

    const to =
      from + limit - 1;

    /*
     * Admin uses supabaseAdmin after authentication.
     *
     * Public uses the normal Supabase client and only
     * receives published articles.
     */
    let query = admin
      ? supabaseAdmin
          .from("blogs")
          .select("*", {
            count: "exact",
          })
      : supabase
          .from("blogs")
          .select("*", {
            count: "exact",
          })
          .eq("published", true);

    /* =====================================================
       CATEGORY FILTER
    =====================================================

       THIS IS THE FIX.

       Previously category was sent from
       BlogCategoryPage.tsx but never applied to Supabase.

       Now:

       /ai       -> category = AI
       /tech     -> category = Tech
       /how-to   -> category = How-To
       /apps     -> category = Apps
       /security -> category = Security
       /explained -> category = Explained

       Because this filter is applied before count and range,
       pagination is also calculated correctly per category.

    ===================================================== */

    if (category) {
      query = query.eq(
        "category",
        category
      );
    }

    /* =====================================================
       ADMIN STATUS FILTER
    ===================================================== */

    if (admin) {
      if (status === "draft") {
        query = query.eq(
          "published",
          false
        );
      }

      if (status === "published") {
        query = query.eq(
          "published",
          true
        );
      }
    }

    /* =====================================================
       ORDER + PAGINATION
    ===================================================== */

    query = query
      .order(
        "published_at",
        {
          ascending: false,
          nullsFirst: false,
        }
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .range(
        from,
        to
      );

    const {
      data,
      error,
      count,
    } = await query;

    if (error) {
      console.error(
        "GET BLOGS ERROR:",
        error
      );

      return jsonResponse(
        {
          success: false,
          error:
            error.message ||
            "Failed to fetch articles.",
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      blogs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil(
        (count || 0) / limit
      ),
    });
  } catch (error) {
    console.error(
      "GET BLOGS UNEXPECTED ERROR:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      500
    );
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    /* =====================================================
       ADMIN AUTH
    ===================================================== */

    const auth =
      await requireAdmin(request);

    if (
      auth.error ||
      !auth.user
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            auth.error ||
            "Authentication required.",
        },
        401
      );
    }

    /* =====================================================
       FORM DATA
    ===================================================== */

    const formData =
      await request.formData();

    const title =
      String(
        formData.get("title") || ""
      ).trim();

    const slugInput =
      String(
        formData.get("slug") || ""
      ).trim();

    const slug =
      normalizeSlug(
        slugInput || title
      );

    const category =
      String(
        formData.get("category") ||
          ""
      ).trim();

    const author =
      String(
        formData.get("author") ||
          ""
      ).trim();

    const excerpt =
      String(
        formData.get("excerpt") ||
          ""
      ).trim();

    const introduction =
      String(
        formData.get(
          "introduction"
        ) || ""
      ).trim();

    const tags =
      parseJsonValue<string[]>(
        formData.get("tags"),
        []
      );

    const contentBlocks =
      parseJsonValue(
        formData.get(
          "content_blocks"
        ),
        []
      );

    const faqs =
      parseJsonValue(
        formData.get("faqs"),
        []
      );

    const published =
      parseBoolean(
        formData.get("published"),
        false
      );

    const featured =
      parseBoolean(
        formData.get("featured"),
        false
      );

    const metaTitle =
      String(
        formData.get(
          "meta_title"
        ) || ""
      ).trim();

    const metaDescription =
      String(
        formData.get(
          "meta_description"
        ) || ""
      ).trim();

    const coverImageEntry =
      formData.get(
        "cover_image"
      );

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!title) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article title is required.",
        },
        400
      );
    }

    if (!slug) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article slug is required.",
        },
        400
      );
    }

    if (!isValidCategory(category)) {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid article category.",
        },
        400
      );
    }

    if (
      !Array.isArray(tags)
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Tags must be a valid array.",
        },
        400
      );
    }

    /* =====================================================
       DUPLICATE SLUG CHECK
    ===================================================== */

    const {
      data: existing,
      error:
        existingError,
    } =
      await supabaseAdmin
        .from("blogs")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (existingError) {
      console.error(
        "CHECK EXISTING BLOG ERROR:",
        existingError
      );

      return jsonResponse(
        {
          success: false,
          error:
            existingError.message ||
            "Failed to check article slug.",
        },
        500
      );
    }

    if (existing) {
      return jsonResponse(
        {
          success: false,
          error:
            "An article with this slug already exists.",
        },
        409
      );
    }

    /* =====================================================
       COVER IMAGE
    ===================================================== */

    let coverImage:
      | string
      | null = null;

    if (
      coverImageEntry instanceof File &&
      coverImageEntry.size > 0
    ) {
      try {
        coverImage =
          await uploadCoverImage(
            coverImageEntry
          );
      } catch (error) {
        console.error(
          "COVER UPLOAD ERROR:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to upload cover image.",
          },
          500
        );
      }
    }

    /* =====================================================
       INSERT BLOG
    ===================================================== */

    const publishedAt =
      published
        ? new Date().toISOString()
        : null;

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("blogs")
        .insert({
          title,
          slug,
          excerpt:
            excerpt || null,
          introduction:
            introduction || null,
          cover_image:
            coverImage,
          category,
          author:
            author || null,
          tags,
          content_blocks:
            contentBlocks,
          faqs,
          published,
          featured,
          views: 0,
          meta_title:
            metaTitle || null,
          meta_description:
            metaDescription ||
            null,
          published_at:
            publishedAt,
        })
        .select("*")
        .single();

    if (error) {
      console.error(
        "INSERT BLOG ERROR:",
        error
      );

      if (coverImage) {
        await deleteCoverImage(
          coverImage
        );
      }

      return jsonResponse(
        {
          success: false,
          error:
            error.message ||
            "Failed to save article.",
        },
        500
      );
    }

    return jsonResponse(
      {
        success: true,
        blog: data,
        message:
          "Article created successfully.",
      },
      201
    );
  } catch (error) {
    console.error(
      "POST BLOG UNEXPECTED ERROR:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      500
    );
  }
}

/* =========================================================
   PUT
========================================================= */

export async function PUT(
  request: NextRequest
) {
  try {
    /* =====================================================
       ADMIN AUTH
    ===================================================== */

    const auth =
      await requireAdmin(request);

    if (
      auth.error ||
      !auth.user
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            auth.error ||
            "Authentication required.",
        },
        401
      );
    }

    /* =====================================================
       FORM DATA
    ===================================================== */

    const formData =
      await request.formData();

    const id =
      String(
        formData.get("id") || ""
      ).trim();

    if (!id) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article ID is required.",
        },
        400
      );
    }

    const title =
      String(
        formData.get("title") || ""
      ).trim();

    const slugInput =
      String(
        formData.get("slug") || ""
      ).trim();

    const slug =
      normalizeSlug(
        slugInput || title
      );

    const category =
      String(
        formData.get("category") ||
          ""
      ).trim();

    const author =
      String(
        formData.get("author") ||
          ""
      ).trim();

    const excerpt =
      String(
        formData.get("excerpt") ||
          ""
      ).trim();

    const introduction =
      String(
        formData.get(
          "introduction"
        ) || ""
      ).trim();

    const tags =
      parseJsonValue<string[]>(
        formData.get("tags"),
        []
      );

    const contentBlocks =
      parseJsonValue(
        formData.get(
          "content_blocks"
        ),
        []
      );

    const faqs =
      parseJsonValue(
        formData.get("faqs"),
        []
      );

    const published =
      parseBoolean(
        formData.get("published"),
        false
      );

    const featured =
      parseBoolean(
        formData.get("featured"),
        false
      );

    const metaTitle =
      String(
        formData.get(
          "meta_title"
        ) || ""
      ).trim();

    const metaDescription =
      String(
        formData.get(
          "meta_description"
        ) || ""
      ).trim();

    const coverImageEntry =
      formData.get(
        "cover_image"
      );

    const removeCoverImage =
      parseBoolean(
        formData.get(
          "remove_cover_image"
        ),
        false
      );

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!title) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article title is required.",
        },
        400
      );
    }

    if (!slug) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article slug is required.",
        },
        400
      );
    }

    if (!isValidCategory(category)) {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid article category.",
        },
        400
      );
    }

    if (
      !Array.isArray(tags)
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Tags must be a valid array.",
        },
        400
      );
    }

    /* =====================================================
       FIND EXISTING BLOG
    ===================================================== */

    const {
      data: existingBlog,
      error:
        existingBlogError,
    } =
      await supabaseAdmin
        .from("blogs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (existingBlogError) {
      console.error(
        "FIND BLOG FOR UPDATE ERROR:",
        existingBlogError
      );

      return jsonResponse(
        {
          success: false,
          error:
            existingBlogError.message ||
            "Failed to find article.",
        },
        500
      );
    }

    if (!existingBlog) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article not found.",
        },
        404
      );
    }

    /* =====================================================
       DUPLICATE SLUG CHECK
    ===================================================== */

    const {
      data: duplicateBlog,
      error:
        duplicateError,
    } =
      await supabaseAdmin
        .from("blogs")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();

    if (duplicateError) {
      console.error(
        "CHECK DUPLICATE SLUG ERROR:",
        duplicateError
      );

      return jsonResponse(
        {
          success: false,
          error:
            duplicateError.message ||
            "Failed to check article slug.",
        },
        500
      );
    }

    if (duplicateBlog) {
      return jsonResponse(
        {
          success: false,
          error:
            "Another article with this slug already exists.",
        },
        409
      );
    }

    /* =====================================================
       COVER IMAGE
    ===================================================== */

    let coverImage =
      existingBlog.cover_image;

    let newCoverImage:
      | string
      | null = null;

    if (
      coverImageEntry instanceof File &&
      coverImageEntry.size > 0
    ) {
      try {
        newCoverImage =
          await uploadCoverImage(
            coverImageEntry
          );

        coverImage =
          newCoverImage;
      } catch (error) {
        console.error(
          "COVER UPLOAD ERROR:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to upload cover image.",
          },
          500
        );
      }
    } else if (
      removeCoverImage
    ) {
      coverImage = null;
    }

    /* =====================================================
       PUBLISHED DATE
    ===================================================== */

    let publishedAt =
      existingBlog.published_at;

    if (
      published &&
      !existingBlog.published
    ) {
      publishedAt =
        new Date().toISOString();
    }

    if (!published) {
      publishedAt = null;
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("blogs")
        .update({
          title,
          slug,
          excerpt:
            excerpt || null,
          introduction:
            introduction || null,
          cover_image:
            coverImage,
          category,
          author:
            author || null,
          tags,
          content_blocks:
            contentBlocks,
          faqs,
          published,
          featured,
          meta_title:
            metaTitle || null,
          meta_description:
            metaDescription ||
            null,
          published_at:
            publishedAt,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
      console.error(
        "UPDATE BLOG ERROR:",
        error
      );

      if (newCoverImage) {
        await deleteCoverImage(
          newCoverImage
        );
      }

      return jsonResponse(
        {
          success: false,
          error:
            error.message ||
            "Failed to update article.",
        },
        500
      );
    }

    /* =====================================================
       DELETE OLD IMAGE AFTER SUCCESSFUL UPDATE
    ===================================================== */

    if (
      newCoverImage &&
      existingBlog.cover_image
    ) {
      await deleteCoverImage(
        existingBlog.cover_image
      );
    }

    if (
      removeCoverImage &&
      !newCoverImage &&
      existingBlog.cover_image
    ) {
      await deleteCoverImage(
        existingBlog.cover_image
      );
    }

    return jsonResponse({
      success: true,
      blog: data,
      message:
        "Article updated successfully.",
    });
  } catch (error) {
    console.error(
      "PUT BLOG UNEXPECTED ERROR:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      500
    );
  }
}

/* =========================================================
   PATCH
========================================================= */

export async function PATCH(
  request: NextRequest
) {
  try {
    /* =====================================================
       ADMIN AUTH
    ===================================================== */

    const auth =
      await requireAdmin(request);

    if (
      auth.error ||
      !auth.user
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            auth.error ||
            "Authentication required.",
        },
        401
      );
    }

    /* =====================================================
       FORM DATA / JSON
    ===================================================== */

    const contentType =
      request.headers.get(
        "content-type"
      ) || "";

    let id: string | null =
      null;

    let published:
      | boolean
      | undefined;

    let featured:
      | boolean
      | undefined;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const body =
        await request.json();

      id =
        body?.id
          ? String(body.id)
          : null;

      if (
        typeof body?.published ===
        "boolean"
      ) {
        published =
          body.published;
      }

      if (
        typeof body?.featured ===
        "boolean"
      ) {
        featured =
          body.featured;
      }
    } else {
      const formData =
        await request.formData();

      id =
        String(
          formData.get("id") || ""
        ).trim();

      if (
        formData.has("published")
      ) {
        published =
          parseBoolean(
            formData.get(
              "published"
            ),
            false
          );
      }

      if (
        formData.has("featured")
      ) {
        featured =
          parseBoolean(
            formData.get(
              "featured"
            ),
            false
          );
      }
    }

    if (!id) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article ID is required.",
        },
        400
      );
    }

    /* =====================================================
       FIND EXISTING
    ===================================================== */

    const {
      data: existingBlog,
      error:
        existingError,
    } =
      await supabaseAdmin
        .from("blogs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (existingError) {
      console.error(
        "PATCH FIND BLOG ERROR:",
        existingError
      );

      return jsonResponse(
        {
          success: false,
          error:
            existingError.message ||
            "Failed to find article.",
        },
        500
      );
    }

    if (!existingBlog) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article not found.",
        },
        404
      );
    }

    /* =====================================================
       BUILD UPDATE
    ===================================================== */

    const updateData: Record<
      string,
      unknown
    > = {};

    if (
      typeof published ===
      "boolean"
    ) {
      updateData.published =
        published;

      if (
        published &&
        !existingBlog.published
      ) {
        updateData.published_at =
          new Date().toISOString();
      }

      if (!published) {
        updateData.published_at =
          null;
      }
    }

    if (
      typeof featured ===
      "boolean"
    ) {
      updateData.featured =
        featured;
    }

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "No valid fields were provided for update.",
        },
        400
      );
    }

    updateData.updated_at =
      new Date().toISOString();

    /* =====================================================
       UPDATE
    ===================================================== */

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("blogs")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
      console.error(
        "PATCH BLOG ERROR:",
        error
      );

      return jsonResponse(
        {
          success: false,
          error:
            error.message ||
            "Failed to update article.",
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      blog: data,
      message:
        "Article updated successfully.",
    });
  } catch (error) {
    console.error(
      "PATCH BLOG UNEXPECTED ERROR:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      500
    );
  }
}

/* =========================================================
   DELETE
========================================================= */

export async function DELETE(
  request: NextRequest
) {
  try {
    /* =====================================================
       ADMIN AUTH
    ===================================================== */

    const auth =
      await requireAdmin(request);

    if (
      auth.error ||
      !auth.user
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            auth.error ||
            "Authentication required.",
        },
        401
      );
    }

    /* =====================================================
       GET ID
    ===================================================== */

    const {
      searchParams,
    } = request.nextUrl;

    const id =
      searchParams.get("id");

    if (!id) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article ID is required.",
        },
        400
      );
    }

    /* =====================================================
       FIND BLOG
    ===================================================== */

    const {
      data: existingBlog,
      error:
        findError,
    } =
      await supabaseAdmin
        .from("blogs")
        .select(
          "id, cover_image"
        )
        .eq("id", id)
        .maybeSingle();

    if (findError) {
      console.error(
        "DELETE FIND BLOG ERROR:",
        findError
      );

      return jsonResponse(
        {
          success: false,
          error:
            findError.message ||
            "Failed to find article.",
        },
        500
      );
    }

    if (!existingBlog) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article not found.",
        },
        404
      );
    }

    /* =====================================================
       DELETE DATABASE ROW
    ===================================================== */

    const {
      error: deleteError,
    } =
      await supabaseAdmin
        .from("blogs")
        .delete()
        .eq("id", id);

    if (deleteError) {
      console.error(
        "DELETE BLOG ERROR:",
        deleteError
      );

      return jsonResponse(
        {
          success: false,
          error:
            deleteError.message ||
            "Failed to delete article.",
        },
        500
      );
    }

    /* =====================================================
       DELETE COVER IMAGE
    ===================================================== */

    if (
      existingBlog.cover_image
    ) {
      await deleteCoverImage(
        existingBlog.cover_image
      );
    }

    return jsonResponse({
      success: true,
      message:
        "Article deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE BLOG UNEXPECTED ERROR:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      500
    );
  }
}

