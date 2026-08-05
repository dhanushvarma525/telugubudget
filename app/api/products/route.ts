import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/* =====================================================
   GET PRODUCTS
   Supports:
   /api/products
   /api/products?page=1&limit=20
   /api/products?page=1&limit=1000
   /api/products?hotPick=true
===================================================== */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const hotPickParam = searchParams.get("hotPick");

    const page = Math.max(
      Number(pageParam || "1"),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(limitParam || "20"),
        1
      ),
      1000
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    /* =================================================
       QUERY
    ================================================= */

    let query = supabase
      .from("products")
      .select("*", {
        count: "exact",
      })
      .order("created_at", {
        ascending: false,
      })
      .range(from, to);

    /* =================================================
       HOT PICKS FILTER
    ================================================= */

    if (hotPickParam === "true") {
      query = query.eq(
        "hot_pick",
        true
      );
    }

    const {
      data,
      error,
      count,
    } = await query;

    /* =================================================
       ERROR
    ================================================= */

    if (error) {
      console.error(
        "❌ GET PRODUCTS SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: error.message,
          products: [],
        },
        {
          status: 500,
        }
      );
    }

    /* =================================================
       RESPONSE
    ================================================= */

    const products = data || [];

    const total = count || 0;

    const totalPages =
      Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,

        products,

        total,

        page,

        limit,

        totalPages,
      },
      {
        status: 200,
      }
    );

  } catch (error: any) {

    console.error(
      "❌ GET PRODUCTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to load products",

        products: [],
      },
      {
        status: 500,
      }
    );
  }
}


/* =====================================================
   POST PRODUCT
===================================================== */

export async function POST(
  request: NextRequest
) {
  try {

    const body =
      await request.json();

    /* =================================================
       REQUIRED FIELDS
    ================================================= */

    if (
      !body.name ||
      !String(body.name).trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product name is required",
        },
        {
          status: 400,
        }
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
          message:
            "Product price is required",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================================
       CATEGORIES
    ================================================= */

    const categories =
      Array.isArray(body.categories)
        ? body.categories
        : body.category
        ? [body.category]
        : [];

    const category =
      categories.length > 0
        ? categories[0]
        : body.category || null;

    /* =================================================
       INSERT
    ================================================= */

    const productData = {

      /* BASIC */

      name:
        String(body.name).trim(),

      category,

      categories,

      brand:
        body.brand || null,

      price:
        body.price,

      old_price:
        body.old_price ||
        null,

      /* IMAGES */

      image:
        body.image || null,

      image2:
        body.image2 || null,

      image3:
        body.image3 || null,

      image4:
        body.image4 || null,

      image5:
        body.image5 || null,

      image6:
        body.image6 || null,

      /* PRODUCT CONTENT */

      description:
        body.description || null,

      features:
        body.features || null,

      /* MARKETPLACE */

      rating:
        body.rating || null,

      stock:
        body.stock || "In Stock",

      delivery:
        body.delivery ||
        "Free Delivery",

      /* COUPON */

      coupon:
        body.coupon || null,

      coupon_available:
        Boolean(
          body.coupon_available
        ),

      /* AFFILIATE */

      affiliate_link:
        body.affiliate_link || null,

      /* HOT PICK */

      hot_pick:
        Boolean(body.hot_pick),

      /* =================================================
         ANANTAGO REVIEW
      ================================================= */

      anantago_score:
        body.anantago_score !==
          undefined &&
        body.anantago_score !== null &&
        body.anantago_score !== ""
          ? body.anantago_score
          : null,

      quality_score:
        body.quality_score !==
          undefined &&
        body.quality_score !== null &&
        body.quality_score !== ""
          ? body.quality_score
          : null,

      performance_score:
        body.performance_score !==
          undefined &&
        body.performance_score !== null &&
        body.performance_score !== ""
          ? body.performance_score
          : null,

      value_score:
        body.value_score !==
          undefined &&
        body.value_score !== null &&
        body.value_score !== ""
          ? body.value_score
          : null,

      features_score:
        body.features_score !==
          undefined &&
        body.features_score !== null &&
        body.features_score !== ""
          ? body.features_score
          : null,

      design_score:
        body.design_score !==
          undefined &&
        body.design_score !== null &&
        body.design_score !== ""
          ? body.design_score
          : null,

      /* REVIEW CONTENT */

      verdict:
        body.verdict || null,

      best_for:
        body.best_for || null,

      not_ideal_for:
        body.not_ideal_for || null,

      pros:
        Array.isArray(body.pros)
          ? body.pros.filter(
              (item: unknown) =>
                String(item).trim() !== ""
            )
          : [],

      cons:
        Array.isArray(body.cons)
          ? body.cons.filter(
              (item: unknown) =>
                String(item).trim() !== ""
            )
          : [],

      review_type:
        body.review_type ||
        "AnantaGo Analysis",

      /* COMPARISON */

      comparison_group:
        body.comparison_group ||
        null,

      /* PRICE HISTORY */

      lowest_price:
        body.lowest_price ||
        null,

      highest_price:
        body.highest_price ||
        null,
    };


    /* =================================================
       SUPABASE INSERT
    ================================================= */

    const {
      data,
      error,
    } = await supabase
      .from("products")
      .insert(productData)
      .select("*")
      .single();


    /* =================================================
       INSERT ERROR
    ================================================= */

    if (error) {

      console.error(
        "❌ CREATE PRODUCT SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,

          message:
            error.message,

          details:
            error.details || null,

          hint:
            error.hint || null,

          code:
            error.code || null,
        },
        {
          status: 500,
        }
      );
    }


    /* =================================================
       SUCCESS
    ================================================= */

    return NextResponse.json(
      {
        success: true,

        message:
          "Product created successfully",

        product: data,
      },
      {
        status: 201,
      }
    );

  } catch (error: any) {

    console.error(
      "❌ CREATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}