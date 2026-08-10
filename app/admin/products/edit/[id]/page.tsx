"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const id = String(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiReviewing, setAiReviewing] = useState(false);

  // =========================
  // BASIC PRODUCT INFORMATION
  // =========================

  const [name, setName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [brand, setBrand] = useState("");

  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");

  const [stock, setStock] = useState("In Stock");
  const [delivery, setDelivery] = useState("Free Delivery");

  // =========================
  // IMAGES
  // =========================

  const [image, setImage] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [image4, setImage4] = useState("");
  const [image5, setImage5] = useState("");
  const [image6, setImage6] = useState("");

  // =========================
  // PRODUCT CONTENT
  // =========================

  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");

  // =========================
  // MARKETPLACE RATING
  // =========================

  const [rating, setRating] = useState("5");

  // =========================
  // COUPON
  // =========================

  const [couponAvailable, setCouponAvailable] = useState(false);
  const [coupon, setCoupon] = useState("");

  // =========================
  // AFFILIATE
  // =========================

  const [affiliateLink, setAffiliateLink] = useState("");

  // =========================
  // HOT PICK
  // =========================

  const [hotPick, setHotPick] = useState(false);

  // =========================
  // ANANTAGO REVIEW
  // =========================

  // IMPORTANT:
  // These are intentionally blank.
  // We DO NOT default them to 8.

  const [anantagoScore, setAnantagoScore] = useState("");

  const [qualityScore, setQualityScore] = useState("");
  const [performanceScore, setPerformanceScore] = useState("");
  const [valueScore, setValueScore] = useState("");
  const [featuresScore, setFeaturesScore] = useState("");
  const [designScore, setDesignScore] = useState("");

  const [verdict, setVerdict] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [notIdealFor, setNotIdealFor] = useState("");

  // =========================
  // PROS & CONS
  // =========================

  const [pros, setPros] = useState<string[]>([""]);
  const [cons, setCons] = useState<string[]>([""]);

  // =========================
  // REVIEW TYPE
  // =========================

  const [reviewType, setReviewType] = useState(
    "AnantaGo Analysis"
  );

  // =========================
  // COMPARISON
  // =========================

  const [comparisonGroup, setComparisonGroup] = useState("");

  // =========================
  // PRICE HISTORY
  // =========================

  const [lowestPrice, setLowestPrice] = useState("");
  const [highestPrice, setHighestPrice] = useState("");

  // =========================
  // CATEGORIES
  // =========================

  const availableCategories = [
    "Today's Deals",
    "Under ₹150",
    "Impress Your Crush",
    "Mom's Favorites",
    "Dad's Essentials",
    "Devotional",
    "Electronics",
    "Fashion",
    "Men & Women Wear",
  ];

  // =========================
  // LOAD PRODUCT
  // =========================

  useEffect(() => {
    if (!id) return;

    loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/products/${id}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch product"
        );
      }

      const data = await response.json();

      // =========================
      // BASIC
      // =========================

      setName(data.name || "");

      setCategories(
        Array.isArray(data.categories) &&
          data.categories.length > 0
          ? data.categories
          : data.category
          ? [data.category]
          : []
      );

      setBrand(data.brand || "");

      setPrice(
        data.price !== null &&
          data.price !== undefined
          ? String(data.price)
          : ""
      );

      setOldPrice(
        data.old_price !== null &&
          data.old_price !== undefined
          ? String(data.old_price)
          : ""
      );

      setStock(
        data.stock || "In Stock"
      );

      setDelivery(
        data.delivery || "Free Delivery"
      );

      // =========================
      // IMAGES
      // =========================

      setImage(data.image || "");
      setImage2(data.image2 || "");
      setImage3(data.image3 || "");
      setImage4(data.image4 || "");
      setImage5(data.image5 || "");
      setImage6(data.image6 || "");

      // =========================
      // PRODUCT CONTENT
      // =========================

      setDescription(
        data.description || ""
      );

      setFeatures(
        data.features || ""
      );

      setRating(
        data.rating !== null &&
          data.rating !== undefined
          ? String(data.rating)
          : "5"
      );

      // =========================
      // COUPON
      // =========================

      setCouponAvailable(
        Boolean(data.coupon_available)
      );

      setCoupon(
        data.coupon || ""
      );

      // =========================
      // AFFILIATE
      // =========================

      setAffiliateLink(
        data.affiliate_link || ""
      );

      // =========================
      // HOT PICK
      // =========================

      setHotPick(
        Boolean(data.hot_pick)
      );

      // =========================
      // ANANTAGO REVIEW
      // =========================

      // IMPORTANT:
      // If database has a score, load it.
      // Otherwise leave blank instead of 8.

      setAnantagoScore(
        data.anantago_score !== null &&
          data.anantago_score !== undefined &&
          data.anantago_score !== ""
          ? String(data.anantago_score)
          : ""
      );

      setQualityScore(
        data.quality_score !== null &&
          data.quality_score !== undefined &&
          data.quality_score !== ""
          ? String(data.quality_score)
          : ""
      );

      setPerformanceScore(
        data.performance_score !== null &&
          data.performance_score !== undefined &&
          data.performance_score !== ""
          ? String(data.performance_score)
          : ""
      );

      setValueScore(
        data.value_score !== null &&
          data.value_score !== undefined &&
          data.value_score !== ""
          ? String(data.value_score)
          : ""
      );

      setFeaturesScore(
        data.features_score !== null &&
          data.features_score !== undefined &&
          data.features_score !== ""
          ? String(data.features_score)
          : ""
      );

      setDesignScore(
        data.design_score !== null &&
          data.design_score !== undefined &&
          data.design_score !== ""
          ? String(data.design_score)
          : ""
      );

      setVerdict(
        data.verdict || ""
      );

      setBestFor(
        data.best_for || ""
      );

      setNotIdealFor(
        data.not_ideal_for || ""
      );

      // =========================
      // PROS
      // =========================

      if (Array.isArray(data.pros)) {
        setPros(
          data.pros.length > 0
            ? data.pros
            : [""]
        );
      } else {
        setPros([""]);
      }

      // =========================
      // CONS
      // =========================

      if (Array.isArray(data.cons)) {
        setCons(
          data.cons.length > 0
            ? data.cons
            : [""]
        );
      } else {
        setCons([""]);
      }

      // =========================
      // REVIEW TYPE
      // =========================

      setReviewType(
        data.review_type ||
          "AnantaGo Analysis"
      );

      // =========================
      // COMPARISON
      // =========================

      setComparisonGroup(
        data.comparison_group || ""
      );

      // =========================
      // PRICE HISTORY
      // =========================

      setLowestPrice(
        data.lowest_price !== null &&
          data.lowest_price !== undefined
          ? String(data.lowest_price)
          : ""
      );

      setHighestPrice(
        data.highest_price !== null &&
          data.highest_price !== undefined
          ? String(data.highest_price)
          : ""
      );
    } catch (error) {
      console.error(error);

      alert("Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // CATEGORY TOGGLE
  // =========================

  function toggleCategory(
    categoryName: string
  ) {
    setCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter(
            (item) =>
              item !== categoryName
          )
        : [...prev, categoryName]
    );
  }

  // =========================
  // IMAGE UPLOAD
  // =========================

  async function uploadImage(
    file: File,
    setImageFunction: React.Dispatch<
      React.SetStateAction<string>
    >
  ) {
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append(
        "file",
        file
      );

      const res = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await res.json();

      if (data.success) {
        setImageFunction(
          data.image
        );
      } else {
        alert(
          data.message ||
            "Image upload failed"
        );
      }
    } catch (error) {
      console.error(error);

      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    setImageFunction: React.Dispatch<
      React.SetStateAction<string>
    >
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    await uploadImage(
      file,
      setImageFunction
    );
  }

  // =========================
  // AI AUTO REVIEW
  // =========================

  async function generateAIReview() {
    const productName =
      name.trim();

    if (!productName) {
      alert(
        "Product name is required"
      );

      return;
    }

    setAiReviewing(true);

    try {
      const response =
        await fetch(
          "/api/ai-review",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              productName,

              brand,

              category:
                categories.join(", "),

              price,

              description,

              features,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "AI review generation failed"
        );
      }

      if (!data.review) {
        throw new Error(
          "AI review data was not received"
        );
      }

      const review =
        data.review;

      // =========================
      // OVERALL SCORE
      // =========================

      if (
        review.score !==
          undefined &&
        review.score !== null
      ) {
        setAnantagoScore(
          String(review.score)
        );
      }

      // =========================
      // QUALITY
      // =========================

      if (
        review.qualityScore !==
          undefined &&
        review.qualityScore !== null
      ) {
        setQualityScore(
          String(
            review.qualityScore
          )
        );
      }

      // =========================
      // PERFORMANCE
      // =========================

      if (
        review.performanceScore !==
          undefined &&
        review.performanceScore !== null
      ) {
        setPerformanceScore(
          String(
            review.performanceScore
          )
        );
      }

      // =========================
      // VALUE FOR MONEY
      // =========================

      if (
        review.valueScore !==
          undefined &&
        review.valueScore !== null
      ) {
        setValueScore(
          String(
            review.valueScore
          )
        );
      }

      // =========================
      // FEATURES
      // =========================

      if (
        review.featuresScore !==
          undefined &&
        review.featuresScore !== null
      ) {
        setFeaturesScore(
          String(
            review.featuresScore
          )
        );
      }

      // =========================
      // DESIGN
      // =========================

      if (
        review.designScore !==
          undefined &&
        review.designScore !== null
      ) {
        setDesignScore(
          String(
            review.designScore
          )
        );
      }

      // =========================
      // VERDICT
      // =========================

      if (review.verdict) {
        setVerdict(
          review.verdict
        );
      }

      // =========================
      // BEST FOR
      // =========================

      if (review.bestFor) {
        setBestFor(
          review.bestFor
        );
      }

      // =========================
      // NOT IDEAL FOR
      // =========================

      if (review.avoidIf) {
        setNotIdealFor(
          review.avoidIf
        );
      }

      // =========================
      // PROS
      // =========================

      if (
        Array.isArray(
          review.pros
        )
      ) {
        setPros(
          review.pros.length > 0
            ? review.pros
            : [""]
        );
      }

      // =========================
      // CONS
      // =========================

      if (
        Array.isArray(
          review.cons
        )
      ) {
        setCons(
          review.cons.length > 0
            ? review.cons
            : [""]
        );
      }

      alert(
        "🤖 Genuine research-based AnantaGo review generated. Please check the generated content before saving."
      );
    } catch (error) {
      console.error(
        "AI Review Error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "AI review generation failed"
      );
    } finally {
      setAiReviewing(false);
    }
  }

  // =========================
  // PROS
  // =========================

  function addPro() {
    setPros((prev) => [
      ...prev,
      "",
    ]);
  }

  function removePro(
    index: number
  ) {
    setPros((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }

  function updatePro(
    index: number,
    value: string
  ) {
    setPros((prev) =>
      prev.map(
        (item, i) =>
          i === index
            ? value
            : item
      )
    );
  }

  // =========================
  // CONS
  // =========================

  function addCon() {
    setCons((prev) => [
      ...prev,
      "",
    ]);
  }

  function removeCon(
    index: number
  ) {
    setCons((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }

  function updateCon(
    index: number,
    value: string
  ) {
    setCons((prev) =>
      prev.map(
        (item, i) =>
          i === index
            ? value
            : item
      )
    );
  }

  // =========================
  // UPDATE PRODUCT
  // =========================

  async function updateProduct() {
    if (
      !name.trim() ||
      !price ||
      !image ||
      categories.length === 0
    ) {
      alert(
        "Main image, product name, price and at least one category are required."
      );

      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          `/api/products/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              // =========================
              // BASIC
              // =========================

              name:
                name.trim(),

              category:
                categories[0],

              categories,

              brand,

              price,

              old_price:
                oldPrice,

              stock,

              delivery,

              // =========================
              // IMAGES
              // =========================

              image,

              image2,

              image3,

              image4,

              image5,

              image6,

              // =========================
              // CONTENT
              // =========================

              description,

              features,

              rating,

              // =========================
              // COUPON
              // =========================

              coupon_available:
                couponAvailable,

              coupon,

              // =========================
              // AFFILIATE
              // =========================

              affiliate_link:
                affiliateLink,

              // =========================
              // HOT PICK
              // =========================

              hot_pick:
                hotPick,

              // =========================
              // ANANTAGO REVIEW
              // =========================

              anantago_score:
                anantagoScore,

              quality_score:
                qualityScore,

              performance_score:
                performanceScore,

              value_score:
                valueScore,

              features_score:
                featuresScore,

              design_score:
                designScore,

              verdict,

              best_for:
                bestFor,

              not_ideal_for:
                notIdealFor,

              // =========================
              // PROS & CONS
              // =========================

              pros:
                pros.filter(
                  (item) =>
                    item.trim() !==
                    ""
                ),

              cons:
                cons.filter(
                  (item) =>
                    item.trim() !==
                    ""
                ),

              // =========================
              // REVIEW TYPE
              // =========================

              review_type:
                reviewType,

              // =========================
              // COMPARISON
              // =========================

              comparison_group:
                comparisonGroup.trim() ||
                null,

              // =========================
              // PRICE HISTORY
              // =========================

              lowest_price:
                lowestPrice.trim() ||
                null,

              highest_price:
                highestPrice.trim() ||
                null,
            }),
          }
        );

      const data =
        await response.json();

      if (data.success) {
        alert(
          "Product updated successfully"
        );

        router.push(
          "/admin/products"
        );

        router.refresh();
      } else {
        alert(
          data.message ||
            "Update failed"
        );
      }
    } catch (error) {
      console.error(error);

      alert("Update failed");
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-xl font-bold">
            Loading Product...
          </p>

          <p className="text-gray-500 mt-2">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // ADDITIONAL IMAGES
  // =========================

  const additionalImages = [
    {
      label: "Image 2",
      setter: setImage2,
      value: image2,
    },
    {
      label: "Image 3",
      setter: setImage3,
      value: image3,
    },
    {
      label: "Image 4",
      setter: setImage4,
      value: image4,
    },
    {
      label: "Image 5",
      setter: setImage5,
      value: image5,
    },
    {
      label: "Image 6",
      setter: setImage6,
      value: image6,
    },
  ];

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-5 md:p-8">

        {/* =========================
            HEADER
        ========================= */}

        <h1 className="text-3xl font-bold mb-2">
          Edit Product
        </h1>

        <p className="text-gray-500 mb-8">
          Update product information,
          AnantaGo analysis, pros, cons
          and comparison details.
        </p>

        {/* =========================
            BASIC INFORMATION
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            🛍️ Basic Product Information
          </h2>

          <input
            placeholder="Product Name"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="w-full border p-3 rounded mb-4"
          />

          <input
            placeholder="Brand"
            value={brand}
            onChange={(e) =>
              setBrand(
                e.target.value
              )
            }
            className="w-full border p-3 rounded mb-4"
          />

          {/* CATEGORIES */}

          <div className="border rounded-lg p-4 mb-4">

            <p className="font-semibold mb-3">
              Select Categories
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {availableCategories.map(
                (cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 cursor-pointer"
                  >

                    <input
                      type="checkbox"
                      checked={categories.includes(
                        cat
                      )}
                      onChange={() =>
                        toggleCategory(
                          cat
                        )
                      }
                      className="w-4 h-4"
                    />

                    <span>
                      {cat}
                    </span>

                  </label>
                )
              )}

            </div>

          </div>

          {/* HOT PICK */}

          <label className="flex items-center gap-3 mb-5 cursor-pointer">

            <input
              type="checkbox"
              checked={hotPick}
              onChange={(e) =>
                setHotPick(
                  e.target.checked
                )
              }
              className="w-5 h-5"
            />

            <span className="font-semibold">
              🔥 Show in Today's Hot Picks
            </span>

          </label>

          {/* PRICE */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              placeholder="Current Price"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded"
            />

            <input
              placeholder="Old Price"
              value={oldPrice}
              onChange={(e) =>
                setOldPrice(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded"
            />

          </div>

        </div>

        {/* =========================
            IMAGES
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            🖼️ Product Images
          </h2>

          <p className="font-semibold mb-2">
            Main Image (Required)
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleUpload(
                e,
                setImage
              )
            }
            className="mb-4"
          />

          {image && (
            <img
              src={image}
              alt="Main Product"
              className="w-32 h-32 object-cover rounded mb-5"
            />
          )}

          <p className="font-semibold mb-4">
            Additional Images (Optional)
          </p>

          {additionalImages.map(
            (img, index) => (
              <div
                key={index}
                className="mb-5 border-b pb-5 last:border-b-0"
              >

                <p className="font-medium mb-2">
                  {img.label}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleUpload(
                      e,
                      img.setter
                    )
                  }
                  className="mb-2"
                />

                {img.value && (
                  <img
                    src={img.value}
                    alt={img.label}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}

              </div>
            )
          )}

        </div>

        {/* =========================
            PRODUCT INFORMATION
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            📝 Product Information
          </h2>

          <textarea
            placeholder="Product Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="w-full border p-3 rounded h-32 mb-4"
          />

          <textarea
            placeholder="About this item / Features (one per line)"
            value={features}
            onChange={(e) =>
              setFeatures(
                e.target.value
              )
            }
            className="w-full border p-3 rounded h-40 mb-4"
          />

          <input
            placeholder="Marketplace Rating (Example: 4.5)"
            value={rating}
            onChange={(e) =>
              setRating(
                e.target.value
              )
            }
            className="w-full border p-3 rounded"
          />

        </div>

        {/* =========================
            ANANTAGO REVIEW
        ========================= */}

        <div className="border-2 border-orange-200 rounded-xl p-5 mb-6 bg-orange-50">

          <h2 className="text-xl font-bold mb-2">
            ⭐ AnantaGo Review & Analysis
          </h2>

          <p className="text-sm text-gray-600 mb-5">
            These scores represent your
            AnantaGo research analysis.
            They are generated from product
            information and web research.
            Do not claim hands-on testing unless
            you actually tested the product.
          </p>

          {/* =========================
              AI AUTO REVIEW
          ========================= */}

          <div className="bg-white border-2 border-purple-200 rounded-xl p-5 mb-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h3 className="text-lg font-bold">
                  🤖 AI Auto Review
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  Research the product and
                  generate genuine AnantaGo
                  scores, pros, cons and analysis.
                  Review the result before saving.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  generateAIReview
                }
                disabled={
                  aiReviewing ||
                  saving ||
                  uploading
                }
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-bold disabled:opacity-50 whitespace-nowrap"
              >

                {aiReviewing
                  ? "🤖 Researching..."
                  : "🤖 Research & Generate Review"}

              </button>

            </div>

          </div>

          {/* =========================
              REVIEW TYPE
          ========================= */}

          <label className="block font-semibold mb-2">
            Review Type
          </label>

          <select
            value={reviewType}
            onChange={(e) =>
              setReviewType(
                e.target.value
              )
            }
            className="w-full border p-3 rounded mb-5 bg-white"
          >

            <option value="AnantaGo Analysis">
              🔎 AnantaGo Analysis
            </option>

            <option value="Hands-on Tested">
              🧪 Hands-on Tested
            </option>

            <option value="Comparison Review">
              📊 Comparison Review
            </option>

          </select>

          {/* =========================
              MAIN SCORE
          ========================= */}

          <div className="bg-white border rounded-xl p-5 mb-5">

            <label className="block font-semibold mb-2">
              AnantaGo Score
            </label>

            <div className="flex items-center gap-3">

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Generated after research"
                value={anantagoScore}
                onChange={(e) =>
                  setAnantagoScore(
                    e.target.value
                  )
                }
                className="border p-3 rounded w-40"
              />

              <span className="text-xl font-bold">
                / 10
              </span>

            </div>

            <p className="text-xs text-gray-500 mt-2">
              Overall score is calculated from
              the five detailed scores.
            </p>

          </div>

          {/* =========================
              DETAILED SCORES
          ========================= */}

          <h3 className="font-bold text-lg mb-3">
            Detailed Scores
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            These scores are generated
            independently from the researched
            product information. They should not
            all default to the same number.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

            {/* QUALITY */}

            <div>

              <label className="block font-medium mb-1">
                Quality
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Research-based score"
                value={qualityScore}
                onChange={(e) =>
                  setQualityScore(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded"
              />

            </div>

            {/* PERFORMANCE */}

            <div>

              <label className="block font-medium mb-1">
                Performance
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Research-based score"
                value={performanceScore}
                onChange={(e) =>
                  setPerformanceScore(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded"
              />

            </div>

            {/* VALUE */}

            <div>

              <label className="block font-medium mb-1">
                Value for Money
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Research-based score"
                value={valueScore}
                onChange={(e) =>
                  setValueScore(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded"
              />

            </div>

            {/* FEATURES */}

            <div>

              <label className="block font-medium mb-1">
                Features
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Research-based score"
                value={featuresScore}
                onChange={(e) =>
                  setFeaturesScore(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded"
              />

            </div>

            {/* DESIGN */}

            <div>

              <label className="block font-medium mb-1">
                Design
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Research-based score"
                value={designScore}
                onChange={(e) =>
                  setDesignScore(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded"
              />

            </div>

          </div>

          {/* =========================
              SCORE EXPLANATION
          ========================= */}

          <div className="bg-white border rounded-xl p-4 mb-5">

            <p className="font-semibold mb-2">
              AnantaGo Score Calculation
            </p>

            <p className="text-sm text-gray-600">
              Quality 25% + Performance 25% +
              Value for Money 20% + Features 20%
              + Design 10%.
            </p>

          </div>

          {/* =========================
              VERDICT
          ========================= */}

          <label className="block font-semibold mb-2">
            AnantaGo Verdict
          </label>

          <textarea
            placeholder="Example: Research suggests this is a strong option for users who want..."
            value={verdict}
            onChange={(e) =>
              setVerdict(
                e.target.value
              )
            }
            className="w-full border p-3 rounded h-32 mb-5"
          />

          {/* =========================
              BEST FOR
          ========================= */}

          <label className="block font-semibold mb-2">
            👍 Best For
          </label>

          <textarea
            placeholder="Example: Travelers, students, office users..."
            value={bestFor}
            onChange={(e) =>
              setBestFor(
                e.target.value
              )
            }
            className="w-full border p-3 rounded h-24 mb-5"
          />

          {/* =========================
              NOT IDEAL
          ========================= */}

          <label className="block font-semibold mb-2">
            👎 Not Ideal For
          </label>

          <textarea
            placeholder="Example: People looking for the cheapest option..."
            value={notIdealFor}
            onChange={(e) =>
              setNotIdealFor(
                e.target.value
              )
            }
            className="w-full border p-3 rounded h-24"
          />

        </div>

        {/* =========================
            PROS
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            👍 Pros
          </h2>

          {pros.map(
            (pro, index) => (
              <div
                key={index}
                className="flex gap-2 mb-3"
              >

                <input
                  value={pro}
                  onChange={(e) =>
                    updatePro(
                      index,
                      e.target.value
                    )
                  }
                  placeholder={`Pro ${
                    index + 1
                  }`}
                  className="flex-1 border p-3 rounded"
                />

                {pros.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removePro(
                        index
                      )
                    }
                    className="px-4 bg-red-100 text-red-600 rounded"
                  >
                    Delete
                  </button>
                )}

              </div>
            )
          )}

          <button
            type="button"
            onClick={addPro}
            className="bg-green-100 text-green-700 px-4 py-2 rounded font-semibold"
          >
            + Add Pro
          </button>

        </div>

        {/* =========================
            CONS
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            👎 Cons
          </h2>

          {cons.map(
            (con, index) => (
              <div
                key={index}
                className="flex gap-2 mb-3"
              >

                <input
                  value={con}
                  onChange={(e) =>
                    updateCon(
                      index,
                      e.target.value
                    )
                  }
                  placeholder={`Con ${
                    index + 1
                  }`}
                  className="flex-1 border p-3 rounded"
                />

                {cons.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      removeCon(
                        index
                      )
                    }
                    className="px-4 bg-red-100 text-red-600 rounded"
                  >
                    Delete
                  </button>
                )}

              </div>
            )
          )}

          <button
            type="button"
            onClick={addCon}
            className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold"
          >
            + Add Con
          </button>

        </div>

        {/* =========================
            COMPARISON
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-2">
            📊 Comparison
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Products with the same comparison
            group can later be shown together
            in AnantaGo comparison pages.
          </p>

          <input
            placeholder="Comparison Group (Example: Power Banks)"
            value={comparisonGroup}
            onChange={(e) =>
              setComparisonGroup(
                e.target.value
              )
            }
            className="w-full border p-3 rounded"
          />

        </div>

        {/* =========================
            PRICE HISTORY
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-2">
            📉 Price Information
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Optional. Use these fields only
            when you have reliable historical
            price information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              placeholder="Lowest Recorded Price"
              value={lowestPrice}
              onChange={(e) =>
                setLowestPrice(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded"
            />

            <input
              placeholder="Highest Recorded Price"
              value={highestPrice}
              onChange={(e) =>
                setHighestPrice(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded"
            />

          </div>

        </div>

        {/* =========================
            AVAILABILITY
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            🚚 Availability
          </h2>

          <select
            value={stock}
            onChange={(e) =>
              setStock(
                e.target.value
              )
            }
            className="w-full border p-3 rounded mb-4"
          >

            <option value="In Stock">
              🟢 In Stock
            </option>

            <option value="Out of Stock">
              🔴 Out of Stock
            </option>

          </select>

          <input
            placeholder="Delivery (Example: Free Delivery)"
            value={delivery}
            onChange={(e) =>
              setDelivery(
                e.target.value
              )
            }
            className="w-full border p-3 rounded"
          />

        </div>

        {/* =========================
            COUPON
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            🎟️ Coupon
          </h2>

          <label className="flex items-center gap-3 mb-3 cursor-pointer">

            <input
              type="checkbox"
              checked={
                couponAvailable
              }
              onChange={(e) =>
                setCouponAvailable(
                  e.target.checked
                )
              }
              className="w-5 h-5"
            />

            <span className="font-semibold">
              Coupon Available
            </span>

          </label>

          {couponAvailable && (
            <input
              placeholder="Coupon Code (Example: EXTRA10)"
              value={coupon}
              onChange={(e) =>
                setCoupon(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded"
            />
          )}

        </div>

        {/* =========================
            AFFILIATE LINK
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            🔗 Purchase Link
          </h2>

          <input
            placeholder="Amazon / Flipkart Affiliate Link"
            value={affiliateLink}
            onChange={(e) =>
              setAffiliateLink(
                e.target.value
              )
            }
            className="w-full border p-3 rounded"
          />

        </div>

        {/* =========================
            UPLOAD STATUS
        ========================= */}

        {uploading && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-4">
            Uploading image...
          </div>
        )}

        {/* =========================
            AI STATUS
        ========================= */}

        {aiReviewing && (
          <div className="bg-purple-50 text-purple-700 p-4 rounded-lg mb-4">
            🤖 AI is researching the product
            and generating the review...
          </div>
        )}

        {/* =========================
            SAVE BUTTON
        ========================= */}

        <button
          type="button"
          onClick={
            updateProduct
          }
          disabled={
            saving ||
            uploading ||
            aiReviewing
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50"
        >

          {saving
            ? "Saving Changes..."
            : "Save Changes"}

        </button>

      </div>

    </main>
  );
}