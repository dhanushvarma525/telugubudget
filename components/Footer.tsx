"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  function goHome() {
    if (pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      router.push("/");
    }
  }

  return (
    <footer
      className="
      bg-gray-900
      text-gray-300
      mt-10
      "
    >

      <div
        className="
        max-w-7xl
        mx-auto
        px-5
        py-10
        grid
        grid-cols-1
        md:grid-cols-4
        gap-8
        "
      >

        {/* Brand */}

        <div>

          <button
            onClick={goHome}
            className="
            text-2xl
            font-bold
            text-orange-400
            mb-3
            cursor-pointer
            "
          >
            TeluguBudget
          </button>

          <p
            className="
            text-sm
            text-gray-300
            leading-6
            "
          >
            Find the best budget products,
            trending deals and smart shopping
            recommendations.
          </p>

        </div>

        {/* Quick Links */}

        <div>

          <h3
            className="
            text-lg
            font-bold
            text-gray-100
            mb-4
            "
          >
            Quick Links
          </h3>

          <div
            className="
            flex
            flex-col
            gap-3
            "
          >

            <button
  onClick={goHome}
  type="button"
  className="
    flex
    items-center
    gap-2
    w-fit
    bg-transparent
    border-0
    p-0
    m-0
    text-sm
    font-normal
    text-gray-300
    hover:text-orange-400
    transition
    cursor-pointer
    appearance-none
  "
>
  <span>🏠</span>
  <span>Home</span>
</button>

            <Link
              href="/categories"
              className="
              text-gray-300
              hover:text-orange-400
              transition
              "
            >
              📂 Categories
            </Link>

            <Link
              href="/contact"
              className="
              text-gray-300
              hover:text-orange-400
              transition
              "
            >
              📞 Contact
            </Link>

          </div>

        </div>

        {/* Legal */}

        <div>

          <h3
            className="
            text-lg
            font-bold
            text-gray-100
            mb-4
            "
          >
            Legal
          </h3>

          <div
            className="
            flex
            flex-col
            gap-3
            "
          >

            <Link
              href="/privacy"
              className="
              text-gray-300
              hover:text-orange-400
              transition
              "
            >
              🔒 Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="
              text-gray-300
              hover:text-orange-400
              transition
              "
            >
              📄 Terms & Conditions
            </Link>

            <Link
              href="/affiliate-disclosure"
              className="
              text-gray-300
              hover:text-orange-400
              transition
              "
            >
              💰 Affiliate Disclosure
            </Link>

          </div>

        </div>

        {/* Support */}

        <div>

          <h3
            className="
            text-lg
            font-bold
            text-gray-100
            mb-4
            "
          >
            Support
          </h3>

          <p
            className="
            text-sm
            text-gray-300
            leading-6
            "
          >
            Need help with products,
            deals or suggestions?
            Contact TeluguBudget team.
          </p>

          <Link
            href="/contact"
            className="
            inline-block
            mt-4
            bg-orange-500
            text-white
            px-5
            py-2
            rounded-full
            font-semibold
            hover:bg-orange-600
            transition
            "
          >
            Contact Us
          </Link>

        </div>

      </div>

      <div
        className="
        border-t
        border-gray-700
        text-center
        py-5
        text-sm
        text-gray-400
        "
      >
        © {new Date().getFullYear()} TeluguBudget. All rights reserved.
      </div>

    </footer>
  );
}