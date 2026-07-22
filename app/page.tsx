import TrendingDeals from "@/components/TrendingDeals";
import Categories from "@/components/Categories";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import { getBaseUrl } from "@/lib/getBaseUrl";


const PRODUCTS_PER_PAGE = 30;


async function getProducts(page:number){

  const res = await fetch(
    `${getBaseUrl()}/api/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`,
    {
      cache:"no-store",
    }
  );


  if(!res.ok){

    throw new Error(
      "Products API failed"
    );

  }


  const data = await res.json();

  console.log("HOME PRODUCTS DATA:", data);


  return data;

}



export default async function Home({

searchParams,

}:{

searchParams: Promise<{page?:string}>;

}){


const params = await searchParams;


const currentPage = Number(
params.page || "1"
);



const data = await getProducts(
currentPage
);



const products =
Array.isArray(data)
?
data
:
data.products || [];



const totalPages =
data.totalPages || 1;



return (

<main
className="
min-h-screen
bg-gray-100
"
>


<TrendingDeals />


<Categories />



<section
className="
max-w-7xl
mx-auto
px-4
py-8
"
>


<h2
className="
text-2xl
font-bold
mb-6
"
>

🔥 Trending Products

</h2>



<div
className="
grid
grid-cols-2
lg:grid-cols-3
gap-4
"
>


{
products.length === 0 ?

<p>
No products available
</p>


:

products.map((product:any)=>(


<ProductCard

key={product.id}

id={product.id}

name={product.name}

price={product.price}

image={product.image}

affiliate_link={product.affiliate_link}

/>


))

}



</div>




<Pagination

currentPage={currentPage}

totalPages={totalPages}

/>



</section>



<Footer />



</main>


)

}