"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string | number;
  [key: string]: any;
};

type Props = {
  product: Product;
};

export default function WishlistButton({ product }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const wishlist: Product[] = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );

      setSaved(wishlist.some((item) => item.id === product.id));
    } catch {
      localStorage.setItem("wishlist", "[]");
    }
  }, [product.id]);

  const toggleWishlist = () => {
    setLoading(true);

    try {
      const wishlist: Product[] = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
      );

      const exists = wishlist.some(
        (item) => item.id === product.id
      );

      let updatedWishlist: Product[];

      if (exists) {
        updatedWishlist = wishlist.filter(
          (item) => item.id !== product.id
        );
        setSaved(false);
      } else {
        updatedWishlist = [product, ...wishlist];
        setSaved(true);
      }

      localStorage.setItem(
        "wishlist",
        JSON.stringify(updatedWishlist)
      );

      // Notify other pages/components
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Wishlist Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`
        mt-4
        w-full
        rounded-xl
        py-3
        font-semibold
        transition-all
        duration-200
        border-2
        shadow-sm
        ${
          saved
            ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
            : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
        }
        ${loading ? "opacity-70 cursor-not-allowed" : ""}
      `}
    >
      {loading
        ? "Updating..."
        : saved
        ? "❤️ Remove from Wishlist"
        : "🤍 Add to Wishlist"}
    </button>
  );
}