"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PRODUCTS_PER_PAGE = 20;

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("latest");

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD ALL PRODUCTS
  // =========================

  async function loadProducts() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/products?page=1&limit=1000",
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to load products");
      }

      const data = await res.json();

      console.log("API RESPONSE:", data);

      const productList =
        Array.isArray(data)
          ? data
          : data.products || [];

      setProducts(productList);

    } catch (error) {
      console.error(
        "Failed to load products:",
        error
      );

      alert("Failed to load products");

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // =========================
  // DELETE PRODUCT
  // =========================

  async function deleteProduct(id: number) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Product deleted successfully");

        await loadProducts();

      } else {
        alert(
          data.message ||
            "Failed to delete product"
        );
      }

    } catch (error) {
      console.error(error);

      alert("Delete failed");
    }
  }

  // =========================
  // REVIEW STATUS
  // =========================

  function hasReview(product: any) {
    return (
      product.anantago_score !== null &&
      product.anantago_score !== undefined &&
      product.anantago_score !== ""
    );
  }

  // =========================
  // FILTER + SORT
  // =========================

  const filteredProducts = [...products]
    .filter((product) => {

      const productName =
        product.name || "";

      const matchesSearch =
        productName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const productCategories =
        Array.isArray(
          product.categories
        )
          ? product.categories
          : product.category
          ? [product.category]
          : [];

      const matchesCategory =
        category === "All Categories" ||
        productCategories.includes(
          category
        );

      return (
        matchesSearch &&
        matchesCategory
      );
    })
    .sort((a, b) => {

      if (sort === "priceHigh") {
        return (
          Number(b.price || 0) -
          Number(a.price || 0)
        );
      }

      if (sort === "priceLow") {
        return (
          Number(a.price || 0) -
          Number(b.price || 0)
        );
      }

      if (sort === "clicks") {
        return (
          Number(b.clicks || 0) -
          Number(a.clicks || 0)
        );
      }

      if (sort === "views") {
        return (
          Number(b.views || 0) -
          Number(a.views || 0)
        );
      }

      return (
        new Date(
          b.created_at || 0
        ).getTime() -
        new Date(
          a.created_at || 0
        ).getTime()
      );
    });

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    filteredProducts.length /
      PRODUCTS_PER_PAGE
  );

  const safeTotalPages =
    Math.max(totalPages, 1);

  const startIndex =
    (currentPage - 1) *
    PRODUCTS_PER_PAGE;

  const endIndex =
    startIndex +
    PRODUCTS_PER_PAGE;

  const paginatedProducts =
    filteredProducts.slice(
      startIndex,
      endIndex
    );

  // Reset pagination when
  // search/filter/sort changes

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    category,
    sort,
  ]);

  // =========================
  // CATEGORY LIST
  // =========================

  const allCategories = [
    ...new Set(
      products.flatMap(
        (product) =>
          Array.isArray(
            product.categories
          )
            ? product.categories
            : product.category
            ? [product.category]
            : []
      )
    ),
  ];

  // =========================
  // REVIEW COUNTS
  // =========================

  const reviewedCount =
    products.filter(
      (product) =>
        hasReview(product)
    ).length;

  const notReviewedCount =
    products.filter(
      (product) =>
        !hasReview(product)
    ).length;

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-10">

      {/* =========================
          HEADER
      ========================= */}

      <div className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-5
        mb-8
      ">

        <div>

          <h1 className="
            text-3xl
            md:text-4xl
            font-bold
            text-gray-800
          ">
            📦 Manage Products
          </h1>

          <p className="
            text-gray-500
            mt-2
          ">

            Manage all products,
            reviews and AnantaGo analysis.

            <span className="
              ml-3
              font-semibold
              text-orange-500
            ">
              Total: {products.length}
            </span>

            <span className="
              ml-3
              font-semibold
              text-blue-500
            ">
              Showing:{" "}
              {paginatedProducts.length}
            </span>

          </p>

          <p className="
            text-sm
            text-gray-500
            mt-1
          ">
            Page {currentPage} of{" "}
            {safeTotalPages}
          </p>

        </div>

        {/* =========================
            CONTROLS
        ========================= */}

        <div className="
          flex
          flex-col
          sm:flex-row
          gap-3
        ">

          <input
            type="text"
            placeholder="🔍 Search Products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              border
              rounded-lg
              px-4
              py-3
              w-full
              sm:w-72
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-orange-400
            "
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="
              border
              rounded-lg
              px-4
              py-3
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-orange-400
            "
          >

            <option value="All Categories">
              All Categories
            </option>

            {allCategories.map(
              (cat) => (

                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>

              )
            )}

          </select>

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="
              border
              rounded-lg
              px-4
              py-3
              bg-white
            "
          >

            <option value="latest">
              Latest
            </option>

            <option value="priceHigh">
              Price High → Low
            </option>

            <option value="priceLow">
              Price Low → High
            </option>

            <option value="clicks">
              Most Clicked
            </option>

            <option value="views">
              Most Viewed
            </option>

          </select>

          <Link
            href="/admin/products/add"
            className="
              bg-orange-500
              hover:bg-orange-600
              text-white
              px-6
              py-3
              rounded-lg
              font-semibold
              text-center
              whitespace-nowrap
            "
          >
            + Add Product
          </Link>

        </div>

      </div>

      {/* =========================
          REVIEW SUMMARY
      ========================= */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-3
        gap-4
        mb-6
      ">

        {/* TOTAL */}

        <div className="
          bg-white
          rounded-xl
          shadow
          p-5
        ">

          <p className="
            text-sm
            text-gray-500
          ">
            Total Products
          </p>

          <p className="
            text-3xl
            font-bold
            mt-1
          ">
            {products.length}
          </p>

        </div>

        {/* REVIEWED */}

        <div className="
          bg-green-50
          border
          border-green-200
          rounded-xl
          p-5
        ">

          <p className="
            text-sm
            text-green-700
          ">
            AnantaGo Reviews Completed
          </p>

          <p className="
            text-3xl
            font-bold
            text-green-700
            mt-1
          ">
            {reviewedCount}
          </p>

        </div>

        {/* NOT REVIEWED */}

        <div className="
          bg-yellow-50
          border
          border-yellow-200
          rounded-xl
          p-5
        ">

          <p className="
            text-sm
            text-yellow-700
          ">
            Reviews Still Needed
          </p>

          <p className="
            text-3xl
            font-bold
            text-yellow-700
            mt-1
          ">
            {notReviewedCount}
          </p>

        </div>

      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading ? (

        <div className="
          bg-white
          rounded-xl
          shadow
          p-12
          text-center
        ">

          <p className="
            text-lg
            font-semibold
            text-gray-600
          ">
            Loading products...
          </p>

        </div>

      ) : (

        /* =========================
           TABLE
        ========================= */

        <div className="
          bg-white
          rounded-xl
          shadow
          overflow-x-auto
        ">

          <table className="
            w-full
            min-w-[1100px]
          ">

            <thead className="
              bg-gray-200
            ">

              <tr>

                <th className="p-4 text-left">
                  Image
                </th>

                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Category
                </th>

                <th className="p-4 text-left">
                  Price
                </th>

                <th className="p-4 text-left">
                  AnantaGo
                </th>

                <th className="p-4 text-left">
                  Clicks
                </th>

                <th className="p-4 text-left">
                  Views
                </th>

                <th className="p-4 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedProducts.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="
                      text-center
                      py-12
                      text-gray-500
                      text-lg
                    "
                  >
                    📦 No products found.
                  </td>

                </tr>

              ) : (

                paginatedProducts.map(
                  (product) => (

                    <tr
                      key={product.id}
                      className="
                        border-t
                        hover:bg-gray-50
                      "
                    >

                      {/* IMAGE */}

                      <td className="p-4">

                        {product.image ? (

                          <img
                            src={product.image}
                            alt={
                              product.name ||
                              "Product"
                            }
                            className="
                              w-20
                              h-20
                              object-cover
                              rounded-lg
                            "
                          />

                        ) : (

                          <span>
                            No Image
                          </span>

                        )}

                      </td>

                      {/* NAME */}

                      <td className="p-4">

                        <div className="
                          font-semibold
                          max-w-xs
                        ">

                          {product.name}

                        </div>

                        {product.brand && (

                          <div className="
                            text-sm
                            text-gray-500
                            mt-1
                          ">

                            {product.brand}

                          </div>

                        )}

                      </td>

                      {/* CATEGORY */}

                      <td className="p-4">

                        <div className="
                          flex
                          flex-wrap
                          gap-1
                          max-w-xs
                        ">

                          {(Array.isArray(
                            product.categories
                          )
                            ? product.categories
                            : product.category
                            ? [product.category]
                            : []
                          )
                            .slice(0, 3)
                            .map(
                              (
                                cat: string
                              ) => (

                                <span
                                  key={cat}
                                  className="
                                    bg-gray-100
                                    px-2
                                    py-1
                                    rounded
                                    text-xs
                                  "
                                >
                                  {cat}
                                </span>

                              )
                            )}

                        </div>

                      </td>

                      {/* PRICE */}

                      <td className="p-4">

                        <div className="
                          font-semibold
                        ">

                          ₹{product.price}

                        </div>

                        {product.old_price && (

                          <div className="
                            text-sm
                            text-gray-400
                            line-through
                          ">

                            ₹{product.old_price}

                          </div>

                        )}

                      </td>

                      {/* ANANTAGO SCORE */}

                      <td className="p-4">

                        {hasReview(product) ? (

                          <div>

                            <div className="
                              inline-flex
                              items-center
                              gap-2
                              bg-green-100
                              text-green-700
                              px-3
                              py-1
                              rounded-full
                              font-bold
                            ">

                              ⭐{" "}
                              {product.anantago_score}/10

                            </div>

                            {product.review_type && (

                              <p className="
                                text-xs
                                text-gray-500
                                mt-2
                              ">

                                {product.review_type}

                              </p>

                            )}

                          </div>

                        ) : (

                          <span className="
                            inline-flex
                            items-center
                            gap-2
                            bg-yellow-100
                            text-yellow-700
                            px-3
                            py-1
                            rounded-full
                            text-sm
                            font-semibold
                          ">
                            ⚠️ Review Needed
                          </span>

                        )}

                      </td>

                      {/* CLICKS */}

                      <td className="p-4">

                        <span className="
                          bg-green-100
                          text-green-700
                          px-3
                          py-1
                          rounded-full
                          text-sm
                        ">

                          {product.clicks || 0}

                        </span>

                      </td>

                      {/* VIEWS */}

                      <td className="p-4">

                        <span className="
                          bg-blue-100
                          text-blue-700
                          px-3
                          py-1
                          rounded-full
                          text-sm
                        ">

                          {product.views || 0}

                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="p-4">

                        <div className="
                          flex
                          gap-2
                        ">

                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="
                              bg-blue-500
                              hover:bg-blue-600
                              text-white
                              px-4
                              py-2
                              rounded
                            "
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() =>
                              deleteProduct(
                                product.id
                              )
                            }
                            className="
                              bg-red-500
                              hover:bg-red-600
                              text-white
                              px-4
                              py-2
                              rounded
                            "
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      )}

      {/* =========================
          PAGINATION
      ========================= */}

      {totalPages > 1 && (

        <div className="
          flex
          justify-center
          items-center
          gap-2
          mt-8
          flex-wrap
        ">

          {/* PREVIOUS */}

          <button
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.max(
                    1,
                    page - 1
                  )
              )
            }
            disabled={
              currentPage === 1
            }
            className="
              px-4
              py-2
              rounded-lg
              border
              bg-white
              hover:bg-gray-100
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            ← Previous
          </button>

          {/* PAGE NUMBERS */}

          {Array.from(
            {
              length: totalPages,
            },
            (_, index) =>
              index + 1
          ).map((page) => (

            <button
              key={page}
              onClick={() =>
                setCurrentPage(page)
              }
              className={`
                px-4
                py-2
                rounded-lg
                border
                transition

                ${
                  currentPage === page
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white hover:bg-gray-100"
                }
              `}
            >
              {page}
            </button>

          ))}

          {/* NEXT */}

          <button
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
              )
            }
            disabled={
              currentPage === totalPages
            }
            className="
              px-4
              py-2
              rounded-lg
              border
              bg-white
              hover:bg-gray-100
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            Next →
          </button>

        </div>

      )}

    </main>
  );
}