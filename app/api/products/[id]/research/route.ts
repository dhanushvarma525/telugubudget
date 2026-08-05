import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type SearchResult = {
  title?: string;
  url?: string;
  content?: string;
};

async function searchWeb(query: string) {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is missing");
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
        include_answer: false,
        include_raw_content: false,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Tavily search failed: ${text}`
    );
  }

  return await response.json();
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 1. GET PRODUCT
    // ==========================================

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 2. CHECK API KEYS
    // ==========================================

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OPENAI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

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

    // ==========================================
    // 3. MARK AS RESEARCHING
    // ==========================================

    await supabase
      .from("products")
      .update({
        anantago_analysis_status: "researching",
      })
      .eq("id", id);

    // ==========================================
    // 4. BUILD PRODUCT IDENTITY
    // ==========================================

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

    const productIdentity = [
      brand,
      productName,
      category,
      features,
    ]
      .filter(Boolean)
      .join(" ");

    // ==========================================
    // 5. SEARCH THE WEB
    // ==========================================

    const queries = [
      `"${brand} ${productName}" official specifications`,
      `"${brand} ${productName}" review`,
      `"${brand} ${productName}" problems cons`,
      `"${brand} ${productName}" warranty`,
    ];

    const searchResults: SearchResult[] = [];

    for (const query of queries) {
      try {
        const result = await searchWeb(query);

        if (Array.isArray(result.results)) {
          searchResults.push(
            ...result.results
          );
        }
      } catch (searchError) {
        console.error(
          "Search failed:",
          searchError
        );
      }
    }

    // ==========================================
    // 6. REMOVE DUPLICATE SOURCES
    // ==========================================

    const uniqueSources = Array.from(
      new Map(
        searchResults
          .filter((item) => item.url)
          .map((item) => [
            item.url,
            item,
          ])
      ).values()
    ).slice(0, 15);

    // ==========================================
    // 7. MAKE RESEARCH PACK
    // ==========================================

    const researchPack =
      uniqueSources
        .map(
          (source, index) => `
SOURCE ${index + 1}

Title:
${source.title || "Unknown"}

URL:
${source.url || "Unknown"}

Information:
${source.content || "No content available"}
`
        )
        .join("\n");

    // ==========================================
    // 8. REQUIRE REAL SOURCES
    // ==========================================

    if (uniqueSources.length === 0) {
      await supabase
        .from("products")
        .update({
          anantago_analysis_status:
            "research_failed",
        })
        .eq("id", id);

      return NextResponse.json(
        {
          success: false,
          message:
            "No reliable web research results were found. Analysis was not generated.",
        },
        { status: 422 }
      );
    }

    // ==========================================
    // 9. ASK AI TO ANALYZE THE RESEARCH
    // ==========================================

    const prompt = `
You are the product research analyst for AnantaGo.

Your job is NOT to invent product information.

You have been given:
1. Product information from our database.
2. Search results from the live web.

Create an honest, useful, product-specific AnantaGo analysis.

IMPORTANT RULES:

- Do not claim AnantaGo physically tested the product.
- Do not invent specifications.
- Do not invent battery life, durability, performance, quality, warranty,
  features, or customer complaints.
- Do not treat marketplace marketing claims as independently verified facts.
- If something cannot be verified, say so.
- Use the provided research sources as evidence.
- Prefer official manufacturer information for specifications.
- Use independent reviews for real-world observations.
- Do not copy large portions of source text.
- Do not create generic Pros and Cons.
- Pros and Cons must be specific to this exact product.
- The score must be based on the available evidence.
- A product does NOT need comparison with another product.
- Do not manufacture a competitor comparison.
- Be especially careful with price because prices change.
- Never say "we tested" or "we used" the product.

PRODUCT DATABASE INFORMATION:

Product:
${productName}

Brand:
${brand}

Category:
${category}

Price:
${price}

Description:
${description}

Features:
${features}

SEARCHED PRODUCT IDENTITY:
${productIdentity}

WEB RESEARCH:

${researchPack}

Return ONLY valid JSON.

Use exactly this structure:

{
  "score": 0,
  "pros": [
    "specific product-related advantage"
  ],
  "cons": [
    "specific product-related limitation"
  ],
  "best_for": "specific type of buyer",
  "not_ideal_for": "specific type of buyer",
  "value": "Excellent / Good / Fair / Poor",
  "verdict": "A concise evidence-based AnantaGo verdict.",
  "research": "Short explanation of what was verified and what remains uncertain."
}

SCORING:

Give a score from 1.0 to 10.0.

Consider:
- Features
- Specifications
- Price/value
- Warranty when verified
- Product suitability
- Evidence from reputable sources
- Known limitations

Do not automatically give high scores.

If evidence is weak, make the analysis more cautious.
`;

    const completion =
      await openai.chat.completions.create({
        model: "gpt-5-mini",

        response_format: {
          type: "json_object",
        },

        messages: [
          {
            role: "system",
            content:
              "You are a careful product research analyst. Never invent facts.",
          },

          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const content =
      completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error(
        "AI returned no analysis"
      );
    }

    const analysis =
      JSON.parse(content);

    // ==========================================
    // 10. VALIDATE BASIC OUTPUT
    // ==========================================

    const score =
      Number(analysis.score);

    if (
      Number.isNaN(score) ||
      score < 1 ||
      score > 10
    ) {
      throw new Error(
        "AI returned an invalid score"
      );
    }

    // ==========================================
    // 11. SAVE ANALYSIS
    // ==========================================

    const sourceText =
      uniqueSources
        .map(
          (source) =>
            `${source.title || "Source"}\n${source.url}`
        )
        .join("\n\n");

    const { error: updateError } =
      await supabase
        .from("products")
        .update({
          anantago_score: score,

          anantago_pros:
            Array.isArray(analysis.pros)
              ? analysis.pros.join("\n")
              : "",

          anantago_cons:
            Array.isArray(analysis.cons)
              ? analysis.cons.join("\n")
              : "",

          anantago_best_for:
            analysis.best_for || "",

          anantago_not_ideal_for:
            analysis.not_ideal_for || "",

          anantago_value:
            analysis.value || "",

          anantago_verdict:
            analysis.verdict || "",

          anantago_research:
            analysis.research || "",

          anantago_sources:
            sourceText,

          anantago_analysis_status:
            "generated",

          anantago_researched_at:
            new Date().toISOString(),
        })
        .eq("id", id);

    if (updateError) {
      throw new Error(
        updateError.message
      );
    }

    // ==========================================
    // 12. RETURN RESULT
    // ==========================================

    return NextResponse.json({
      success: true,

      message:
        "AnantaGo research completed successfully.",

      analysis: {
        score,

        pros:
          analysis.pros || [],

        cons:
          analysis.cons || [],

        best_for:
          analysis.best_for || "",

        not_ideal_for:
          analysis.not_ideal_for || "",

        value:
          analysis.value || "",

        verdict:
          analysis.verdict || "",

        research:
          analysis.research || "",

        sources:
          uniqueSources.map(
            (source) => ({
              title:
                source.title || "",
              url:
                source.url || "",
            })
          ),
      },
    });
  } catch (error) {
    console.error(
      "AnantaGo research error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Research failed",
      },
      { status: 500 }
    );
  }
}