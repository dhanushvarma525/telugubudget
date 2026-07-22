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

    if(pathname === "/") {

      window.scrollTo({
        top:0,
        behavior:"smooth",
      });

    } else {

      router.push("/");

    }

  }




  function handleSearch(e:React.FormEvent){

    e.preventDefault();

    if(!search.trim()) return;

    router.push(
      `/search?q=${encodeURIComponent(search)}`
    );

    setMenuOpen(false);

  }





  return (

    <>

    <nav className="sticky top-0 z-50 bg-white shadow-md">


      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">



        {/* LOGO */}

        <button

        onClick={goHome}

        className="
        text-2xl
        font-extrabold
        text-orange-500
        cursor-pointer
        "

        >

        TeluguBudget

        </button>






        {/* DESKTOP MENU */}

        <div className="
        hidden
        lg:flex
        items-center
        gap-8
        font-semibold
        ">


          <button

          onClick={goHome}

          className="hover:text-orange-500"

          >

          Home

          </button>




          <Link

          href="/categories/todays-deals"

          className="hover:text-orange-500"

          >

          Today's Deals

          </Link>





          <Link

          href="/categories"

          className="hover:text-orange-500"

          >

          Categories

          </Link>





          <Link

          href="/blog"

          className="hover:text-orange-500"

          >

          Blogs

          </Link>





          <Link

          href="/contact"

          className="hover:text-orange-500"

          >

          Contact

          </Link>



        </div>








        {/* DESKTOP SEARCH */}

        <form

        onSubmit={handleSearch}

        className="
        hidden
        lg:flex
        flex-1
        max-w-md
        mx-8
        "

        >


          <input

          type="text"

          placeholder="Search products..."

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          className="
          w-full
          border
          rounded-l-full
          px-4
          py-2
          outline-none
          "

          />



          <button

          type="submit"

          className="
          bg-orange-500
          text-white
          px-5
          rounded-r-full
          "

          >

          🔍

          </button>



        </form>







        {/* MOBILE BUTTON */}

        <button

        className="
        lg:hidden
        text-3xl
        "

        onClick={()=>setMenuOpen(!menuOpen)}

        >

        ☰

        </button>



      </div>








      {/* MOBILE MENU */}

      {

      menuOpen &&

      <div

      className="
      lg:hidden
      border-t
      bg-white
      "

      >




        {/* MOBILE SEARCH */}

        <form

        onSubmit={handleSearch}

        className="p-4"

        >


          <div className="flex">


            <input

            type="text"

            placeholder="Search products..."

            value={search}

            onChange={(e)=>setSearch(e.target.value)}

            className="
            flex-1
            border
            rounded-l-lg
            px-4
            py-3
            "

            />



            <button

            className="
            bg-orange-500
            text-white
            px-5
            rounded-r-lg
            "

            >

            🔍

            </button>



          </div>


        </form>








        {/* MOBILE LINKS */}


        <div className="flex flex-col">





          <button

          onClick={goHome}

          className="
          px-5
          py-4
          border-b
          text-left
          "

          >

          🏠 Home

          </button>







          <Link

          href="/categories"

          onClick={()=>setMenuOpen(false)}

          className="
          px-5
          py-4
          border-b
          "

          >

          📂 Categories

          </Link>







          <Link

          href="/favorites"

          onClick={()=>setMenuOpen(false)}

          className="
          px-5
          py-4
          border-b
          "

          >

          ❤️ Favorites

          </Link>







          <Link

          href="/blog"

          onClick={()=>setMenuOpen(false)}

          className="
          px-5
          py-4
          border-b
          "

          >

          📝 Blogs

          </Link>







          <Link

          href="/categories/todays-deals"

          onClick={()=>setMenuOpen(false)}

          className="
          px-5
          py-4
          border-b
          "

          >

          🔥 Today's Deals

          </Link>







          <Link

          href="/contact"

          onClick={()=>setMenuOpen(false)}

          className="
          px-5
          py-4
          "

          >

          📞 Contact

          </Link>





        </div>



      </div>

      }



    </nav>


    </>

  );

}