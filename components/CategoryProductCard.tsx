import Link from "next/link";

type CategoryProductCardProps = {
  id: number;
  name: string;
  price: string;
  image: string;

  coupon?: string;
  coupon_available?: boolean;
};

export default function CategoryProductCard({
  id,
  name,
  price,
  image,
  coupon,
  coupon_available,
}: CategoryProductCardProps) {
  return (
    <Link href={`/products/${id}`}>
      <div
        className="
        bg-white
        rounded-2xl
        shadow-md
        overflow-hidden
        hover:shadow-xl
        transition
        cursor-pointer
        "
      >
        <img
          src={image}
          alt={name}
          className="
          w-full
          h-48
          object-cover
          "
        />

        <div className="p-5">
          <h2
            className="
            text-xl
            font-bold
            "
          >
            {name}
          </h2>

          <p
            className="
            text-lg
            font-semibold
            mt-2
            "
          >
            ₹{price}
          </p>

          <p
            className="
            mt-2
            text-yellow-500
            "
          >
            ⭐⭐⭐⭐⭐
          </p>

          {coupon_available ? (
            <p className="mt-2 text-green-600 font-semibold">
              🟢 Coupon: <span className="font-bold">{coupon}</span>
            </p>
          ) : (
            <p className="mt-2 text-red-600 font-semibold">
              🔴 No coupon available
            </p>
          )}

          <button
            className="
            mt-4
            w-full
            bg-orange-500
            text-white
            py-2
            rounded-lg
            font-semibold
            "
          >
            View Product
          </button>
        </div>
      </div>
    </Link>
  );
}