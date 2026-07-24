"use client";

import { useEffect, useState } from "react";


export default function ReviewSection({
  productId
}:{
  productId:number
}){


const [reviews,setReviews] = useState<any[]>([]);

const [name,setName]=useState("");

const [comment,setComment]=useState("");

const [rating,setRating]=useState(5);

const [loading,setLoading]=useState(false);



async function loadReviews(){


const res = await fetch(
`/api/reviews?product_id=${productId}`
);


const data = await res.json();


setReviews(data);


}



useEffect(()=>{

loadReviews();

},[]);





async function submitReview(){


if(!name || !comment){

alert("Please fill all fields");

return;

}


setLoading(true);



await fetch(
"/api/reviews",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

product_id:productId,

name,

rating,

comment

})

}

);



setName("");

setComment("");

setRating(5);


loadReviews();


setLoading(false);


}




return (

<div className="bg-white rounded-xl shadow p-8 mt-8">


<h2 className="text-3xl font-bold mb-5">

Customer Reviews

</h2>





<div className="mb-8">


<input

placeholder="Your Name"

value={name}

onChange={
e=>setName(e.target.value)
}

className="border p-3 w-full rounded mb-3"

/>





<div className="mb-3">


{
[1,2,3,4,5].map((star)=>(


<button

key={star}

onClick={()=>setRating(star)}

className="text-3xl"

>

{star <= rating ? "★":"☆"}

</button>


))

}


</div>







<textarea

placeholder="Write your review"

value={comment}

onChange={
e=>setComment(e.target.value)
}

className="border p-3 w-full rounded h-32"

/>







<button

onClick={submitReview}

className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg"

>

{
loading
?
"Submitting..."
:
"Submit Review"
}

</button>



</div>







{
reviews.map((review)=>(


<div

key={review.id}

className="border-t py-5"

>


<h3 className="font-bold">

{review.name}

</h3>



<p className="text-yellow-500">

{"★".repeat(review.rating)}

</p>



<p>

{review.comment}

</p>


</div>


))

}



</div>


);


}