
"use client";

import { useState } from "react";

export default function TavilyTestPage() {
  const [productName, setProductName] = useState(
    "Anker PowerCore 10000"
  );

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchProduct() {
    setLoading(true);
    setResults([]);
    setError("");

    try {
      const response = await fetch("/api/tavily-test", {
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
          data.error || "Tavily search failed"
        );
      }

      setResults(data.results || []);
    } catch (error: any) {
      console.error(error);

      setError(
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 sm:p-10">

      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-2xl shadow-md p-6">

          <h1 className="text-3xl font-bold text-gray-800">
            🔎 AnantaGo Tavily Research Test
          </h1>

          <p className="text-gray-500 mt-2">
            Test whether AnantaGo can research a real
            product before generating an AI review.
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
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-orange-400
              "
              placeholder="Enter product name"
            />

          </div>

          <button
            onClick={searchProduct}
            disabled={
              loading ||
              !productName.trim()
            }
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
              ? "🔎 Researching..."
              : "🔎 Research Product"}
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
              <strong>Error:</strong>{" "}
              {error}
            </div>

          )}

        </div>

        {results.length > 0 && (

          <div className="mt-6 space-y-5">

            <h2 className="text-2xl font-bold">
              🔎 Research Results
            </h2>

            {results.map(
              (result, index) => (

                <div
                  key={index}
                  className="
                    bg-white
                    rounded-xl
                    shadow
                    p-5
                  "
                >

                  <h3 className="text-lg font-bold">

                    {result.title}

                  </h3>

                  {result.url && (

                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        text-blue-600
                        hover:underline
                        text-sm
                        break-all
                      "
                    >
                      {result.url}
                    </a>

                  )}

                  <p className="
                    text-gray-700
                    mt-3
                    leading-relaxed
                  ">
                    {result.content}
                  </p>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </main>
  );
}

