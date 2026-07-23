"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {

  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);


  function goHome() {

    setMenuOpen(false);

    if (pathname === "/") {

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } else {

      router.push("/");

    }

  }



  function handleSearch(e: React.FormEvent) {

    e.preventDefault();

    if (!search.trim()) return;


    router.push(
      `/search?q=${encodeURIComponent(search)}`
    );


    setSearch("");
    setMenuOpen(false);

  }



  return (

    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">


      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">


        {/* LOGO */}


        <button

          onClick={goHome}

          className="text-3xl font-black tracking-tight hover:scale-105 transition"

        >

          <span className="text-blue-600">
            Ananta
          </span>

          <span className="text-orange-500">
            Go
          </span>

        </button>



        {/* DESKTOP MENU */}


        <div className="hidden lg:flex items-center gap-8 font-semibold text-gray-700">


          <button

            onClick={goHome}

            className="hover:text-blue-600 transition"

          >

            Home

          </button>



          <Link

            href="/categories/todays-deals"

            className="hover:text-blue-600 transition"

          >

            Today's Deals

          </Link>
                    <Link
            href="/categories"
            className="hover:text-blue-600 transition"
          >
            Categories
          </Link>



          <Link
            href="/blog"
            className="hover:text-blue-600 transition"
          >
            Blogs
          </Link>



          <Link
            href="/contact"
            className="hover:text-blue-600 transition"
          >
            Contact
          </Link>


        </div>




        {/* DESKTOP SEARCH */}


        <form
          onSubmit={handleSearch}
          className="hidden lg:flex flex-1 max-w-md mx-4"
        >


          <input

            type="text"

            placeholder="Search deals, gadgets, fashion..."

            value={search}

            onChange={(e)=>setSearch(e.target.value)}

            className="w-full border border-gray-300 rounded-l-full px-5 py-2.5 outline-none focus:border-blue-500"

          />



          <button

            type="submit"

            className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-r-full transition"

          >

            🔍

          </button>



        </form>





        {/* MOBILE MENU BUTTON */}


        <button

          className="lg:hidden text-3xl text-blue-600"

          onClick={()=>setMenuOpen(!menuOpen)}

        >

          ☰

        </button>


      </div>
            {/* MOBILE MENU */}

      {
        menuOpen && (

          <div className="lg:hidden bg-white border-t shadow-lg">


            {/* MOBILE SEARCH */}


            <form
              onSubmit={handleSearch}
              className="p-4"
            >

              <div className="flex">


                <input

                  type="text"

                  placeholder="Search deals, gadgets..."

                  value={search}

                  onChange={(e)=>setSearch(e.target.value)}

                  className="flex-1 border border-gray-300 rounded-l-xl px-4 py-3 outline-none focus:border-blue-500"

                />



                <button

                  type="submit"

                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-r-xl transition"

                >

                  🔍

                </button>


              </div>


            </form>





            {/* MOBILE LINKS */}


            <div className="flex flex-col">


              <button

                onClick={goHome}

                className="px-5 py-4 border-b hover:bg-gray-50 text-left"

              >

                🏠 Home

              </button>





              <Link

                href="/categories/todays-deals"

                onClick={()=>setMenuOpen(false)}

                className="px-5 py-4 border-b hover:bg-gray-50"

              >

                🔥 Today's Deals

              </Link>





              <Link

                href="/categories"

                onClick={()=>setMenuOpen(false)}

                className="px-5 py-4 border-b hover:bg-gray-50"

              >

                📂 Categories

              </Link>





              <Link

                href="/blog"

                onClick={()=>setMenuOpen(false)}

                className="px-5 py-4 border-b hover:bg-gray-50"

              >

                📝 Blogs

              </Link>





              <Link

                href="/favorites"

                onClick={()=>setMenuOpen(false)}

                className="px-5 py-4 border-b hover:bg-gray-50"

              >

                ❤️ Favorites

              </Link>

              <Link

                href="/contact"

                onClick={()=>setMenuOpen(false)}

                className="px-5 py-4 hover:bg-gray-50"

              >

                📞 Contact

              </Link>



            </div>


          </div>

        )
      }



    </nav>

  );

}