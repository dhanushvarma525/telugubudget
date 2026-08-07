import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/* =========================================================
   GET PRODUCTS
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

    /* CATEGORY FILTER */

    if (categoryParam && categoryParam.trim() !== "") {
      query = query.contains("categories", [
        categoryParam.trim(),
      ]);
    }

    /* HOT PICK FILTER */

    if (hotPickParam === "true") {
      query = query.eq("hot_pick", true);
    }

    /* PAGINATION */

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
  } catch (error: any) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to load products",
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
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "===================================="
    );

    console.log("ADDING PRODUCT");
    console.log("Product name:", body?.name);

    /* REQUIRED FIELD */

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

    /* CATEGORIES */

    let categories: string[] = [];

    if (Array.isArray(body.categories)) {
      categories = body.categories
        .filter(
          (item: unknown) =>
            typeof item === "string"
        )
        .map((item: string) => item.trim())
        .filter(Boolean);
    }

    /*
      Backward compatibility:
      If frontend still sends category instead
      of categories, convert it.
    */

    if (
      categories.length === 0 &&
      typeof body.category === "string" &&
      body.category.trim() !== ""
    ) {
      categories = [body.category.trim()];
    }

    /* IMAGES */

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : null;

    const image2 =
      typeof body.image2 === "string"
        ? body.image2.trim()
        : null;

    const image3 =
      typeof body.image3 === "string"
        ? body.image3.trim()
        : null;

    const image4 =
      typeof body.image4 === "string"
        ? body.image4.trim()
        : null;

    const image5 =
      typeof body.image5 === "string"
        ? body.image5.trim()
        : null;

    const image6 =
      typeof body.image6 === "string"
        ? body.image6.trim()
        : null;

    /* NUMBERS */

    const price =
      body.price !== undefined &&
      body.price !== null &&
      body.price !== ""
        ? Number(body.price)
        : null;

    const oldPrice =
      body.old_price !== undefined &&
      body.old_price !== null &&
      body.old_price !== ""
        ? Number(body.old_price)
        : null;

    const rating =
      body.rating !== undefined &&
      body.rating !== null &&
      body.rating !== ""
        ? Number(body.rating)
        : null;

    /* VALIDATE PRICE */

    if (
      price !== null &&
      !Number.isFinite(price)
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
      oldPrice !== null &&
      !Number.isFinite(oldPrice)
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
      rating !== null &&
      !Number.isFinite(rating)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid rating",
        },
        { status: 400 }
      );
    }

    /* FEATURES */

    let features = body.features ?? null;

    if (
      typeof features === "string" &&
      features.trim() === ""
    ) {
      features = null;
    }

    /* INSERT DATA */

    const productData = {
      name: body.name.trim(),

      price,

      old_price: oldPrice,

      categories,

      category:
        typeof body.category === "string"
          ? body.category.trim() || null
          : categories[0] || null,

      image,

      image2,
      image3,
      image4,
      image5,
      image6,

      affiliate_link:
        typeof body.affiliate_link === "string"
          ? body.affiliate_link.trim() || null
          : null,

      description:
        typeof body.description === "string"
          ? body.description.trim() || null
          : null,

      features,

      rating,

      stock:
        body.stock !== undefined &&
        body.stock !== null &&
        body.stock !== ""
          ? String(body.stock)
          : null,

      coupon:
        typeof body.coupon === "string"
          ? body.coupon.trim() || null
          : null,

      hot_pick:
        body.hot_pick === true,

      views:
        Number.isFinite(Number(body.views))
          ? Number(body.views)
          : 0,

      clicks:
        Number.isFinite(Number(body.clicks))
          ? Number(body.clicks)
          : 0,
    };

    console.log(
      "INSERT DATA:",
      productData
    );

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .insert(productData)
      .select()
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
          error: error,
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
        message: "Product added successfully",
        product: data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "ADD PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Something went wrong while adding product",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PUT - UPDATE PRODUCT
========================================================= */

export async function PUT(request: NextRequest) {
  return updateProduct(request);
}

/* =========================================================
   PATCH - UPDATE PRODUCT
========================================================= */

export async function PATCH(request: NextRequest) {
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

    /* BUILD UPDATE OBJECT */

    const updateData: Record<
      string,
      any
    > = {};

    /* NAME */

    if (body.name !== undefined) {
      updateData.name =
        typeof body.name === "string"
          ? body.name.trim()
          : body.name;
    }

    /* PRICE */

    if (body.price !== undefined) {
      if (
        body.price === "" ||
        body.price === null
      ) {
        updateData.price = null;
      } else {
        const value = Number(body.price);

        if (!Number.isFinite(value)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid product price",
            },
            { status: 400 }
          );
        }

        updateData.price = value;
      }
    }

    /* OLD PRICE */

    if (body.old_price !== undefined) {
      if (
        body.old_price === "" ||
        body.old_price === null
      ) {
        updateData.old_price = null;
      } else {
        const value = Number(
          body.old_price
        );

        if (!Number.isFinite(value)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid old price",
            },
            { status: 400 }
          );
        }

        updateData.old_price = value;
      }
    }

    /* CATEGORIES */

    if (body.categories !== undefined) {
      if (Array.isArray(body.categories)) {
        updateData.categories =
          body.categories
            .filter(
              (item: unknown) =>
                typeof item === "string"
            )
            .map((item: string) =>
              item.trim()
            )
            .filter(Boolean);
      }
    }

    /* BACKWARD COMPATIBILITY */

    if (body.category !== undefined) {
      updateData.category =
        typeof body.category === "string"
          ? body.category.trim() || null
          : null;

      if (
        body.categories === undefined &&
        typeof body.category === "string"
      ) {
        updateData.categories =
          body.category.trim()
            ? [body.category.trim()]
            : [];
      }
    }

    /* IMAGES */

    const imageFields = [
      "image",
      "image2",
      "image3",
      "image4",
      "image5",
      "image6",
    ];

    for (const field of imageFields) {
      if (body[field] !== undefined) {
        updateData[field] =
          typeof body[field] === "string"
            ? body[field].trim() || null
            : null;
      }
    }

    /* AFFILIATE LINK */

    if (
      body.affiliate_link !== undefined
    ) {
      updateData.affiliate_link =
        typeof body.affiliate_link ===
        "string"
          ? body.affiliate_link.trim() ||
            null
          : null;
    }

    /* DESCRIPTION */

    if (
      body.description !== undefined
    ) {
      updateData.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }

    /* FEATURES */

    if (body.features !== undefined) {
      updateData.features =
        body.features;
    }

    /* RATING */

    if (body.rating !== undefined) {
      if (
        body.rating === "" ||
        body.rating === null
      ) {
        updateData.rating = null;
      } else {
        const value = Number(
          body.rating
        );

        if (!Number.isFinite(value)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid rating",
            },
            { status: 400 }
          );
        }

        updateData.rating = value;
      }
    }

    /* STOCK */

    if (body.stock !== undefined) {
      updateData.stock =
        body.stock === "" ||
        body.stock === null
          ? null
          : String(body.stock);
    }

    /* COUPON */

    if (body.coupon !== undefined) {
      updateData.coupon =
        typeof body.coupon === "string"
          ? body.coupon.trim() || null
          : null;
    }

    /* HOT PICK */

    if (body.hot_pick !== undefined) {
      updateData.hot_pick =
        body.hot_pick === true;
    }

    /* UPDATE */

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
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
  } catch (error: any) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Something went wrong while updating product",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function DELETE(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    let id =
      searchParams.get("id");

    /*
      Also support:
      DELETE /api/products
      with JSON { id: "..." }
    */

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
          message: "Product ID is required",
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
      .select();

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

    if (!data || data.length === 0) {
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
  } catch (error: any) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Something went wrong while deleting product",
      },
      { status: 500 }
    );
  }
}