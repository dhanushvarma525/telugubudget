import CategoryProductCard from "@/components/CategoryProductCard";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabase";

const PRODUCTS_PER_PAGE = 10;
const CATEGORY_NAME = "Devotional";

async function getProducts(page: number) {
  // ============================================
  // GET PRODUCTS FROM SUPABASE
  // ============================================

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "DEVOTIONAL CATEGORY SUPABASE ERROR:",
      error
    );

    throw new Error(
      "Failed to fetch products"
    );
  }

  // ============================================
  // FILTER BY categories ARRAY
  // ============================================

  const filteredProducts =
    (data || []).filter((product: any) => {
      if (
        !Array.isArray(
          product.categories
        )
      ) {
        return false;
      }

      return product.categories.some(
        (category: unknown) =>
          String(category)
            .trim()
            .toLowerCase() ===
          CATEGORY_NAME
            .trim()
            .toLowerCase()
      );
    });

  // ============================================
  // PAGINATION
  // ============================================

  const total =
    filteredProducts.length;

  const totalPages =
    Math.max(
      Math.ceil(
        total / PRODUCTS_PER_PAGE
      ),
      1
    );

  const safePage = Math.min(
    Math.max(page, 1),
    totalPages
  );

  const start =
    (safePage - 1) *
    PRODUCTS_PER_PAGE;

  const end =
    start + PRODUCTS_PER_PAGE;

  const products =
    filteredProducts.slice(
      start,
      end
    );

  // ============================================
  // DEBUG
  // ============================================

  console.log(
    "===================================="
  );

  console.log(
    "CATEGORY:",
    CATEGORY_NAME
  );

  console.log(
    "TOTAL DATABASE PRODUCTS:",
    data?.length || 0
  );

  console.log(
    "FILTERED PRODUCTS:",
    filteredProducts.length
  );

  console.log(
    "CURRENT PAGE:",
    safePage
  );

  console.log(
    "PRODUCTS DISPLAYED:",
    products.length
  );

  console.log(
    "DISPLAYED PRODUCT CATEGORIES:",
    products.map(
      (product: any) =>
        product.categories
    )
  );

  console.log(
    "===================================="
  );

  return {
    products,
    totalPages,
    currentPage: safePage,
  };
}

export default async function DevotionalPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const params =
    await searchParams;

  // ============================================
  // CURRENT PAGE
  // ============================================

  const requestedPage =
    Number(
      params.page || "1"
    );

  const currentPage =
    Number.isFinite(
      requestedPage
    ) &&
    requestedPage > 0
      ? Math.floor(
          requestedPage
        )
      : 1;

  // ============================================
  // GET PRODUCTS
  // ============================================

  const {
    products,
    totalPages,
  } = await getProducts(
    currentPage
  );

  // ============================================
  // UI
  // ============================================

  return (
    <main className="min-h-screen">
      {/* ========================================
          HEADER
      ======================================== */}

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        🙏 Devotional
      </h1>

      <p className="mb-6 sm:mb-8 text-gray-600">
        Spiritual and devotional products.
      </p>

      {/* ========================================
          PRODUCTS
      ======================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <p className="text-gray-500 text-lg">
              No products found.
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Category:{" "}
              {CATEGORY_NAME}
            </p>
          </div>
        ) : (
          products.map(
            (product: any) => (
              <CategoryProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                coupon={
                  product.coupon
                }
                coupon_available={
                  product.coupon_available
                }
              />
            )
          )
        )}
      </div>

      {/* ========================================
          PAGINATION
      ======================================== */}

      {totalPages > 1 && (
        <div className="mt-10 sm:mt-12 flex justify-center">
          <Pagination
            currentPage={
              currentPage
            }
            totalPages={
              totalPages
            }
          />
        </div>
      )}
    </main>
  );
}