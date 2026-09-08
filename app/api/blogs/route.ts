import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  category: string;
  author: string | null;
  tags: unknown;
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

function jsonResponse(
  data: unknown,
  status = 200,
  headers?: HeadersInit
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function parseBoolean(
  value: unknown,
  fallback = false
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();

    if (
      normalized === "true" ||
      normalized === "1"
    ) {
      return true;
    }

    if (
      normalized === "false" ||
      normalized === "0"
    ) {
      return false;
    }
  }

  return fallback;
}

function parseJsonValue<T>(
  value: unknown,
  fallback: T
): T {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value !== "string") {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidCategory(
  value: string
): value is BlogCategory {
  return CATEGORIES.includes(
    value as BlogCategory
  );
}

function getFileExtension(
  filename: string
): string {
  const parts = filename.split(".");

  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }

  return "jpg";
}

function getStoragePathFromPublicUrl(
  publicUrl: string | null | undefined
): string | null {
  if (!publicUrl) {
    return null;
  }

  try {
    const marker =
      "/storage/v1/object/public/";

    const index =
      publicUrl.indexOf(marker);

    if (index === -1) {
      return null;
    }

    const afterMarker =
      publicUrl.slice(
        index + marker.length
      );

    const firstSlash =
      afterMarker.indexOf("/");

    if (firstSlash === -1) {
      return null;
    }

    return afterMarker.slice(
      firstSlash + 1
    );
  } catch {
    return null;
  }
}

async function deleteCoverImage(
  coverImage: string | null | undefined
) {
  if (!coverImage) {
    return;
  }

  const storagePath =
    getStoragePathFromPublicUrl(
      coverImage
    );

  if (!storagePath) {
    return;
  }

  try {
    const { error } =
      await supabase.storage
        .from("blog-images")
        .remove([storagePath]);

    if (error) {
      console.error(
        "Failed to delete cover image:",
        error
      );
    }
  } catch (error) {
    console.error(
      "Failed to delete old cover image:",
      error
    );
  }
}

async function uploadCoverImage(
  file: File
): Promise<string> {
  const extension =
    getFileExtension(file.name);

  const filename =
    `cover-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${extension}`;

  const filePath =
    `blogs/${filename}`;

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  const { error } =
    await supabase.storage
      .from("blog-images")
      .upload(
        filePath,
        buffer,
        {
          contentType:
            file.type ||
            "image/jpeg",
          upsert: false,
        }
      );

  if (error) {
    console.error(
      "Cover image upload error:",
      error
    );

    throw new Error(
      "Failed to upload cover image."
    );
  }

  const { data } =
    supabase.storage
      .from("blog-images")
      .getPublicUrl(
        filePath
      );

  return data.publicUrl;
}

/* =========================================================
   GET
   ========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const slug =
      searchParams.get("slug");

    const id =
      searchParams.get("id");

    const admin =
      searchParams.get("admin") === "true";

    const pageParam =
      searchParams.get("page");

    const limitParam =
      searchParams.get("limit");

    /* -------------------------------------------------------
       SINGLE ARTICLE
       ------------------------------------------------------- */

    if (slug || id) {
      let query =
        supabase
          .from("blogs")
          .select("*");

      if (id) {
        const numericId =
          Number(id);

        if (
          !Number.isFinite(
            numericId
          )
        ) {
          return jsonResponse(
            {
              success: false,
              error:
                "Invalid article ID.",
            },
            400
          );
        }

        query =
          query.eq(
            "id",
            numericId
          );
      } else if (slug) {
        const trimmedSlug =
          slug.trim();

        if (
          /^\d+$/.test(
            trimmedSlug
          )
        ) {
          query =
            query.eq(
              "id",
              Number(trimmedSlug)
            );
        } else {
          query =
            query.eq(
              "slug",
              trimmedSlug
            );
        }
      }

      const {
        data,
        error,
      } = await query
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1);

      if (error) {
        console.error(
          "GET single blog error:",
          error
        );

        return jsonResponse(
          {
            success: false,
            error:
              error.message,
          },
          500
        );
      }

      if (
        !data ||
        data.length === 0
      ) {
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
        blog: data[0],
      });
    }

    /* -------------------------------------------------------
       ARTICLE LIST
       ------------------------------------------------------- */

    const parsedPage =
      Number(pageParam || "1");

    const parsedLimit =
      Number(limitParam || "20");

    const page =
      Number.isFinite(
        parsedPage
      )
        ? Math.max(
            1,
            Math.floor(parsedPage)
          )
        : 1;

    const limit =
      Number.isFinite(
        parsedLimit
      )
        ? Math.min(
            1000,
            Math.max(
              1,
              Math.floor(parsedLimit)
            )
          )
        : 20;

    const from =
      (page - 1) * limit;

    const to =
      from + limit - 1;

    let query =
      supabase
        .from("blogs")
        .select("*", {
          count: "exact",
        })
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

    if (!admin) {
      query =
        query.eq(
          "published",
          true
        );
    }

    const {
      data,
      error,
      count,
    } = await query;

    if (error) {
      console.error(
        "GET blogs error:",
        error
      );

      return jsonResponse(
        {
          success: false,
          error:
            error.message,
        },
        500
      );
    }

    const total =
      count || 0;

    return jsonResponse({
      success: true,
      blogs: data || [],
      data: data || [],
      total,
      page,
      limit,
      totalPages:
        Math.ceil(
          total / limit
        ),
    });
  } catch (error) {
    console.error(
      "GET /api/blogs unexpected error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load articles.",
      },
      500
    );
  }
}

/* =========================================================
   POST
   CREATE ARTICLE
   ========================================================= */

export async function POST(
  request: NextRequest
) {
  let uploadedCoverImage:
    string | null = null;

  try {
    const contentType =
      request.headers.get(
        "content-type"
      ) || "";

    let title = "";
    let slug = "";
    let excerpt = "";
    let introduction = "";
    let category = "";
    let author = "";
    let tags: string[] = [];
    let contentBlocks: unknown[] = [];
    let faqs: unknown[] = [];
    let published = false;
    let featured = false;
    let publishedAt:
      | string
      | null = null;
    let metaTitle = "";
    let metaDescription = "";
    let coverFile:
      | File
      | null = null;

    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {
      const formData =
        await request.formData();

      title =
        String(
          formData.get(
            "title"
          ) || ""
        ).trim();

      slug =
        normalizeSlug(
          String(
            formData.get(
              "slug"
            ) || ""
          )
        );

      excerpt =
        String(
          formData.get(
            "excerpt"
          ) || ""
        ).trim();

      introduction =
        String(
          formData.get(
            "introduction"
          ) || ""
        ).trim();

      category =
        String(
          formData.get(
            "category"
          ) || ""
        ).trim();

      author =
        String(
          formData.get(
            "author"
          ) || ""
        ).trim();

      tags =
        parseJsonValue<
          string[]
        >(
          formData.get(
            "tags"
          ),
          []
        );

      contentBlocks =
        parseJsonValue<
          unknown[]
        >(
          formData.get(
            "content_blocks"
          ),
          []
        );

      faqs =
        parseJsonValue<
          unknown[]
        >(
          formData.get(
            "faqs"
          ),
          []
        );

      published =
        parseBoolean(
          formData.get(
            "published"
          ),
          false
        );

      featured =
        parseBoolean(
          formData.get(
            "featured"
          ),
          false
        );

      const rawPublishedAt =
        String(
          formData.get(
            "published_at"
          ) || ""
        ).trim();

      publishedAt =
        rawPublishedAt ||
        null;

      metaTitle =
        String(
          formData.get(
            "meta_title"
          ) || ""
        ).trim();

      metaDescription =
        String(
          formData.get(
            "meta_description"
          ) || ""
        ).trim();

      const possibleFile =
        formData.get(
          "cover_image"
        );

      if (
        possibleFile instanceof File &&
        possibleFile.size > 0
      ) {
        coverFile =
          possibleFile;
      }
    } else {
      const body =
        await request.json();

      title =
        String(
          body.title || ""
        ).trim();

      slug =
        normalizeSlug(
          String(
            body.slug || ""
          )
        );

      excerpt =
        String(
          body.excerpt || ""
        ).trim();

      introduction =
        String(
          body.introduction || ""
        ).trim();

      category =
        String(
          body.category || ""
        ).trim();

      author =
        String(
          body.author || ""
        ).trim();

      tags =
        Array.isArray(
          body.tags
        )
          ? body.tags
          : [];

      contentBlocks =
        Array.isArray(
          body.content_blocks
        )
          ? body.content_blocks
          : [];

      faqs =
        Array.isArray(
          body.faqs
        )
          ? body.faqs
          : [];

      published =
        parseBoolean(
          body.published,
          false
        );

      featured =
        parseBoolean(
          body.featured,
          false
        );

      publishedAt =
        body.published_at ||
        null;

      metaTitle =
        String(
          body.meta_title ||
            ""
        ).trim();

      metaDescription =
        String(
          body.meta_description ||
            ""
        ).trim();
    }

    if (!title) {
      return jsonResponse(
        {
          success: false,
          error:
            "Title is required.",
        },
        400
      );
    }

    if (!slug) {
      return jsonResponse(
        {
          success: false,
          error:
            "Slug is required.",
        },
        400
      );
    }

    if (!category) {
      return jsonResponse(
        {
          success: false,
          error:
            "Category is required.",
        },
        400
      );
    }

    if (
      !isValidCategory(
        category
      )
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid category.",
        },
        400
      );
    }

    const {
      data: existingRows,
      error: duplicateError,
    } =
      await supabase
        .from("blogs")
        .select("id")
        .eq(
          "slug",
          slug
        )
        .limit(1);

    if (duplicateError) {
      console.error(
        "Duplicate slug check error:",
        duplicateError
      );

      return jsonResponse(
        {
          success: false,
          error:
            duplicateError.message,
        },
        500
      );
    }

    if (
      existingRows &&
      existingRows.length > 0
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "An article with this slug already exists.",
        },
        409
      );
    }

    if (coverFile) {
      uploadedCoverImage =
        await uploadCoverImage(
          coverFile
        );
    }

    const now =
      new Date().toISOString();

    const finalPublishedAt =
      published
        ? publishedAt ||
          now
        : null;

    const {
      data,
      error,
    } =
      await supabase
        .from("blogs")
        .insert({
          title,
          slug,
          excerpt:
            excerpt || null,
          introduction:
            introduction ||
            null,
          cover_image:
            uploadedCoverImage,
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
            finalPublishedAt,
          created_at: now,
          updated_at: now,
        })
        .select("*")
        .limit(1);

    if (error) {
      console.error(
        "POST insert error:",
        error
      );

      if (
        uploadedCoverImage
      ) {
        await deleteCoverImage(
          uploadedCoverImage
        );
      }

      return jsonResponse(
        {
          success: false,
          error:
            error.message,
        },
        500
      );
    }

    if (
      !data ||
      data.length === 0
    ) {
      if (
        uploadedCoverImage
      ) {
        await deleteCoverImage(
          uploadedCoverImage
        );
      }

      return jsonResponse(
        {
          success: false,
          error:
            "Article was not created.",
        },
        500
      );
    }

    return jsonResponse(
      {
        success: true,
        blog: data[0],
      },
      201
    );
  } catch (error) {
    console.error(
      "POST /api/blogs error:",
      error
    );

    if (
      uploadedCoverImage
    ) {
      await deleteCoverImage(
        uploadedCoverImage
      );
    }

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create article.",
      },
      500
    );
  }
}

/* =========================================================
   PUT
   UPDATE ARTICLE
   ========================================================= */

export async function PUT(
  request: NextRequest
) {
  let uploadedNewCover:
    | string
    | null = null;

  try {
    const contentType =
      request.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType.includes(
        "multipart/form-data"
      )
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Update requests must use multipart/form-data.",
        },
        400
      );
    }

    const formData =
      await request.formData();

    const idValue =
      String(
        formData.get(
          "id"
        ) || ""
      ).trim();

    const originalSlug =
      String(
        formData.get(
          "original_slug"
        ) || ""
      ).trim();

    const title =
      String(
        formData.get(
          "title"
        ) || ""
      ).trim();

    const slug =
      normalizeSlug(
        String(
          formData.get(
            "slug"
          ) || ""
        )
      );

    const excerpt =
      String(
        formData.get(
          "excerpt"
        ) || ""
      ).trim();

    const introduction =
      String(
        formData.get(
          "introduction"
        ) || ""
      ).trim();

    const category =
      String(
        formData.get(
          "category"
        ) || ""
      ).trim();

    const author =
      String(
        formData.get(
          "author"
        ) || ""
      ).trim();

    const tags =
      parseJsonValue<
        string[]
      >(
        formData.get(
          "tags"
        ),
        []
      );

    const contentBlocks =
      parseJsonValue<
        unknown[]
      >(
        formData.get(
          "content_blocks"
        ),
        []
      );

    const faqs =
      parseJsonValue<
        unknown[]
      >(
        formData.get(
          "faqs"
        ),
        []
      );

    const published =
      parseBoolean(
        formData.get(
          "published"
        ),
        false
      );

    const featured =
      parseBoolean(
        formData.get(
          "featured"
        ),
        false
      );

    const rawPublishedAt =
      String(
        formData.get(
          "published_at"
        ) || ""
      ).trim();

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

    const removeCoverImage =
      parseBoolean(
        formData.get(
          "remove_cover_image"
        ),
        false
      );

    const possibleCoverFile =
      formData.get(
        "cover_image"
      );

    const newCoverFile =
      possibleCoverFile instanceof
        File &&
      possibleCoverFile.size > 0
        ? possibleCoverFile
        : null;

    /* -------------------------------------------------------
       VALIDATION
       ------------------------------------------------------- */

    if (!idValue) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article ID is required.",
        },
        400
      );
    }

    const numericId =
      Number(idValue);

    if (
      !Number.isFinite(
        numericId
      )
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid article ID.",
        },
        400
      );
    }

    if (!title) {
      return jsonResponse(
        {
          success: false,
          error:
            "Title is required.",
        },
        400
      );
    }

    if (!slug) {
      return jsonResponse(
        {
          success: false,
          error:
            "Slug is required.",
        },
        400
      );
    }

    if (!category) {
      return jsonResponse(
        {
          success: false,
          error:
            "Category is required.",
        },
        400
      );
    }

    if (
      !isValidCategory(
        category
      )
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid category.",
        },
        400
      );
    }

    /* -------------------------------------------------------
       FIND EXISTING ARTICLE
       ------------------------------------------------------- */

    const {
      data: existingRows,
      error: existingError,
    } =
      await supabase
        .from("blogs")
        .select("*")
        .eq(
          "id",
          numericId
        )
        .limit(1);

    if (existingError) {
      console.error(
        "Find article by ID error:",
        existingError
      );

      return jsonResponse(
        {
          success: false,
          error:
            existingError.message,
        },
        500
      );
    }

    let existingBlog =
      (existingRows?.[0] as
        | BlogRow
        | undefined) ||
      null;

    /*
     * Fallback to original slug.
     *
     * This protects older edit URLs.
     */
    if (
      !existingBlog &&
      originalSlug
    ) {
      const {
        data: slugRows,
        error: slugError,
      } =
        await supabase
          .from("blogs")
          .select("*")
          .eq(
            "slug",
            originalSlug
          )
          .limit(1);

      if (slugError) {
        console.error(
          "Find article by original slug error:",
          slugError
        );

        return jsonResponse(
          {
            success: false,
            error:
              slugError.message,
          },
          500
        );
      }

      existingBlog =
        (slugRows?.[0] as
          | BlogRow
          | undefined) ||
        null;
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

    const existingId =
      Number(
        existingBlog.id
      );

    /* -------------------------------------------------------
       DUPLICATE SLUG CHECK
       ------------------------------------------------------- */

    if (
      slug !== existingBlog.slug
    ) {
      const {
        data: duplicateRows,
        error: duplicateError,
      } =
        await supabase
          .from("blogs")
          .select("id")
          .eq(
            "slug",
            slug
          )
          .neq(
            "id",
            existingId
          )
          .limit(1);

      if (duplicateError) {
        console.error(
          "Slug duplicate check error:",
          duplicateError
        );

        return jsonResponse(
          {
            success: false,
            error:
              duplicateError.message,
          },
          500
        );
      }

      if (
        duplicateRows &&
        duplicateRows.length > 0
      ) {
        return jsonResponse(
          {
            success: false,
            error:
              "Another article already uses this slug.",
          },
          409
        );
      }
    }

    /* -------------------------------------------------------
       COVER IMAGE
       ------------------------------------------------------- */

    let finalCoverImage =
      existingBlog.cover_image;

    if (newCoverFile) {
      uploadedNewCover =
        await uploadCoverImage(
          newCoverFile
        );

      finalCoverImage =
        uploadedNewCover;
    } else if (
      removeCoverImage
    ) {
      finalCoverImage =
        null;
    }

    /* -------------------------------------------------------
       PUBLICATION DATE
       ------------------------------------------------------- */

    let finalPublishedAt =
      existingBlog.published_at;

    if (published) {
      finalPublishedAt =
        existingBlog.published_at ||
        rawPublishedAt ||
        new Date().toISOString();
    } else {
      /*
       * Keep the existing date while
       * setting published=false.
       */
      finalPublishedAt =
        existingBlog.published_at;
    }

    /* -------------------------------------------------------
       UPDATE DATABASE
       ------------------------------------------------------- */

    const updatePayload = {
      title,
      slug,
      excerpt:
        excerpt || null,
      introduction:
        introduction || null,
      cover_image:
        finalCoverImage,
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
        metaDescription || null,
      published_at:
        finalPublishedAt,
      updated_at:
        new Date().toISOString(),
    };

    console.log(
      "[PUT /api/blogs] Updating article:",
      existingId
    );

    /*
     * IMPORTANT:
     *
     * Do NOT depend on UPDATE ... RETURNING
     * to provide the article.
     *
     * Some Supabase/RLS configurations can
     * successfully perform the update but return
     * an empty result from .select().
     *
     * Therefore:
     *
     * 1. UPDATE
     * 2. Check for error
     * 3. SELECT the updated article separately
     */
    const {
      error: updateError,
    } =
      await supabase
        .from("blogs")
        .update(
          updatePayload
        )
        .eq(
          "id",
          existingId
        );

    if (updateError) {
      console.error(
        "PUT update error:",
        updateError
      );

      if (
        uploadedNewCover
      ) {
        await deleteCoverImage(
          uploadedNewCover
        );
      }

      return jsonResponse(
        {
          success: false,
          error:
            updateError.message,
        },
        500
      );
    }

    /* -------------------------------------------------------
       FETCH UPDATED ARTICLE
       ------------------------------------------------------- */

    const {
      data: updatedRows,
      error: fetchUpdatedError,
    } =
      await supabase
        .from("blogs")
        .select("*")
        .eq(
          "id",
          existingId
        )
        .limit(1);

    if (fetchUpdatedError) {
      console.error(
        "Fetch updated article error:",
        fetchUpdatedError
      );

      /*
       * The database update already happened.
       * Do not delete the newly uploaded image
       * because the article now points to it.
       */
      return jsonResponse(
        {
          success: false,
          error:
            "Article was updated, but the updated article could not be loaded. " +
            fetchUpdatedError.message,
        },
        500
      );
    }

    if (
      !updatedRows ||
      updatedRows.length === 0
    ) {
      console.error(
        "Updated article could not be found after update:",
        existingId
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Article was updated, but it could not be retrieved afterward.",
        },
        500
      );
    }

    const updatedBlog =
      updatedRows[0] as BlogRow;

    /* -------------------------------------------------------
       DELETE OLD COVER IMAGE
       ------------------------------------------------------- */

    if (
      uploadedNewCover &&
      existingBlog.cover_image
    ) {
      await deleteCoverImage(
        existingBlog.cover_image
      );
    }

    if (
      removeCoverImage &&
      !uploadedNewCover &&
      existingBlog.cover_image
    ) {
      await deleteCoverImage(
        existingBlog.cover_image
      );
    }

    console.log(
      "[PUT /api/blogs] Article updated successfully:",
      updatedBlog.id
    );

    return jsonResponse({
      success: true,
      blog: updatedBlog,
    });
  } catch (error) {
    console.error(
      "PUT /api/blogs unexpected error:",
      error
    );

    /*
     * Only delete the newly uploaded image
     * when the request itself failed before
     * successful completion.
     */
    if (
      uploadedNewCover
    ) {
      await deleteCoverImage(
        uploadedNewCover
      );
    }

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update article.",
      },
      500
    );
  }
}

/* =========================================================
   PATCH
   PUBLISH / UNPUBLISH
   ========================================================= */

export async function PATCH(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const id =
      body.id;

    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article ID is required.",
        },
        400
      );
    }

    const numericId =
      Number(id);

    if (
      !Number.isFinite(
        numericId
      )
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid article ID.",
        },
        400
      );
    }

    const published =
      parseBoolean(
        body.published,
        false
      );

    /* -------------------------------------------------------
       FIND CURRENT ARTICLE
       ------------------------------------------------------- */

    const {
      data: existingRows,
      error: findError,
    } =
      await supabase
        .from("blogs")
        .select(
          "id,published,published_at"
        )
        .eq(
          "id",
          numericId
        )
        .limit(1);

    if (findError) {
      return jsonResponse(
        {
          success: false,
          error:
            findError.message,
        },
        500
      );
    }

    if (
      !existingRows ||
      existingRows.length === 0
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article not found.",
        },
        404
      );
    }

    const existing =
      existingRows[0];

    let publishedAt =
      existing.published_at;

    if (
      published &&
      !publishedAt
    ) {
      publishedAt =
        new Date().toISOString();
    }

    /* -------------------------------------------------------
       UPDATE
       ------------------------------------------------------- */

    const {
      error: updateError,
    } =
      await supabase
        .from("blogs")
        .update({
          published,
          published_at:
            publishedAt,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          numericId
        );

    if (updateError) {
      console.error(
        "PATCH publish error:",
        updateError
      );

      return jsonResponse(
        {
          success: false,
          error:
            updateError.message,
        },
        500
      );
    }

    /* -------------------------------------------------------
       FETCH UPDATED ARTICLE
       ------------------------------------------------------- */

    const {
      data: updatedRows,
      error: fetchError,
    } =
      await supabase
        .from("blogs")
        .select("*")
        .eq(
          "id",
          numericId
        )
        .limit(1);

    if (fetchError) {
      return jsonResponse(
        {
          success: false,
          error:
            fetchError.message,
        },
        500
      );
    }

    if (
      !updatedRows ||
      updatedRows.length === 0
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article was updated but could not be retrieved.",
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      blog: updatedRows[0],
    });
  } catch (error) {
    console.error(
      "PATCH /api/blogs error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update article.",
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
    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get(
        "id"
      );

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

    const numericId =
      Number(id);

    if (
      !Number.isFinite(
        numericId
      )
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Invalid article ID.",
        },
        400
      );
    }

    /* -------------------------------------------------------
       FIND ARTICLE
       ------------------------------------------------------- */

    const {
      data: rows,
      error: findError,
    } =
      await supabase
        .from("blogs")
        .select(
          "id,cover_image"
        )
        .eq(
          "id",
          numericId
        )
        .limit(1);

    if (findError) {
      return jsonResponse(
        {
          success: false,
          error:
            findError.message,
        },
        500
      );
    }

    if (
      !rows ||
      rows.length === 0
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Article not found.",
        },
        404
      );
    }

    const blog =
      rows[0];

    /* -------------------------------------------------------
       DELETE ARTICLE
       ------------------------------------------------------- */

    const {
      error: deleteError,
    } =
      await supabase
        .from("blogs")
        .delete()
        .eq(
          "id",
          numericId
        );

    if (deleteError) {
      console.error(
        "DELETE blog error:",
        deleteError
      );

      return jsonResponse(
        {
          success: false,
          error:
            deleteError.message,
        },
        500
      );
    }

    /* -------------------------------------------------------
       DELETE COVER IMAGE
       ------------------------------------------------------- */

    if (blog.cover_image) {
      await deleteCoverImage(
        blog.cover_image
      );
    }

    return jsonResponse({
      success: true,
      message:
        "Article deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/blogs error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete article.",
      },
      500
    );
  }
}