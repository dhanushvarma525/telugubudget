import Link from "next/link";
import ReviewSection from "@/components/ReviewSection";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import { getBaseUrl } from "@/lib/getBaseUrl";
import ProductImageSlider from "@/components/ProductImageSlider";
import ViewTracker from "@/components/ViewTracker";


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



const rating =
Number(product.rating || 0);



const siteUrl =
process.env.NEXT_PUBLIC_SITE_URL ||
"http://localhost:3000";



return (

<main
className="
min-h-screen
bg-gray-100
p-3
sm:p-6
"
>


{/* PRODUCT SCHEMA */}

<script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html:JSON.stringify({

"@context":"https://schema.org",

"@type":"Product",


name:product.name,


image:[
product.image,
product.image2,
product.image3,
product.image4
].filter(Boolean),



description:
product.description,



brand:{

"@type":"Brand",

name:"TeluguBudget"

},



offers:{


"@type":"Offer",


url:
`${siteUrl}/products/${product.id}`,


priceCurrency:"INR",


price:
product.price,


availability:
product.stock === "In Stock"

?
"https://schema.org/InStock"

:

"https://schema.org/OutOfStock",



seller:{

"@type":"Organization",

name:"TeluguBudget"

}


},




aggregateRating:
rating > 0

?

{

"@type":"AggregateRating",

ratingValue:
rating,

bestRating:"5",

worstRating:"1"

}

:

undefined



})

}}
/>






{/* BREADCRUMB SCHEMA */}


<script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html:JSON.stringify({


"@context":"https://schema.org",


"@type":"BreadcrumbList",



itemListElement:[



{


"@type":"ListItem",

position:1,

name:"Home",

item:siteUrl

},




{


"@type":"ListItem",

position:2,

name:
product.category,

item:
`${siteUrl}/categories/${encodeURIComponent(product.category)}`

},




{


"@type":"ListItem",

position:3,

name:
product.name,

item:
`${siteUrl}/products/${product.id}`

}



]



})

}}
/>{/* REVIEWS */}


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