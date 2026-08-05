
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

function contains(text: string, words: string[]) {
  return words.some((word) =>
    text.toLowerCase().includes(word.toLowerCase())
  );
}

function addUnique(
  array: string[],
  value: string,
  max = 6
) {
  if (!array.includes(value) && array.length < max) {
    array.push(value);
  }
}

export function generateAnantaGoReview(
  productName: string,
  answer: string | null,
  sources: ResearchSource[]
): AnantaGoReview {
  const combinedText = `
    ${answer || ""}
    ${sources
      .map((source) => source.content || "")
      .join("\n")}
  `.toLowerCase();

  const pros: string[] = [];
  const cons: string[] = [];

  // =========================
  // PORTABILITY
  // =========================

  if (
    contains(combinedText, [
      "compact",
      "pocket-friendly",
      "pocket friendly",
      "lightweight",
      "portable",
    ])
  ) {
    addUnique(
      pros,
      "Compact and easy to carry for everyday use."
    );
  }

  // =========================
  // BUILD QUALITY
  // =========================

  if (
    contains(combinedText, [
      "solid build",
      "sturdy",
      "durable",
      "build quality",
    ])
  ) {
    addUnique(
      pros,
      "Build quality is a strong point according to multiple reviews."
    );
  }

  // =========================
  // FAST CHARGING
  // =========================

  if (
    contains(combinedText, [
      "fast charging",
      "quick charge",
      "poweriq",
      "fast charge",
    ])
  ) {
    addUnique(
      pros,
      "Supports useful charging technology for faster device charging."
    );
  }

  // =========================
  // CAPACITY
  // =========================

  if (
    contains(combinedText, [
      "10,000mah",
      "10000mah",
      "10,000 mah",
    ])
  ) {
    addUnique(
      pros,
      "10,000mAh capacity makes it suitable as a portable backup power source."
    );
  }

  // =========================
  // COMPATIBILITY
  // =========================

  if (
    contains(combinedText, [
      "android",
      "iphone",
      "broad compatibility",
      "compatible with",
    ])
  ) {
    addUnique(
      pros,
      "Broad compatibility with common phones and USB devices."
    );
  }

  // =========================
  // USB-C PROBLEM
  // =========================

  if (
    contains(combinedText, [
      "no usb-c",
      "no usb c",
      "micro-usb",
      "micro usb",
    ])
  ) {
    addUnique(
      cons,
      "The port setup may feel outdated if you prefer modern USB-C charging."
    );
  }

  // =========================
  // SINGLE PORT
  // =========================

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
      "Limited connectivity makes it less convenient for charging multiple devices."
    );
  }

  // =========================
  // SLOW RECHARGE
  // =========================

  if (
    contains(combinedText, [
      "slow recharge",
      "slow to recharge",
      "6-7 hours",
      "6–7 hours",
      "5 hrs 35 mins",
      "5 hours",
    ])
  ) {
    addUnique(
      cons,
      "Recharge time can be relatively long compared with newer power banks."
    );
  }

  // =========================
  // NO PASS THROUGH
  // =========================

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
      "Does not support pass-through charging."
    );
  }

  // =========================
  // CAPACITY EFFICIENCY
  // =========================

  if (
    contains(combinedText, [
      "53%",
      "64%",
      "lower than advertised",
      "usable capacity",
      "conversion losses",
    ])
  ) {
    addUnique(
      cons,
      "Real-world usable capacity can be noticeably lower than the advertised battery capacity."
    );
  }

  // =========================
  // RECALL
  // =========================

  const hasRecall = contains(combinedText, [
    "recall",
    "cpsc recall",
  ]);

  if (hasRecall) {
    addUnique(
      cons,
      "Some units may be affected by a product recall, so buyers should verify the exact model and serial number."
    );
  }

  // =========================
  // CALCULATE SCORE
  // =========================

  let score = 7;

  score += Math.min(pros.length * 0.25, 1.25);

  score -= Math.min(cons.length * 0.25, 1.5);

  if (hasRecall) {
    score -= 0.5;
  }

  score = Math.max(
    1,
    Math.min(10, Number(score.toFixed(1)))
  );

  // =========================
  // BEST FOR
  // =========================

  let bestFor =
    "Users looking for a practical product for everyday use.";

  if (
    contains(combinedText, [
      "power bank",
      "portable charger",
      "10,000mah",
    ])
  ) {
    bestFor =
      "Travelers, commuters and users who want a compact backup power source for phones and other USB devices.";
  }

  // =========================
  // AVOID IF
  // =========================

  let avoidIf =
    "You need advanced features that this particular model does not provide.";

  if (
    contains(combinedText, [
      "no usb-c",
      "micro-usb",
      "single usb",
      "only one usb",
    ])
  ) {
    avoidIf =
      "You specifically need USB-C connectivity or want to charge several devices simultaneously.";
  }

  // =========================
  // VERDICT
  // =========================

  let verdict = `${productName} appears to be a reasonable option based on the available research, but buyers should compare its limitations with newer alternatives before purchasing.`;

  if (pros.length >= 3 && cons.length >= 3) {
    verdict = `${productName} has several practical strengths, particularly around usability and portability, but the research also highlights meaningful limitations. It can make sense for the right buyer, especially if the current price is attractive, but newer alternatives may offer better connectivity and convenience.`;
  }

  if (hasRecall) {
    verdict +=
      " Buyers should also verify whether their specific unit is affected by any applicable recall before using or purchasing it.";
  }

  // =========================
  // RESEARCH SUMMARY
  // =========================

  const researchSummary =
    answer ||
    `Research was gathered from ${sources.length} sources covering specifications, performance, advantages and limitations.`;

  return {
    score,
    pros,
    cons,
    bestFor,
    avoidIf,
    verdict,
    researchSummary,

    sources: sources
      .filter(
        (source) =>
          source.title &&
          source.url
      )
      .map((source) => ({
        title: source.title!,
        url: source.url!,
      })),
  };
}

