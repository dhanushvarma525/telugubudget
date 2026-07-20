"use client";

import { useState } from "react";


export default function TestUpload(){


const [image,setImage]=useState("");



async function upload(e:any){


const file=e.target.files[0];


const formData=new FormData();


formData.append(
"file",
file
);



const res=await fetch(
"/api/upload",
{
method:"POST",
body:formData
}
);



const data=await res.json();


setImage(data.image);


}



return (

<div className="p-10">


<h1 className="text-3xl font-bold mb-5">
Test Image Upload
</h1>



<input
type="file"
onChange={upload}
/>



{
image && (

<div className="mt-5">

<p>
Uploaded:
{image}
</p>


<img
src={image}
className="w-48 mt-3"
/>


</div>

)
}


</div>

);


}