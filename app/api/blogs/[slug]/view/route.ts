import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await context.params;

    console.log("VIEW BLOG SLUG:", slug);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog slug is required",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // FIND BLOG
    // =====================================================

    const {
      data: blog,
      error: blogError,
    } = await supabase
      .from("blogs")
      .select("id, slug, views")
      .eq("slug", slug)
      .single();

    if (blogError) {
      console.error(
        "BLOG FIND ERROR:",
        blogError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Failed to find blog",
          error: blogError.message,
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
          message: "Blog not found",
        },
        {
          status: 404,
        }
      );
    }

    // =====================================================
    // CURRENT VIEWS
    // =====================================================

    const currentViews =
      Number(blog.views) || 0;

    const newViews =
      currentViews + 1;

    // =====================================================
    // UPDATE VIEWS
    // =====================================================

    const {
      data: updatedBlog,
      error: updateError,
    } = await supabase
      .from("blogs")
      .update({
        views: newViews,
      })
      .eq("id", blog.id)
      .select("id, slug, views")
      .single();

    console.log(
      "BLOG VIEW UPDATE RESULT:",
      updatedBlog
    );

    console.log(
      "BLOG VIEW UPDATE ERROR:",
      updateError
    );

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update blog views",
          error: updateError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!updatedBlog) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog view update returned no data",
        },
        {
          status: 500,
        }
      );
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json({
      success: true,
      views: Number(updatedBlog.views) || newViews,
    });
  } catch (error) {
    console.error(
      "BLOG VIEW TRACKING ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to track blog view",
      },
      {
        status: 500,
      }
    );
  }
}