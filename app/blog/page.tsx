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



export default async function BlogPage(){


  const blogs = await getBlogs();



  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-8">
        Telugu Budget Blogs
      </h1>



      <div
      className="
      grid
      md:grid-cols-3
      gap-6
      "
      >


      {
        blogs
        .filter((blog:any)=>blog.published)
        .map((blog:any)=>(


          <Link
          key={blog.id}
          href={`/blog/${blog.slug}`}
          className="
          border
          rounded-xl
          overflow-hidden
          hover:shadow-lg
          transition
          "
          >



            {
              blog.cover_image &&

              <img
              src={blog.cover_image}
              alt={blog.title}
              className="
              w-full
              h-48
              object-cover
              "
              />

            }




            <div className="p-4">


              <h2 className="
              font-bold
              text-lg
              "
              >
                {blog.title}
              </h2>



              <p className="
              text-sm
              text-gray-500
              mt-2
              "
              >
                {blog.excerpt}
              </p>



              <p className="
              text-xs
              mt-3
              "
              >
                {blog.category}
              </p>



            </div>



          </Link>


        ))
      }


      </div>


    </div>

  )

}