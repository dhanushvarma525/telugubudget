import CategoryProductCard from "@/components/CategoryProductCard";
import Pagination from "@/components/Pagination";
import { getBaseUrl } from "@/lib/getBaseUrl";

const PRODUCTS_PER_PAGE = 30;

async function getProducts(page: number) {
  const res = await fetch(
    `${getBaseUrl()}/api/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export default async function CrushPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;

  const currentPage = Number(params.page || "1");

  const { products, totalPages } = await getProducts(currentPage);

  const crushProducts = products.filter(
    (product: any) => product.category === "Impress Your Crush"
  );

  return (
    <main
      className="
      min-h-screen
      bg-gray-100
      p-8
      "
    >
      <h1
        className="
        text-4xl
        font-bold
        mb-3
        "
      >
        ❤️ Impress Your Crush
      </h1>

      <p
        className="
        mb-8
        text-gray-600
        "
      >
        Special gifts and products to impress someone special.
      </p>

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-3
        lg:grid-cols-4
        gap-6
        "
      >
        {crushProducts.length === 0 ? (
          <p className="text-gray-500 text-lg">
            No products found.
          </p>
        ) : (
          crushProducts.map((product: any) => (
           <CategoryProductCard
  key={product.id}
  id={product.id}
  name={product.name}
  price={product.price}
  image={product.image}
  coupon={product.coupon}
  coupon_available={product.coupon_available}
/>
          ))
        )}
      </div>

      <div className="mt-12 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </main>
  );
}