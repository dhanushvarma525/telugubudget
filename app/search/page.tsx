import CategoryProductCard from "@/components/CategoryProductCard";

import { getBaseUrl } from "@/lib/getBaseUrl";
async function getProducts(){

const res = await fetch(
  `${getBaseUrl()}/api/products`,
  {
    cache: "no-store",
  }
);


return res.json();

}





export default async function SearchPage({

searchParams

}:{

searchParams:Promise<{
q:string
}>

}){


const {q}=await searchParams;


const data = await getProducts();

const products = data.products || data;



const results = products.filter(

(product:any)=>

product.name
.toLowerCase()
.includes(
q.toLowerCase()
)

);





return (

<main className="
min-h-screen
bg-gray-100
p-8
">


<h1 className="
text-4xl
font-bold
mb-8
">

Search Results for:
<span className="text-orange-500">
 {q}
</span>

</h1>




<div className="
grid
grid-cols-1
md:grid-cols-3
lg:grid-cols-4
gap-6
">


{

results.length===0

?


<p>
No products found
</p>


:


results.map((product:any)=>(


<CategoryProductCard

key={product.id}

id={product.id}

name={product.name}

price={product.price}

image={product.image}

/>


))


}



</div>



</main>

);


}