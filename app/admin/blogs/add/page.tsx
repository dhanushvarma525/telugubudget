"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function AddBlogPage(){

  const router = useRouter();


  const [form,setForm] = useState({

    title:"",
    slug:"",
    excerpt:"",
    content:"",
    cover_image:"",
    category:"",
    author:"Telugu Budget",
    tags:"",
    published:true,
    featured:false

  });



  function handleChange(
    e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ){

    const {name,value} = e.target;


    setForm({

      ...form,

      [name]:value

    });


  }



  function generateSlug(title:string){

    return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g,"")
    .replace(/\s+/g,"-");

  }



  async function submitBlog(){


    const response = await fetch(
      "/api/blogs",
      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          ...form,

          slug:
          form.slug ||
          generateSlug(form.title),

          tags:
          form.tags
          .split(",")
          .map(tag=>tag.trim())

        })

      }
    );



    const data = await response.json();



    if(data.success){

      alert(
        "Blog added successfully"
      );


      router.push(
        "/admin/blogs"
      );


    }
    else{

      alert(
        data.message
      );

    }


  }



  return (

    <div className="p-6 max-w-3xl">


      <h1 className="text-2xl font-bold mb-6">
        Add New Blog
      </h1>



      <div className="space-y-4">



        <input
        name="title"
        placeholder="Blog title"
        value={form.title}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <input
        name="slug"
        placeholder="Slug (optional)"
        value={form.slug}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <input
        name="cover_image"
        placeholder="Cover image URL"
        value={form.cover_image}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <input
        name="tags"
        placeholder="Tags separated by comma"
        value={form.tags}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <textarea
        name="excerpt"
        placeholder="Short description"
        value={form.excerpt}
        onChange={handleChange}
        className="
        border
        p-3
        w-full
        rounded
        h-24
        "
        />



        <textarea
        name="content"
        placeholder="Write complete blog content..."
        value={form.content}
        onChange={handleChange}
        className="
        border
        p-3
        w-full
        rounded
        h-72
        "
        />



        <label className="flex gap-2">

          <input
          type="checkbox"
          checked={form.featured}
          onChange={(e)=>
            setForm({
              ...form,
              featured:e.target.checked
            })
          }
          />

          Featured Blog

        </label>



        <label className="flex gap-2">

          <input
          type="checkbox"
          checked={form.published}
          onChange={(e)=>
            setForm({
              ...form,
              published:e.target.checked
            })
          }
          />

          Published

        </label>



        <button
        onClick={submitBlog}
        className="
        bg-black
        text-white
        px-6
        py-3
        rounded
        "
        >

          Save Blog

        </button>



      </div>


    </div>

  )

}