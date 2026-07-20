import CategoryProductCard from "@/components/CategoryProductCard";

import { getBaseUrl } from "@/lib/getBaseUrl";
async function getProducts(){

const res = await fetch(
  `${getBaseUrl()}/api/products`,
  {
    cache: "no-store",
  }
);

return await res.json();

}





export default async function DevotionalPage(){


const products = await getProducts();



const devotionalProducts = products.filter(

(product:any)=>

product.category === "Devotional"

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
mb-3
">

🕉️ Devotional

</h1>




<p className="
mb-8
text-gray-600
">

Spiritual products, pooja essentials and devotional items.

</p>





<div className="
grid
grid-cols-1
md:grid-cols-3
lg:grid-cols-4
gap-6
">



{

devotionalProducts.length === 0


?


<p className="
text-gray-500
text-lg
">

No products found.

</p>


:


devotionalProducts.map((product:any)=>(


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