import type { Metadata } from "next";
import TrendingDeals from "@/components/TrendingDeals";
import Categories from "@/components/Categories";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import { getBaseUrl } from "@/lib/getBaseUrl";


export const metadata: Metadata = {
  title: "AnantaGo – Infinite Deals. Smarter Shopping.",
  description:
    "Discover the best Amazon and Flipkart deals, trending products, honest recommendations, and budget-friendly shopping with AnantaGo.",
};


const PRODUCTS_PER_PAGE = 30;


async function getProducts(page:number){

  const res = await fetch(
    `${getBaseUrl()}/api/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`,
    {
      cache:"no-store",
    }
  );


  if(!res.ok){
    throw new Error("Products API failed");
  }


  const data = await res.json();


  return data;

}




export default async function Home({

  searchParams,

}:{

  searchParams:Promise<{page?:string}>;

}){


const params = await searchParams;


const currentPage = Number(params.page || "1");


const data = await getProducts(currentPage);


const products = Array.isArray(data)
? data
: data.products || [];


const totalPages = data.totalPages || 1;



return (

<main className="min-h-screen bg-white">


{/* HERO */}

<section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">

<div className="max-w-7xl mx-auto px-6 py-10 md:py-12 text-center">


<h1 className="text-3xl md:text-5xl font-extrabold mb-3">

Welcome to <span className="text-yellow-300">
AnantaGo
</span>

</h1>


<p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">

Discover the best Amazon & Flipkart deals,
trending products, honest recommendations,
and budget-friendly shopping — all in one place.

</p>



<div className="mt-6 flex flex-wrap justify-center gap-3">


<a
href="#featured-deals"
className="
bg-white
text-blue-700
font-semibold
px-5
py-2.5
rounded-full
hover:bg-gray-100
transition
"
>

🔥 Explore Deals

</a>



<a
href="/blog"
className="
border
border-white
px-5
py-2.5
rounded-full
hover:bg-white
hover:text-blue-700
transition
"
>

📖 Read Blogs

</a>


</div>


</div>

</section>





{/* TRENDING */}

<TrendingDeals />





{/* CATEGORIES */}

<Categories />





{/* PRODUCTS */}

<section
id="featured-deals"
className="max-w-7xl mx-auto px-4 py-10"
>


<div className="mb-8">


<h2 className="text-3xl font-bold text-gray-900">

🔥 Featured Deals

</h2>


<p className="text-gray-600 mt-2">

Handpicked products, trending offers,
and smart shopping picks updated regularly.

</p>


</div>





<div
className="
grid
grid-cols-2
lg:grid-cols-3
gap-4
"
>


{
products.length === 0 ? (

<div className="col-span-full text-center py-16">

<h3 className="text-2xl font-semibold text-gray-800">

No deals available right now.

</h3>


<p className="text-gray-500 mt-3">

Check back soon for fresh products and exciting offers.

</p>


</div>


) : (


products.map((product:any)=>(


<ProductCard

key={product.id}

id={product.id}

name={product.name}

price={product.price}

old_price={product.old_price}

image={product.image}

affiliate_link={product.affiliate_link}

/>


))


)

}



</div>





<div className="mt-10">


<Pagination

currentPage={currentPage}

totalPages={totalPages}

/>


</div>



</section>





{/* FOOTER */}

<Footer />



</main>

);

}