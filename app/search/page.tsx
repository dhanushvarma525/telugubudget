import CategoryProductCard from "@/components/CategoryProductCard";
import { getBaseUrl } from "@/lib/getBaseUrl";
import Link from "next/link";

async function getProducts() {
  const res = await fetch(
    `${getBaseUrl()}/api/products`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const { q = "" } = await searchParams;

  const data = await getProducts();

  const products = data.products || data;

  const results = q
    ? products.filter((product: any) =>
        product.name
          .toLowerCase()
          .includes(q.toLowerCase())
      )
    : [];

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6">
        🔍 Search Products
      </h1>

      {/* Search Box */}

      <form
        action="/search"
        method="GET"
        className="flex gap-2 mb-8"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
        />

        <button
          type="submit"
          className="bg-orange-500 text-white px-6 rounded-lg hover:bg-orange-600"
        >
          Search
        </button>
      </form>

      {q === "" ? (
        <>

          <h2 className="text-xl font-semibold mb-4">
            🔥 Popular Searches
          </h2>

          <div className="flex flex-wrap gap-3">

            <Link
              href="/search?q=earbuds"
              className="bg-white px-4 py-2 rounded-full shadow hover:bg-orange-100"
            >
              Earbuds
            </Link>

            <Link
              href="/search?q=watch"
              className="bg-white px-4 py-2 rounded-full shadow hover:bg-orange-100"
            >
              Smart Watches
            </Link>

            <Link
              href="/search?q=speaker"
              className="bg-white px-4 py-2 rounded-full shadow hover:bg-orange-100"
            >
              Bluetooth Speakers
            </Link>

            <Link
              href="/search?q=kitchen"
              className="bg-white px-4 py-2 rounded-full shadow hover:bg-orange-100"
            >
              Kitchen
            </Link>

            <Link
              href="/search?q=fashion"
              className="bg-white px-4 py-2 rounded-full shadow hover:bg-orange-100"
            >
              Fashion
            </Link>

          </div>

        </>
      ) : (
        <>

          <h2 className="text-2xl font-bold mb-6">
            Search Results for:
            <span className="text-orange-500">
              {" "}
              {q}
            </span>
          </h2>

          {results.length === 0 ? (
            <p className="text-gray-600">
              No products found.
            </p>
          ) : (
            <div
              className="
              grid
              grid-cols-1
              md:grid-cols-3
              lg:grid-cols-4
              gap-6
              "
            >
              {results.map((product: any) => (
               <CategoryProductCard
  key={product.id}
  id={product.id}
  name={product.name}
  price={product.price}
  image={product.image}
  coupon={product.coupon}
  coupon_available={product.coupon_available}
/>
              ))}
            </div>
          )}

        </>
      )}
    </main>
  );
}