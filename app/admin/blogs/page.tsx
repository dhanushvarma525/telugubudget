"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ManageBlogs() {

  const [blogs,setBlogs] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);


  async function loadBlogs(){

    const res = await fetch("/api/blogs");

    const data = await res.json();

    setBlogs(data.blogs || []);

    setLoading(false);

  }


  useEffect(()=>{
    loadBlogs();
  },[]);



  async function deleteBlog(slug:string){

    const confirmDelete = confirm(
      "Delete this blog?"
    );

    if(!confirmDelete) return;


    await fetch(
      `/api/blogs/${slug}`,
      {
        method:"DELETE"
      }
    );


    loadBlogs();

  }



  if(loading)
  {
    return (
      <div className="p-6">
        Loading blogs...
      </div>
    )
  }



  return (

    <div className="p-6">


      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Manage Blogs
        </h1>


        <Link
        href="/admin/blogs/add"
        className="
        bg-black
        text-white
        px-4
        py-2
        rounded
        "
        >
          + Add Blog
        </Link>


      </div>



      <div className="space-y-4">


      {
        blogs.map((blog)=>(
          
          <div
          key={blog.id}
          className="
          border
          rounded
          p-4
          flex
          justify-between
          items-center
          "
          >


            <div>

              <h2 className="font-bold">
                {blog.title}
              </h2>


              <p className="text-sm text-gray-500">
                {blog.category}
              </p>


            </div>



            <div className="flex gap-3">


              <Link
              href={`/admin/blogs/edit/${blog.slug}`}
              className="
              bg-blue-500
              text-white
              px-3
              py-1
              rounded
              "
              >
                Edit
              </Link>


              <button
              onClick={()=>deleteBlog(blog.slug)}
              className="
              bg-red-500
              text-white
              px-3
              py-1
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


    </div>

  )
}