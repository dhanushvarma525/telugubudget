import Link from "next/link";

type CategoryProductCardProps = {
  id: number;
  name: string;
  price: string;
  image: string;
  coupon?: string;
  coupon_available?: boolean;
};


export default function CategoryProductCard({

  id,
  name,
  price,
  image,
  coupon,
  coupon_available,

}:CategoryProductCardProps){


return (

<Link href={`/products/${id}`}>

<div
className="
bg-white
rounded-xl
shadow-md
overflow-hidden
hover:shadow-xl
transition
"
>


{/* IMAGE */}

<div
className="
w-full
h-32
sm:h-40
bg-white
flex
items-center
justify-center
overflow-hidden
"
>

<img

src={image}

alt={name}

className="
w-full
h-full
object-contain
p-2
"

/>

</div>




{/* CONTENT */}

<div
className="
p-3
"
>


<h2

className="
text-sm
font-bold
line-clamp-2
min-h-[40px]
"

>

{name}

</h2>



<p

className="
text-base
font-semibold
mt-2
text-orange-600
"

>

₹{price}

</p>




{
coupon_available && (

<p

className="
text-xs
text-green-600
font-semibold
mt-1
"

>

🟢 Coupon Available

</p>

)

}




<button

className="
mt-3
w-full
bg-orange-500
text-white
py-2
rounded-lg
text-sm
font-bold
"

>

View Product

</button>



</div>



</div>


</Link>

);

}