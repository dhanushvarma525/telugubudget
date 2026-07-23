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
      name: "Categories",
      icon: "📂",
      href: "/categories",
    },
    {
      name: "Contact",
      icon: "📞",
      href: "/contact",
    },
  ];



  return (

    <nav
      className="
      fixed
      bottom-0
      left-0
      right-0
      z-50
      bg-white
      border-t
      shadow-lg
      lg:hidden
      "
    >

      <div
        className="
        flex
        justify-around
        items-center
        h-16
        "
      >


        {
          items.map((item)=>(


            <Link

              key={item.name}

              href={item.href}

              className={`
              flex
              flex-col
              items-center
              justify-center
              text-xs
              font-semibold
              transition
              ${
                pathname === item.href
                ? "text-blue-600"
                : "text-gray-500"
              }
              `}

            >

              <span className="text-xl">
                {item.icon}
              </span>


              <span>
                {item.name}
              </span>


            </Link>


          ))
        }


      </div>


    </nav>

  );

}