
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables."
  );
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
    console.error(
      "JSON FIELD PARSE ERROR:",
      error
    );

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
    ? fileName.substring(
        fileName.lastIndexOf(".")
      )
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
   GET BLOGS
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const category =
      searchParams.get("category")?.trim() ||
      "";

    const search =
      searchParams.get("search")?.trim() ||
      "";

    const pageParam =
      searchParams.get("page") || "1";

    const limitParam =
      searchParams.get("limit") || "10";

    const admin =
      searchParams.get("admin") === "true";

    const page = Math.max(
      1,
      Number.parseInt(pageParam, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(limitParam, 10) || 10
      )
    );

    const from =
      (page - 1) * limit;

    const to =
      from + limit - 1;

    console.log(
      "GET BLOGS:",
      {
        category,
        search,
        page,
        limit,
        admin,
      }
    );

    /*
     * =====================================================
     * SELECT
     *
     * IMPORTANT:
     * Do NOT select "content".
     * Your current schema uses "introduction".
     * =====================================================
     */

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

    /*
     * =====================================================
     * PUBLIC VS ADMIN
     * =====================================================
     *
     * Public pages:
     *   only published articles
     *
     * Admin:
     *   published + drafts
     */

    if (!admin) {
      query = query.eq(
        "published",
        true
      );
    }

    /*
     * =====================================================
     * CATEGORY FILTER
     * =====================================================
     *
     * IMPORTANT:
     * Use ilike() instead of eq() so category matching
     * is case-insensitive.
     *
     * This allows:
     *
     *   Security
     *   security
     *   SECURITY
     *   SeCuRiTy
     *
     * to all match the same database category.
     *
     * This fixes existing articles without requiring
     * you to manually edit their category values.
     */

    if (category) {
      query = query.ilike(
        "category",
        category
      );
    }

    /*
     * =====================================================
     * SEARCH
     * =====================================================
     */

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

    /*
     * =====================================================
     * ORDER
     * =====================================================
     */

    query = query.order(
      "published_at",
      {
        ascending: false,
        nullsFirst: false,
      }
    );

    /*
     * =====================================================
     * PAGINATION
     * =====================================================
     */

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
        },
        { status: 500 }
      );
    }

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

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

    console.log(
      "BLOG POST CONTENT TYPE:",
      contentType
    );

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

      /* ---------------------------------------------------
         BASIC FIELDS
      --------------------------------------------------- */

      const title = cleanString(
        formData.get("title")
      );

      const slug = cleanString(
        formData.get("slug")
      );

      const excerpt = cleanString(
        formData.get("excerpt")
      );

      const introduction =
        cleanString(
          formData.get(
            "introduction"
          )
        );

      const category = cleanString(
        formData.get("category")
      );

      const author =
        cleanString(
          formData.get("author")
        ) || "AnantaGo";

      /* ---------------------------------------------------
         JSON FIELDS
      --------------------------------------------------- */

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

      /* ---------------------------------------------------
         OTHER FIELDS
      --------------------------------------------------- */

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

      /* ---------------------------------------------------
         VALIDATION
      --------------------------------------------------- */

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

      /* ---------------------------------------------------
         CHECK SLUG
      --------------------------------------------------- */

      const {
        data: existingBlog,
        error: slugError,
      } = await supabaseAdmin
        .from(BLOG_TABLE)
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (slugError) {
        console.error(
          "SLUG CHECK ERROR:",
          slugError
        );

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

      /* ---------------------------------------------------
         COVER IMAGE
      --------------------------------------------------- */

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
          console.error(
            "COVER IMAGE UPLOAD ERROR:",
            uploadError
          );

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

      /* ---------------------------------------------------
         DATABASE RECORD

         IMPORTANT:
         There is NO "content" column.
      --------------------------------------------------- */

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

        published_at: published
          ? submittedPublishedAt ||
            new Date().toISOString()
          : null,
      };

      console.log(
        "CREATING BLOG:",
        {
          title,
          slug,
          category,
          author,
          published,
          featured,
          tags: tags.length,
          blocks:
            contentBlocks.length,
          faqs: faqs.length,
          hasIntroduction:
            Boolean(
              introduction
            ),
          hasCover:
            Boolean(
              coverImageUrl
            ),
        }
      );

      /* ---------------------------------------------------
         INSERT
      --------------------------------------------------- */

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
        console.error(
          "BLOG INSERT ERROR:",
          insertError
        );

        if (
          uploadedStoragePath
        ) {
          try {
            const {
              error:
                deleteError,
            } =
              await supabaseAdmin.storage
                .from(
                  BLOG_BUCKET
                )
                .remove([
                  uploadedStoragePath,
                ]);

            if (
              deleteError
            ) {
              console.error(
                "UPLOADED IMAGE CLEANUP ERROR:",
                deleteError
              );
            }
          } catch (
            cleanupError
          ) {
            console.error(
              "IMAGE CLEANUP ERROR:",
              cleanupError
            );
          }
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
       JSON REQUEST
    ===================================================== */

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const body =
        await request.json();

      const title =
        typeof body.title ===
        "string"
          ? body.title.trim()
          : "";

      const slug =
        typeof body.slug ===
        "string"
          ? body.slug.trim()
          : "";

      const excerpt =
        typeof body.excerpt ===
        "string"
          ? body.excerpt.trim()
          : "";

      const introduction =
        typeof body.introduction ===
        "string"
          ? body.introduction.trim()
          : "";

      const category =
        typeof body.category ===
        "string"
          ? body.category.trim()
          : "";

      const author =
        typeof body.author ===
          "string" &&
        body.author.trim()
          ? body.author.trim()
          : "AnantaGo";

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
      } = await supabaseAdmin
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

        published_at: published
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
        console.error(
          "JSON BLOG INSERT ERROR:",
          insertError
        );

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
