import CategoryProductCard from "@/components/CategoryProductCard";


async function getProducts(){

const res = await fetch(

"http://localhost:3000/api/products",

{
cache:"no-store"
}

);


return await res.json();

}





export default async function TodaysDealsPage(){


const products = await getProducts();



// Products having discount

const dealsProducts = products.filter(

(product:any)=>

product.old_price &&

Number(product.old_price) > Number(product.price)

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

🔥 Today's Deals

</h1>



<p className="
mb-8
text-gray-600
">

Best offers and discounted products available today.

</p>





<div className="
grid
grid-cols-1
md:grid-cols-3
lg:grid-cols-4
gap-6
">



{

dealsProducts.length === 0


?


<p className="
text-gray-500
text-lg
">

No deals available.

</p>


:


dealsProducts.map((product:any)=>(


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