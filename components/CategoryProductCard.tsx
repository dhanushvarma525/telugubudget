import Link from "next/link";


type CategoryProductCardProps = {

  id:number;
  name:string;
  price:string;
  image:string;

};



export default function CategoryProductCard({

id,
name,
price,
image

}:CategoryProductCardProps){



return (

<Link

href={`/products/${id}`}

>

<div

className="
bg-white
rounded-2xl
shadow-md
overflow-hidden
hover:shadow-xl
transition
cursor-pointer
"

>


<img

src={image}

alt={name}

className="
w-full
h-48
object-cover
"

/>



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




<p className="
mt-2
text-yellow-500
">

⭐⭐⭐⭐⭐

</p>



<button

className="
mt-4
w-full
bg-orange-500
text-white
py-2
rounded-lg
font-semibold
"

>

View Product

</button>



</div>


</div>


</Link>


);


}