import Link from "next/link";
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




export default async function DadPage(){


const products = await getProducts();



const dadProducts = products.filter(
(product:any)=>
product.category === "Dad's Essentials"
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

👨 Dad's Essentials

</h1>


<p className="
text-lg
text-gray-600
mb-8
">

Best gifts and useful products for dads.

</p>




<div className="
grid
grid-cols-1
md:grid-cols-4
gap-6
">



{

dadProducts.length === 0 ?


<p className="
text-gray-500
text-lg
">

No products found.

</p>



:


dadProducts.map((product:any)=>(



<Link

key={product.id}

href={`/products/${product.id}`}

className="
bg-white
rounded-xl
shadow
overflow-hidden
hover:shadow-xl
"


>


<img

src={product.image}

alt={product.name}

className="
w-full
h-48
object-cover
"

/>



<div className="p-5">


<h2 className="
font-bold
text-xl
">

{product.name}

</h2>



<p className="
mt-2
font-semibold
">

₹{product.price}

</p>


</div>



</Link>


))


}



</div>


</main>

);


}