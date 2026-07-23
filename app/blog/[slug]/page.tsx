import { getBaseUrl } from "@/lib/getBaseUrl";
import { notFound } from "next/navigation";
import RelatedBlogs from "@/components/RelatedBlogs";


async function getBlog(slug: string) {

  const res = await fetch(
    `${getBaseUrl()}/api/blogs/${slug}`,
    {
      cache: "no-store",
    }
  );


  if (!res.ok) {
    return null;
  }


  const data = await res.json();


  return data.blog || null;

}




export async function generateMetadata(
{
  params
}:{
  params: Promise<{slug:string}>
}) {


  const { slug } = await params;


  const blog = await getBlog(slug);



  if (!blog) {

    return {
      title: "Blog Not Found",
    };

  }



  return {

    title: `${blog.title} | AnantaGo`,

    description:
      blog.excerpt ||
      blog.content?.slice(0,150),


    openGraph: {

      title: blog.title,

      description: blog.excerpt,

      images:
        blog.cover_image
        ?
        [blog.cover_image]
        :
        [],

    },

  };

}





export default async function BlogArticlePage(
{
  params
}:{
  params: Promise<{slug:string}>
}) {


  const { slug } = await params;


  const blog = await getBlog(slug);



  if (!blog) {

    notFound();

  }




  await fetch(
    `${getBaseUrl()}/api/blogs/${slug}/view`,
    {
      method:"POST",
      cache:"no-store",
    }
  );





  return (

    <article className="max-w-4xl mx-auto p-6">


      <h1 className="
      text-4xl
      font-bold
      mb-4
      ">

        {blog.title}

      </h1>





      <div className="
      text-sm
      text-gray-500
      mb-6
      ">

        {blog.category}

        {" • "}

        {blog.author || "AnantaGo"}

        {" • "}

        👁️ {blog.views || 0} views


      </div>





      {
        blog.cover_image && (

          <img

            src={blog.cover_image}

            alt={blog.title}

            className="
            w-full
            rounded-xl
            mb-8
            "

          />

        )
      }





      <div className="
      whitespace-pre-line
      text-lg
      leading-8
      ">

        {blog.content}

      </div>





      <RelatedBlogs

        category={blog.category}

        slug={blog.slug}

      />




    </article>

  );

}