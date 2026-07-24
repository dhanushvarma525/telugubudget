"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


export default function BottomNavigation() {

  const pathname = usePathname();


  const items = [
    {
      name: "Home",
      icon: "🏠",
      href: "/",
    },
    {
      name: "Deals",
      icon: "🔥",
      href: "/categories/todays-deals",
    },
    {
      name: "Blogs",
      icon: "📝",
      href: "/blog",
    },
    {
      name: "Search",
      icon: "🔍",
      href: "/search",
    },
  ];


  return (

    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md md:hidden">

      <div className="flex justify-around items-center h-16">

        {items.map((item) => (

          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center text-xs transition ${
              pathname === item.href
                ? "text-blue-600 font-bold"
                : "text-gray-600"
            }`}
          >

            <span className="text-xl">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>

          </Link>

        ))}

      </div>

    </nav>

  );

}