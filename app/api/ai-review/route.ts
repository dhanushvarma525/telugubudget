import { NextRequest, NextResponse } from "next/server";
import { generateAnantaGoReview } from "@/lib/generateAnantaGoReview";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

export async function POST(req: NextRequest) {
  try {
    // =====================================================
    // 1. GET REQUEST DATA
    // =====================================================

    const body = await req.json();

    const productName =
      typeof body.productName === "string"
        ? body.productName.trim()
        : "";

    if (!productName) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 2. TAVILY API KEY
    // =====================================================

    const tavilyKey = process.env.TAVILY_API_KEY;

    if (!tavilyKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "TAVILY_API_KEY is missing from environment variables",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 3. PRODUCT INFORMATION
    // =====================================================

    const brand =
      typeof body.brand === "string"
        ? body.brand.trim()
        : "";

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const features =
      typeof body.features === "string"
        ? body.features.trim()
        : "";

    const price =
      body.price !== undefined &&
      body.price !== null
        ? String(body.price)
        : "";

    // =====================================================
    // 4. PRODUCT CONTEXT
    // =====================================================

    const productContext = `
Product Name:
${productName}

Brand:
${brand || "Not provided"}

Category:
${category || "Not provided"}

Current Price:
${price || "Not provided"}

Description:
${description || "Not provided"}

Features:
${features || "Not provided"}
`.trim();

    // =====================================================
    // 5. SEARCH QUERY
    // =====================================================

    const query = `
${productName}
${brand}
${category}
official specifications
technical specifications
performance review
pros and cons
buyer experience
limitations
build quality
design
value for money
warranty
common problems
`.trim();

    console.log(
      `🔎 Researching product: ${productName}`
    );

    // =====================================================
    // 6. TAVILY SEARCH
    // =====================================================

    const tavilyResponse = await fetch(
      "https://api.tavily.com/search",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          api_key: tavilyKey,

          query,

          search_depth: "advanced",

          topic: "general",

          max_results: 8,

          include_answer: true,

          include_raw_content: false,
        }),
      }
    );

    const tavilyData =
      await tavilyResponse.json();

    // =====================================================
    // 7. TAVILY ERROR
    // =====================================================

    if (!tavilyResponse.ok) {
      console.error(
        "❌ Tavily API error:",
        tavilyData
      );

      return NextResponse.json(
        {
          success: false,
          message: "Tavily search failed",
          error: tavilyData,
        },
        {
          status: tavilyResponse.status,
        }
      );
    }

    // =====================================================
    // 8. FORMAT SOURCES
    // =====================================================

    const sources: TavilyResult[] =
      Array.isArray(tavilyData.results)
        ? tavilyData.results.map(
            (result: TavilyResult) => ({
              title:
                result.title ||
                "Untitled Source",

              url:
                result.url || "",

              content:
                result.content || "",

              score:
                typeof result.score === "number"
                  ? result.score
                  : 0,
            })
          )
        : [];

    console.log(
      `✅ Found ${sources.length} research sources`
    );

    // =====================================================
    // 9. REQUIRE RESEARCH RESULTS
    // =====================================================

    if (sources.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No reliable product research was found. Please try again with the full product name.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 10. GENERATE ANANTAGO REVIEW
    // =====================================================

    const review =
      await generateAnantaGoReview(
        productContext,
        tavilyData.answer || null,
        sources
      );

    console.log(
      "✅ Genuine AnantaGo analysis generated:",
      {
        score: review.score,
        quality:
          review.qualityScore,
        performance:
          review.performanceScore,
        value:
          review.valueScore,
        features:
          review.featuresScore,
        design:
          review.designScore,
      }
    );

    // =====================================================
    // 11. RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      productName,

      productContext,

      answer:
        tavilyData.answer || null,

      review,

      sourceCount:
        sources.length,

      sources,
    });
  } catch (error: unknown) {
    console.error(
      "❌ AI Review API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to research product",
      },
      {
        status: 500,
      }
    );
  }
}