import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";


async function getBlogs(){

  const res = await fetch(
    `${getBaseUrl()}/api/blogs`,
    {
      cache:"no-store"
    }
  );


  const data = await res.json();

  return data.blogs || [];

}





export async function generateMetadata(
{
 params
}:{
 params:Promise<{category:string}>
}){


 const {category}=await params;


 return {

   title:
   `${category} Blogs | Telugu Budget`,


   description:
   `Read latest ${category} articles and buying guides on Telugu Budget`

 }


}





export default async function BlogCategoryPage(
{
 params
}:{
 params:Promise<{category:string}>
}){


 const {category}=await params;


 const blogs =
 await getBlogs();



 const filteredBlogs =
 blogs.filter(
 (blog:any)=>

 blog.published &&
 blog.category
 .toLowerCase()
 ===
 category.toLowerCase()

 );





 return (

 <div className="p-6 max-w-6xl mx-auto">



 <h1
 className="
 text-3xl
 font-bold
 mb-8
 "
 >

 {category} Blogs

 </h1>





 {
 filteredBlogs.length === 0 &&

 <p>
 No blogs found.
 </p>

 }






 <div
 className="
 grid
 md:grid-cols-3
 gap-6
 "
 >



 {
 filteredBlogs.map(
 (blog:any)=>(


 <Link

 key={blog.id}

 href={`/blog/${blog.slug}`}

 className="
 border
 rounded-xl
 p-5
 hover:shadow-lg
 "

 >



 <h2
 className="
 font-bold
 text-lg
 "
 >

 {blog.title}

 </h2>



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




 </div>

 )


}