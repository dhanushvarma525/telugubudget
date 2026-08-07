import CategoryProductCard from "@/components/CategoryProductCard";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabase";

const PRODUCTS_PER_PAGE = 10;

async function getProducts(page: number) {
  // =====================================================
  // GET ALL PRODUCTS
  // =====================================================

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
      "TODAY'S DEALS SUPABASE ERROR:",
      error
    );

    throw new Error("Failed to fetch products");
  }

  // =====================================================
  // FILTER DEALS
  // old_price > current price
  // =====================================================

  const dealsProducts = (data || []).filter(
    (product: any) => {
      const currentPrice = Number(
        product.price
      );

      const oldPrice = Number(
        product.old_price
      );

      return (
        Number.isFinite(currentPrice) &&
        Number.isFinite(oldPrice) &&
        oldPrice > currentPrice
      );
    }
  );

  // =====================================================
  // PAGINATION
  // =====================================================

  const total = dealsProducts.length;

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
    dealsProducts.slice(start, end);

  // =====================================================
  // DEBUG
  // =====================================================

  console.log(
    "===================================="
  );

  console.log(
    "CATEGORY: Today's Deals"
  );

  console.log(
    "TOTAL PRODUCTS:",
    data?.length || 0
  );

  console.log(
    "DEAL PRODUCTS:",
    dealsProducts.length
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
    "DISPLAYED PRODUCTS:",
    products.map(
      (product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        old_price: product.old_price,
      })
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

export default async function TodaysDealsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const params = await searchParams;

  // =====================================================
  // PAGE NUMBER
  // =====================================================

  const requestedPage = Number(
    params.page || "1"
  );

  const currentPage =
    Number.isFinite(requestedPage) &&
    requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  // =====================================================
  // GET DEAL PRODUCTS
  // =====================================================

  const {
    products,
    totalPages,
  } = await getProducts(
    currentPage
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">

      {/* HEADER */}

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        🔥 Today's Deals
      </h1>

      <p className="mb-6 sm:mb-8 text-gray-600">
        Best offers and discounted products available today.
      </p>

      {/* PRODUCTS */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">

        {products.length === 0 ? (
          <div className="col-span-full py-10 text-center">

            <p className="text-gray-500 text-lg">
              No deals available.
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
                coupon={product.coupon}
                coupon_available={
                  product.coupon_available
                }
              />
            )
          )
        )}

      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="mt-10 sm:mt-12 flex justify-center">

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
          />

        </div>
      )}

    </main>
  );
}