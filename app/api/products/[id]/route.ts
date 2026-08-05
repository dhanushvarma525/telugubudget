
import Link from "next/link";

import ReviewSection from "@/components/ReviewSection";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import ProductImageSlider from "@/components/ProductImageSlider";

import { getBaseUrl } from "@/lib/getBaseUrl";

// =====================================================
// GET PRODUCT
// =====================================================

async function getProduct(id: string) {
  const res = await fetch(
    `${getBaseUrl()}/api/products/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return null;
  }

  return await res.json();
}

// =====================================================
// GET SIMILAR PRODUCTS
// =====================================================

async function getSimilarProducts(
  category: string,
  id: string
) {
  const res = await fetch(
    `${getBaseUrl()}/api/products`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();

  const products = data.products || [];

  return products
    .filter((item: any) => {
      const sameCategory =
        item.category === category ||
        (Array.isArray(item.categories) &&
          item.categories.includes(category));

      return (
        sameCategory &&
        item.id !== Number(id)
      );
    })
    .slice(0, 4);
}

// =====================================================
// SCORE LABEL
// =====================================================

function getScoreLabel(score: number) {
  if (score >= 9) return "Excellent";
  if (score >= 8) return "Very Good";
  if (score >= 7) return "Good";
  if (score >= 6) return "Decent";

  return "Below Average";
}

// =====================================================
// PRODUCT PAGE
// =====================================================

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  // ===================================================
  // PRODUCT NOT FOUND
  // ===================================================

  if (!product) {
    return (
      <div className="p-10 text-center">
        Product Not Found
      </div>
    );
  }

  // ===================================================
  // SIMILAR PRODUCTS
  // ===================================================

  const similarProducts =
    await getSimilarProducts(
      product.category,
      id
    );

  // ===================================================
  // DISCOUNT
  // ===================================================

  const discount =
    product.old_price &&
    Number(product.old_price) >
      Number(product.price)
      ? Math.round(
          ((Number(product.old_price) -
            Number(product.price)) /
            Number(product.old_price)) *
            100
        )
      : null;

  // ===================================================
  // ANANTAGO SCORE
  // ===================================================

  const hasAnantaGoScore =
    product.anantago_score !== null &&
    product.anantago_score !== undefined &&
    product.anantago_score !== "";

  const anantaGoScore =
    hasAnantaGoScore
      ? Number(product.anantago_score)
      : null;

  const scoreLabel =
    anantaGoScore !== null
      ? getScoreLabel(anantaGoScore)
      : null;

  // ===================================================
  // DETAILED SCORES
  // ===================================================

  const detailedScores = [
    {
      label: "Quality",
      value: product.quality_score,
    },
    {
      label: "Performance",
      value: product.performance_score,
    },
    {
      label: "Value",
      value: product.value_score,
    },
    {
      label: "Features",
      value: product.features_score,
    },
    {
      label: "Design",
      value: product.design_score,
    },
  ].filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      item.value !== ""
  );

  // ===================================================
  // IMAGES
  // ===================================================

  const images = [
    product.image,
    product.image2,
    product.image3,
    product.image4,
    product.image5,
    product.image6,
  ].filter(Boolean);

  // ===================================================
  // FEATURES
  // ===================================================

  const featureList =
    typeof product.features === "string"
      ? product.features
          .split("\n")
          .map((item: string) =>
            item.trim()
          )
          .filter(Boolean)
      : [];

  // ===================================================
  // PROS
  // ===================================================

  const prosList =
    Array.isArray(product.pros)
      ? product.pros.filter(
          (item: any) =>
            typeof item === "string" &&
            item.trim() !== ""
        )
      : typeof product.pros === "string"
      ? product.pros
          .split("\n")
          .map((item: string) =>
            item.trim()
          )
          .filter(Boolean)
      : [];

  // ===================================================
  // CONS
  // ===================================================

  const consList =
    Array.isArray(product.cons)
      ? product.cons.filter(
          (item: any) =>
            typeof item === "string" &&
            item.trim() !== ""
        )
      : typeof product.cons === "string"
      ? product.cons
          .split("\n")
          .map((item: string) =>
            item.trim()
          )
          .filter(Boolean)
      : [];

  return (
    <main className="min-h-screen bg-gray-100 p-2.5 sm:p-6">

      {/* =================================================
          MAIN PRODUCT
      ================================================= */}

      <div
        className="
          max-w-6xl
          mx-auto
          bg-white
          rounded-xl
          sm:rounded-2xl
          shadow-md
          overflow-hidden
        "
      >
        <div className="p-3 sm:p-8">

          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <ProductImageSlider
            images={images}
          />

          {/* =================================================
              PRODUCT TITLE
          ================================================= */}

          <div className="mt-5 sm:mt-7">

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-1.5
                mb-2
              "
            >
              {product.brand && (
                <span
                  className="
                    text-xs
                    sm:text-sm
                    text-gray-500
                    bg-gray-100
                    px-2.5
                    py-1
                    rounded-full
                  "
                >
                  {product.brand}
                </span>
              )}

              {product.stock && (
                <span
                  className={`
                    text-xs
                    sm:text-sm
                    px-2.5
                    py-1
                    rounded-full
                    font-medium
                    ${
                      product.stock === "In Stock"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {product.stock === "In Stock"
                    ? "🟢 In Stock"
                    : "🔴 Out of Stock"}
                </span>
              )}
            </div>

            <h1
              className="
                text-xl
                sm:text-4xl
                font-bold
                text-gray-900
                leading-tight
              "
            >
              {product.name}
            </h1>

            {/* MARKETPLACE RATING */}

            {product.rating && (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  mt-2
                "
              >
                <span
                  className="
                    bg-green-600
                    text-white
                    px-2.5
                    py-1
                    rounded-lg
                    font-bold
                    text-sm
                  "
                >
                  ⭐ {product.rating}
                </span>

                <span className="text-xs sm:text-sm text-gray-500">
                  Marketplace rating
                </span>
              </div>
            )}
          </div>

          {/* =================================================
              PRICE
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-2
              flex-wrap
              mt-4
            "
          >
            <span
              className="
                text-2xl
                sm:text-4xl
                font-bold
                text-orange-600
              "
            >
              ₹{product.price}
            </span>

            {product.old_price &&
              Number(product.old_price) >
                Number(product.price) && (
                <span
                  className="
                    text-base
                    sm:text-xl
                    text-gray-400
                    line-through
                  "
                >
                  ₹{product.old_price}
                </span>
              )}

            {discount && (
              <span
                className="
                  bg-green-100
                  text-green-700
                  px-2.5
                  py-1
                  rounded-full
                  text-xs
                  sm:text-sm
                  font-bold
                "
              >
                {discount}% OFF
              </span>
            )}
          </div>

          {/* =================================================
              COUPON
          ================================================= */}

          {product.coupon_available &&
            product.coupon && (
              <div
                className="
                  mt-3
                  bg-yellow-50
                  border
                  border-yellow-200
                  p-3
                  rounded-xl
                "
              >
                <p className="text-xs text-yellow-800">
                  🎟️ Coupon available
                </p>

                <p className="font-bold text-yellow-900 mt-0.5">
                  {product.coupon}
                </p>
              </div>
            )}

          {/* =================================================
              ANANTAGO REVIEW
          ================================================= */}

          {(hasAnantaGoScore ||
            product.verdict ||
            product.best_for ||
            product.not_ideal_for ||
            detailedScores.length > 0) && (
            <section
              className="
                mt-5
                sm:mt-7
                rounded-xl
                sm:rounded-2xl
                border
                border-orange-200
                bg-orange-50
                p-3
                sm:p-5
              "
            >

              {/* REVIEW HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  mb-3
                  sm:mb-5
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      sm:text-xs
                      font-semibold
                      text-orange-700
                      uppercase
                      tracking-wide
                    "
                  >
                    AnantaGo Review
                  </p>

                  <h2
                    className="
                      text-lg
                      sm:text-2xl
                      font-bold
                      mt-0.5
                    "
                  >
                    Our Analysis
                  </h2>

                  <p
                    className="
                      hidden
                      sm:block
                      text-gray-600
                      text-sm
                      mt-1
                    "
                  >
                    An editorial assessment based
                    on the product's features,
                    value and practical usefulness.
                  </p>
                </div>

                {/* SCORE */}

                {hasAnantaGoScore && (
                  <div className="flex items-center gap-2">

                    <div
                      className="
                        w-14
                        h-14
                        sm:w-20
                        sm:h-20
                        rounded-full
                        bg-orange-500
                        text-white
                        flex
                        flex-col
                        items-center
                        justify-center
                        shadow
                        shrink-0
                      "
                    >
                      <span
                        className="
                          text-lg
                          sm:text-2xl
                          font-bold
                        "
                      >
                        {anantaGoScore}
                      </span>

                      <span className="text-[9px] sm:text-xs">
                        /10
                      </span>
                    </div>

                    <div className="hidden sm:block">
                      <p className="font-bold text-lg">
                        {scoreLabel}
                      </p>

                      <p className="text-sm text-gray-500">
                        AnantaGo Score
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* MOBILE SCORE LABEL */}

              {hasAnantaGoScore && (
                <div
                  className="
                    sm:hidden
                    flex
                    items-center
                    justify-between
                    bg-white
                    rounded-lg
                    border
                    px-3
                    py-2
                    mb-3
                  "
                >
                  <span className="text-xs text-gray-500">
                    AnantaGo Score
                  </span>

                  <span className="font-bold text-orange-600">
                    {scoreLabel}
                  </span>
                </div>
              )}

              {/* REVIEW TYPE */}

              {product.review_type && (
                <div
                  className="
                    bg-white
                    border
                    rounded-lg
                    px-3
                    py-2
                    mb-3
                    text-xs
                  "
                >
                  <span className="text-gray-500">
                    Review Type:
                  </span>{" "}
                  <span className="font-semibold">
                    {product.review_type}
                  </span>
                </div>
              )}

              {/* =================================================
                  DETAILED SCORES
              ================================================= */}

              {detailedScores.length > 0 && (
                <div className="mb-3 sm:mb-5">

                  <h3
                    className="
                      text-sm
                      sm:text-lg
                      font-bold
                      mb-2
                    "
                  >
                    📊 Detailed Scores
                  </h3>

                  <div
                    className="
                      grid
                      grid-cols-2
                      sm:grid-cols-5
                      gap-2
                    "
                  >
                    {detailedScores.map(
                      (item) => (
                        <div
                          key={item.label}
                          className="
                            bg-white
                            border
                            rounded-lg
                            p-2
                            sm:p-3
                            text-center
                          "
                        >
                          <p
                            className="
                              text-[10px]
                              sm:text-xs
                              text-gray-500
                              truncate
                            "
                          >
                            {item.label}
                          </p>

                          <p
                            className="
                              font-bold
                              text-sm
                              sm:text-base
                              text-orange-600
                              mt-0.5
                            "
                          >
                            {item.value}/10
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* =================================================
                  VERDICT
              ================================================= */}

              {product.verdict && (
                <div
                  className="
                    border-l-4
                    border-orange-500
                    bg-white
                    p-3
                    sm:p-4
                    rounded-r-lg
                    mb-3
                  "
                >
                  <h3
                    className="
                      text-sm
                      sm:text-lg
                      font-bold
                      mb-1
                    "
                  >
                    🧠 AnantaGo Verdict
                  </h3>

                  <p
                    className="
                      text-xs
                      sm:text-sm
                      text-gray-700
                      leading-relaxed
                      whitespace-pre-line
                    "
                  >
                    {product.verdict}
                  </p>
                </div>
              )}

              {/* =================================================
                  BEST FOR / NOT IDEAL FOR
              ================================================= */}

              {(product.best_for ||
                product.not_ideal_for) && (
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-2
                    sm:gap-4
                  "
                >
                  {product.best_for && (
                    <div
                      className="
                        bg-green-50
                        border
                        border-green-200
                        rounded-lg
                        p-3
                      "
                    >
                      <h3
                        className="
                          font-bold
                          text-sm
                          text-green-800
                          mb-1
                        "
                      >
                        👍 Best For
                      </h3>

                      <p
                        className="
                          text-xs
                          sm:text-sm
                          text-gray-700
                          whitespace-pre-line
                        "
                      >
                        {product.best_for}
                      </p>
                    </div>
                  )}

                  {product.not_ideal_for && (
                    <div
                      className="
                        bg-red-50
                        border
                        border-red-200
                        rounded-lg
                        p-3
                      "
                    >
                      <h3
                        className="
                          font-bold
                          text-sm
                          text-red-800
                          mb-1
                        "
                      >
                        ⚠️ Not Ideal For
                      </h3>

                      <p
                        className="
                          text-xs
                          sm:text-sm
                          text-gray-700
                          whitespace-pre-line
                        "
                      >
                        {product.not_ideal_for}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          {product.description && (
            <section className="mt-5 sm:mt-8">

              <h2
                className="
                  text-lg
                  sm:text-2xl
                  font-bold
                  mb-2
                "
              >
                About This Product
              </h2>

              <p
                className="
                  text-sm
                  sm:text-base
                  text-gray-700
                  leading-relaxed
                  whitespace-pre-line
                "
              >
                {product.description}
              </p>

            </section>
          )}

          {/* =================================================
              KEY FEATURES
          ================================================= */}

          {featureList.length > 0 && (
            <section className="mt-5 sm:mt-8">

              <h2
                className="
                  text-lg
                  sm:text-2xl
                  font-bold
                  mb-3
                "
              >
                Key Features
              </h2>

              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-2
                  gap-2
                  sm:gap-3
                "
              >
                {featureList.map(
                  (
                    feature: string,
                    index: number
                  ) => (
                    <div
                      key={index}
                      className="
                        flex
                        items-start
                        gap-2
                        bg-gray-50
                        border
                        rounded-lg
                        p-2.5
                        sm:p-4
                      "
                    >
                      <span
                        className="
                          text-green-600
                          font-bold
                          text-sm
                          shrink-0
                        "
                      >
                        ✓
                      </span>

                      <span
                        className="
                          text-xs
                          sm:text-sm
                          text-gray-700
                          leading-snug
                        "
                      >
                        {feature}
                      </span>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* =================================================
              PROS & CONS
          ================================================= */}

          {(prosList.length > 0 ||
            consList.length > 0) && (
            <section className="mt-5 sm:mt-8">

              <h2
                className="
                  text-lg
                  sm:text-2xl
                  font-bold
                  mb-3
                "
              >
                Pros & Cons
              </h2>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3
                  sm:gap-5
                "
              >

                {/* PROS */}

                {prosList.length > 0 && (
                  <div
                    className="
                      border
                      border-green-200
                      rounded-xl
                      p-3
                      sm:p-5
                      bg-green-50
                    "
                  >
                    <h3
                      className="
                        text-sm
                        sm:text-lg
                        font-bold
                        text-green-800
                        mb-2
                      "
                    >
                      ✅ What We Like
                    </h3>

                    <ul className="space-y-2">

                      {prosList.map(
                        (
                          item: string,
                          index: number
                        ) => (
                          <li
                            key={index}
                            className="
                              flex
                              gap-2
                              text-xs
                              sm:text-sm
                              text-gray-700
                            "
                          >
                            <span className="text-green-600 font-bold">
                              ✓
                            </span>

                            <span>
                              {item}
                            </span>
                          </li>
                        )
                      )}

                    </ul>
                  </div>
                )}

                {/* CONS */}

                {consList.length > 0 && (
                  <div
                    className="
                      border
                      border-red-200
                      rounded-xl
                      p-3
                      sm:p-5
                      bg-red-50
                    "
                  >
                    <h3
                      className="
                        text-sm
                        sm:text-lg
                        font-bold
                        text-red-800
                        mb-2
                      "
                    >
                      ❌ What Could Be Better
                    </h3>

                    <ul className="space-y-2">

                      {consList.map(
                        (
                          item: string,
                          index: number
                        ) => (
                          <li
                            key={index}
                            className="
                              flex
                              gap-2
                              text-xs
                              sm:text-sm
                              text-gray-700
                            "
                          >
                            <span className="text-red-600 font-bold">
                              ×
                            </span>

                            <span>
                              {item}
                            </span>
                          </li>
                        )
                      )}

                    </ul>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className="
              mt-5
              sm:mt-8
              border-t
              pt-4
              sm:pt-6
            "
          >
            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-2
                sm:gap-3
              "
            >
              <WishlistButton
                product={product}
              />

              <ShareButton
                name={product.name}
              />
            </div>

            {product.affiliate_link && (
              <a
                href={product.affiliate_link}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="
                  block
                  mt-3
                  bg-orange-500
                  hover:bg-orange-600
                  text-white
                  text-center
                  py-3
                  sm:py-4
                  rounded-xl
                  font-bold
                  text-base
                  sm:text-lg
                  transition
                "
              >
                🛒 Check Price & Buy
              </a>
            )}

            <p
              className="
                text-[10px]
                sm:text-xs
                text-gray-500
                text-center
                mt-2
              "
            >
              Prices and availability may change.
              AnantaGo may earn a commission from
              qualifying purchases.
            </p>
          </div>

          {/* =================================================
              TRUST NOTE
          ================================================= */}

          <div
            className="
              mt-4
              sm:mt-7
              bg-blue-50
              border
              border-blue-100
              rounded-xl
              p-3
              sm:p-4
            "
          >
            <p
              className="
                text-xs
                sm:text-sm
                text-blue-900
                leading-relaxed
              "
            >
              <strong>About our review:</strong>{" "}
              AnantaGo's editorial score and
              pros/cons are our assessment of
              the product's usefulness, features
              and value. A comparison is not
              required for every product.
            </p>
          </div>

        </div>
      </div>

      {/* =================================================
          COMMUNITY REVIEWS
      ================================================= */}

      <div
        className="
          max-w-6xl
          mx-auto
          mt-4
          sm:mt-6
          bg-white
          rounded-xl
          sm:rounded-2xl
          shadow-md
          p-3
          sm:p-8
        "
      >
        <h2
          className="
            text-lg
            sm:text-2xl
            font-bold
            mb-1
          "
        >
          💬 Community Reviews
        </h2>

        <p
          className="
            text-gray-500
            text-xs
            sm:text-sm
            mb-4
          "
        >
          See what other AnantaGo visitors
          think about this product.
        </p>

        <ReviewSection
          productId={product.id}
        />
      </div>

      {/* =================================================
          SIMILAR PRODUCTS
      ================================================= */}

      {similarProducts.length > 0 && (
        <div
          className="
            max-w-6xl
            mx-auto
            mt-5
            sm:mt-8
          "
        >
          <div className="mb-3">

            <h2
              className="
                text-lg
                sm:text-2xl
                font-bold
              "
            >
              Similar Products
            </h2>

            <p
              className="
                text-gray-500
                text-xs
                sm:text-sm
                mt-1
              "
            >
              More options you may want
              to consider.
            </p>

          </div>

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-4
              gap-2
              sm:gap-4
            "
          >
            {similarProducts.map(
              (item: any) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="
                    bg-white
                    rounded-lg
                    sm:rounded-xl
                    shadow
                    p-2
                    sm:p-3
                    hover:shadow-lg
                    transition
                  "
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="
                      h-28
                      sm:h-32
                      w-full
                      object-cover
                      rounded-lg
                    "
                  />

                  <p
                    className="
                      font-semibold
                      mt-2
                      text-xs
                      sm:text-sm
                      line-clamp-2
                    "
                  >
                    {item.name}
                  </p>

                  {item.price && (
                    <p
                      className="
                        font-bold
                        text-orange-600
                        mt-1.5
                        text-sm
                        sm:text-base
                      "
                    >
                      ₹{item.price}
                    </p>
                  )}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </main>
  );
}

