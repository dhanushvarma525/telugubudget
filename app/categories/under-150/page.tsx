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





export default async function Under150Page(){


const products = await getProducts();



// Price based filtering

const under150Products = products.filter(

(product:any)=>

Number(product.price) <= 150

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

💰 Products Under ₹150

</h1>



<p className="
mb-8
text-gray-600
">

Affordable useful products under ₹150.

</p>





<div className="
grid
grid-cols-1
md:grid-cols-3
lg:grid-cols-4
gap-6
">



{

under150Products.length === 0


?


<p className="
text-gray-500
text-lg
">

No products available under ₹150.

</p>


:


under150Products.map((product:any)=>(


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