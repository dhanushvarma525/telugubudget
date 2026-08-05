
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

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

  const [anantagoScore, setAnantagoScore] = useState("8");

  const [qualityScore, setQualityScore] = useState("8");
  const [performanceScore, setPerformanceScore] = useState("8");
  const [valueScore, setValueScore] = useState("8");
  const [featuresScore, setFeaturesScore] = useState("8");
  const [designScore, setDesignScore] = useState("8");

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

  const [reviewType, setReviewType] = useState("AnantaGo Analysis");

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
  // AI REVIEW
  // =========================

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  // =========================
  // UPLOAD / SAVE
  // =========================

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
  // CATEGORY TOGGLE
  // =========================

  function toggleCategory(categoryName: string) {
    setCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((item) => item !== categoryName)
        : [...prev, categoryName]
    );
  }

  // =========================
  // IMAGE UPLOAD
  // =========================

  async function uploadImage(
    file: File,
    setImageFunction: React.Dispatch<React.SetStateAction<string>>
  ) {
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setImageFunction(data.image);
      } else {
        alert(data.message || "Image upload failed");
      }
    } catch (error) {
      console.log(error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    setImageFunction: React.Dispatch<React.SetStateAction<string>>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadImage(file, setImageFunction);
  }

  // =========================
  // PROS
  // =========================

  function addPro() {
    setPros((prev) => [...prev, ""]);
  }

  function removePro(index: number) {
    setPros((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePro(index: number, value: string) {
    setPros((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  }

  // =========================
  // CONS
  // =========================

  function addCon() {
    setCons((prev) => [...prev, ""]);
  }

  function removeCon(index: number) {
    setCons((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCon(index: number, value: string) {
    setCons((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  }

  // =========================
  // AI REVIEW GENERATOR
  // =========================

  async function generateAIReview() {
    if (!name.trim()) {
      alert("Please enter the product name first.");
      return;
    }

    setAiLoading(true);
    setAiResult("");

    try {
      const res = await fetch("/api/ai-review", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          productName: name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to generate AI review"
        );
      }

      const review = data.review;

      // =========================
      // MAIN SCORE
      // =========================

      if (review?.score !== undefined) {
        setAnantagoScore(String(review.score));
      }

      // =========================
      // DETAILED SCORES
      // =========================

      if (review?.qualityScore !== undefined) {
        setQualityScore(String(review.qualityScore));
      }

      if (review?.performanceScore !== undefined) {
        setPerformanceScore(String(review.performanceScore));
      }

      if (review?.valueScore !== undefined) {
        setValueScore(String(review.valueScore));
      }

      if (review?.featuresScore !== undefined) {
        setFeaturesScore(String(review.featuresScore));
      }

      if (review?.designScore !== undefined) {
        setDesignScore(String(review.designScore));
      }

      // =========================
      // VERDICT
      // =========================

      if (review?.verdict) {
        setVerdict(review.verdict);
      }

      // =========================
      // BEST FOR
      // =========================

      if (review?.bestFor) {
        setBestFor(review.bestFor);
      }

      // =========================
      // NOT IDEAL FOR
      // =========================

      if (review?.avoidIf) {
        setNotIdealFor(review.avoidIf);
      }

      // =========================
      // PROS
      // =========================

      if (Array.isArray(review?.pros)) {
        setPros(
          review.pros.length > 0
            ? review.pros
            : [""]
        );
      }

      // =========================
      // CONS
      // =========================

      if (Array.isArray(review?.cons)) {
        setCons(
          review.cons.length > 0
            ? review.cons
            : [""]
        );
      }

      setAiResult(
        "AI review generated successfully. Please check and edit the generated information before saving."
      );
    } catch (error) {
      console.error("AI review error:", error);

      setAiResult("");

      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate AI review"
      );
    } finally {
      setAiLoading(false);
    }
  }

  // =========================
  // SAVE PRODUCT
  // =========================

  async function saveProduct() {
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
      const res = await fetch("/api/products", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          // =========================
          // BASIC
          // =========================

          name,

          category: categories[0],

          categories,

          brand,

          price,

          old_price: oldPrice,

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
          // PRODUCT CONTENT
          // =========================

          description,

          features,

          rating,

          // =========================
          // COUPON
          // =========================

          coupon_available: couponAvailable,

          coupon,

          // =========================
          // AFFILIATE
          // =========================

          affiliate_link: affiliateLink,

          // =========================
          // HOT PICK
          // =========================

          hot_pick: hotPick,

          // =========================
          // ANANTAGO REVIEW
          // =========================

          anantago_score: anantagoScore,

          quality_score: qualityScore,

          performance_score: performanceScore,

          value_score: valueScore,

          features_score: featuresScore,

          design_score: designScore,

          verdict,

          best_for: bestFor,

          not_ideal_for: notIdealFor,

          // =========================
          // PROS & CONS
          // =========================

          pros: pros.filter(
            (item) => item.trim() !== ""
          ),

          cons: cons.filter(
            (item) => item.trim() !== ""
          ),

          // =========================
          // REVIEW TYPE
          // =========================

          review_type: reviewType,

          // =========================
          // COMPARISON
          // =========================

          comparison_group: comparisonGroup,

          // =========================
          // PRICE HISTORY
          // =========================

          lowest_price: lowestPrice,

          highest_price: highestPrice,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Product Added Successfully");

        router.push("/admin/products");
      } else {
        alert(
          data.message || "Failed to save product"
        );
      }
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // IMAGE INPUT DATA
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
            TITLE
        ========================= */}

        <h1 className="text-3xl font-bold mb-2">
          Add Product
        </h1>

        <p className="text-gray-500 mb-8">
          Add product information, AnantaGo analysis, pros, cons and comparison details.
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
              setName(e.target.value)
            }
            className="w-full border p-3 rounded mb-4"
          />

          <input
            placeholder="Brand"
            value={brand}
            onChange={(e) =>
              setBrand(e.target.value)
            }
            className="w-full border p-3 rounded mb-4"
          />

          {/* CATEGORIES */}

          <div className="border rounded-lg p-4 mb-4">

            <p className="font-semibold mb-3">
              Select Categories
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {availableCategories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer"
                >

                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() =>
                      toggleCategory(cat)
                    }
                    className="w-4 h-4"
                  />

                  <span>{cat}</span>

                </label>
              ))}

            </div>
          </div>

          {/* HOT PICK */}

          <label className="flex items-center gap-3 mb-5 cursor-pointer">

            <input
              type="checkbox"
              checked={hotPick}
              onChange={(e) =>
                setHotPick(e.target.checked)
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
                setPrice(e.target.value)
              }
              className="w-full border p-3 rounded"
            />

            <input
              placeholder="Old Price"
              value={oldPrice}
              onChange={(e) =>
                setOldPrice(e.target.value)
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
              handleUpload(e, setImage)
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

          {additionalImages.map((img, index) => (
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
          ))}

        </div>

        {/* =========================
            DESCRIPTION
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            📝 Product Information
          </h2>

          <textarea
            placeholder="Product Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="w-full border p-3 rounded h-32 mb-4"
          />

          <textarea
            placeholder="About this item / Features (one per line)"
            value={features}
            onChange={(e) =>
              setFeatures(e.target.value)
            }
            className="w-full border p-3 rounded h-40 mb-4"
          />

          <input
            placeholder="Marketplace Rating (Example: 4.5)"
            value={rating}
            onChange={(e) =>
              setRating(e.target.value)
            }
            className="w-full border p-3 rounded mb-4"
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
            These scores represent your own AnantaGo analysis. Do not claim
            hands-on testing unless you actually tested the product.
          </p>

          {/* =========================
              AI REVIEW GENERATOR
          ========================= */}

          <div className="bg-white border-2 border-orange-300 rounded-xl p-5 mb-6">

            <h3 className="text-lg font-bold mb-2">
              🤖 Generate AnantaGo Review with AI
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Enter the product name above, then use AI to generate a
              research-based review. You can edit every generated field
              before saving.
            </p>

            <button
              type="button"
              onClick={generateAIReview}
              disabled={
                aiLoading ||
                uploading ||
                saving ||
                !name.trim()
              }
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {aiLoading
                ? "🤖 Researching & Generating Review..."
                : "🤖 Generate AI Review"}
            </button>

            {aiResult && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
                ✅ {aiResult}
              </div>
            )}

          </div>

          {/* REVIEW TYPE */}

          <label className="block font-semibold mb-2">
            Review Type
          </label>

          <select
            value={reviewType}
            onChange={(e) =>
              setReviewType(e.target.value)
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

          {/* MAIN SCORE */}

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
                value={anantagoScore}
                onChange={(e) =>
                  setAnantagoScore(
                    e.target.value
                  )
                }
                className="border p-3 rounded w-32"
              />

              <span className="text-xl font-bold">
                / 10
              </span>

            </div>

          </div>

          {/* INDIVIDUAL SCORES */}

          <h3 className="font-bold text-lg mb-3">
            Detailed Scores
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

            <div>

              <label className="block font-medium mb-1">
                Quality
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={qualityScore}
                onChange={(e) =>
                  setQualityScore(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded"
              />

            </div>

            <div>

              <label className="block font-medium mb-1">
                Performance
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={performanceScore}
                onChange={(e) =>
                  setPerformanceScore(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded"
              />

            </div>

            <div>

              <label className="block font-medium mb-1">
                Value for Money
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={valueScore}
                onChange={(e) =>
                  setValueScore(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded"
              />

            </div>

            <div>

              <label className="block font-medium mb-1">
                Features
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={featuresScore}
                onChange={(e) =>
                  setFeaturesScore(
                    e.target.value
                  )
                }
                className="w-full border p-3 rounded"
              />

            </div>

            <div>

              <label className="block font-medium mb-1">
                Design
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
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

          {/* VERDICT */}

          <label className="block font-semibold mb-2">
            AnantaGo Verdict
          </label>

          <textarea
            placeholder="Example: This is a strong option for users who want fast charging and good portability. However, the price may be high for budget buyers."
            value={verdict}
            onChange={(e) =>
              setVerdict(e.target.value)
            }
            className="w-full border p-3 rounded h-32 mb-5"
          />

          {/* BEST FOR */}

          <label className="block font-semibold mb-2">
            👍 Best For
          </label>

          <textarea
            placeholder="Example: Travelers, students, office users, heavy smartphone users..."
            value={bestFor}
            onChange={(e) =>
              setBestFor(e.target.value)
            }
            className="w-full border p-3 rounded h-24 mb-5"
          />

          {/* NOT IDEAL FOR */}

          <label className="block font-semibold mb-2">
            👎 Not Ideal For
          </label>

          <textarea
            placeholder="Example: People looking for the cheapest option..."
            value={notIdealFor}
            onChange={(e) =>
              setNotIdealFor(e.target.value)
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

          {pros.map((pro, index) => (
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
                placeholder={`Pro ${index + 1}`}
                className="flex-1 border p-3 rounded"
              />

              {pros.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removePro(index)
                  }
                  className="px-4 bg-red-100 text-red-600 rounded"
                >
                  Delete
                </button>
              )}

            </div>
          ))}

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

          {cons.map((con, index) => (
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
                placeholder={`Con ${index + 1}`}
                className="flex-1 border p-3 rounded"
              />

              {cons.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removeCon(index)
                  }
                  className="px-4 bg-red-100 text-red-600 rounded"
                >
                  Delete
                </button>
              )}

            </div>
          ))}

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
            Products with the same comparison group can later be shown
            together in AnantaGo comparison pages.
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
            Optional. Use these fields only when you have reliable historical
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
            STOCK / DELIVERY
        ========================= */}

        <div className="border rounded-xl p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            🚚 Availability
          </h2>

          <select
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
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
              setDelivery(e.target.value)
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
              checked={couponAvailable}
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
                setCoupon(e.target.value)
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

        {aiLoading && (
          <div className="bg-purple-50 text-purple-700 p-4 rounded-lg mb-4">
            🤖 AI is researching the product and generating your AnantaGo analysis...
          </div>
        )}

        {/* =========================
            SAVE BUTTON
        ========================= */}

        <button
          onClick={saveProduct}
          disabled={
            saving ||
            uploading ||
            aiLoading
          }
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50"
        >
          {saving
            ? "Saving Product..."
            : "Save Product"}
        </button>

      </div>
    </main>
  );
}

