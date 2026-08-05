
type ResearchSource = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type AnantaGoReview = {
  score: number;
  pros: string[];
  cons: string[];
  bestFor: string;
  avoidIf: string;
  verdict: string;
  researchSummary: string;
  sources: {
    title: string;
    url: string;
  }[];
};

/* =========================================================
   HELPERS
========================================================= */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function contains(text: string, words: string[]): boolean {
  const normalized = normalize(text);

  return words.some((word) =>
    normalized.includes(normalize(word))
  );
}

function addUnique(
  array: string[],
  value: string,
  max = 6
): void {
  const normalizedValue = normalize(value);

  const exists = array.some(
    (item) => normalize(item) === normalizedValue
  );

  if (!exists && array.length < max) {
    array.push(value);
  }
}

/* =========================================================
   PRODUCT TYPE DETECTION
========================================================= */

function detectProductType(text: string): string {
  if (
    contains(text, [
      "juicer",
      "mixer grinder",
      "blender",
      "smoothie maker",
      "food processor",
      "mixer",
      "grinder",
    ])
  ) {
    return "kitchen";
  }

  if (
    contains(text, [
      "power bank",
      "powerbank",
      "portable charger",
      "battery bank",
    ])
  ) {
    return "powerbank";
  }

  if (
    contains(text, [
      "backpack",
      "laptop bag",
      "travel bag",
      "school bag",
      "rucksack",
    ])
  ) {
    return "bag";
  }

  if (
    contains(text, [
      "earbuds",
      "earphone",
      "earphones",
      "headphone",
      "headphones",
      "headset",
    ])
  ) {
    return "audio";
  }

  if (
    contains(text, [
      "smartphone",
      "mobile phone",
      "android phone",
      "iphone",
    ])
  ) {
    return "phone";
  }

  if (
    contains(text, [
      "smartwatch",
      "smart watch",
      "fitness band",
      "smart band",
    ])
  ) {
    return "wearable";
  }

  if (
    contains(text, [
      "keyboard",
      "mouse",
      "webcam",
      "monitor",
      "laptop stand",
      "computer",
      "ssd",
      "hard drive",
    ])
  ) {
    return "computer";
  }

  if (
    contains(text, [
      "fan",
      "air cooler",
      "heater",
      "air purifier",
      "vacuum cleaner",
    ])
  ) {
    return "home-appliance";
  }

  if (
    contains(text, [
      "bottle",
      "water bottle",
      "flask",
      "thermos",
      "tumbler",
    ])
  ) {
    return "bottle";
  }

  if (
    contains(text, [
      "trimmer",
      "shaver",
      "grooming",
      "hair dryer",
      "hair straightener",
      "beard trimmer",
    ])
  ) {
    return "grooming";
  }

  if (
    contains(text, [
      "oil sprayer",
      "oil spray bottle",
      "kitchen dispenser",
      "oil dispenser",
    ])
  ) {
    return "kitchen-accessory";
  }

  return "general";
}

/* =========================================================
   MAIN REVIEW GENERATOR
========================================================= */

export function generateAnantaGoReview(
  productName: string,
  answer: string | null,
  sources: ResearchSource[]
): AnantaGoReview {
  const sourceText = sources
    .map((source) => source.content || "")
    .join("\n");

  const combinedText = normalize(
    `
    PRODUCT:
    ${productName}

    RESEARCH SUMMARY:
    ${answer || ""}

    SOURCES:
    ${sourceText}
    `
  );

  const productType = detectProductType(combinedText);

  const pros: string[] = [];
  const cons: string[] = [];

  /* =====================================================
     PORTABILITY
  ===================================================== */

  if (
    contains(combinedText, [
      "compact",
      "pocket-friendly",
      "pocket friendly",
      "lightweight",
      "portable",
      "travel-friendly",
      "travel friendly",
    ])
  ) {
    addUnique(
      pros,
      "Compact and portable design makes it convenient for everyday use and travel."
    );
  }

  /* =====================================================
     BUILD QUALITY
  ===================================================== */

  if (
    contains(combinedText, [
      "solid build",
      "sturdy",
      "durable",
      "build quality",
      "well built",
      "well-built",
      "premium build",
    ])
  ) {
    addUnique(
      pros,
      "Available reviews indicate that build quality is one of its stronger points."
    );
  }

  /* =====================================================
     FAST CHARGING
  ===================================================== */

  if (
    contains(combinedText, [
      "fast charging",
      "quick charge",
      "poweriq",
      "fast charge",
      "pd charging",
      "power delivery",
      "quick charging",
    ])
  ) {
    addUnique(
      pros,
      "Charging support is useful for users who want faster charging for compatible devices."
    );
  }

  /* =====================================================
     POWER BANK CAPACITY
  ===================================================== */

  if (
    contains(combinedText, [
      "10,000mah",
      "10000mah",
      "10,000 mah",
    ])
  ) {
    addUnique(
      pros,
      "The 10,000mAh capacity provides useful backup power for phones and compatible devices."
    );
  }

  if (
    contains(combinedText, [
      "20,000mah",
      "20000mah",
      "20,000 mah",
    ])
  ) {
    addUnique(
      pros,
      "The 20,000mAh capacity is useful for users who need extended portable battery backup."
    );
  }

  /* =====================================================
     USB-C
  ===================================================== */

  const hasModernUsbC = contains(combinedText, [
    "usb-c",
    "usb c",
    "type-c",
    "type c",
  ]);

  const hasOldUsb = contains(combinedText, [
    "no usb-c",
    "no usb c",
    "micro-usb",
    "micro usb",
  ]);

  if (hasModernUsbC && !hasOldUsb) {
    addUnique(
      pros,
      "USB-C connectivity improves convenience for users with newer devices and cables."
    );
  }

  if (hasOldUsb) {
    addUnique(
      cons,
      "The older charging-port setup may be less convenient if you prefer an all-USB-C setup."
    );
  }

  /* =====================================================
     MULTIPLE PORTS
  ===================================================== */

  if (
    contains(combinedText, [
      "multiple usb",
      "dual usb",
      "2 usb",
      "three usb",
      "3 usb",
      "multiple ports",
      "multiple charging ports",
    ])
  ) {
    addUnique(
      pros,
      "Multiple ports improve convenience when charging or connecting more than one device."
    );
  }

  if (
    contains(combinedText, [
      "single usb",
      "only 1 usb",
      "only one usb",
      "one usb port",
      "single usb-a",
    ])
  ) {
    addUnique(
      cons,
      "The limited number of ports makes simultaneous charging less convenient."
    );
  }

  /* =====================================================
     RECHARGE TIME
  ===================================================== */

  if (
    contains(combinedText, [
      "slow recharge",
      "slow to recharge",
      "long recharge",
      "long charging time",
      "6-7 hours",
      "6–7 hours",
      "5 hrs",
      "5 hours",
    ])
  ) {
    addUnique(
      cons,
      "Recharge time can be relatively long compared with newer alternatives."
    );
  }

  /* =====================================================
     PASS-THROUGH
  ===================================================== */

  if (
    contains(combinedText, [
      "no pass-through",
      "no pass through",
      "lack of pass-through",
      "lack of pass through",
    ])
  ) {
    addUnique(
      cons,
      "The lack of pass-through charging reduces flexibility for some charging setups."
    );
  }

  /* =====================================================
     KITCHEN PRODUCTS
  ===================================================== */

  if (productType === "kitchen") {
    if (
      contains(combinedText, [
        "500w",
        "500 watt",
        "500 watts",
      ])
    ) {
      addUnique(
        pros,
        "The 500W motor is suitable for common everyday blending and mixing tasks."
      );
    }

    if (
      contains(combinedText, [
        "750w",
        "750 watt",
        "750 watts",
        "1000w",
        "1000 watt",
        "1000 watts",
      ])
    ) {
      addUnique(
        pros,
        "The higher-powered motor can be useful for users who regularly handle more demanding kitchen tasks."
      );
    }

    if (
      contains(combinedText, [
        "2 jar",
        "2 jars",
        "two jars",
      ])
    ) {
      addUnique(
        pros,
        "The included two-jar setup provides flexibility for different kitchen tasks."
      );
    }

    if (
      contains(combinedText, [
        "3 jar",
        "3 jars",
        "three jars",
      ])
    ) {
      addUnique(
        pros,
        "The multi-jar setup provides useful flexibility for different preparation tasks."
      );
    }

    if (
      contains(combinedText, [
        "stainless steel",
        "steel blade",
        "sharp blade",
      ])
    ) {
      addUnique(
        pros,
        "The blade setup is designed for practical everyday grinding and blending tasks."
      );
    }

    if (
      contains(combinedText, [
        "smoothie",
        "smoothies",
        "blending",
        "juice",
        "juicing",
      ])
    ) {
      addUnique(
        pros,
        "Its blending-focused design makes it suitable for common smoothie, juice and preparation tasks."
      );
    }

    if (
      contains(combinedText, [
        "noisy",
        "noise",
        "loud",
        "high noise",
      ])
    ) {
      addUnique(
        cons,
        "Noise during operation may be noticeable, particularly during harder grinding tasks."
      );
    }

    if (
      contains(combinedText, [
        "only one blade",
        "single blade",
        "1 blade",
      ])
    ) {
      addUnique(
        cons,
        "The limited blade configuration may make it less versatile than models with multiple specialized blades."
      );
    }

    if (
      contains(combinedText, [
        "overheating",
        "overheats",
        "motor heats",
        "heating issue",
      ])
    ) {
      addUnique(
        cons,
        "Reports of heating during demanding use may be a concern for buyers who expect extended operation."
      );
    }
  }

  /* =====================================================
     BAG PRODUCTS
  ===================================================== */

  if (productType === "bag") {
    if (
      contains(combinedText, [
        "water resistant",
        "water-resistant",
        "rain cover",
        "waterproof",
      ])
    ) {
      addUnique(
        pros,
        "Weather-resistant protection is useful for commuting and everyday travel."
      );
    }

    if (
      contains(combinedText, [
        "laptop compartment",
        "laptop sleeve",
        "15.6",
        "15 inch",
        "15-inch",
      ])
    ) {
      addUnique(
        pros,
        "Laptop-focused storage makes it practical for work, college and daily commuting."
      );
    }

    if (
      contains(combinedText, [
        "trolley sleeve",
        "trolley",
        "luggage strap",
      ])
    ) {
      addUnique(
        pros,
        "The luggage or trolley attachment adds convenience for travelers."
      );
    }

    if (
      contains(combinedText, [
        "usb charging port",
        "usb charging",
      ])
    ) {
      addUnique(
        pros,
        "The integrated USB charging feature can be convenient for keeping a phone connected while traveling."
      );
    }

    if (
      contains(combinedText, [
        "heavy",
        "bulky",
        "uncomfortable",
      ])
    ) {
      addUnique(
        cons,
        "The available feedback suggests that comfort or bulk may be a consideration for some users."
      );
    }

    if (
      contains(combinedText, [
        "limited storage",
        "small capacity",
        "less storage",
      ])
    ) {
      addUnique(
        cons,
        "Storage capacity may be limiting for users who regularly carry many items."
      );
    }
  }

  /* =====================================================
     AUDIO PRODUCTS
  ===================================================== */

  if (productType === "audio") {
    if (
      contains(combinedText, [
        "noise cancellation",
        "anc",
        "active noise cancellation",
      ])
    ) {
      addUnique(
        pros,
        "Noise-cancellation features can make it more suitable for commuting and noisy environments."
      );
    }

    if (
      contains(combinedText, [
        "long battery",
        "long battery life",
        "battery life",
      ])
    ) {
      addUnique(
        pros,
        "Battery performance is useful for longer listening sessions between charges."
      );
    }

    if (
      contains(combinedText, [
        "poor microphone",
        "mic quality",
        "microphone quality",
        "poor call quality",
      ])
    ) {
      addUnique(
        cons,
        "Microphone performance may be a limitation for users who frequently take calls."
      );
    }

    if (
      contains(combinedText, [
        "poor sound",
        "weak bass",
        "poor audio",
        "average sound quality",
      ])
    ) {
      addUnique(
        cons,
        "Sound performance may not satisfy buyers looking for a more premium listening experience."
      );
    }
  }

  /* =====================================================
     PHONE PRODUCTS
  ===================================================== */

  if (productType === "phone") {
    if (
      contains(combinedText, [
        "amoled",
        "oled display",
        "amoled display",
      ])
    ) {
      addUnique(
        pros,
        "The display technology can provide an appealing viewing experience for everyday media and apps."
      );
    }

    if (
      contains(combinedText, [
        "fast processor",
        "strong performance",
        "good performance",
        "high performance",
      ])
    ) {
      addUnique(
        pros,
        "Performance appears suitable for everyday apps and multitasking based on the available research."
      );
    }

    if (
      contains(combinedText, [
        "poor camera",
        "average camera",
        "weak camera",
      ])
    ) {
      addUnique(
        cons,
        "Camera performance may be less suitable for buyers who prioritize photography."
      );
    }

    if (
      contains(combinedText, [
        "bloatware",
        "preinstalled apps",
        "ads in ui",
      ])
    ) {
      addUnique(
        cons,
        "The software experience may be less appealing to buyers who prefer a cleaner interface."
      );
    }
  }

  /* =====================================================
     WEARABLE PRODUCTS
  ===================================================== */

  if (productType === "wearable") {
    if (
      contains(combinedText, [
        "heart rate",
        "heart-rate",
        "fitness tracking",
        "activity tracking",
        "step tracking",
      ])
    ) {
      addUnique(
        pros,
        "The available health and activity tracking features can be useful for everyday fitness monitoring."
      );
    }

    if (
      contains(combinedText, [
        "water resistant",
        "water-resistant",
        "ip68",
        "ip67",
      ])
    ) {
      addUnique(
        pros,
        "Water resistance adds useful protection for everyday wear and activity."
      );
    }

    if (
      contains(combinedText, [
        "inaccurate tracking",
        "inaccurate sensor",
        "poor tracking",
      ])
    ) {
      addUnique(
        cons,
        "Tracking accuracy may be a concern for buyers who need highly precise fitness measurements."
      );
    }
  }

  /* =====================================================
     COMPUTER PRODUCTS
  ===================================================== */

  if (productType === "computer") {
    if (
      contains(combinedText, [
        "ergonomic",
        "comfortable",
        "adjustable",
      ])
    ) {
      addUnique(
        pros,
        "The design can improve everyday comfort and usability during longer work sessions."
      );
    }

    if (
      contains(combinedText, [
        "portable",
        "foldable",
        "compact",
      ])
    ) {
      addUnique(
        pros,
        "The compact design makes it convenient for users with limited desk space or mobile setups."
      );
    }

    if (
      contains(combinedText, [
        "unstable",
        "wobbly",
        "flex",
        "flimsy",
      ])
    ) {
      addUnique(
        cons,
        "Stability or structural strength may be a concern for users with heavier equipment."
      );
    }
  }

  /* =====================================================
     HOME APPLIANCES
  ===================================================== */

  if (productType === "home-appliance") {
    if (
      contains(combinedText, [
        "energy efficient",
        "energy-efficient",
        "low power consumption",
      ])
    ) {
      addUnique(
        pros,
        "The available information indicates useful attention to energy efficiency."
      );
    }

    if (
      contains(combinedText, [
        "noisy",
        "loud",
        "noise",
      ])
    ) {
      addUnique(
        cons,
        "Noise levels may be a consideration for users who prefer quieter appliances."
      );
    }

    if (
      contains(combinedText, [
        "difficult to clean",
        "hard to clean",
        "cleaning is difficult",
      ])
    ) {
      addUnique(
        cons,
        "Cleaning may require more effort than some competing designs."
      );
    }
  }

  /* =====================================================
     BOTTLE PRODUCTS
  ===================================================== */

  if (productType === "bottle") {
    if (
      contains(combinedText, [
        "insulated",
        "double wall",
        "double-wall",
        "keeps cold",
        "keeps hot",
      ])
    ) {
      addUnique(
        pros,
        "Insulation can help maintain drink temperature for longer periods."
      );
    }

    if (
      contains(combinedText, [
        "leak proof",
        "leak-proof",
        "leakproof",
      ])
    ) {
      addUnique(
        pros,
        "The leak-resistant design is useful for carrying the bottle in bags during everyday travel."
      );
    }

    if (
      contains(combinedText, [
        "heavy",
        "difficult to clean",
        "hard to clean",
      ])
    ) {
      addUnique(
        cons,
        "Weight or cleaning convenience may be a consideration for everyday users."
      );
    }
  }

  /* =====================================================
     GROOMING PRODUCTS
  ===================================================== */

  if (productType === "grooming") {
    if (
      contains(combinedText, [
        "rechargeable",
        "cordless",
        "wireless",
      ])
    ) {
      addUnique(
        pros,
        "Rechargeable or cordless operation provides convenient flexibility during grooming."
      );
    }

    if (
      contains(combinedText, [
        "long battery",
        "long battery life",
      ])
    ) {
      addUnique(
        pros,
        "Good battery life can reduce the need for frequent charging."
      );
    }

    if (
      contains(combinedText, [
        "poor battery",
        "short battery",
        "weak battery",
      ])
    ) {
      addUnique(
        cons,
        "Battery performance may be limiting for users who need frequent cordless use."
      );
    }
  }

  /* =====================================================
     KITCHEN ACCESSORIES
  ===================================================== */

  if (productType === "kitchen-accessory") {
    if (
      contains(combinedText, [
        "glass",
        "food grade",
        "food-grade",
        "refillable",
      ])
    ) {
      addUnique(
        pros,
        "The reusable design and practical construction can be convenient for regular kitchen use."
      );
    }

    if (
      contains(combinedText, [
        "leak",
        "leaking",
        "leakage",
      ])
    ) {
      addUnique(
        cons,
        "Leakage concerns mentioned in available feedback may affect everyday convenience."
      );
    }

    if (
      contains(combinedText, [
        "clog",
        "clogging",
        "spray issue",
      ])
    ) {
      addUnique(
        cons,
        "Spray consistency or clogging may require attention during regular use."
      );
    }
  }

  /* =====================================================
     WARRANTY
  ===================================================== */

  if (
    contains(combinedText, [
      "2-year warranty",
      "2 year warranty",
      "two-year warranty",
      "two year warranty",
    ])
  ) {
    addUnique(
      pros,
      "A two-year warranty provides useful long-term purchase support."
    );
  } else if (
    contains(combinedText, [
      "1-year warranty",
      "1 year warranty",
      "one-year warranty",
      "one year warranty",
    ])
  ) {
    addUnique(
      pros,
      "The included one-year warranty provides basic purchase protection."
    );
  }

  /* =====================================================
     VALUE
  ===================================================== */

  if (
    contains(combinedText, [
      "budget",
      "affordable",
      "value for money",
      "good value",
      "worth the price",
      "reasonable price",
      "excellent value",
    ])
  ) {
    addUnique(
      pros,
      "The research suggests that its feature set can offer reasonable value at the right price."
    );
  }

  /* =====================================================
     RECALL
  ===================================================== */

  const hasRecall = contains(combinedText, [
    "recall",
    "cpsc recall",
    "product recall",
  ]);

  if (hasRecall) {
    addUnique(
      cons,
      "Some units may be affected by a product recall, so buyers should verify the exact model and serial number."
    );
  }

  /* =====================================================
     GENERAL NEGATIVE SIGNALS
  ===================================================== */

  if (
    contains(combinedText, [
      "poor performance",
      "underwhelming performance",
      "weak performance",
    ])
  ) {
    addUnique(
      cons,
      "Performance feedback is mixed, so buyers with demanding requirements should review the limitations carefully."
    );
  }

  if (
    contains(combinedText, [
      "difficult to clean",
      "hard to clean",
      "cleaning is difficult",
    ])
  ) {
    addUnique(
      cons,
      "Cleaning may require more effort than some competing designs."
    );
  }

  if (
    contains(combinedText, [
      "limited features",
      "basic features",
      "lacks features",
    ])
  ) {
    addUnique(
      cons,
      "The feature set may feel basic for buyers looking for more advanced functionality."
    );
  }

  /* =====================================================
     FALLBACK PROS
  ===================================================== */

  if (pros.length === 0) {
    switch (productType) {
      case "kitchen":
        addUnique(
          pros,
          "The available research indicates that it can handle practical everyday kitchen tasks."
        );
        break;

      case "powerbank":
        addUnique(
          pros,
          "Its portable format makes it useful as an everyday backup power option."
        );
        break;

      case "bag":
        addUnique(
          pros,
          "The design provides practical everyday storage for personal belongings."
        );
        break;

      case "audio":
        addUnique(
          pros,
          "The product provides convenient everyday audio functionality for compatible devices."
        );
        break;

      case "phone":
        addUnique(
          pros,
          "The available features make it a practical option for everyday smartphone use."
        );
        break;

      case "wearable":
        addUnique(
          pros,
          "The available smart and fitness features can provide useful everyday convenience."
        );
        break;

      case "computer":
        addUnique(
          pros,
          "The product is designed to provide practical support for everyday computer use."
        );
        break;

      default:
        addUnique(
          pros,
          `${productName} offers a practical feature set for buyers considering products in this category.`
        );
    }
  }

  /* =====================================================
     FALLBACK CONS
  ===================================================== */

  if (cons.length === 0) {
    addUnique(
      cons,
      "The available research does not identify a major product-specific drawback, but buyers should still check current reviews and specifications before purchasing."
    );
  }

  /* =====================================================
     SCORE
  ===================================================== */

  let score = 6.5;

  score += Math.min(pros.length * 0.35, 2.1);
  score -= Math.min(cons.length * 0.25, 1.5);

  if (hasRecall) {
    score -= 0.8;
  }

  if (sources.length >= 5) {
    score += 0.2;
  }

  score = Math.max(
    1,
    Math.min(10, Number(score.toFixed(1)))
  );

  /* =====================================================
     BEST FOR
  ===================================================== */

  let bestFor = "";

  switch (productType) {
    case "kitchen":
      bestFor =
        "Home users who want a practical appliance for regular everyday kitchen preparation.";

      if (
        contains(combinedText, [
          "smoothie",
          "juice",
          "blending",
        ])
      ) {
        bestFor =
          "Users who regularly make smoothies, juices and blended preparations and want a compact everyday kitchen appliance.";
      }

      if (
        contains(combinedText, [
          "grinding",
          "masala",
          "spices",
        ])
      ) {
        bestFor =
          "Home cooks who need a practical appliance for everyday grinding, blending and kitchen preparation.";
      }

      break;

    case "powerbank":
      bestFor =
        "Travelers, commuters and smartphone users who want portable backup power during the day.";

      if (
        contains(combinedText, [
          "20,000mah",
          "20000mah",
        ])
      ) {
        bestFor =
          "Frequent travelers and heavy smartphone users who need extended portable battery backup.";
      }

      if (
        contains(combinedText, [
          "fast charging",
          "usb-c",
          "power delivery",
        ])
      ) {
        bestFor =
          "Users who want portable backup power with faster charging and modern device connectivity.";
      }

      break;

    case "bag":
      bestFor =
        "Students, commuters and professionals who need organized everyday storage for personal items and electronics.";

      if (
        contains(combinedText, [
          "laptop",
          "15.6",
          "laptop compartment",
        ])
      ) {
        bestFor =
          "Students and working professionals who regularly carry a laptop along with everyday essentials.";
      }

      if (
        contains(combinedText, [
          "travel",
          "trolley",
          "rain cover",
        ])
      ) {
        bestFor =
          "Travelers and commuters who want practical storage with useful travel and weather-protection features.";
      }

      break;

    case "audio":
      bestFor =
        "Users who want convenient everyday listening for music, videos, calls and commuting.";

      if (
        contains(combinedText, [
          "anc",
          "noise cancellation",
        ])
      ) {
        bestFor =
          "Commuters and frequent travelers who want more isolation from surrounding noise while listening.";
      }

      break;

    case "phone":
      bestFor =
        "Users looking for a smartphone that fits their priorities around everyday performance, features and price.";

      if (
        contains(combinedText, [
          "camera",
          "photography",
        ])
      ) {
        bestFor =
          "Users who place particular importance on smartphone photography and camera features.";
      }

      break;

    case "wearable":
      bestFor =
        "Users who want convenient access to everyday smartwatch or fitness features without constantly reaching for their phone.";
      break;

    case "computer":
      bestFor =
        "Students, professionals and home users looking for a practical computer accessory for everyday work or study.";
      break;

    case "home-appliance":
      bestFor =
        "Home users looking for a practical appliance that addresses everyday comfort or household needs.";
      break;

    case "bottle":
      bestFor =
        "Students, commuters, office workers and travelers who want a reusable bottle for everyday hydration.";
      break;

    case "grooming":
      bestFor =
        "Users looking for a convenient grooming solution for regular personal-care routines.";
      break;

    case "kitchen-accessory":
      bestFor =
        "Home cooks who want a convenient accessory to make everyday kitchen preparation easier and more controlled.";
      break;

    default:
      bestFor =
        `Buyers who are specifically looking for the features and use case offered by ${productName}.`;
      break;
  }

  /* =====================================================
     NOT IDEAL FOR
  ===================================================== */

  let avoidIf = "";

  if (hasRecall) {
    avoidIf =
      "You cannot verify the exact model or serial number against applicable recall information.";
  } else if (
    hasOldUsb
  ) {
    avoidIf =
      "You specifically want modern USB-C connectivity and do not want to use an older charging-port standard.";
  } else if (
    contains(combinedText, [
      "single usb",
      "only one usb",
      "one usb port",
    ])
  ) {
    avoidIf =
      "You regularly need to charge or connect several devices at the same time.";
  } else if (productType === "kitchen") {
    if (
      contains(combinedText, [
        "only one blade",
        "single blade",
      ])
    ) {
      avoidIf =
        "You need multiple specialized blades or a more versatile food-preparation setup.";
    } else {
      avoidIf =
        "You need a heavy-duty appliance for demanding or commercial-level kitchen workloads.";
    }
  } else if (productType === "bag") {
    avoidIf =
      "You need a very lightweight bag or substantially more storage than this model provides.";
  } else if (productType === "audio") {
    avoidIf =
      "You prioritize premium sound quality, advanced call performance or flagship-level features above price and everyday convenience.";
  } else if (productType === "powerbank") {
    avoidIf =
      "You need extremely fast recharging, very high power output or advanced charging features that this model does not provide.";
  } else if (productType === "phone") {
    avoidIf =
      "You need flagship-level performance or specialized features that are not supported by this model.";
  } else if (productType === "grooming") {
    avoidIf =
      "You need professional-grade performance or specialized grooming functions beyond this model's feature set.";
  } else if (productType === "wearable") {
    avoidIf =
      "You need highly advanced health tracking or professional-level fitness measurements.";
  } else if (productType === "computer") {
    avoidIf =
      "You need a premium professional setup or advanced features beyond this accessory's intended everyday use.";
  } else {
    avoidIf =
      `You need features or performance beyond what the available research confirms for ${productName}.`;
  }

  /* =====================================================
     VERDICT
  ===================================================== */

  let verdict = "";

  if (score >= 8.5) {
    verdict =
      `${productName} looks like a strong option based on the available research. Its combination of relevant features and practical strengths makes it worth considering for the right buyer, provided the current price remains competitive.`;
  } else if (score >= 7.5) {
    verdict =
      `${productName} appears to be a good option for its intended use. The research shows several useful strengths, although buyers should consider the identified limitations before making a purchase.`;
  } else if (score >= 6.5) {
    verdict =
      `${productName} offers a reasonable set of features for its category, but the research suggests that buyers should weigh its limitations carefully and compare the current price with alternatives.`;
  } else {
    verdict =
      `${productName} has some useful qualities, but the available research raises enough concerns that buyers should carefully compare alternatives before purchasing.`;
  }

  if (hasRecall) {
    verdict +=
      " Buyers should also verify whether the specific unit is affected by any applicable recall.";
  }

  /* =====================================================
     RESEARCH SUMMARY
  ===================================================== */

  const researchSummary =
    answer ||
    `AnantaGo reviewed ${sources.length} available sources covering product specifications, practical features, performance observations and potential limitations. The analysis is based on available online research and does not represent physical testing by AnantaGo.`;

  /* =====================================================
     SOURCES
  ===================================================== */

  const cleanSources = sources
    .filter(
      (source) =>
        typeof source.title === "string" &&
        source.title.trim() !== "" &&
        typeof source.url === "string" &&
        source.url.trim() !== ""
    )
    .map((source) => ({
      title: source.title!.trim(),
      url: source.url!.trim(),
    }));

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    score,
    pros: pros.slice(0, 5),
    cons: cons.slice(0, 5),
    bestFor,
    avoidIf,
    verdict,
    researchSummary,
    sources: cleanSources,
  };
}

