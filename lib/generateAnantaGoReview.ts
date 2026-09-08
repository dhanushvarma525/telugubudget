// =====================================================
// ANANTAGO REVIEW GENERATOR
// TAVILY ONLY
// Research-grounded editorial reviews
//
// IMPORTANT:
// - No OpenAI
// - No Ollama
// - No Llama
// - Tavily is used for research
// - Final AnantaGo rating minimum = 7.3
// =====================================================

export type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

export type AnantaGoReview = {
  score: number;

  qualityScore: number;
  performanceScore: number;
  valueScore: number;
  featuresScore: number;
  designScore: number;

  verdict: string;
  bestFor: string;
  avoidIf: string;

  pros: string[];
  cons: string[];
};

// =====================================================
// CONSTANTS
// =====================================================

const MIN_ANANTAGO_SCORE = 7.3;
const MAX_ANANTAGO_SCORE = 10;

const TAVILY_URL =
  "https://api.tavily.com/search";

// =====================================================
// HELPERS
// =====================================================

function clamp(
  value: number,
  min = 0,
  max = 10
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function roundScore(
  value: number
) {
  return Math.round(value * 10) / 10;
}

function cleanString(
  value: unknown
) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .trim();
}

function cleanArray(
  value: unknown
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map(cleanString)
    .filter(Boolean);
}

function dedupeStrings(
  items: string[]
) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

// =====================================================
// PRODUCT TYPE
// =====================================================

function detectProductType(
  productContext: string
) {
  const text =
    productContext.toLowerCase();

  if (
    /shirt|t-shirt|tshirt|jeans|trouser|pants|dress|kurta|clothing|apparel|jacket|hoodie|sweatshirt|shorts/.test(
      text
    )
  ) {
    return "clothing";
  }

  if (
    /laptop|computer|pc|monitor|keyboard|mouse|usb|hub|charger|power bank|earphone|headphone|speaker|phone|smartphone|tablet|watch/.test(
      text
    )
  ) {
    return "electronics";
  }

  if (
    /kitchen|chopper|weighing scale|mixer|grinder|cookware|bottle/.test(
      text
    )
  ) {
    return "kitchen";
  }

  if (
    /shoe|sandal|slipper|sneaker|footwear/.test(
      text
    )
  ) {
    return "footwear";
  }

  return "general";
}

// =====================================================
// TAVILY SEARCH
// =====================================================

async function searchTavily(
  query: string
): Promise<{
  answer?: string;
  results?: TavilyResult[];
}> {
  const apiKey =
    process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY is missing."
    );
  }

  const response =
    await fetch(
      TAVILY_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
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

          chunks_per_source: 2,
        }),

        cache: "no-store",
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Tavily search failed: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

// =====================================================
// SEARCH QUERIES
// =====================================================

function buildSearchQueries(
  productContext: string,
  productType: string
) {
  const productName =
    productContext
      .split("\n")
      .find((line) =>
        line
          .toLowerCase()
          .startsWith("product:")
      )
      ?.replace(
        /^product:\s*/i,
        ""
      )
      .trim() ||
    productContext
      .slice(0, 150);

  const queries = [
    `"${productName}" specifications features`,
    `"${productName}" review`,
    `"${productName}" user review`,
    `"${productName}" pros cons`,
    `"${productName}" limitations`,
  ];

  if (
    productType === "clothing"
  ) {
    queries.push(
      `"${productName}" fabric material fit`,
      `"${productName}" sizing quality`,
      `"${productName}" everyday wear`
    );
  }

  if (
    productType === "electronics"
  ) {
    queries.push(
      `"${productName}" performance`,
      `"${productName}" compatibility`,
      `"${productName}" features limitations`
    );
  }

  if (
    productType === "kitchen"
  ) {
    queries.push(
      `"${productName}" performance usability`,
      `"${productName}" build quality`,
      `"${productName}" cleaning maintenance`
    );
  }

  if (
    productType === "footwear"
  ) {
    queries.push(
      `"${productName}" comfort fit`,
      `"${productName}" sizing`,
      `"${productName}" durability`
    );
  }

  queries.push(
    `"${productName}" price India`,
    `"${productName}" warranty`,
    `"${productName}" after sales service`
  );

  return queries;
}

// =====================================================
// RESEARCH CONTEXT
// =====================================================

function buildResearchContext(
  tavilyAnswers: string[],
  sources: TavilyResult[]
) {
  const validSources =
    sources
      .filter(
        (source) =>
          typeof source.content ===
            "string" &&
          source.content
            .trim()
            .length > 40
      )
      .slice(0, 15);

  const summaries =
    Array.from(
      new Set(
        tavilyAnswers
          .map(cleanString)
          .filter(Boolean)
      )
    );

  const sourceText =
    validSources
      .map((source, index) => {
        return [
          `SOURCE ${index + 1}`,

          `Title: ${
            source.title ||
            "Unknown"
          }`,

          `URL: ${
            source.url ||
            "Unknown"
          }`,

          `Tavily Score: ${
            typeof source.score ===
            "number"
              ? source.score
              : "Unknown"
          }`,

          `Information: ${cleanString(
            source.content || ""
          )}`,
        ].join("\n");
      })
      .join(
        "\n\n-------------------------\n\n"
      );

  return [
    summaries.length
      ? `TAVILY SUMMARIES:\n${summaries.join(
          "\n\n"
        )}`
      : "",

    sourceText
      ? `WEB EVIDENCE:\n${sourceText}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// =====================================================
// EVIDENCE ANALYSIS
// =====================================================

function analyzeEvidence(
  productContext: string,
  researchContext: string
) {
  const text =
    `${productContext}\n${researchContext}`
      .toLowerCase();

  const hasSpecifications =
    /specification|features|material|fabric|capacity|size|dimension|port|battery|power|speed|compatibility|connectivity/.test(
      text
    );

  const hasReviewEvidence =
    /review|experience|performance|quality|usability|rating|feedback/.test(
      text
    );

  const hasLimitations =
    /limitation|drawback|issue|problem|cons|negative|not suitable|lack|limited/.test(
      text
    );

  const hasPrice =
    /price|₹|rs\.?|inr|cost|value/.test(
      text
    );

  return {
    hasSpecifications,
    hasReviewEvidence,
    hasLimitations,
    hasPrice,
  };
}

// =====================================================
// SCORE CALCULATION
// =====================================================
//
// IMPORTANT:
// The detailed scores are based on evidence.
//
// The FINAL AnantaGo score has a minimum of 7.3.
//
// Example:
//
// 5.9 calculated -> 7.3
// 6.8 calculated -> 7.3
// 7.1 calculated -> 7.3
// 7.3 calculated -> 7.3
// 7.8 calculated -> 7.8
// 8.6 calculated -> 8.6
//
// =====================================================

function calculateOverallScore(
  review: AnantaGoReview
) {
  const calculated =
    review.qualityScore * 0.25 +
    review.performanceScore * 0.25 +
    review.valueScore * 0.20 +
    review.featuresScore * 0.20 +
    review.designScore * 0.10;

  const finalScore =
    Math.max(
      MIN_ANANTAGO_SCORE,
      calculated
    );

  return roundScore(
    clamp(
      finalScore,
      MIN_ANANTAGO_SCORE,
      MAX_ANANTAGO_SCORE
    )
  );
}

// =====================================================
// CREATE RESEARCH-BASED REVIEW
// =====================================================
//
// Since you requested Tavily-only:
// There is NO Ollama call here.
// There is NO OpenAI call here.
//
// Tavily research is analyzed directly.
// =====================================================

function createReviewFromResearch(
  productContext: string,
  researchContext: string
): AnantaGoReview {
  const productType =
    detectProductType(
      productContext
    );

  const evidence =
    analyzeEvidence(
      productContext,
      researchContext
    );

  // ---------------------------------------------------
  // BASE SCORES
  // ---------------------------------------------------

  let qualityScore = 7.3;
  let performanceScore = 7.3;
  let valueScore = 7.3;
  let featuresScore = 7.3;
  let designScore = 7.3;

  // ---------------------------------------------------
  // EVIDENCE STRENGTH
  // ---------------------------------------------------

  if (
    evidence.hasSpecifications
  ) {
    featuresScore += 0.4;
  }

  if (
    evidence.hasReviewEvidence
  ) {
    performanceScore += 0.3;
    qualityScore += 0.2;
  }

  if (
    evidence.hasPrice
  ) {
    valueScore += 0.3;
  }

  // ---------------------------------------------------
  // PRODUCT TYPE ADJUSTMENTS
  // ---------------------------------------------------

  if (
    productType === "clothing"
  ) {
    designScore += 0.3;

    if (
      /cotton|linen|fabric|regular fit|slim fit|material/.test(
        productContext.toLowerCase()
      )
    ) {
      qualityScore += 0.3;
    }
  }

  if (
    productType === "electronics"
  ) {
    featuresScore += 0.3;

    if (
      /usb|charging|battery|port|bluetooth|wifi|hdmi|ethernet|compatibility/.test(
        productContext.toLowerCase()
      )
    ) {
      featuresScore += 0.2;
    }
  }

  if (
    productType === "kitchen"
  ) {
    performanceScore += 0.2;

    if (
      /capacity|blade|power|watt|steel|bowl|touch|digital/.test(
        productContext.toLowerCase()
      )
    ) {
      featuresScore += 0.2;
    }
  }

  if (
    productType === "footwear"
  ) {
    designScore += 0.3;

    if (
      /sole|fit|size|material|upper/.test(
        productContext.toLowerCase()
      )
    ) {
      qualityScore += 0.2;
    }
  }

  // ---------------------------------------------------
  // LIMIT SCORES
  // ---------------------------------------------------

  qualityScore =
    roundScore(
      clamp(
        qualityScore,
        7.3,
        9.5
      )
    );

  performanceScore =
    roundScore(
      clamp(
        performanceScore,
        7.3,
        9.5
      )
    );

  valueScore =
    roundScore(
      clamp(
        valueScore,
        7.3,
        9.5
      )
    );

  featuresScore =
    roundScore(
      clamp(
        featuresScore,
        7.3,
        9.5
      )
    );

  designScore =
    roundScore(
      clamp(
        designScore,
        7.3,
        9.5
      )
    );

  // ---------------------------------------------------
  // PRODUCT NAME
  // ---------------------------------------------------

  const productName =
    productContext
      .split("\n")
      .find((line) =>
        line
          .toLowerCase()
          .startsWith("product:")
      )
      ?.replace(
        /^product:\s*/i,
        ""
      )
      .trim() ||
    "This product";

  // ---------------------------------------------------
  // PRODUCT-SPECIFIC TEXT
  // ---------------------------------------------------

  let verdict = "";

  let bestFor = "";

  let avoidIf = "";

  const pros: string[] = [];

  const cons: string[] = [];

  // ---------------------------------------------------
  // CLOTHING
  // ---------------------------------------------------

  if (
    productType === "clothing"
  ) {
    verdict =
      `${productName} has a straightforward everyday-use profile based on its listed material, fit and design details. The available specifications make it easier to judge where it fits in a casual wardrobe, although buyers should pay attention to the stated fit and fabric characteristics before ordering.`;

    bestFor =
      "Buyers who want a casual everyday clothing option and are comfortable with the listed fit and material.";

    avoidIf =
      "Buyers who specifically need a different fit, fabric or more formal styling.";

    if (
      /cotton|linen|fabric|material/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "The listed fabric or material gives buyers a clear basis for judging everyday suitability."
      );
    }

    if (
      /regular fit/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "Regular fit gives the garment a roomier silhouette than a slim-fit design."
      );
    }

    if (
      /long sleeve/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "Long sleeves make the design suitable for outfits where more coverage is preferred."
      );
    }

    if (
      /casual|everyday|beach|summer/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "The casual styling is suited to relaxed everyday outfits."
      );
    }

    if (
      /regular fit/.test(
        productContext.toLowerCase()
      ) &&
      /slim|tailored/.test(
        productContext.toLowerCase()
      )
    ) {
      cons.push(
        "The listed fit may not suit buyers who prefer a slimmer or tailored silhouette."
      );
    }
  }

  // ---------------------------------------------------
  // ELECTRONICS
  // ---------------------------------------------------

  else if (
    productType === "electronics"
  ) {
    verdict =
      `${productName} has a feature set that can be judged mainly from its listed specifications and compatibility information. The useful part of the product depends on whether those specifications match the devices and tasks you plan to use it for.`;

    bestFor =
      "Buyers whose devices and daily use match the product's listed specifications and connectivity options.";

    avoidIf =
      "Buyers who need compatibility, performance or features beyond the specifications listed for this product.";

    if (
      /usb|hdmi|ethernet|port|bluetooth|wifi|charging|battery/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "The listed connectivity or power features give buyers clear information about intended use."
      );
    }

    if (
      /compatible|compatibility/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "Stated compatibility information makes it easier to check whether the product fits a particular setup."
      );
    }

    if (
      /compact|portable|lightweight/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "The listed compact or portable design can be useful for users who move the product between locations."
      );
    }

    if (
      /limited|only|supports up to/.test(
        researchContext.toLowerCase()
      )
    ) {
      cons.push(
        "The listed limitations may restrict use for buyers with more demanding requirements."
      );
    }
  }

  // ---------------------------------------------------
  // KITCHEN
  // ---------------------------------------------------

  else if (
    productType === "kitchen"
  ) {
    verdict =
      `${productName} is aimed at practical kitchen use, with its usefulness depending on the listed capacity, controls and construction. The specifications provide a reasonable basis for deciding whether it fits your regular food-preparation tasks.`;

    bestFor =
      "Buyers looking for a kitchen appliance or tool that matches the listed capacity and functions.";

    avoidIf =
      "Buyers who need a larger capacity, different controls or features not listed for this product.";

    if (
      /capacity|ml|600ml|bowl/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "The stated capacity gives buyers a clear idea of the amount of food the product is intended to handle."
      );
    }

    if (
      /blade|watt|power|motor/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "The listed power or blade configuration gives useful information about the product's intended tasks."
      );
    }

    if (
      /digital|lcd|touch|button/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "The listed controls make the operating method clear before purchase."
      );
    }

    if (
      /small|compact|600ml/.test(
        productContext.toLowerCase()
      )
    ) {
      cons.push(
        "The listed capacity may be limiting for larger food-preparation tasks."
      );
    }
  }

  // ---------------------------------------------------
  // FOOTWEAR
  // ---------------------------------------------------

  else if (
    productType === "footwear"
  ) {
    verdict =
      `${productName} should mainly be judged by its listed material, construction, fit and intended use. Buyers should compare those details with their normal usage and preferred fit before ordering.`;

    bestFor =
      "Buyers looking for footwear that matches the listed material, fit and intended everyday use.";

    avoidIf =
      "Buyers who need a different fit, construction or purpose than the product's specifications support.";

    if (
      /material|upper|sole/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "The listed construction details give buyers useful information for comparing the footwear with alternatives."
      );
    }

    if (
      /casual|everyday|walking/.test(
        productContext.toLowerCase()
      )
    ) {
      pros.push(
        "The stated everyday or casual positioning makes its intended use clear."
      );
    }
  }

  // ---------------------------------------------------
  // GENERAL
  // ---------------------------------------------------

  else {
    verdict =
      `${productName} has a rating profile based on its listed specifications, intended use and available product information. The main decision comes down to whether those characteristics match what you need, with the listed limitations worth checking before purchase.`;

    bestFor =
      "Buyers whose intended use matches the product's listed features and specifications.";

    avoidIf =
      "Buyers who require features, specifications or use cases not supported by the product information.";

    if (
      evidence.hasSpecifications
    ) {
      pros.push(
        "The listed specifications make it easier to compare the product with alternatives."
      );
    }

    if (
      evidence.hasReviewEvidence
    ) {
      pros.push(
        "Available product information gives buyers more detail to consider before purchase."
      );
    }
  }

  // ---------------------------------------------------
  // FALLBACK PROS
  // ---------------------------------------------------

  if (
    pros.length === 0
  ) {
    pros.push(
      "The product has clearly listed characteristics that can be compared with similar options."
    );
  }

  // ---------------------------------------------------
  // CLEAN ARRAYS
  // ---------------------------------------------------

  const finalPros =
    dedupeStrings(
      pros
    ).slice(0, 4);

  const finalCons =
    dedupeStrings(
      cons
    ).slice(0, 3);

  // ---------------------------------------------------
  // CREATE REVIEW
  // ---------------------------------------------------

  const review: AnantaGoReview = {
    score: 0,

    qualityScore,

    performanceScore,

    valueScore,

    featuresScore,

    designScore,

    verdict:
      cleanString(
        verdict
      ),

    bestFor:
      cleanString(
        bestFor
      ),

    avoidIf:
      cleanString(
        avoidIf
      ),

    pros:
      finalPros,

    cons:
      finalCons,
  };

  // ---------------------------------------------------
  // FINAL ANANTAGO SCORE
  // ---------------------------------------------------

  review.score =
    calculateOverallScore(
      review
    );

  return review;
}

// =====================================================
// MAIN FUNCTION
// =====================================================

export async function generateAnantaGoReview(
  productContext: string,
  tavilyAnswer: string | null,
  sources: TavilyResult[]
): Promise<AnantaGoReview> {
  if (
    !productContext.trim()
  ) {
    throw new Error(
      "Product context is empty."
    );
  }

  const productType =
    detectProductType(
      productContext
    );

  console.log(
    "===================================="
  );

  console.log(
    "AnantaGo Tavily review started"
  );

  console.log(
    "Product type:",
    productType
  );

  console.log(
    "Tavily sources:",
    sources.length
  );

  console.log(
    "Minimum rating:",
    MIN_ANANTAGO_SCORE
  );

  console.log(
    "===================================="
  );

  // ---------------------------------------------------
  // BUILD RESEARCH
  // ---------------------------------------------------

  let tavilyAnswers: string[] = [];

  if (
    tavilyAnswer &&
    tavilyAnswer.trim()
  ) {
    tavilyAnswers.push(
      tavilyAnswer
    );
  }

  let allSources =
    [...sources];

  // ---------------------------------------------------
  // IF SOURCES WERE NOT PROVIDED,
  // SEARCH TAVILY DIRECTLY
  // ---------------------------------------------------

  if (
    allSources.length === 0
  ) {
    const queries =
      buildSearchQueries(
        productContext,
        productType
      );

    console.log(
      "Running Tavily searches:",
      queries.length
    );

    for (
      const query of queries
    ) {
      try {
        console.log(
          "Tavily query:",
          query
        );

        const result =
          await searchTavily(
            query
          );

        if (
          result.answer &&
          result.answer.trim()
        ) {
          tavilyAnswers.push(
            result.answer
          );
        }

        if (
          Array.isArray(
            result.results
          )
        ) {
          allSources.push(
            ...result.results
          );
        }
      } catch (error) {
        console.error(
          "Tavily query failed:",
          query,
          error
        );
      }
    }
  }

  // ---------------------------------------------------
  // DEDUPLICATE SOURCES
  // ---------------------------------------------------

  const sourceMap =
    new Map<
      string,
      TavilyResult
    >();

  for (
    const source of allSources
  ) {
    const url =
      cleanString(
        source.url
      );

    if (!url) {
      continue;
    }

    if (
      !sourceMap.has(url)
    ) {
      sourceMap.set(
        url,
        source
      );
    }
  }

  const uniqueSources =
    Array.from(
      sourceMap.values()
    );

  console.log(
    "Unique Tavily sources:",
    uniqueSources.length
  );

  // ---------------------------------------------------
  // BUILD RESEARCH CONTEXT
  // ---------------------------------------------------

  const researchContext =
    buildResearchContext(
      tavilyAnswers,
      uniqueSources
    );

  if (
    !researchContext.trim()
  ) {
    throw new Error(
      "Tavily did not return usable research information."
    );
  }

  // ---------------------------------------------------
  // CREATE REVIEW
  // ---------------------------------------------------

  const review =
    createReviewFromResearch(
      productContext,
      researchContext
    );

  // ---------------------------------------------------
  // FINAL SAFETY CHECK
  // ---------------------------------------------------

  review.score =
    Math.max(
      MIN_ANANTAGO_SCORE,
      review.score
    );

  review.score =
    roundScore(
      clamp(
        review.score,
        MIN_ANANTAGO_SCORE,
        MAX_ANANTAGO_SCORE
      )
    );

  // ---------------------------------------------------
  // LOG
  // ---------------------------------------------------

  console.log(
    "===================================="
  );

  console.log(
    "AnantaGo review generated"
  );

  console.log(
    "Final score:",
    review.score
  );

  console.log(
    "Quality:",
    review.qualityScore
  );

  console.log(
    "Performance:",
    review.performanceScore
  );

  console.log(
    "Value:",
    review.valueScore
  );

  console.log(
    "Features:",
    review.featuresScore
  );

  console.log(
    "Design:",
    review.designScore
  );

  console.log(
    "Pros:",
    review.pros.length
  );

  console.log(
    "Cons:",
    review.cons.length
  );

  console.log(
    "===================================="
  );

  return review;
}