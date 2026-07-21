"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({

    totalProducts: 0,

    totalClicks: 0,

    totalCategories: 0,

    topProduct: {
      name: "",
      clicks: 0,
    },

  });


  useEffect(() => {

    loadDashboard();

  }, []);



  async function loadDashboard() {

    try {

      const response = await fetch(
        "/api/admin/dashboard"
      );


      const data = await response.json();


      if (data.success) {

        setStats(data);

      }


    } catch (error) {

      console.log(error);

      alert(
        "Failed to load dashboard"
      );


    } finally {

      setLoading(false);

    }

  }




  async function logout() {


    try {


      await fetch(
        "/api/admin/logout",
        {
          method:"POST",
        }
      );


      router.push(
        "/admin/login"
      );


    } catch(error){


      console.log(error);


      alert(
        "Logout Failed"
      );


    }


  }




  if (loading) {


    return (

      <div
        className="
        flex
        items-center
        justify-center
        h-screen
        text-3xl
        font-bold
        "
      >

        Loading Dashboard...

      </div>

    );


  }





  return (

    <main
      className="
      max-w-7xl
      mx-auto
      p-8
      "
    >



      <h1
        className="
        text-4xl
        font-bold
        mb-10
        "
      >

        Admin Dashboard

      </h1>





      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-4
        gap-6
        "
      >



        <div
          className="
          bg-white
          shadow
          rounded-xl
          p-6
          "
        >

          <h2 className="text-gray-500">
            Total Products
          </h2>

          <p className="text-3xl font-bold mt-2">
            {stats.totalProducts}
          </p>

        </div>






        <div
          className="
          bg-white
          shadow
          rounded-xl
          p-6
          "
        >

          <h2 className="text-gray-500">
            Total Clicks
          </h2>

          <p className="text-3xl font-bold mt-2">
            {stats.totalClicks}
          </p>

        </div>






        <div
          className="
          bg-white
          shadow
          rounded-xl
          p-6
          "
        >

          <h2 className="text-gray-500">
            Categories
          </h2>

          <p className="text-3xl font-bold mt-2">
            {stats.totalCategories}
          </p>

        </div>







        <div
          className="
          bg-white
          shadow
          rounded-xl
          p-6
          "
        >

          <h2 className="text-gray-500">
            Top Product
          </h2>


          <p className="font-bold mt-2">

            {stats.topProduct.name}

          </p>


          <p className="text-sm text-gray-500">

            {stats.topProduct.clicks} Clicks

          </p>


        </div>



      </div>







      <div
        className="
        mt-10
        flex
        gap-4
        flex-wrap
        "
      >





        <Link

          href="/admin/products"

          className="
          bg-blue-600
          text-white
          px-6
          py-3
          rounded-lg
          "

        >

          📦 Manage Products

        </Link>







        <Link

          href="/admin/products/add"

          className="
          bg-green-600
          text-white
          px-6
          py-3
          rounded-lg
          "

        >

          ➕ Add Product

        </Link>








        <Link

          href="/admin/contacts"

          className="
          bg-purple-600
          text-white
          px-6
          py-3
          rounded-lg
          "

        >

          📩 Contacts

        </Link>








        <button

          onClick={logout}

          className="
          bg-red-600
          text-white
          px-6
          py-3
          rounded-lg
          "

        >

          🚪 Logout

        </button>





      </div>




    </main>

  );


}