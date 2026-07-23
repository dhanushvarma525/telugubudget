"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function BlogsPage() {

  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    loadBlogs();

  }, []);




  async function loadBlogs() {

    try {

      const res = await fetch("/api/blogs");

      const data = await res.json();


      if (data.success) {

        setBlogs(data.blogs || []);

      }


    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  }





  async function deleteBlog(slug: string) {


    const confirmDelete = confirm(
      "Are you sure you want to delete this blog?"
    );


    if (!confirmDelete) return;



    try {


      const res = await fetch(
        `/api/blogs/${slug}`,
        {
          method: "DELETE",
        }
      );



      const data = await res.json();



      if (data.success) {


        alert("Blog deleted successfully");


        loadBlogs();


      } else {


        alert(data.message || "Delete failed");


      }



    } catch (error) {


      console.log(error);


      alert("Something went wrong");


    }


  }







  if (loading) {

    return (

      <div className="p-10 text-2xl font-bold">

        Loading Blogs...

      </div>

    );

  }







  return (

    <main className="max-w-7xl mx-auto p-8">



      <div className="flex justify-between items-center mb-8">


        <h1 className="text-3xl font-bold">

          📝 Manage Blogs

        </h1>



        <Link

          href="/admin/blogs/add"

          className="
          bg-green-600
          text-white
          px-6
          py-3
          rounded-lg
          "

        >

          ➕ Add Blog

        </Link>


      </div>







      {
        blogs.length === 0 ? (


          <div className="bg-white shadow rounded-xl p-6">

            No blogs created yet.

          </div>



        ) : (



          <div className="grid gap-5">



            {
              blogs.map((blog: any) => (



                <div

                  key={blog.id}

                  className="
                  bg-white
                  shadow
                  rounded-xl
                  p-5
                  "

                >



                  <h2 className="text-xl font-bold">

                    {blog.title}

                  </h2>




                  <p className="text-gray-600 mt-2">

                    {blog.excerpt}

                  </p>





                  <div className="mt-4 flex gap-3 flex-wrap">





                    <Link

                      href={`/blog/${blog.slug}`}

                      className="
                      bg-blue-600
                      text-white
                      px-4
                      py-2
                      rounded
                      "

                    >

                      View

                    </Link>





                    <Link

                      href={`/admin/blogs/edit/${blog.slug}`}

                      className="
                      bg-yellow-500
                      text-white
                      px-4
                      py-2
                      rounded
                      "

                    >

                      Edit

                    </Link>







                    <button

                      onClick={() => deleteBlog(blog.slug)}

                      className="
                      bg-red-600
                      text-white
                      px-4
                      py-2
                      rounded
                      "

                    >

                      Delete

                    </button>





                  </div>




                </div>



              ))
            }




          </div>


        )
      }





    </main>

  );

}