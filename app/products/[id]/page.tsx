import Link from "next/link";
import ReviewSection from "@/components/ReviewSection";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import { getBaseUrl } from "@/lib/getBaseUrl";
import ProductImageSlider from "@/components/ProductImageSlider";

async function getProduct(id:string){

  const res = await fetch(
    `${getBaseUrl()}/api/products/${id}`,
    {
      cache:"no-store",
    }
  );


  if(!res.ok){
    return null;
  }


  return await res.json();

}



async function getSimilarProducts(
  category:string,
  id:string
){

  const res = await fetch(
    `${getBaseUrl()}/api/products`,
    {
      cache:"no-store",
    }
  );


  if(!res.ok){
    return [];
  }


  const data = await res.json();


  const products=data.products || [];


  return products
  .filter(
    (item:any)=>
      item.category===category &&
      item.id!==Number(id)
  )
  .slice(0,4);

}



export default async function ProductPage({

params

}:{

params:Promise<{id:string}>

}){


const {id}=await params;


const product=await getProduct(id);



if(!product){

return(

<div className="p-10 text-center">

Product Not Found

</div>

);

}



const similarProducts=
await getSimilarProducts(
product.category,
id
);



const rating=
Number(product.rating || 0);
return (

<main
className="
min-h-screen
bg-gray-100
p-3
sm:p-6
"
>


<div
className="
max-w-7xl
mx-auto
bg-white
rounded-xl
shadow
p-4
sm:p-8
grid
md:grid-cols-2
gap-6
"
>



{/* PRODUCT IMAGE */}

<ProductImageSlider
  images={[
    product.image,
    product.image2,
    product.image3,
    product.image4,
    product.image5,
    product.image6,
  ]}
/>





{/* PRODUCT DETAILS */}

<div>



<h1
className="
text-xl
sm:text-3xl
font-bold
leading-snug
"
>

{product.name}

</h1>





<div
className="
mt-3
flex
items-center
gap-2
"
>


<span
className="
text-yellow-500
text-lg
sm:text-2xl
"
>

{"★".repeat(
Math.floor(rating)
)}

{"☆".repeat(
5-Math.floor(rating)
)}

</span>


<span
className="
text-gray-600
text-sm
"
>

{rating}/5

</span>


</div>





<div
className="
mt-4
flex
items-center
gap-3
"
>


<p
className="
text-2xl
sm:text-3xl
font-bold
text-orange-500
"
>

₹{product.price}

</p>



{
product.old_price &&

<p
className="
line-through
text-gray-400
"
>

₹{product.old_price}

</p>

}


</div>






{
product.old_price &&

<p
className="
mt-2
text-green-600
font-bold
"
>

🔥

{
Math.round(

(
(Number(product.old_price)
-
Number(product.price))

/

Number(product.old_price)

)

*100

)

}

% OFF

</p>

}



<div
className="
mt-4
"
>


{

product.stock==="In Stock"

?

<span
className="
text-green-600
font-semibold
"
>

🟢 In Stock

</span>


:

<span
className="
text-red-600
font-semibold
"
>

🔴 Out of Stock

</span>


}


</div>





<div
className="
mt-4
"
>

<WishlistButton product={product}/>

</div>






<a

href={product.affiliate_link}

target="_blank"

className="
mt-4
block
w-full
bg-orange-500
hover:bg-orange-600
text-white
text-center
py-3
rounded-xl
font-bold
text-base
"
>

🛒 Buy Now

</a>





<div
className="
mt-4
"
>

<ShareButton
name={product.name}
/>

</div>



</div>


</div>
{/* ABOUT ITEM */}

<div
className="
max-w-7xl
mx-auto
bg-white
mt-5
rounded-xl
shadow
p-4
sm:p-8
"
>


<h2
className="
text-xl
sm:text-2xl
font-bold
mb-4
"
>

About this item

</h2>



<div
className="
text-gray-700
text-sm
sm:text-base
"
>


{

product.features

?

product.features
.split("\n")
.map(
(item:string,index:number)=>(


<p
key={index}
className="
mb-2
"
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

<div
className="
max-w-7xl
mx-auto
bg-white
mt-5
rounded-xl
shadow
p-4
sm:p-8
"
>


<h2
className="
text-xl
sm:text-2xl
font-bold
mb-4
"
>

Product Description

</h2>



<p
className="
whitespace-pre-line
text-gray-700
text-sm
sm:text-base
"
>

{
product.description ||
"No description added"
}

</p>



</div>






{/* SIMILAR PRODUCTS */}

<div
className="
max-w-7xl
mx-auto
mt-6
"
>


<h2
className="
text-2xl
font-bold
mb-4
"
>

Similar Products

</h2>



<div
className="
grid
grid-cols-2
sm:grid-cols-3
md:grid-cols-4
gap-4
"
>


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

alt={item.name}

className="
w-full
h-36
sm:h-48
object-contain
"

/>



<div
className="
p-3
"
>


<h3
className="
font-bold
text-sm
line-clamp-2
"
>

{item.name}

</h3>



<p
className="
mt-2
font-semibold
"
>

₹{item.price}

</p>


</div>


</Link>


))


}


</div>


</div>





{/* REVIEWS */}


<div
className="
mt-6
"
>


<ReviewSection

productId={product.id}

/>


</div>




</main>


);

}