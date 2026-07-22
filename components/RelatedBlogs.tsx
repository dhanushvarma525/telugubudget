import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";


async function getRelatedBlogs(
category:string,
currentSlug:string
){

  const res = await fetch(
    `${getBaseUrl()}/api/blogs`,
    {
      cache:"no-store"
    }
  );


  const data = await res.json();


  return (
    data.blogs || []
  )
  .filter(
    (blog:any)=>
      blog.published &&
      blog.category === category &&
      blog.slug !== currentSlug
  )
  .slice(0,3);

}





export default async function RelatedBlogs(
{
 category,
 slug
}:{
 category:string,
 slug:string
}
){


 const blogs =
 await getRelatedBlogs(
  category,
  slug
 );



 if(blogs.length===0)
 return null;




 return (

 <section className="
 mt-12
 border-t
 pt-8
 ">


 <h2
 className="
 text-2xl
 font-bold
 mb-5
 "
 >
 You may also like
 </h2>





 <div
 className="
 grid
 md:grid-cols-3
 gap-5
 "
 >


 {
 blogs.map((blog:any)=>(


 <Link
 key={blog.id}
 href={`/blog/${blog.slug}`}
 className="
 border
 rounded-xl
 p-4
 hover:shadow-lg
 "
 >



 <h3
 className="
 font-bold
 "
 >
 {blog.title}
 </h3>


 <p
 className="
 text-sm
 text-gray-500
 mt-2
 "
 >
 {blog.excerpt}
 </p>



 </Link>


 ))
 }



 </div>



 </section>

 )


}