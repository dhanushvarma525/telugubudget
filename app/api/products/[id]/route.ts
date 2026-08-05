import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/* =========================================================
   TYPES
========================================================= */

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   HELPER
========================================================= */

async function getProductId(
  context: RouteContext
): Promise<number | null> {
  const { id } = await context.params;

  if (!id) {
    return null;
  }

  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  return productId;
}

/* =========================================================
   GET SINGLE PRODUCT
   GET /api/products/[id]
========================================================= */

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const productId = await getProductId(context);

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    console.log("GET PRODUCT:", productId);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error) {
      console.error("GET PRODUCT ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error: unknown) {
    console.error("GET SINGLE PRODUCT ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load product";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PUT / UPDATE PRODUCT
   PUT /api/products/[id]
========================================================= */

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const productId = await getProductId(context);

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    if (
      body.price === undefined ||
      body.price === null ||
      body.price === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product price is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof body.image !== "string" ||
      !body.image.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Main product image is required",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categories = Array.isArray(body.categories)
      ? body.categories.filter(
          (item: unknown): item is string =>
            typeof item === "string" &&
            item.trim() !== ""
        )
      : body.category
      ? [body.category]
      : [];

    if (categories.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one category is required",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       NUMBER HELPER
    ===================================================== */

    const numberOrNull = (
      value: unknown
    ): number | null => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number)
        ? number
        : null;
    };

    /* =====================================================
       STRING HELPER
    ===================================================== */

    const stringOrNull = (
      value: unknown
    ): string | null => {
      if (
        value === undefined ||
        value === null
      ) {
        return null;
      }

      const stringValue = String(value).trim();

      return stringValue || null;
    };

    /* =====================================================
       PROS
    ===================================================== */

    const pros = Array.isArray(body.pros)
      ? body.pros.filter(
          (item: unknown): item is string =>
            typeof item === "string" &&
            item.trim() !== ""
        )
      : [];

    /* =====================================================
       CONS
    ===================================================== */

    const cons = Array.isArray(body.cons)
      ? body.cons.filter(
          (item: unknown): item is string =>
            typeof item === "string" &&
            item.trim() !== ""
        )
      : [];

    /* =====================================================
       UPDATE DATA
    ===================================================== */

    const updateData = {
      /* BASIC */

      name: body.name.trim(),

      category: categories[0] || null,

      categories,

      brand: stringOrNull(body.brand),

      /* PRICE */

      price: numberOrNull(body.price),

      old_price: numberOrNull(
        body.old_price
      ),

      /* IMAGES */

      image: stringOrNull(body.image),

      image2: stringOrNull(body.image2),

      image3: stringOrNull(body.image3),

      image4: stringOrNull(body.image4),

      image5: stringOrNull(body.image5),

      image6: stringOrNull(body.image6),

      /* PRODUCT CONTENT */

      description: stringOrNull(
        body.description
      ),

      features: stringOrNull(
        body.features
      ),

      rating: numberOrNull(
        body.rating
      ),

      /* AVAILABILITY */

      stock:
        stringOrNull(body.stock) ||
        "In Stock",

      delivery:
        stringOrNull(body.delivery) ||
        "Free Delivery",

      /* COUPON */

      coupon_available:
        Boolean(body.coupon_available),

      coupon: stringOrNull(
        body.coupon
      ),

      /* AFFILIATE */

      affiliate_link:
        stringOrNull(
          body.affiliate_link
        ),

      /* HOT PICK */

      hot_pick:
        Boolean(body.hot_pick),

      /* ===================================================
         ANANTAGO REVIEW
      =================================================== */

      anantago_score:
        numberOrNull(
          body.anantago_score
        ),

      quality_score:
        numberOrNull(
          body.quality_score
        ),

      performance_score:
        numberOrNull(
          body.performance_score
        ),

      value_score:
        numberOrNull(
          body.value_score
        ),

      features_score:
        numberOrNull(
          body.features_score
        ),

      design_score:
        numberOrNull(
          body.design_score
        ),

      /* REVIEW CONTENT */

      verdict:
        stringOrNull(
          body.verdict
        ),

      best_for:
        stringOrNull(
          body.best_for
        ),

      not_ideal_for:
        stringOrNull(
          body.not_ideal_for
        ),

      /* PROS */

      pros,

      /* CONS */

      cons,

      /* REVIEW TYPE */

      review_type:
        stringOrNull(
          body.review_type
        ) ||
        "AnantaGo Analysis",

      /* COMPARISON */

      comparison_group:
        stringOrNull(
          body.comparison_group
        ),

      /* PRICE HISTORY */

      lowest_price:
        numberOrNull(
          body.lowest_price
        ),

      highest_price:
        numberOrNull(
          body.highest_price
        ),
    };

    console.log(
      "UPDATING PRODUCT:",
      productId
    );

    /* =====================================================
       UPDATE SUPABASE
    ===================================================== */

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found or could not be updated",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Product updated successfully",
        product: data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "PUT PRODUCT ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update product";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE PRODUCT
   DELETE /api/products/[id]
========================================================= */

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const productId = await getProductId(context);

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    console.log(
      "DELETING PRODUCT:",
      productId
    );

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete product";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}