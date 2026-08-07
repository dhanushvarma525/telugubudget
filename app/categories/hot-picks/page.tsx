
import CategoryProductCard from "@/components/CategoryProductCard";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabase";

const PRODUCTS_PER_PAGE = 10;

async function getProducts(page: number) {
  // ============================================
  // GET ALL PRODUCTS
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
      "HOT PICKS SUPABASE ERROR:",
      error
    );

    throw new Error(
      "Failed to fetch hot picks"
    );
  }

  // ============================================
  // FILTER HOT PICKS
  // ============================================

  const filteredProducts =
    (data || []).filter(
      (product: any) =>
        product.hot_pick === true
    );

  // ============================================
  // PAGINATION
  // ============================================

  const total =
    filteredProducts.length;

  const totalPages = Math.max(
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
    "HOT PICKS"
  );

  console.log(
    "TOTAL PRODUCTS:",
    data?.length || 0
  );

  console.log(
    "HOT PICK PRODUCTS:",
    filteredProducts.length
  );

  console.log(
    "PAGE:",
    safePage
  );

  console.log(
    "PRODUCTS DISPLAYED:",
    products.length
  );

  console.log(
    "DISPLAYED PRODUCT IDS:",
    products.map(
      (product: any) =>
        product.id
    )
  );

  console.log(
    "DISPLAYED HOT PICK VALUES:",
    products.map(
      (product: any) =>
        product.hot_pick
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

export default async function HotPicksPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const params =
    await searchParams;

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

  const {
    products,
    totalPages,
  } = await getProducts(
    currentPage
  );

  return (
    <main className="min-h-screen">
      {/* =====================================
          HEADER
      ===================================== */}

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        🔥 Today's Hot Picks
      </h1>

      <p className="mb-6 sm:mb-8 text-gray-600">
        Hand-picked trending products
        you should check today.
      </p>

      {/* =====================================
          PRODUCTS
      ===================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <p className="text-lg text-gray-500">
              No hot picks available.
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Products marked as
              "Today's Hot Picks" will
              appear here.
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

      {/* =====================================
          PAGINATION
      ===================================== */}

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

