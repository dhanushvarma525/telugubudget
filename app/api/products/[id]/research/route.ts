import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type SearchResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type TavilyResponse = {
  answer?: string;
  results?: SearchResult[];
};

/* =========================================================
   TAVILY SEARCH
========================================================= */

async function searchWeb(
  query: string
): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY is missing"
    );
  }

  const response = await fetch(
    "https://api.tavily.com/search",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        api_key: apiKey,

        query,

        search_depth: "advanced",

        topic: "general",

        max_results: 6,

        include_answer: true,

        include_raw_content: false,

        include_images: false,
      }),

      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Tavily search failed: ${text}`
    );
  }

  return (await response.json()) as TavilyResponse;
}

/* =========================================================
   POST
   /api/products/[id]/research
========================================================= */

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    /* =====================================================
       PRODUCT ID
    ===================================================== */

    const { id } = await context.params;

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

    const productId = Number(id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid product ID",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CHECK TAVILY KEY
    ===================================================== */

    if (!process.env.TAVILY_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            "TAVILY_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       GET PRODUCT
    ===================================================== */

    const {
      data: product,
      error: productError,
    } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      console.error(
        "Product fetch error:",
        productError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            productError.message,
        },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       MARK RESEARCHING
    ===================================================== */

    await supabase
      .from("products")
      .update({
        anantago_analysis_status:
          "researching",
      })
      .eq("id", productId);

    /* =====================================================
       PRODUCT INFORMATION
    ===================================================== */

    const productName =
      product.name || "";

    const brand =
      product.brand || "";

    const category =
      product.category || "";

    const description =
      product.description || "";

    const features =
      product.features || "";

    const price =
      product.price || "";

    /* =====================================================
       PRODUCT IDENTITY
    ===================================================== */

    const productIdentity = [
      brand,
      productName,
      category,
      features,
    ]
      .filter(Boolean)
      .join(" ");

    /* =====================================================
       SEARCH QUERIES
    ===================================================== */

    const queries = [
      `"${brand} ${productName}" official specifications`,

      `"${brand} ${productName}" review`,

      `"${brand} ${productName}" pros cons`,

      `"${brand} ${productName}" warranty`,
    ];

    /* =====================================================
       SEARCH
    ===================================================== */

    const searchResults: SearchResult[] = [];

    const tavilyAnswers: string[] = [];

    for (const query of queries) {
      try {
        const result =
          await searchWeb(query);

        /* Save Tavily answer */

        if (
          result.answer &&
          result.answer.trim()
        ) {
          tavilyAnswers.push(
            result.answer.trim()
          );
        }

        /* Save search results */

        if (
          Array.isArray(
            result.results
          )
        ) {
          searchResults.push(
            ...result.results
          );
        }
      } catch (error) {
        console.error(
          `Search failed for query: ${query}`,
          error
        );
      }
    }

    /* =====================================================
       REMOVE DUPLICATE SOURCES
    ===================================================== */

    const uniqueSources =
      Array.from(
        new Map(
          searchResults
            .filter(
              (item) =>
                item.url
            )
            .map(
              (item) => [
                item.url,
                item,
              ]
            )
        ).values()
      ).slice(0, 20);

    /* =====================================================
       NO SOURCES
    ===================================================== */

    if (
      uniqueSources.length === 0
    ) {
      await supabase
        .from("products")
        .update({
          anantago_analysis_status:
            "research_failed",
        })
        .eq("id", productId);

      return NextResponse.json(
        {
          success: false,
          message:
            "No reliable web research results were found.",
        },
        { status: 422 }
      );
    }

    /* =====================================================
       BUILD RESEARCH TEXT
    ===================================================== */

    const researchText =
      uniqueSources
        .map(
          (source, index) => {
            return [
              `SOURCE ${index + 1}`,
              "",
              `Title: ${
                source.title ||
                "Unknown"
              }`,
              "",
              `URL: ${
                source.url ||
                "Unknown"
              }`,
              "",
              `Information: ${
                source.content ||
                "No information available"
              }`,
            ].join("\n");
          }
        )
        .join("\n\n-------------------------\n\n");

    /* =====================================================
       TAVILY SUMMARY
    ===================================================== */

    const tavilySummary =
      Array.from(
        new Set(tavilyAnswers)
      ).join("\n\n");

    /* =====================================================
       FULL RESEARCH REPORT
    ===================================================== */

    const finalResearch = [
      `Product: ${productName}`,

      brand
        ? `Brand: ${brand}`
        : "",

      category
        ? `Category: ${category}`
        : "",

      price
        ? `Current Price: ${price}`
        : "",

      "",

      "Product Identity:",

      productIdentity,

      "",

      "Tavily Research Summary:",

      tavilySummary ||
        "No summary was returned.",

      "",

      "Web Sources:",

      researchText,
    ]
      .filter(
        (item) =>
          item !== ""
      )
      .join("\n");

    /* =====================================================
       SOURCE TEXT
    ===================================================== */

    const sourceText =
      uniqueSources
        .map(
          (source) =>
            `${source.title || "Source"}\n${
              source.url || ""
            }`
        )
        .join("\n\n");

    /* =====================================================
       SAVE TO SUPABASE
    ===================================================== */

    const {
      error: updateError,
    } = await supabase
      .from("products")
      .update({
        anantago_research:
          finalResearch,

        anantago_sources:
          sourceText,

        anantago_analysis_status:
          "generated",

        anantago_researched_at:
          new Date().toISOString(),
      })
      .eq("id", productId);

    if (updateError) {
      console.error(
        "Research save error:",
        updateError
      );

      await supabase
        .from("products")
        .update({
          anantago_analysis_status:
            "research_failed",
        })
        .eq("id", productId);

      throw new Error(
        updateError.message
      );
    }

    /* =====================================================
       RETURN RESULT
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "AnantaGo web research completed successfully.",

        analysis: {
          research:
            finalResearch,

          sources:
            uniqueSources.map(
              (source) => ({
                title:
                  source.title ||
                  "",
                url:
                  source.url ||
                  "",
              })
            ),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "AnantaGo research error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Research failed";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}