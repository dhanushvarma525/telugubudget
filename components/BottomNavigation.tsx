"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Folder,
  Flame,
  Search,
  MessageCircle,
} from "lucide-react";


export default function BottomNavigation() {

  const pathname = usePathname();


  const menu = [

    {
      name: "Home",
      icon: Home,
      href: "/",
    },

    {
      name: "Categories",
      icon: Folder,
      href: "/categories",
    },

    {
      name: "Deals",
      icon: Flame,
      href: "/categories/todays-deals",
    },

    {
      name: "Search",
      icon: Search,
      href: "/search?q=",
    },

    {
      name: "Contact",
      icon: MessageCircle,
      href: "/contact",
    },

  ];



  return (

    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg lg:hidden z-50">


      <div className="grid grid-cols-5">


        {
          menu.map((item) => {


            const Icon = item.icon;


            const active =
              pathname === item.href;


            return (

              <Link

                key={item.name}

                href={item.href}

                className={`flex flex-col items-center justify-center py-3 text-xs ${
                  active
                    ? "text-orange-500 font-bold"
                    : "text-gray-600"
                }`}

              >


                <Icon
                  size={26}
                  strokeWidth={2.5}
                />


                <span className="mt-1">
                  {item.name}
                </span>


              </Link>

            );


          })
        }


      </div>


    </div>

  );

}