"use client";

import Link from "next/link";
import { useEffect, useState } from "react";


export default function AdminProducts() {


 const [products, setProducts] = useState<any[]>([]);
const [search, setSearch] = useState("");

const [category, setCategory] = useState("All Categories");

const [sort, setSort] = useState("latest");


  async function loadProducts() {


    const res = await fetch(
      "/api/products",
      {
        cache:"no-store"
      }
    );


    const data = await res.json();


    setProducts(data);


  }





  useEffect(()=>{

    loadProducts();

  },[]);







  async function deleteProduct(id:number){


    const confirmDelete = confirm(
      "Are you sure you want to delete this product?"
    );



    if(!confirmDelete){

      return;

    }




    const response = await fetch(

      `/api/products/${id}`,

      {
        method:"DELETE"
      }

    );




    const data = await response.json();




    if(data.success){


      alert(
        "Product deleted successfully"
      );


      loadProducts();



    }
    else{


      alert(
        data.message
      );


    }



  }




const filteredProducts = products
    .filter((product) => {

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      return matchesSearch && matchesCategory;

    })
    .sort((a, b) => {

      if (sort === "priceHigh") {
        return Number(b.price) - Number(a.price);
      }

      if (sort === "priceLow") {
        return Number(a.price) - Number(b.price);
      }

      if (sort === "clicks") {
        return Number(b.clicks) - Number(a.clicks);
      }

      if (sort === "views") {
        return Number(b.views) - Number(a.views);
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );

    });


  return (

    <main className="
    min-h-screen
    bg-gray-100
    p-10
    ">



      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

  <div>

    <h1 className="text-4xl font-bold text-gray-800">
      📦 Manage Products
    </h1>

   <p className="text-gray-500 mt-2">

  Manage all affiliate products from one place.

  <span className="ml-3 font-semibold text-orange-500">
    Total Products: {products.length}
  </span>

  <span className="ml-3 font-semibold text-blue-500">
    Showing: {filteredProducts.length}
  </span>

</p>

  </div>

  <div className="flex flex-col sm:flex-row gap-3">

    <input
  type="text"
  placeholder="🔍 Search Products..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="border rounded-lg px-4 py-3 w-72 focus:outline-none focus:ring-2 focus:ring-orange-400"
/>

   <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
>
  <option>
  All Categories
</option>

{
  [...new Set(
    products.map(
      (product) => product.category
    )
  )].map((cat) => (

    <option
      key={cat}
      value={cat}
    >
      {cat}
    </option>


 ))
}
</select>
<select
  value={sort}
  onChange={(e)=>setSort(e.target.value)}
  className="border rounded-lg px-4 py-3 bg-white"
>

  <option value="latest">
    Latest
  </option>

  <option value="priceHigh">
    Price High → Low
  </option>

  <option value="priceLow">
    Price Low → High
  </option>

  <option value="clicks">
    Most Clicked
  </option>

  <option value="views">
    Most Viewed
  </option>

</select>


<Link
  href="/admin/products/add"
  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-center"
>
  + Add Product
</Link>

  </div>

</div>







      <div className="
      bg-white
      rounded-xl
      shadow
      overflow-hidden
      ">


        <table className="
        w-full
        ">


          <thead className="
          bg-gray-200
          ">


            <tr>


              <th className="p-4">
                Image
              </th>


              <th className="p-4">
                Name
              </th>


              <th className="p-4">
                Category
              </th>


              <th className="p-4">
                Price
              </th>


              <th className="p-4">
                Clicks
              </th>

<th className="p-4">
  Views
</th>

              <th className="p-4">
                Actions
              </th>


            </tr>


          </thead>






<tbody>

{
  filteredProducts.length === 0

  ?

  (

    <tr>

      <td
        colSpan={7}
        className="text-center py-12 text-gray-500 text-lg"
      >

        📦 No products found.

      </td>

    </tr>

  )

  :

  (

    filteredProducts.map((product) => (

      <tr
        key={product.id}
        className="border-t hover:bg-gray-50"
      >

        <td className="p-4">

          {
            product.image ?

            (
              <img
                src={product.image}
                alt={product.name}
                className="
                w-20
                h-20
                object-cover
                rounded-lg
                "
              />
            )

            :

            (
              <span>
                No Image
              </span>
            )
          }

        </td>


        <td className="p-4 font-semibold">
          {product.name}
        </td>


        <td className="p-4">
          {product.category}
        </td>


        <td className="p-4">
          ₹{product.price}
        </td>


        <td className="p-4">

          <span className="
          bg-green-100
          text-green-700
          px-3
          py-1
          rounded-full
          text-sm
          ">

            {product.clicks}

          </span>

        </td>


        <td className="p-4">

          <span className="
          bg-blue-100
          text-blue-700
          px-3
          py-1
          rounded-full
          text-sm
          ">

            {product.views}

          </span>

        </td>


        <td className="p-4">

          <div className="flex gap-3">

            <Link
              href={`/admin/products/edit/${product.id}`}
              className="
              bg-blue-500
              text-white
              px-4
              py-2
              rounded
              "
            >
              Edit
            </Link>


            <button
              onClick={() => deleteProduct(product.id)}
              className="
              bg-red-500
              text-white
              px-4
              py-2
              rounded
              "
            >
              Delete
            </button>


          </div>

        </td>


      </tr>

    ))

  )

}

</tbody>




        </table>



      </div>




    </main>

  );


}