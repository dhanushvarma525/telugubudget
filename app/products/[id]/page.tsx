import Link from "next/link";
import ReviewSection from "@/components/ReviewSection";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
async function getProduct(id:string) {


  const res = await fetch(
    `http://localhost:3000/api/products/${id}`,
    {
      cache:"no-store"
    }
  );


  if(!res.ok){

    return null;

  }


  return await res.json();


}




async function getSimilarProducts(category:string,id:string){


  const res = await fetch(

    `http://localhost:3000/api/products`,

    {
      cache:"no-store"
    }

  );


  const products = await res.json();



  return products
    .filter(
      (item:any)=>
        item.category===category &&
        item.id !== Number(id)
    )
    .slice(0,4);



}





export default async function ProductPage({

params

}:{

params:Promise<{id:string}>

}){


const {id}=await params;



const product = await getProduct(id);



if(!product){


return (

<div className="p-10 text-center">

Product Not Found

</div>

);


}




const similarProducts =
await getSimilarProducts(
product.category,
id
);





const rating =
Number(product.rating || 0);



return (

<main className="
bg-gray-100
min-h-screen
p-6
">


<div className="
max-w-7xl
mx-auto
bg-white
rounded-xl
shadow
p-8
grid
md:grid-cols-2
gap-10
">


{/* IMAGE */}

<div>


<img

src={product.image}

alt={product.name}

className="
w-full
h-[450px]
object-cover
rounded-xl
"

/>


</div>





{/* DETAILS */}

<div>


<h1 className="
text-4xl
font-bold
">

{product.name}

</h1>





<div className="mt-4">


<span className="
text-yellow-500
text-2xl
">


{"★".repeat(Math.floor(rating))}

{"☆".repeat(5-Math.floor(rating))}


</span>


<span className="ml-3">

{rating}/5

</span>


</div>





<p className="
text-3xl
font-bold
mt-5
">

₹{product.price}

</p>




{
product.old_price &&

<div className="mt-2">


<p className="
line-through
text-gray-500
text-xl
">

₹{product.old_price}

</p>



<p className="
text-green-600
font-bold
text-lg
">

🔥

{
Math.round(
(
(Number(product.old_price)-Number(product.price))
/
Number(product.old_price)
)*100
)
}

% OFF

</p>


</div>

}



<div className="
mt-5
font-semibold
">


{

product.stock === "In Stock"

?

<span className="text-green-600">
🟢 In Stock
</span>

:

<span className="text-red-600">
🔴 Out of Stock
</span>

}


</div>


<WishlistButton product={product} />

<a
href={product.affiliate_link}
target="_blank"
className="
inline-block
mt-4
w-full
bg-orange-500
text-white
text-center
px-8
py-4
rounded-xl
font-bold
"
>
🛒 Buy Now
</a>

<ShareButton
  name={product.name}
/>
</div>


</div>







{/* ABOUT ITEM */}


<div className="
max-w-7xl
mx-auto
bg-white
mt-8
rounded-xl
shadow
p-8
">


<h2 className="
text-2xl
font-bold
mb-4
">

About this item

</h2>



<div className="
text-gray-700
">

{

product.features

?

product.features
.split("\n")
.map(
(item:string,index:number)=>(

<p
key={index}
className="mb-2"
>

✓ {item}

</p>

)

)

:

<p>
No features added
</p>

}


</div>



</div>







{/* DESCRIPTION */}


<div className="
max-w-7xl
mx-auto
bg-white
mt-8
rounded-xl
shadow
p-8
">


<h2 className="
text-2xl
font-bold
mb-4
">

Product Description

</h2>


<p className="
whitespace-pre-line
text-gray-700
">

{product.description || "No description added"}

</p>


</div>







{/* SIMILAR PRODUCTS */}


<div className="
max-w-7xl
mx-auto
mt-8
">


<h2 className="
text-3xl
font-bold
mb-6
">

Similar Products

</h2>



<div className="
grid
md:grid-cols-4
gap-6
">


{

similarProducts.map((item:any)=>(


<Link

key={item.id}

href={`/products/${item.id}`}

className="
bg-white
rounded-xl
shadow
overflow-hidden
"


>


<img

src={item.image}

className="
w-full
h-48
object-cover
"

/>


<div className="p-4">


<h3 className="
font-bold
">

{item.name}

</h3>


<p className="mt-2">

₹{item.price}

</p>


</div>


</Link>


))


}


</div>


</div>



<ReviewSection
productId={product.id}
/>

</main>


);


}