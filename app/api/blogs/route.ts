import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const BLOG_TABLE = "blogs";
const BLOG_BUCKET = "blog-images";

const CATEGORIES = [
  "AI",
  "Tech",
  "How-To",
  "Apps",
  "Security",
  "Explained",
];

/* =========================================================
   HELPERS
========================================================= */

function cleanString(
  value: FormDataEntryValue | null
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parseJSON<T>(
  value: FormDataEntryValue | null,
  fallback: T
): T {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    console.error("JSON FIELD PARSE ERROR:", error);
    return fallback;
  }
}

function parseBoolean(
  value: FormDataEntryValue | null,
  fallback = false
): boolean {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function createSafeFileName(
  fileName: string
): string {
  const extension = fileName.includes(".")
    ? fileName.substring(fileName.lastIndexOf("."))
    : "";

  return `${crypto.randomUUID()}${extension.toLowerCase()}`;
}

function normalizeTags(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (tag): tag is string =>
        typeof tag === "string"
    )
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeBlocks(
  value: unknown
): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeFaqs(
  value: unknown
): unknown[] {
  return Array.isArray(value) ? value : [];
}

/* =========================================================
   GET BLOGS / ADMIN STATS
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const category =
      searchParams.get("category")?.trim() || "";

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      searchParams.get("status")?.trim().toLowerCase() ||
      "all";

    const stats =
      searchParams.get("stats") === "true";

    const admin =
      searchParams.get("admin") === "true";

    const pageParam =
      searchParams.get("page") || "1";

    const limitParam =
      searchParams.get("limit") || "20";

    const page = Math.max(
      1,
      Number.parseInt(pageParam, 10) || 1
    );

    const requestedLimit =
      Number.parseInt(limitParam, 10) || 20;

    const limit = Math.min(
      100,
      Math.max(1, requestedLimit)
    );

    /* =====================================================
       ADMIN DASHBOARD STATS
    ===================================================== */

    if (admin && stats) {
      const [
        totalResult,
        publishedResult,
        draftResult,
        categoryResults,
      ] = await Promise.all([
        supabaseAdmin
          .from(BLOG_TABLE)
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabaseAdmin
          .from(BLOG_TABLE)
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("published", true),

        supabaseAdmin
          .from(BLOG_TABLE)
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("published", false),

        Promise.all(
          CATEGORIES.map(async (categoryName) => {
            const { count, error } =
              await supabaseAdmin
                .from(BLOG_TABLE)
                .select("id", {
                  count: "exact",
                  head: true,
                })
                .ilike(
                  "category",
                  categoryName
                );

            return {
              category: categoryName,
              count: error ? 0 : count || 0,
            };
          })
        ),
      ]);

      if (
        totalResult.error ||
        publishedResult.error ||
        draftResult.error
      ) {
        console.error(
          "ADMIN STATS ERROR:",
          totalResult.error ||
            publishedResult.error ||
            draftResult.error
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Failed to load dashboard statistics.",
          },
          { status: 500 }
        );
      }

      const categoryCounts =
        categoryResults.reduce(
          (
            accumulator,
            item
          ) => {
            accumulator[
              item.category
            ] = item.count;

            return accumulator;
          },
          {} as Record<string, number>
        );

      return NextResponse.json(
        {
          success: true,
          stats: {
            total: totalResult.count || 0,
            published:
              publishedResult.count || 0,
            drafts:
              draftResult.count || 0,
            categories:
              categoryCounts,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        }
      );
    }

    /* =====================================================
       NORMAL BLOG QUERY
    ===================================================== */

    const from =
      (page - 1) * limit;

    const to =
      from + limit - 1;

    let query = supabaseAdmin
      .from(BLOG_TABLE)
      .select(
        `
          id,
          title,
          slug,
          excerpt,
          introduction,
          cover_image,
          category,
          author,
          tags,
          content_blocks,
          faqs,
          published,
          featured,
          views,
          meta_title,
          meta_description,
          published_at,
          created_at,
          updated_at
        `,
        {
          count: "exact",
        }
      );

    /* =====================================================
       PUBLIC
    ===================================================== */

    if (!admin) {
      query = query.eq(
        "published",
        true
      );
    }

    /* =====================================================
       ADMIN STATUS FILTER
    ===================================================== */

    if (admin) {
      if (status === "published") {
        query = query.eq(
          "published",
          true
        );
      }

      if (
        status === "draft" ||
        status === "drafts"
      ) {
        query = query.eq(
          "published",
          false
        );
      }
    }

    /* =====================================================
       CATEGORY
    ===================================================== */

    if (category) {
      query = query.ilike(
        "category",
        category
      );
    }

    /* =====================================================
       SEARCH
    ===================================================== */

    if (search) {
      const safeSearch =
        search.replace(
          /[%_,]/g,
          " "
        );

      query = query.or(
        `title.ilike.%${safeSearch}%,excerpt.ilike.%${safeSearch}%`
      );
    }

    /* =====================================================
       ORDER
    ===================================================== */

    query = query.order(
      "created_at",
      {
        ascending: false,
      }
    );

    /* =====================================================
       PAGINATION
    ===================================================== */

    query = query.range(
      from,
      to
    );

    const {
      data: blogs,
      error,
      count,
    } = await query;

    if (error) {
      console.error(
        "GET BLOGS SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            error.message ||
            "Failed to load blogs.",
          blogs: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        blogs: blogs || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil(
          (count || 0) / limit
        ),
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET BLOGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load blogs.",
        blogs: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: NextRequest
) {
  let uploadedStoragePath: string | null =
    null;

  try {
    const contentType =
      request.headers.get(
        "content-type"
      ) || "";

    /* =====================================================
       FORM DATA
    ===================================================== */

    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {
      const formData =
        await request.formData();

      const title =
        cleanString(
          formData.get("title")
        );

      const slug =
        cleanString(
          formData.get("slug")
        );

      const excerpt =
        cleanString(
          formData.get("excerpt")
        );

      const introduction =
        cleanString(
          formData.get(
            "introduction"
          )
        );

      const category =
        cleanString(
          formData.get("category")
        );

      const author =
        cleanString(
          formData.get("author")
        ) || "Dhanush Varma";

      const tags =
        normalizeTags(
          parseJSON<unknown>(
            formData.get("tags"),
            []
          )
        );

      const contentBlocks =
        normalizeBlocks(
          parseJSON<unknown>(
            formData.get(
              "content_blocks"
            ),
            []
          )
        );

      const faqs =
        normalizeFaqs(
          parseJSON<unknown>(
            formData.get("faqs"),
            []
          )
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

      const metaTitle =
        cleanString(
          formData.get(
            "meta_title"
          )
        ) || title;

      const metaDescription =
        cleanString(
          formData.get(
            "meta_description"
          )
        ) || excerpt;

      const submittedPublishedAt =
        cleanString(
          formData.get(
            "published_at"
          )
        );

      if (!title) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Blog title is required.",
          },
          { status: 400 }
        );
      }

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Blog slug is required.",
          },
          { status: 400 }
        );
      }

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Blog category is required.",
          },
          { status: 400 }
        );
      }

      if (!excerpt) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Blog excerpt is required.",
          },
          { status: 400 }
        );
      }

      const {
        data: existingBlog,
        error: slugError,
      } =
        await supabaseAdmin
          .from(BLOG_TABLE)
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

      if (slugError) {
        return NextResponse.json(
          {
            success: false,
            error:
              slugError.message ||
              "Failed to check blog slug.",
          },
          { status: 500 }
        );
      }

      if (existingBlog) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A blog with this slug already exists.",
          },
          { status: 409 }
        );
      }

      /* ===================================================
         COVER IMAGE
      =================================================== */

      let coverImageUrl:
        | string
        | null = null;

      const coverImage =
        formData.get(
          "cover_image"
        );

      if (
        coverImage instanceof File &&
        coverImage.size > 0
      ) {
        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/webp",
        ];

        if (
          !allowedTypes.includes(
            coverImage.type
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Cover image must be PNG, JPG, JPEG, or WEBP.",
            },
            { status: 400 }
          );
        }

        const maxSize =
          5 * 1024 * 1024;

        if (
          coverImage.size > maxSize
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Cover image must be smaller than 5MB.",
            },
            { status: 400 }
          );
        }

        const fileName =
          createSafeFileName(
            coverImage.name
          );

        uploadedStoragePath =
          `covers/${fileName}`;

        const arrayBuffer =
          await coverImage.arrayBuffer();

        const fileBuffer =
          Buffer.from(
            arrayBuffer
          );

        const {
          error: uploadError,
        } =
          await supabaseAdmin.storage
            .from(BLOG_BUCKET)
            .upload(
              uploadedStoragePath,
              fileBuffer,
              {
                contentType:
                  coverImage.type,
                cacheControl:
                  "3600",
                upsert: false,
              }
            );

        if (uploadError) {
          uploadedStoragePath =
            null;

          return NextResponse.json(
            {
              success: false,
              error:
                uploadError.message ||
                "Failed to upload cover image.",
            },
            { status: 500 }
          );
        }

        const {
          data: publicUrlData,
        } =
          supabaseAdmin.storage
            .from(BLOG_BUCKET)
            .getPublicUrl(
              uploadedStoragePath
            );

        coverImageUrl =
          publicUrlData.publicUrl;
      }

      const blogData: Record<
        string,
        unknown
      > = {
        title,
        slug,
        excerpt,
        introduction,
        cover_image:
          coverImageUrl,
        category,
        author,
        tags,
        published,
        featured,
        views: 0,
        content_blocks:
          contentBlocks,
        faqs,
        meta_title:
          metaTitle,
        meta_description:
          metaDescription,
        published_at:
          published
            ? submittedPublishedAt ||
              new Date().toISOString()
            : null,
      };

      const {
        data: blog,
        error: insertError,
      } =
        await supabaseAdmin
          .from(BLOG_TABLE)
          .insert(blogData)
          .select()
          .single();

      if (insertError) {
        if (
          uploadedStoragePath
        ) {
          await supabaseAdmin.storage
            .from(BLOG_BUCKET)
            .remove([
              uploadedStoragePath,
            ]);
        }

        return NextResponse.json(
          {
            success: false,
            error:
              insertError.message ||
              "Failed to save blog.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: published
            ? "Article published successfully."
            : "Article saved as draft.",
          blog,
        },
        { status: 201 }
      );
    }

    /* =====================================================
       JSON
    ===================================================== */

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const body =
        await request.json();

      const title =
        typeof body.title === "string"
          ? body.title.trim()
          : "";

      const slug =
        typeof body.slug === "string"
          ? body.slug.trim()
          : "";

      const excerpt =
        typeof body.excerpt === "string"
          ? body.excerpt.trim()
          : "";

      const introduction =
        typeof body.introduction ===
        "string"
          ? body.introduction.trim()
          : "";

      const category =
        typeof body.category === "string"
          ? body.category.trim()
          : "";

      const author =
        typeof body.author === "string" &&
        body.author.trim()
          ? body.author.trim()
          : "Dhanush Varma";

      const tags =
        normalizeTags(
          body.tags
        );

      const contentBlocks =
        normalizeBlocks(
          body.content_blocks
        );

      const faqs =
        normalizeFaqs(
          body.faqs
        );

      const published =
        body.published === true;

      const featured =
        body.featured === true;

      const metaTitle =
        typeof body.meta_title ===
          "string" &&
        body.meta_title.trim()
          ? body.meta_title.trim()
          : title;

      const metaDescription =
        typeof body.meta_description ===
          "string" &&
        body.meta_description.trim()
          ? body.meta_description.trim()
          : excerpt;

      if (!title) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Blog title is required.",
          },
          { status: 400 }
        );
      }

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Blog slug is required.",
          },
          { status: 400 }
        );
      }

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Blog category is required.",
          },
          { status: 400 }
        );
      }

      if (!excerpt) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Blog excerpt is required.",
          },
          { status: 400 }
        );
      }

      const {
        data: existingBlog,
        error: slugError,
      } =
        await supabaseAdmin
          .from(BLOG_TABLE)
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

      if (slugError) {
        return NextResponse.json(
          {
            success: false,
            error:
              slugError.message,
          },
          { status: 500 }
        );
      }

      if (existingBlog) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A blog with this slug already exists.",
          },
          { status: 409 }
        );
      }

      const blogData: Record<
        string,
        unknown
      > = {
        title,
        slug,
        excerpt,
        introduction,
        cover_image:
          typeof body.cover_image ===
          "string"
            ? body.cover_image
            : null,
        category,
        author,
        tags,
        published,
        featured,
        views: 0,
        content_blocks:
          contentBlocks,
        faqs,
        meta_title:
          metaTitle,
        meta_description:
          metaDescription,
        published_at:
          published
            ? new Date().toISOString()
            : null,
      };

      const {
        data: blog,
        error: insertError,
      } =
        await supabaseAdmin
          .from(BLOG_TABLE)
          .insert(blogData)
          .select()
          .single();

      if (insertError) {
        return NextResponse.json(
          {
            success: false,
            error:
              insertError.message ||
              "Failed to save blog.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: published
            ? "Article published successfully."
            : "Article saved as draft.",
          blog,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Unsupported request content type.",
      },
      { status: 415 }
    );
  } catch (error) {
    console.error(
      "BLOG POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save blog.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PATCH
   Publish / Unpublish Article
========================================================= */

export async function PATCH(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const id =
      typeof body.id === "number"
        ? body.id
        : typeof body.id === "string"
          ? Number(body.id)
          : NaN;

    if (!Number.isFinite(id)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valid article ID is required.",
        },
        { status: 400 }
      );
    }

    const published =
      body.published === true;

    const updateData: Record<
      string,
      unknown
    > = {
      published,
      updated_at:
        new Date().toISOString(),
    };

    /*
     * When publishing:
     * - Set published_at now if it does not exist.
     *
     * When turning back into draft:
     * - Clear published_at.
     */

    if (published) {
      updateData.published_at =
        new Date().toISOString();
    } else {
      updateData.published_at = null;
    }

    const {
      data: blog,
      error,
    } = await supabaseAdmin
      .from(BLOG_TABLE)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "PUBLISH UPDATE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            error.message ||
            "Failed to update article.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: published
          ? "Article published successfully."
          : "Article moved to drafts.",
        blog,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "PATCH BLOG ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update article.",
      },
      { status: 500 }
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

    const idParam =
      searchParams.get("id");

    const id =
      idParam
        ? Number(idParam)
        : NaN;

    if (!Number.isFinite(id)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valid article ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Get cover image first so we can
     * remove it from Supabase Storage.
     */

    const {
      data: blog,
      error: fetchError,
    } =
      await supabaseAdmin
        .from(BLOG_TABLE)
        .select(
          "id, cover_image"
        )
        .eq("id", id)
        .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          error:
            fetchError.message ||
            "Failed to find article.",
        },
        { status: 500 }
      );
    }

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Article not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Delete database record.
     */

    const {
      error: deleteError,
    } =
      await supabaseAdmin
        .from(BLOG_TABLE)
        .delete()
        .eq("id", id);

    if (deleteError) {
      console.error(
        "DELETE BLOG ERROR:",
        deleteError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            deleteError.message ||
            "Failed to delete article.",
        },
        { status: 500 }
      );
    }

    /*
     * Best-effort cover image cleanup.
     */

    if (
      typeof blog.cover_image ===
      "string" &&
      blog.cover_image
    ) {
      try {
        const marker =
          `/object/public/${BLOG_BUCKET}/`;

        const markerIndex =
          blog.cover_image.indexOf(
            marker
          );

        if (markerIndex !== -1) {
          const storagePath =
            decodeURIComponent(
              blog.cover_image.substring(
                markerIndex +
                  marker.length
              )
            );

          if (storagePath) {
            await supabaseAdmin.storage
              .from(BLOG_BUCKET)
              .remove([
                storagePath,
              ]);
          }
        }
      } catch (storageError) {
        console.error(
          "COVER IMAGE CLEANUP ERROR:",
          storageError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Article deleted successfully.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "DELETE BLOG ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete article.",
      },
      { status: 500 }
    );
  }
}