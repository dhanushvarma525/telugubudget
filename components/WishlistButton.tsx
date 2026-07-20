"use client";

import { useEffect, useState } from "react";

type Props = {
  product: any;
};

export default function WishlistButton({ product }: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    const exists = wishlist.find(
      (item: any) => item.id === product.id
    );

    setSaved(!!exists);
  }, [product.id]);

  function toggleWishlist() {
    let wishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    const exists = wishlist.find(
      (item: any) => item.id === product.id
    );

    if (exists) {
      wishlist = wishlist.filter(
        (item: any) => item.id !== product.id
      );
      setSaved(false);
    } else {
      wishlist.unshift(product);
      setSaved(true);
    }

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      className="
      mt-4
      w-full
      border-2
      rounded-lg
      py-3
      font-bold
      transition
      "
    >
      {saved ? "❤️ Remove from Wishlist" : "🤍 Add to Wishlist"}
    </button>
  );
}