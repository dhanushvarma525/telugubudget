import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* =========================================================
   SUPABASE
========================================================= */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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

/* =========================================================
   PARAMS
========================================================= */

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

/* =========================================================
   FIND BLOG
   Supports BOTH:
   /api/blogs/1
   /api/blogs/my-article-slug
========================================================= */

async function findBlog(identifier: string) {
  const value = decodeURIComponent(
    identifier || ""
  ).trim();

  if (!value) {
    return {
      blog: null,
      error: null,
    };
  }

  /* =====================================================
     FIRST TRY ID
  ===================================================== */

  if (/^\d+$/.test(value)) {
    const {
      data: blogById,
      error: idError,
    } = await supabaseAdmin
      .from("blogs")
      .select("*")
      .eq("id", Number(value))
      .maybeSingle();

    if (idError) {
      return {
        blog: null,
        error: idError,
      };
    }

    if (blogById) {
      return {
        blog: blogById,
        error: null,
      };
    }
  }

  /* =====================================================
     THEN TRY SLUG
  ===================================================== */

  const {
    data: blogBySlug,
    error: slugError,
  } = await supabaseAdmin
    .from("blogs")
    .select("*")
    .eq("slug", value)
    .maybeSingle();

  if (slugError) {
    return {
      blog: null,
      error: slugError,
    };
  }

  return {
    blog: blogBySlug,
    error: null,
  };
}

/* =========================================================
   GET BLOG
========================================================= */

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;

    const identifier = decodeURIComponent(
      params.slug || ""
    ).trim();

    console.log(
      "GET BLOG IDENTIFIER:",
      identifier
    );

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog ID or slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      blog,
      error,
    } = await findBlog(identifier);

    if (error) {
      console.error(
        "GET BLOG DATABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to load blog.",
          error:
            error.message,
          details:
            error.details,
          hint:
            error.hint,
          code:
            error.code,
        },
        {
          status: 500,
        }
      );
    }

    if (!blog) {
      console.error(
        "BLOG NOT FOUND:",
        identifier
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Blog not found.",
          identifier,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      blog,
    });
  } catch (error: any) {
    console.error(
      "GET BLOG SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to load blog.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   UPDATE BLOG
========================================================= */

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;

    const identifier = decodeURIComponent(
      params.slug || ""
    ).trim();

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog ID or slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog title is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       FIND EXISTING BLOG
    ===================================================== */

    const {
      blog: existingBlog,
      error: findError,
    } = await findBlog(identifier);

    if (findError) {
      console.error(
        "FIND BLOG ERROR:",
        findError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to find existing blog.",
          error:
            findError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!existingBlog) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       SLUG
    ===================================================== */

    const generatedSlug =
      body.title
        .trim()
        .toLowerCase()
        .replace(
          /[^a-z0-9\s-]/g,
          ""
        )
        .replace(
          /\s+/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        );

    const finalSlug =
      body.slug?.trim() ||
      generatedSlug;

    /* =====================================================
       CHECK DUPLICATE SLUG
    ===================================================== */

    const {
      data: duplicateBlog,
      error: duplicateError,
    } = await supabaseAdmin
      .from("blogs")
      .select("id")
      .eq("slug", finalSlug)
      .neq(
        "id",
        existingBlog.id
      )
      .maybeSingle();

    if (duplicateError) {
      console.error(
        "DUPLICATE SLUG ERROR:",
        duplicateError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to check slug.",
          error:
            duplicateError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (duplicateBlog) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another blog already uses this slug.",
        },
        {
          status: 409,
        }
      );
    }

    /* =====================================================
       TAGS
    ===================================================== */

    const tags =
      Array.isArray(body.tags)
        ? body.tags
            .map(
              (tag: unknown) =>
                String(tag).trim()
            )
            .filter(Boolean)
        : [];

    /* =====================================================
       CONTENT BLOCKS
    ===================================================== */

    const contentBlocks =
      Array.isArray(
        body.content_blocks
      )
        ? body.content_blocks
        : [];

    /* =====================================================
       UPDATE DATA
    ===================================================== */

    const updateData: Record<
      string,
      unknown
    > = {
      title:
        body.title.trim(),

      slug:
        finalSlug,

      excerpt:
        body.excerpt?.trim() ||
        "",

      content:
        body.content || "",

      cover_image:
        body.cover_image || "",

      category:
        body.category?.trim() ||
        "",

      author:
        body.author?.trim() ||
        "AnantaGo",

      tags,

      published:
        body.published === true,

      featured:
        body.featured === true,

      content_blocks:
        contentBlocks,

      updated_at:
        new Date().toISOString(),
    };

    /* =====================================================
       PUBLISHED AT
    ===================================================== */

    if (
      body.published === true
    ) {
      updateData.published_at =
        new Date().toISOString();
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("blogs")
      .update(updateData)
      .eq(
        "id",
        existingBlog.id
      )
      .select("*")
      .single();

    if (error) {
      console.error(
        "UPDATE BLOG DATABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Failed to update blog.",
          details:
            error.details,
          hint:
            error.hint,
          code:
            error.code,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Blog updated successfully.",
      blog: data,
    });
  } catch (error: any) {
    console.error(
      "UPDATE BLOG SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to update blog.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE BLOG
========================================================= */

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;

    const identifier =
      decodeURIComponent(
        params.slug || ""
      ).trim();

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog ID or slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       FIND BLOG
    ===================================================== */

    const {
      blog,
      error: findError,
    } = await findBlog(
      identifier
    );

    if (findError) {
      console.error(
        "DELETE FIND ERROR:",
        findError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to find blog.",
          error:
            findError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       DELETE
    ===================================================== */

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from("blogs")
      .delete()
      .eq(
        "id",
        blog.id
      );

    if (deleteError) {
      console.error(
        "DELETE BLOG ERROR:",
        deleteError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            deleteError.message ||
            "Failed to delete blog.",
          details:
            deleteError.details,
          hint:
            deleteError.hint,
          code:
            deleteError.code,
        },
        {
          status: 500
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Blog deleted successfully.",
      deletedBlog: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
      },
    });
  } catch (error: any) {
    console.error(
      "DELETE BLOG SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to delete blog.",
      },
      {
        status: 500,
      }
    );
  }
}