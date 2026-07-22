import { getBaseUrl } from "@/lib/getBaseUrl";
import { notFound } from "next/navigation";
import RelatedBlogs from "@/components/RelatedBlogs";


async function getBlog(slug:string){

  const res = await fetch(
    `${getBaseUrl()}/api/blogs/${slug}`,
    {
      cache:"no-store"
    }
  );


  if(!res.ok){
    return null;
  }


  return res.json();

}





export async function generateMetadata(
{
 params
}:{
 params:Promise<{slug:string}>
}){


 const {slug}=await params;


 const blog = await getBlog(slug);



 if(!blog){

   return {
     title:"Blog Not Found"
   }

 }



 return {

   title:
   `${blog.title} | Telugu Budget`,


   description:
   blog.excerpt ||
   blog.content?.slice(0,150),


   openGraph:{

     title:
     blog.title,


     description:
     blog.excerpt,


     images:
     blog.cover_image
     ?
     [blog.cover_image]
     :
     []

   }


 }


}








export default async function BlogArticlePage(
{
 params
}:{
 params:Promise<{slug:string}>
}){


 const {slug}=await params;


 const blog =
 await getBlog(slug);



 if(!blog){

   notFound();

 }





 // Increase blog views

 await fetch(
   `${getBaseUrl()}/api/blogs/${slug}/view`,
   {
     method:"POST",
     cache:"no-store"
   }
 );





 const siteUrl =
 process.env.NEXT_PUBLIC_SITE_URL ||
 "http://localhost:3000";






 return (

 <article
 className="
 max-w-4xl
 mx-auto
 p-6
 "
 >




 {/* Article Schema */}

 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html:JSON.stringify({

   "@context":"https://schema.org",

   "@type":"Article",

   headline:blog.title,


   description:
   blog.excerpt,


   image:
   blog.cover_image
   ?
   [blog.cover_image]
   :
   [],


   author:{

     "@type":"Person",

     name:
     blog.author || "Telugu Budget"

   },


   publisher:{

     "@type":"Organization",

     name:"Telugu Budget"

   },


   datePublished:
   blog.created_at,


   dateModified:
   blog.updated_at


 })

 }}
 />







 {/* Breadcrumb Schema */}

 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html:JSON.stringify({

   "@context":"https://schema.org",

   "@type":"BreadcrumbList",


   itemListElement:[


   {

    "@type":"ListItem",

    position:1,

    name:"Home",

    item:siteUrl

   },


   {

    "@type":"ListItem",

    position:2,

    name:"Blog",

    item:`${siteUrl}/blog`

   },


   {

    "@type":"ListItem",

    position:3,

    name:blog.title,

    item:`${siteUrl}/blog/${blog.slug}`

   }


   ]


 })

 }}
 />









 <h1
 className="
 text-4xl
 font-bold
 mb-4
 "
 >

 {blog.title}

 </h1>







 <div
 className="
 text-sm
 text-gray-500
 mb-6
 "
 >

 {blog.category}

 {" • "}

 {blog.author}


 {" • "}

 👁️ {blog.views || 0} views


 </div>







 {
 blog.cover_image &&


 <img

 src={blog.cover_image}

 alt={blog.title}

 className="
 w-full
 rounded-xl
 mb-8
 "

 />

 }









 <div
 className="
 whitespace-pre-line
 text-lg
 leading-8
 "
 >

 {blog.content}


 </div>








 {/* Related Blogs */}

 <RelatedBlogs

 category={blog.category}

 slug={blog.slug}

 />








 </article>

 )


}