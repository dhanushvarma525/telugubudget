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
   HELPERS
========================================================= */

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/* =========================================================
   PRODUCT TYPE
========================================================= */

function detectProductType(
  productName: string,
  category: string,
  description: string,
  features: string
) {
  const text = normalizeText(
    `${productName} ${category} ${description} ${features}`
  ).toLowerCase();

  if (
    /\bshirt\b|\bt-shirt\b|\btshirt\b|\bjeans\b|\btrouser\b|\bpants\b|\bdress\b|\bkurta\b|\bhoodie\b|\bjacket\b|\bapparel\b|\bclothing\b|\bwear\b|\bsweatshirt\b|\bshorts\b/.test(
      text
    )
  ) {
    return "clothing";
  }

  if (
    /\bphone\b|\bsmartphone\b|\bmobile\b|\btablet\b|\blaptop\b|\bcomputer\b|\bmonitor\b|\bkeyboard\b|\bmouse\b/.test(
      text
    )
  ) {
    return "electronics";
  }

  if (
    /\bheadphone\b|\bearphone\b|\bearbuds\b|\bneckband\b|\bspeaker\b/.test(
      text
    )
  ) {
    return "audio";
  }

  if (
    /\bpower bank\b|\bcharger\b|\badapter\b|\bhub\b|\bcable\b|\bpower strip\b/.test(
      text
    )
  ) {
    return "accessory";
  }

  if (
    /\bscale\b|\bchopper\b|\bmixer\b|\bgrinder\b|\bkettle\b|\bblender\b|\bcookware\b|\bkitchen\b/.test(
      text
    )
  ) {
    return "kitchen";
  }

  if (
    /\bwatch\b|\bsmartwatch\b|\bfitness band\b|\bsmart band\b/.test(
      text
    )
  ) {
    return "wearable";
  }

  if (
    /\bshoe\b|\bsandal\b|\bslipper\b|\bsneaker\b|\bfootwear\b/.test(
      text
    )
  ) {
    return "footwear";
  }

  return "general";
}

/* =========================================================
   TAVILY SEARCH
========================================================= */

async function searchWeb(
  query: string
): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is missing.");
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

        max_results: 8,

        include_answer: true,
        include_raw_content: false,
        include_images: false,

        chunks_per_source: 3,
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
   SEARCH QUERIES
========================================================= */

function buildSearchQueries(
  brand: string,
  productName: string,
  productType: string
) {
  const product = `"${brand} ${productName}"`;

  const commonQueries = [
    `${product} official specifications features`,
    `${product} detailed review`,
    `${product} user experience review`,
    `${product} limitations drawbacks`,
  ];

  const categoryQueries: Record<string, string[]> = {
    clothing: [
      `${product} fabric material fit comfort review`,
      `${product} sizing fit quality review`,
      `${product} casual everyday wear review`,
    ],

    electronics: [
      `${product} performance benchmark review`,
      `${product} real world performance issues`,
      `${product} features compatibility limitations`,
    ],

    audio: [
      `${product} sound quality comfort battery review`,
      `${product} microphone connectivity issues`,
      `${product} user experience review`,
    ],

    accessory: [
      `${product} compatibility performance review`,
      `${product} ports charging transfer speed review`,
      `${product} limitations compatibility issues`,
    ],

    kitchen: [
      `${product} performance ease of use review`,
      `${product} build quality durability review`,
      `${product} cleaning usability limitations`,
    ],

    wearable: [
      `${product} accuracy battery comfort review`,
      `${product} features real world performance`,
      `${product} limitations user experience`,
    ],

    footwear: [
      `${product} comfort fit quality review`,
      `${product} sizing durability review`,
      `${product} everyday use review`,
    ],

    general: [
      `${product} quality performance usability review`,
      `${product} strengths weaknesses review`,
      `${product} real world user experience`,
    ],
  };

  return [
    ...commonQueries,
    ...(categoryQueries[productType] ||
      categoryQueries.general),

    `${product} warranty after sales support`,
    `${product} price value for money India`,
  ];
}

/* =========================================================
   SOURCE QUALITY
========================================================= */

function sourcePriority(source: SearchResult) {
  const url = source.url || "";

  let domain = "";

  try {
    domain = new URL(url)
      .hostname
      .toLowerCase();
  } catch {
    return 0.5;
  }

  if (
    domain.includes("rtings.com") ||
    domain.includes("techradar.com") ||
    domain.includes("tomsguide.com") ||
    domain.includes("pcmag.com") ||
    domain.includes("trustedreviews.com") ||
    domain.includes("gsmarena.com") ||
    domain.includes("91mobiles.com")
  ) {
    return 1;
  }

  if (
    domain.includes("amazon.") ||
    domain.includes("flipkart.")
  ) {
    return 0.9;
  }

  if (
    domain.includes("reddit.com") ||
    domain.includes("quora.com")
  ) {
    return 0.65;
  }

  return 0.75;
}

/* =========================================================
   SOURCE SCORE
========================================================= */

function calculateSourceScore(source: SearchResult) {
  const tavilyScore =
    typeof source.score === "number"
      ? Math.max(0, Math.min(1, source.score))
      : 0.5;

  const quality = sourcePriority(source);

  return tavilyScore * 0.7 + quality * 0.3;
}

/* =========================================================
   DEDUPLICATE SOURCES
========================================================= */

function deduplicateSources(
  sources: SearchResult[]
) {
  const map = new Map<string, SearchResult>();

  for (const source of sources) {
    if (!source.url) {
      continue;
    }

    const url = source.url.trim();

    if (!url) {
      continue;
    }

    const existing = map.get(url);

    if (!existing) {
      map.set(url, source);
      continue;
    }

    const existingScore =
      typeof existing.score === "number"
        ? existing.score
        : 0;

    const newScore =
      typeof source.score === "number"
        ? source.score
        : 0;

    if (newScore > existingScore) {
      map.set(url, source);
    }
  }

  return Array.from(map.values());
}

/* =========================================================
   SELECT BEST SOURCES
========================================================= */

function selectBestSources(
  sources: SearchResult[],
  limit = 20
) {
  return sources
    .filter(
      (source) =>
        source.url &&
        source.content &&
        source.content.trim().length >= 80
    )
    .map((source) => ({
      source,

      calculatedScore:
        calculateSourceScore(source),
    }))
    .sort(
      (a, b) =>
        b.calculatedScore -
        a.calculatedScore
    )
    .slice(0, limit)
    .map((item) => item.source);
}

/* =========================================================
   BUILD RESEARCH
========================================================= */

function buildResearchText(
  productName: string,
  brand: string,
  category: string,
  price: string,
  productType: string,
  tavilyAnswers: string[],
  sources: SearchResult[]
) {
  const summaries = Array.from(
    new Set(
      tavilyAnswers
        .map(normalizeText)
        .filter(Boolean)
    )
  );

  const sourceSections = sources.map(
    (source, index) => {
      return [
        `SOURCE ${index + 1}`,

        `Title: ${
          source.title || "Unknown"
        }`,

        `URL: ${
          source.url || "Unknown"
        }`,

        `Tavily relevance: ${
          typeof source.score === "number"
            ? source.score.toFixed(3)
            : "unknown"
        }`,

        "Information:",

        normalizeText(
          source.content || ""
        ),
      ].join("\n");
    }
  );

  return [
    "ANANTAGO RESEARCH DATA",

    `Product: ${productName}`,

    brand ? `Brand: ${brand}` : "",

    category ? `Category: ${category}` : "",

    price ? `Current Price: ₹${price}` : "",

    `Detected Product Type: ${productType}`,

    "",

    "TAVILY RESEARCH SUMMARIES",

    summaries.length
      ? summaries.join("\n\n")
      : "No Tavily summary available.",

    "",

    "WEB EVIDENCE",

    sourceSections.join(
      "\n\n------------------------------\n\n"
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
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
          message: "Product ID is required.",
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
          message: "Invalid product ID.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       TAVILY KEY
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
          message: productError.message,
        },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
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

    const productName = String(
      product.name || ""
    ).trim();

    const brand = String(
      product.brand || ""
    ).trim();

    const category = String(
      product.category || ""
    ).trim();

    const description = String(
      product.description || ""
    ).trim();

    const features = String(
      product.features || ""
    ).trim();

    const price = String(
      product.price || ""
    ).trim();

    /* =====================================================
       PRODUCT TYPE
    ===================================================== */

    const productType =
      detectProductType(
        productName,
        category,
        description,
        features
      );

    /* =====================================================
       PRODUCT CONTEXT
    ===================================================== */

    const productContext = [
      `Product: ${productName}`,

      brand ? `Brand: ${brand}` : "",

      category ? `Category: ${category}` : "",

      price ? `Current Price: ₹${price}` : "",

      description
        ? `Description: ${description}`
        : "",

      features
        ? `Features: ${features}`
        : "",

      `Detected Product Type: ${productType}`,
    ]
      .filter(Boolean)
      .join("\n");

    /* =====================================================
       SEARCH QUERIES
    ===================================================== */

    const queries =
      buildSearchQueries(
        brand,
        productName,
        productType
      );

    console.log(
      "===================================="
    );

    console.log(
      "AnantaGo research started"
    );

    console.log(
      "Product:",
      productName
    );

    console.log(
      "Product type:",
      productType
    );

    console.log(
      "Search queries:",
      queries
    );

    console.log(
      "===================================="
    );

    /* =====================================================
       TAVILY SEARCH
    ===================================================== */

    const searchResults: SearchResult[] = [];

    const tavilyAnswers: string[] = [];

    for (const query of queries) {
      try {
        console.log(
          "Tavily search:",
          query
        );

        const result =
          await searchWeb(query);

        if (
          result.answer &&
          result.answer.trim()
        ) {
          tavilyAnswers.push(
            result.answer.trim()
          );
        }

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
          `Tavily search failed: ${query}`,
          error
        );
      }
    }

    /* =====================================================
       DEDUPLICATE
    ===================================================== */

    const uniqueSources =
      deduplicateSources(
        searchResults
      );

    console.log(
      `Tavily returned ${uniqueSources.length} unique sources.`
    );

    /* =====================================================
       SELECT BEST SOURCES
    ===================================================== */

    const selectedSources =
      selectBestSources(
        uniqueSources,
        20
      );

    console.log(
      `Selected ${selectedSources.length} research sources.`
    );

    /* =====================================================
       NO SOURCES
    ===================================================== */

    if (
      selectedSources.length === 0
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
            "No useful web research results were found.",
        },
        { status: 422 }
      );
    }

    /* =====================================================
       BUILD RESEARCH
    ===================================================== */

    const finalResearch =
      buildResearchText(
        productName,
        brand,
        category,
        price,
        productType,
        tavilyAnswers,
        selectedSources
      );

    /* =====================================================
       SOURCE TEXT
    ===================================================== */

    const sourceText =
      selectedSources
        .map((source) =>
          [
            source.title || "Source",

            source.url || "",

            typeof source.score === "number"
              ? `Tavily Score: ${source.score}`
              : "",
          ]
            .filter(Boolean)
            .join("\n")
        )
        .join("\n\n");

    /* =====================================================
       SAVE RESEARCH
    ===================================================== */

    const {
      error: researchSaveError,
    } = await supabase
      .from("products")
      .update({
        anantago_research:
          finalResearch,

        anantago_sources:
          sourceText,

        anantago_analysis_status:
          "research_completed",

        anantago_researched_at:
          new Date().toISOString(),
      })
      .eq("id", productId);

    if (researchSaveError) {
      console.error(
        "Research save error:",
        researchSaveError
      );

      await supabase
        .from("products")
        .update({
          anantago_analysis_status:
            "research_failed",
        })
        .eq("id", productId);

      throw new Error(
        researchSaveError.message
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
      "===================================="
    );

    console.log(
      "AnantaGo research completed"
    );

    console.log(
      "Sources:",
      selectedSources.length
    );

    console.log(
      "===================================="
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "AnantaGo product research completed successfully.",

        analysis: {
          productId,

          productName,

          productType,

          sourceCount:
            selectedSources.length,

          research:
            finalResearch,

          sources:
            selectedSources.map(
              (source) => ({
                title:
                  source.title || "",

                url:
                  source.url || "",

                score:
                  source.score ?? null,
              })
            ),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "===================================="
    );

    console.error(
      "AnantaGo research error:",
      error
    );

    console.error(
      "===================================="
    );

    const message =
      error instanceof Error
        ? error.message
        : "Research failed.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}