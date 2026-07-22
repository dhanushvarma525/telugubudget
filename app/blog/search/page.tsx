"use client";

import {useState} from "react";
import Link from "next/link";


export default function BlogSearchPage(){


const [query,setQuery]=useState("");

const [blogs,setBlogs]=useState<any[]>([]);



async function searchBlogs(){


 const res =
 await fetch(
 `/api/blogs/search?q=${query}`
 );


 const data =
 await res.json();


 setBlogs(
 data.blogs || []
 );


}





return (

<div className="p-6 max-w-5xl mx-auto">


<h1 className="text-3xl font-bold mb-6">

Search Blogs

</h1>



<div className="flex gap-2">


<input

value={query}

onChange={
e=>setQuery(e.target.value)
}

placeholder="Search articles..."

className="
border
p-3
flex-1
rounded
"

/>


<button

onClick={searchBlogs}

className="
bg-orange-500
text-white
px-5
rounded
"

>

Search

</button>


</div>






<div className="mt-8 space-y-4">


{
blogs.map((blog)=>(


<Link

key={blog.id}

href={`/blog/${blog.slug}`}

className="
block
border
p-4
rounded
hover:shadow
"

>


<h2 className="font-bold">

{blog.title}

</h2>



<p className="text-sm text-gray-500">

{blog.excerpt}

</p>


</Link>


))
}


</div>


</div>

)


}