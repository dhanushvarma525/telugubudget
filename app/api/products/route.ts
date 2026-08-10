import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/* =========================================================
   HELPERS
========================================================= */

function numberOrNull(value: unknown): number | null {
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
}

function stringOrNull(value: unknown): string | null {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const valueString = String(value).trim();

  return valueString || null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item: unknown): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
}

/* =========================================================
   GET PRODUCTS
   GET /api/products
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const categoryParam = searchParams.get("category");
    const hotPickParam = searchParams.get("hotPick");

    const pageNumber = Number(pageParam || "1");
    const limitNumber = Number(limitParam || "20");

    const page =
      Number.isFinite(pageNumber) && pageNumber > 0
        ? Math.floor(pageNumber)
        : 1;

    const limit =
      Number.isFinite(limitNumber) && limitNumber > 0
        ? Math.min(Math.floor(limitNumber), 1000)
        : 20;

    let query = supabase
      .from("products")
      .select("*", {
        count: "exact",
      });

    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    if (
      categoryParam &&
      categoryParam.trim() !== ""
    ) {
      query = query.contains("categories", [
        categoryParam.trim(),
      ]);
    }

    /* =====================================================
       HOT PICK FILTER
    ===================================================== */

    if (hotPickParam === "true") {
      query = query.eq("hot_pick", true);
    }

    /* =====================================================
       PAGINATION
    ===================================================== */

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order("created_at", {
        ascending: false,
      })
      .range(from, to);

    const {
      data,
      error,
      count,
    } = await query;

    if (error) {
      console.error(
        "GET PRODUCTS SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: error.message,
          products: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
        { status: 500 }
      );
    }

    const products = data || [];
    const total = count || 0;

    const totalPages =
      total > 0
        ? Math.ceil(total / limit)
        : 0;

    return NextResponse.json(
      {
        success: true,
        products,
        total,
        page,
        limit,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load products";

    return NextResponse.json(
      {
        success: false,
        message,
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST - ADD PRODUCT
   POST /api/products
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "===================================="
    );

    console.log("ADDING PRODUCT");
    console.log("Product name:", body?.name);

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (
      !body ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CATEGORIES
    ===================================================== */

    let categories = stringArray(
      body.categories
    );

    if (
      categories.length === 0 &&
      typeof body.category === "string" &&
      body.category.trim() !== ""
    ) {
      categories = [
        body.category.trim(),
      ];
    }

    /* =====================================================
       IMAGES
    ===================================================== */

    const image = stringOrNull(
      body.image
    );

    const image2 = stringOrNull(
      body.image2
    );

    const image3 = stringOrNull(
      body.image3
    );

    const image4 = stringOrNull(
      body.image4
    );

    const image5 = stringOrNull(
      body.image5
    );

    const image6 = stringOrNull(
      body.image6
    );

    /* =====================================================
       NUMBERS
    ===================================================== */

    const price = numberOrNull(
      body.price
    );

    const oldPrice = numberOrNull(
      body.old_price
    );

    const rating = numberOrNull(
      body.rating
    );

    /* =====================================================
       VALIDATE NUMBERS
    ===================================================== */

    if (
      body.price !== undefined &&
      body.price !== null &&
      body.price !== "" &&
      price === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product price",
        },
        { status: 400 }
      );
    }

    if (
      body.old_price !== undefined &&
      body.old_price !== null &&
      body.old_price !== "" &&
      oldPrice === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid old price",
        },
        { status: 400 }
      );
    }

    if (
      body.rating !== undefined &&
      body.rating !== null &&
      body.rating !== "" &&
      rating === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid rating",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       PROS & CONS
    ===================================================== */

    const pros = stringArray(
      body.pros
    );

    const cons = stringArray(
      body.cons
    );

    /* =====================================================
       ANANTAGO REVIEW SCORES
    ===================================================== */

    const anantagoScore =
      numberOrNull(
        body.anantago_score
      );

    const qualityScore =
      numberOrNull(
        body.quality_score
      );

    const performanceScore =
      numberOrNull(
        body.performance_score
      );

    const valueScore =
      numberOrNull(
        body.value_score
      );

    const featuresScore =
      numberOrNull(
        body.features_score
      );

    const designScore =
      numberOrNull(
        body.design_score
      );

    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    const productData = {
      /* BASIC */

      name: body.name.trim(),

      brand: stringOrNull(
        body.brand
      ),

      price,

      old_price: oldPrice,

      /* CATEGORIES */

      categories,

      category:
        typeof body.category === "string"
          ? body.category.trim() || null
          : categories[0] || null,

      /* IMAGES */

      image,
      image2,
      image3,
      image4,
      image5,
      image6,

      /* PRODUCT CONTENT */

      description: stringOrNull(
        body.description
      ),

      features:
        body.features !== undefined &&
        body.features !== null &&
        String(body.features).trim() !== ""
          ? body.features
          : null,

      rating,

      /* AVAILABILITY */

      stock:
        stringOrNull(body.stock) ||
        "In Stock",

      delivery:
        stringOrNull(body.delivery) ||
        "Free Delivery",

      /* COUPON */

      coupon_available:
        body.coupon_available === true,

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
        body.hot_pick === true,

      /* ===================================================
         ANANTAGO REVIEW
      =================================================== */

      anantago_score:
        anantagoScore,

      quality_score:
        qualityScore,

      performance_score:
        performanceScore,

      value_score:
        valueScore,

      features_score:
        featuresScore,

      design_score:
        designScore,

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

      /* ===================================================
         PROS & CONS
      =================================================== */

      pros,

      cons,

      /* ===================================================
         REVIEW TYPE
      =================================================== */

      review_type:
        stringOrNull(
          body.review_type
        ) ||
        "AnantaGo Analysis",

      /* ===================================================
         COMPARISON
      =================================================== */

      comparison_group:
        stringOrNull(
          body.comparison_group
        ),

      /* ===================================================
         PRICE HISTORY
      =================================================== */

      lowest_price:
        numberOrNull(
          body.lowest_price
        ),

      highest_price:
        numberOrNull(
          body.highest_price
        ),

      /* ===================================================
         ANALYTICS
      =================================================== */

      views:
        Number.isFinite(
          Number(body.views)
        )
          ? Number(body.views)
          : 0,

      clicks:
        Number.isFinite(
          Number(body.clicks)
        )
          ? Number(body.clicks)
          : 0,
    };

    console.log(
      "INSERT DATA:",
      productData
    );

    /* =====================================================
       INSERT
    ===================================================== */

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .insert(productData)
      .select("*")
      .single();

    if (error) {
      console.error(
        "ADD PRODUCT SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Failed to add product",
          error,
        },
        { status: 500 }
      );
    }

    console.log(
      "PRODUCT ADDED:",
      data?.id
    );

    console.log(
      "===================================="
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Product added successfully",
        product: data,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "ADD PRODUCT ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while adding product";

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
   PUT - UPDATE PRODUCT
========================================================= */

export async function PUT(
  request: NextRequest
) {
  return updateProduct(request);
}

/* =========================================================
   PATCH - UPDATE PRODUCT
========================================================= */

export async function PATCH(
  request: NextRequest
) {
  return updateProduct(request);
}

/* =========================================================
   UPDATE PRODUCT FUNCTION
========================================================= */

async function updateProduct(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const id = body?.id;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    console.log(
      "===================================="
    );

    console.log(
      "UPDATING PRODUCT:",
      id
    );

    const updateData: Record<
      string,
      any
    > = {};

    /* =====================================================
       BASIC
    ===================================================== */

    if (body.name !== undefined) {
      updateData.name =
        typeof body.name === "string"
          ? body.name.trim()
          : body.name;
    }

    if (body.brand !== undefined) {
      updateData.brand =
        stringOrNull(body.brand);
    }

    /* =====================================================
       PRICE
    ===================================================== */

    if (body.price !== undefined) {
      const value =
        numberOrNull(body.price);

      if (
        body.price !== "" &&
        body.price !== null &&
        value === null
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid product price",
          },
          { status: 400 }
        );
      }

      updateData.price = value;
    }

    if (
      body.old_price !== undefined
    ) {
      const value =
        numberOrNull(
          body.old_price
        );

      if (
        body.old_price !== "" &&
        body.old_price !== null &&
        value === null
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid old price",
          },
          { status: 400 }
        );
      }

      updateData.old_price = value;
    }

    /* =====================================================
       CATEGORIES
    ===================================================== */

    if (
      body.categories !== undefined
    ) {
      updateData.categories =
        stringArray(
          body.categories
        );
    }

    if (
      body.category !== undefined
    ) {
      updateData.category =
        typeof body.category === "string"
          ? body.category.trim() || null
          : null;

      if (
        body.categories === undefined
      ) {
        updateData.categories =
          typeof body.category === "string" &&
          body.category.trim()
            ? [body.category.trim()]
            : [];
      }
    }

    /* =====================================================
       IMAGES
    ===================================================== */

    const imageFields = [
      "image",
      "image2",
      "image3",
      "image4",
      "image5",
      "image6",
    ];

    for (
      const field of imageFields
    ) {
      if (
        body[field] !== undefined
      ) {
        updateData[field] =
          stringOrNull(
            body[field]
          );
      }
    }

    /* =====================================================
       PRODUCT CONTENT
    ===================================================== */

    if (
      body.description !== undefined
    ) {
      updateData.description =
        stringOrNull(
          body.description
        );
    }

    if (
      body.features !== undefined
    ) {
      updateData.features =
        body.features === null ||
        body.features === ""
          ? null
          : body.features;
    }

    /* =====================================================
       RATING
    ===================================================== */

    if (
      body.rating !== undefined
    ) {
      const value =
        numberOrNull(
          body.rating
        );

      if (
        body.rating !== "" &&
        body.rating !== null &&
        value === null
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid rating",
          },
          { status: 400 }
        );
      }

      updateData.rating = value;
    }

    /* =====================================================
       STOCK / DELIVERY
    ===================================================== */

    if (
      body.stock !== undefined
    ) {
      updateData.stock =
        stringOrNull(
          body.stock
        );
    }

    if (
      body.delivery !== undefined
    ) {
      updateData.delivery =
        stringOrNull(
          body.delivery
        );
    }

    /* =====================================================
       COUPON
    ===================================================== */

    if (
      body.coupon_available !== undefined
    ) {
      updateData.coupon_available =
        body.coupon_available === true;
    }

    if (
      body.coupon !== undefined
    ) {
      updateData.coupon =
        stringOrNull(
          body.coupon
        );
    }

    /* =====================================================
       AFFILIATE
    ===================================================== */

    if (
      body.affiliate_link !== undefined
    ) {
      updateData.affiliate_link =
        stringOrNull(
          body.affiliate_link
        );
    }

    /* =====================================================
       HOT PICK
    ===================================================== */

    if (
      body.hot_pick !== undefined
    ) {
      updateData.hot_pick =
        body.hot_pick === true;
    }

    /* =====================================================
       ANANTAGO REVIEW SCORES
    ===================================================== */

    const reviewScoreFields = [
      "anantago_score",
      "quality_score",
      "performance_score",
      "value_score",
      "features_score",
      "design_score",
    ];

    for (
      const field of reviewScoreFields
    ) {
      if (
        body[field] !== undefined
      ) {
        const value =
          numberOrNull(
            body[field]
          );

        if (
          body[field] !== "" &&
          body[field] !== null &&
          value === null
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid ${field}`,
            },
            { status: 400 }
          );
        }

        updateData[field] = value;
      }
    }

    /* =====================================================
       ANANTAGO REVIEW CONTENT
    ===================================================== */

    if (
      body.verdict !== undefined
    ) {
      updateData.verdict =
        stringOrNull(
          body.verdict
        );
    }

    if (
      body.best_for !== undefined
    ) {
      updateData.best_for =
        stringOrNull(
          body.best_for
        );
    }

    if (
      body.not_ideal_for !== undefined
    ) {
      updateData.not_ideal_for =
        stringOrNull(
          body.not_ideal_for
        );
    }

    /* =====================================================
       PROS
    ===================================================== */

    if (
      body.pros !== undefined
    ) {
      updateData.pros =
        stringArray(
          body.pros
        );
    }

    /* =====================================================
       CONS
    ===================================================== */

    if (
      body.cons !== undefined
    ) {
      updateData.cons =
        stringArray(
          body.cons
        );
    }

    /* =====================================================
       REVIEW TYPE
    ===================================================== */

    if (
      body.review_type !== undefined
    ) {
      updateData.review_type =
        stringOrNull(
          body.review_type
        ) ||
        "AnantaGo Analysis";
    }

    /* =====================================================
       COMPARISON
    ===================================================== */

    if (
      body.comparison_group !== undefined
    ) {
      updateData.comparison_group =
        stringOrNull(
          body.comparison_group
        );
    }

    /* =====================================================
       PRICE HISTORY
    ===================================================== */

    if (
      body.lowest_price !== undefined
    ) {
      updateData.lowest_price =
        numberOrNull(
          body.lowest_price
        );
    }

    if (
      body.highest_price !== undefined
    ) {
      updateData.highest_price =
        numberOrNull(
          body.highest_price
        );
    }

    /* =====================================================
       SAFETY CHECK
    ===================================================== */

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No fields provided for update",
        },
        { status: 400 }
      );
    }

    console.log(
      "UPDATE DATA:",
      updateData
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
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error(
        "UPDATE PRODUCT SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Failed to update product",
          error,
        },
        { status: 500 }
      );
    }

    console.log(
      "PRODUCT UPDATED:",
      data?.id
    );

    console.log(
      "===================================="
    );

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
      "UPDATE PRODUCT ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while updating product";

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
   DELETE /api/products?id=123
========================================================= */

export async function DELETE(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    let id =
      searchParams.get("id");

    /* =====================================================
       ALSO SUPPORT JSON BODY
    ===================================================== */

    if (!id) {
      try {
        const body =
          await request.json();

        id = body?.id || null;
      } catch {
        // No JSON body
      }
    }

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product ID is required",
        },
        { status: 400 }
      );
    }

    console.log(
      "===================================="
    );

    console.log(
      "DELETING PRODUCT:",
      id
    );

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("*");

    if (error) {
      console.error(
        "DELETE PRODUCT SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Failed to delete product",
          error,
        },
        { status: 500 }
      );
    }

    if (
      !data ||
      data.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found or could not be deleted",
        },
        { status: 404 }
      );
    }

    console.log(
      "PRODUCT DELETED:",
      id
    );

    console.log(
      "===================================="
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Product deleted successfully",
        deletedProduct: data[0],
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
        : "Something went wrong while deleting product";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}