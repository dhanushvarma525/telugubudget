
import { NextRequest, NextResponse } from "next/server";
import { generateAnantaGoReview } from "@/lib/generateAnantaGoReview";

export async function POST(req: NextRequest) {
  try {
    // =========================
    // GET REQUEST DATA
    // =========================

    const body = await req.json();

    const productName = body.productName?.trim();

    if (!productName) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // TAVILY API KEY
    // =========================

    const tavilyKey =
      process.env.TAVILY_API_KEY;

    if (!tavilyKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "TAVILY_API_KEY is missing from environment variables",
        },
        {
          status: 500,
        }
      );
    }

    // =========================
    // SEARCH QUERY
    // =========================

    const query = `
      ${productName}
      review
      specifications
      performance
      pros and cons
      expert testing
      buyer experience
    `;

    console.log(
      `🔎 Researching product: ${productName}`
    );

    // =========================
    // TAVILY SEARCH
    // =========================

    const tavilyResponse = await fetch(
      "https://api.tavily.com/search",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tavilyKey}`,
        },

        body: JSON.stringify({
          query,

          search_depth: "advanced",

          include_answer: "advanced",

          max_results: 5,
        }),
      }
    );

    const tavilyData =
      await tavilyResponse.json();

    // =========================
    // TAVILY ERROR
    // =========================

    if (!tavilyResponse.ok) {
      console.error(
        "❌ Tavily API error:",
        tavilyData
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Tavily search failed",

          error: tavilyData,
        },
        {
          status:
            tavilyResponse.status,
        }
      );
    }

    // =========================
    // FORMAT SOURCES
    // =========================

    const sources = (
      tavilyData.results || []
    ).map((result: any) => ({
      title:
        result.title || "Untitled Source",

      url:
        result.url || "",

      content:
        result.content || "",

      score:
        result.score || 0,
    }));

    console.log(
      `✅ Found ${sources.length} research sources`
    );

    // =========================
    // GENERATE ANANTAGO ANALYSIS
    // =========================

    const review =
      generateAnantaGoReview(
        productName,

        tavilyData.answer ||
          null,

        sources
      );

    console.log(
      "✅ AnantaGo analysis generated"
    );

    // =========================
    // FINAL RESPONSE
    // =========================

    return NextResponse.json({
      success: true,

      productName,

      // Tavily's research summary
      answer:
        tavilyData.answer ||
        null,

      // Our AnantaGo analysis
      review,

      // Number of sources
      sourceCount:
        sources.length,

      // Raw research sources
      sources,
    });
  } catch (error: any) {
    // =========================
    // GENERAL ERROR
    // =========================

    console.error(
      "❌ AI Review API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to research product",

        error:
          error?.message ||
          "Unknown server error",
      },
      {
        status: 500,
      }
    );
  }
}

