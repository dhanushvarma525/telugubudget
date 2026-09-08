import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const q =
      searchParams.get("q")?.trim() || "";

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = 10;

    if (!q) {
      return NextResponse.json({
        blogs: [],
        total: 0,
      });
    }

    const from =
      (page - 1) * limit;

    const to =
      from + limit - 1;

    const {
      data,
      error,
      count,
    } = await supabase
      .from("blogs")
      .select(
        `
          id,
          title,
          slug,
          excerpt,
          cover_image,
          category,
          author,
          published_at,
          created_at
        `,
        {
          count: "exact",
        }
      )
      .eq("published", true)
      .or(
        `title.ilike.%${q}%,excerpt.ilike.%${q}%,category.ilike.%${q}%`
      )
      .order(
        "published_at",
        {
          ascending: false,
        }
      )
      .range(from, to);

    if (error) {
      console.error(
        "SEARCH BLOG ERROR:",
        error
      );

      return NextResponse.json(
        {
          message:
            "Failed to search blogs",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      blogs: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error(
      "SEARCH API ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}