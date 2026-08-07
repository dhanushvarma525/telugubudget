import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/*
=====================================================
GET PRODUCTS

Examples:

/api/products
/api/products?page=1&limit=20
/api/products?category=Fashion
/api/products?category=Electronics
/api/products?category=Impress%20Your%20Crush
/api/products?hotPick=true
=====================================================
*/

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

    /*
    =================================================
    BASE QUERY
    =================================================
    */

    let query = supabase
      .from("products")
      .select("*", {
        count: "exact",
      });

    /*
    =================================================
    CATEGORY FILTER

    IMPORTANT:
    Your products table contains:

    categories: ["Fashion"]

    Therefore we use:
    .contains("categories", [categoryParam])
    =================================================
    */

    if (categoryParam && categoryParam.trim() !== "") {
      query = query.contains("categories", [
        categoryParam.trim(),
      ]);
    }

    /*
    =================================================
    HOT PICK FILTER
    =================================================
    */

    if (hotPickParam === "true") {
      query = query.eq("hot_pick", true);
    }

    /*
    =================================================
    ORDER + PAGINATION
    =================================================
    */

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order("created_at", {
        ascending: false,
      })
      .range(from, to);

    /*
    =================================================
    EXECUTE
    =================================================
    */

    const {
      data,
      error,
      count,
    } = await query;

    /*
    =================================================
    ERROR
    =================================================
    */

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
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
        {
          status: 500,
        }
      );
    }

    /*
    =================================================
    RESPONSE
    =================================================
    */

    const products = data || [];
    const total = count || 0;

    const totalPages = Math.ceil(
      total / limit
    );

    console.log(
      "===================================="
    );

    console.log(
      "PRODUCT API REQUEST"
    );

    console.log(
      "Category:",
      categoryParam || "ALL"
    );

    console.log(
      "Page:",
      page
    );

    console.log(
      "Limit:",
      limit
    );

    console.log(
      "Returned:",
      products.length
    );

    console.log(
      "Total:",
      total
    );

    console.log(
      "Total Pages:",
      totalPages
    );

    console.log(
      "===================================="
    );

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
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
      {
        status: 500,
      }
    );
  }
}