"use client";

import { useState } from "react";


export default function ContactPage(){


const [name,setName]=useState("");

const [email,setEmail]=useState("");

const [message,setMessage]=useState("");

const [loading,setLoading]=useState(false);





async function submitContact(){


if(!name || !email || !message){

alert("Please fill all fields");

return;

}



setLoading(true);



const res = await fetch(

"/api/contact",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

name,

email,

message

})


}

);



const data = await res.json();



if(data.success){

alert(
"Message sent successfully"
);


setName("");

setEmail("");

setMessage("");

}
else{

alert(data.message);

}



setLoading(false);


}





return (

<main className="
min-h-screen
bg-gray-100
p-5
">


<div className="
max-w-xl
mx-auto
bg-white
rounded-2xl
shadow
p-6
md:p-10
">


<h1 className="
text-3xl
md:text-4xl
font-bold
mb-6
">

📩 Contact TeluguBudget

</h1>




<input

placeholder="Your Name"

value={name}

onChange={
e=>setName(e.target.value)
}

className="
w-full
border
rounded-lg
p-3
mb-4
"

/>




<input

placeholder="Email Address"

value={email}

onChange={
e=>setEmail(e.target.value)
}

className="
w-full
border
rounded-lg
p-3
mb-4
"

/>





<textarea

placeholder="Your Message"

value={message}

onChange={
e=>setMessage(e.target.value)
}

className="
w-full
border
rounded-lg
p-3
mb-4
h-32
"

/>





<button

onClick={submitContact}

className="
w-full
bg-orange-500
hover:bg-orange-600
text-white
font-bold
py-3
rounded-lg
"

>

{

loading

?

"Sending..."

:

"Send Message"

}


</button>




</div>


</main>

);


}