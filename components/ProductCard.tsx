import Link from "next/link";


type ProductCardProps = {

  id:number;

  name:string;

  price:string;

  image:string;

  affiliate_link:string;

};



export default function ProductCard({

  id,

  name,

  price,

  image,

  affiliate_link

}:ProductCardProps){


return (

<div
  className="
  bg-white
  rounded-xl
  shadow-md
  overflow-hidden
  hover:shadow-xl
  transition
  flex
  flex-col
  h-full
  "
>


<Link
  href={`/products/${id}`}
  className="flex-1"
>


{/* PRODUCT IMAGE */}

<div
  className="
  w-full
  aspect-square
  bg-white
  flex
  items-center
  justify-center
  overflow-hidden
  "
>


{
image ? (

<img

src={image}

alt={name}

className="
w-full
h-full
object-contain
p-3
"

/>

) : (

<div

className="
w-full
h-full
bg-gray-200
flex
items-center
justify-center
text-sm
"

>

No Image

</div>

)

}


</div>





{/* PRODUCT INFO */}

<div
className="
p-3
sm:p-5
"
>


<h2

className="
text-sm
sm:text-xl
font-bold
line-clamp-2
min-h-[40px]
sm:min-h-[56px]
"

>

{name}

</h2>




<p

className="
text-base
sm:text-lg
font-semibold
mt-2
text-orange-600
"

>

₹{price}

</p>


</div>



</Link>





{/* BUY BUTTON */}

<a

href={affiliate_link}

target="_blank"

rel="noopener noreferrer"

className="
block
mx-3
mb-3
sm:mx-5
sm:mb-5
text-center
bg-orange-500
hover:bg-orange-600
text-white
py-2
sm:py-3
rounded-lg
font-bold
text-sm
sm:text-base
"

>

🛒 Buy Now

</a>




</div>

);


}