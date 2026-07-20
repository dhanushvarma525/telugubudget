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

<div className="
bg-white
rounded-2xl
shadow-md
overflow-hidden
hover:shadow-xl
transition
">


<Link href={`/products/${id}`}>



{

image ?

<img

src={image}

alt={name}

className="
w-full
h-48
object-cover
"

/>

:

<div className="
h-48
bg-gray-200
flex
items-center
justify-center
">

No Image

</div>

}



<div className="p-5">


<h2 className="
text-xl
font-bold
">

{name}

</h2>


<p className="
text-lg
font-semibold
mt-2
">

₹{price}

</p>


</div>


</Link>





<a

href={affiliate_link}

target="_blank"

className="
block
mx-5
mb-5
text-center
bg-orange-500
text-white
py-3
rounded-lg
font-bold
"

>

🛒 Buy Now

</a>



</div>

);


}