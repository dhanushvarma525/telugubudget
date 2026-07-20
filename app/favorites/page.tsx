"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WishlistPage() {

  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {

    const data = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    setWishlist(data);

  }, []);

  function removeItem(id:number){

    const updated = wishlist.filter(
      item => item.id !== id
    );

    setWishlist(updated);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updated)
    );

  }

  return (

    <main className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          ❤️ My Wishlist
        </h1>

        {
          wishlist.length === 0 ?

          <div className="bg-white rounded-xl p-10 text-center shadow">

            <h2 className="text-2xl font-bold">
              Your wishlist is empty
            </h2>

            <p className="mt-3 text-gray-600">
              Save products to view them here.
            </p>

            <Link
              href="/"
              className="
              inline-block
              mt-6
              bg-orange-500
              text-white
              px-6
              py-3
              rounded-lg
              "
            >
              Continue Shopping
            </Link>

          </div>

          :

          <div className="grid md:grid-cols-4 gap-6">

            {wishlist.map((product)=>(

              <div
                key={product.id}
                className="
                bg-white
                rounded-xl
                shadow
                overflow-hidden
                "
              >

                <Link href={`/products/${product.id}`}>

                  <img
                    src={product.image}
                    className="
                    w-full
                    h-52
                    object-cover
                    "
                  />

                  <div className="p-5">

                    <h2 className="font-bold text-lg">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-orange-600 font-bold">
                      ₹{product.price}
                    </p>

                  </div>

                </Link>

                <button
                  onClick={() => removeItem(product.id)}
                  className="
                  w-full
                  bg-red-500
                  hover:bg-red-600
                  text-white
                  py-3
                  "
                >
                  Remove
                </button>

              </div>

            ))}

          </div>

        }

      </div>

    </main>

  );

}