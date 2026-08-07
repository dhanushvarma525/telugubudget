
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  try {
    const { slug } = await params;

    // =====================================================
    // VALIDATE SLUG
    // =====================================================

    if (
      !slug ||
      typeof slug !== "string"
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid blog slug",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "VIEW BLOG SLUG:",
      slug
    );

    // =====================================================
    // ATOMICALLY INCREMENT BLOG VIEWS
    // =====================================================

    const { data, error } =
      await supabase.rpc(
        "increment_blog_views",
        {
          blog_slug: slug,
        }
      );

    console.log(
      "BLOG VIEW UPDATE RESULT:",
      data
    );

    console.log(
      "BLOG VIEW UPDATE ERROR:",
      error
    );

    // =====================================================
    // HANDLE ERROR
    // =====================================================

    if (error) {
      throw error;
    }

    // =====================================================
    // BLOG NOT FOUND
    // =====================================================

    if (
      !data ||
      data.length === 0
    ) {
      return Response.json(
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
    // NEW VIEW COUNT
    // =====================================================

    const newViews =
      data[0].views;

    return Response.json({
      success: true,
      views: newViews,
    });

  } catch (error: any) {
    console.error(
      "BLOG VIEW TRACKING ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to update blog views",
      },
      {
        status: 500,
      }
    );
  }
}

