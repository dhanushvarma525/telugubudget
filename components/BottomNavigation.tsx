"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  const menu = [
    {
      name: "Home",
      icon: "🏠",
      href: "/",
    },
    {
      name: "Categories",
      icon: "📂",
      href: "/categories",
    },
    {
      name: "Deals",
      icon: "🔥",
      href: "/categories/todays-deals",
    },
    {
      name: "Search",
      icon: "🔍",
      href: "/search?q=",
    },
    {
      name: "Contact",
      icon: "📞",
      href: "/contact",
    },
  ];

  return (
    <div
      className="
      fixed
      bottom-0
      left-0
      right-0
      bg-white
      border-t
      shadow-lg
      lg:hidden
      z-50
      "
    >
      <div className="grid grid-cols-5">

        {menu.map((item) => (

          <Link
            key={item.name}
            href={item.href}
            className={`
              flex
              flex-col
              items-center
              justify-center
              py-3
              text-xs
              ${
                pathname === item.href
                  ? "text-orange-500 font-bold"
                  : "text-gray-600"
              }
            `}
          >
            <span className="text-xl">
              {item.icon}
            </span>

            <span className="mt-1">
              {item.name}
            </span>

          </Link>

        ))}

      </div>
    </div>
  );
}