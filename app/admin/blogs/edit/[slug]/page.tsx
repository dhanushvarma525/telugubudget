"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


export default function EditBlogPage(){

  const params = useParams();

  const router = useRouter();

  const slug = params.slug as string;



  const [loading,setLoading] = useState(true);


  const [form,setForm] = useState<any>({

    title:"",
    slug:"",
    excerpt:"",
    content:"",
    cover_image:"",
    category:"",
    author:"",
    tags:[],
    published:true,
    featured:false

  });



  async function loadBlog(){

    const res = await fetch(
      `/api/blogs/${slug}`
    );


    const data = await res.json();


    setForm({

      ...data,

      tags:
      data.tags
      ?
      data.tags.join(", ")
      :
      ""

    });


    setLoading(false);

  }



  useEffect(()=>{

    loadBlog();

  },[]);




  function handleChange(
    e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ){

    setForm({

      ...form,

      [e.target.name]:
      e.target.value

    });

  }





  async function updateBlog(){


    const res = await fetch(
      `/api/blogs/${slug}`,
      {

        method:"PUT",

        headers:{
          "Content-Type":"application/json"
        },


        body:JSON.stringify({

          ...form,

          tags:
          form.tags
          .split(",")
          .map((tag:string)=>tag.trim())


        })

      }
    );



    const data = await res.json();



    if(data.success){

      alert(
        "Blog updated successfully"
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





  if(loading){

    return (
      <div className="p-6">
        Loading...
      </div>
    )

  }





  return (

    <div className="p-6 max-w-3xl">


      <h1 className="text-2xl font-bold mb-6">

        Edit Blog

      </h1>




      <div className="space-y-4">



        <input
        name="title"
        value={form.title}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <input
        name="slug"
        value={form.slug}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <input
        name="cover_image"
        value={form.cover_image}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <input
        name="category"
        value={form.category}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <input
        name="tags"
        value={form.tags}
        onChange={handleChange}
        className="border p-3 w-full rounded"
        />



        <textarea
        name="excerpt"
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


          Featured


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

        onClick={updateBlog}

        className="
        bg-black
        text-white
        px-6
        py-3
        rounded
        "

        >

          Update Blog

        </button>




      </div>



    </div>

  )


}