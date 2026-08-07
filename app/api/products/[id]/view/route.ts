
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    // =====================================================
    // VALIDATE PRODUCT ID
    // =====================================================

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "VIEW PRODUCT ID:",
      productId
    );

    // =====================================================
    // ATOMICALLY INCREMENT VIEWS
    // =====================================================

    const { data, error } =
      await supabase.rpc(
        "increment_product_views",
        {
          product_id: productId,
        }
      );

    console.log(
      "VIEW UPDATE RESULT:",
      data
    );

    console.log(
      "VIEW UPDATE ERROR:",
      error
    );

    // =====================================================
    // HANDLE ERROR
    // =====================================================

    if (error) {
      throw error;
    }

    // =====================================================
    // PRODUCT NOT FOUND
    // =====================================================

    if (
      !data ||
      data.length === 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
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
      "VIEW TRACKING ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to update views",
      },
      {
        status: 500,
      }
    );
  }
}

