
"use client";

import { useState } from "react";

export default function AIReviewTestPage() {
  const [productName, setProductName] = useState(
    "Anker PowerCore 10000"
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function generateReview() {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("/api/ai-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to generate review"
        );
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 sm:p-10">

      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-md p-6">

          <h1 className="text-3xl font-bold text-gray-800">
            🤖 AnantaGo AI Review Test
          </h1>

          <p className="text-gray-500 mt-2">
            Test AI-powered product research before connecting
            it to your 80+ products.
          </p>

          <div className="mt-6">

            <label className="block font-semibold mb-2">
              Product Name
            </label>

            <input
              type="text"
              value={productName}
              onChange={(e) =>
                setProductName(e.target.value)
              }
              className="
                w-full
                border
                rounded-lg
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-orange-400
              "
              placeholder="Enter product name"
            />

          </div>

          <button
            onClick={generateReview}
            disabled={loading || !productName.trim()}
            className="
              mt-5
              w-full
              bg-orange-500
              hover:bg-orange-600
              disabled:bg-gray-400
              text-white
              font-bold
              py-3
              rounded-lg
            "
          >
            {loading
              ? "🔎 Researching + Generating Review..."
              : "🤖 Generate AI Review"}
          </button>

          {error && (

            <div className="
              mt-6
              bg-red-50
              border
              border-red-200
              text-red-700
              rounded-lg
              p-4
            ">
              <strong>Error:</strong> {error}
            </div>

          )}

          {result && (

            <div className="mt-8">

              <h2 className="text-2xl font-bold mb-4">
                ✅ AI Result
              </h2>

              <pre className="
                bg-gray-900
                text-green-300
                p-5
                rounded-xl
                overflow-x-auto
                whitespace-pre-wrap
                text-sm
              ">
                {JSON.stringify(result, null, 2)}
              </pre>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}

