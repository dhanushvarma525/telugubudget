"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


type Product = {
  id: string;
  name: string;
};



export default function EditBlogPage() {


  const params = useParams();

  const router = useRouter();

  const slug = params.slug as string;




  const [loading, setLoading] = useState(true);


  const [uploading, setUploading] = useState(false);



  const [products, setProducts] = useState<Product[]>([]);



  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);






  const [form, setForm] = useState<any>({

    title: "",

    slug: "",

    excerpt: "",

    content: "",

    cover_image: "",

    category: "",

    author: "AnantaGo",

    tags: "",

    published: true,

    featured: false,

  });







  useEffect(()=>{


    loadBlog();

    loadProducts();


  },[]);







  async function loadBlog(){


    const res = await fetch(

      `/api/blogs/${slug}`

    );



    const response = await res.json();



    const data = response.blog;





    if(data){



      setForm({

        ...data,


        tags:

        data.tags

        ?

        data.tags.join(", ")

        :

        "",


      });






      if(data.related_products){


        setSelectedProducts(

          data.related_products

        );


      }

      else{


        setSelectedProducts([]);


      }



    }





    setLoading(false);



  }
    async function loadProducts(){


    const { data, error } = await supabase

      .from("products")

      .select("id,name")

      .order(

        "created_at",

        {

          ascending:false

        }

      );



    if(!error && data){


      setProducts(data);


    }


  }








  async function handleImageUpload(

    e:React.ChangeEvent<HTMLInputElement>

  ){



    const file = e.target.files?.[0];



    if(!file) return;





    try{



      setUploading(true);





      const fileName =

      `${Date.now()}-${file.name.replace(/\s+/g,"-")}`;







      const { error } = await supabase.storage

        .from("blog-images")

        .upload(

          fileName,

          file

        );





      if(error){


        throw error;


      }






      const { data } = supabase.storage

        .from("blog-images")

        .getPublicUrl(fileName);






      setForm((prev:any)=>({


        ...prev,


        cover_image:data.publicUrl


      }));







    }

    catch(error:any){



      alert(error.message);



    }

    finally{



      setUploading(false);



    }



  }









  function handleChange(

    e:React.ChangeEvent<

      HTMLInputElement | HTMLTextAreaElement

    >

  ){



    const {

      name,

      value


    } = e.target;






    setForm((prev:any)=>({


      ...prev,


      [name]:value



    }));



  }









  function generateSlug(title:string){



    return title


      .toLowerCase()


      .trim()


      .replace(

        /[^a-z0-9\s-]/g,

        ""

      )


      .replace(

        /\s+/g,

        "-"

      );



  }









  function toggleProduct(id:string){



    setSelectedProducts((prev)=>



      prev.includes(id)


      ?


      prev.filter(

        (item)=>item !== id

      )


      :


      [

        ...prev,

        id

      ]



    );



  }






  async function updateBlog(){



    const response = await fetch(


      `/api/blogs/${slug}`,



      {



        method:"PUT",




        headers:{


          "Content-Type":"application/json"


        },





        body:JSON.stringify({


          ...form,




          slug:


          form.slug


          ?


          form.slug


          :


          generateSlug(

            form.title

          ),





          tags:


          form.tags


          .split(",")


          .map(

            (tag:string)=>

            tag.trim()

          )


          .filter(Boolean),






          related_products:


          selectedProducts





        })



      }


    );





    const data = await response.json();






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

    );


  }






  return (


    <div className="p-6 max-w-4xl">



      <h1 className="text-2xl font-bold mb-6">

        Edit Blog

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

          placeholder="Slug"

          value={form.slug}

          onChange={handleChange}

          className="border p-3 w-full rounded"

        />








        {/* =========================
            COVER IMAGE UPLOAD
        ========================== */}



        <div className="border rounded-lg p-4">



          <label className="font-semibold block mb-2">

            Blog Cover Image

          </label>






          <input

            type="file"

            accept="image/*"

            onChange={handleImageUpload}

            className="border p-3 w-full rounded"

          />






          {
            uploading && (

              <p className="text-sm text-gray-500 mt-2">

                Uploading image...

              </p>

            )
          }






          {
            form.cover_image && (

              <img

                src={form.cover_image}

                alt="Cover Preview"

                className="
                  mt-4
                  w-full
                  h-64
                  object-cover
                  rounded-lg
                "

              />

            )
          }




        </div>







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






        {/* =========================
            RELATED PRODUCTS
        ========================== */}



        <div className="border rounded-lg p-4">



          <h2 className="text-lg font-semibold mb-3">

            Related Products (Optional)

          </h2>





          <p className="text-sm text-gray-500 mb-4">

            Select products to display at the end of this blog.

          </p>






          <div className="
            max-h-72
            overflow-y-auto
            border
            rounded
            p-3
            space-y-2
          ">



            {
              products.length === 0 && (

                <p className="text-gray-500 text-sm">

                  No products found.

                </p>

              )
            }





            {
              products.map((product)=>(



                <label

                  key={product.id}

                  className="
                    flex
                    items-center
                    gap-3
                    cursor-pointer
                    hover:bg-gray-50
                    rounded
                    p-2
                  "

                >



                  <input

                    type="checkbox"

                    checked={
                      selectedProducts.includes(
                        product.id
                      )
                    }

                    onChange={()=>

                      toggleProduct(

                        product.id

                      )

                    }

                  />




                  <span>

                    {product.name}

                  </span>




                </label>



              ))
            }




          </div>




        </div>
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

          onClick={updateBlog}

          disabled={uploading}

          className="
            bg-black
            text-white
            px-6
            py-3
            rounded
            hover:bg-gray-800
            transition
            disabled:opacity-50
          "

        >


          {uploading 
            ? 
            "Uploading..." 
            : 
            "Update Blog"
          }



        </button>



      </div>









      {/* =========================
          BLOG PREVIEW
      ========================== */}



      <div className="
        mt-10
        border
        rounded-lg
        p-6
        bg-gray-50
      ">



        <h2 className="text-xl font-bold mb-4">

          Blog Preview

        </h2>






        <h3 className="text-2xl font-semibold">

          {form.title || "Blog Title"}

        </h3>







        <p className="text-sm text-gray-500 mt-2">

          {form.category || "Category"} • {form.author}

        </p>







        {
          form.cover_image && (


            <img

              src={form.cover_image}

              alt="Preview"

              className="
                w-full
                rounded-lg
                mt-4
              "

            />


          )
        }







        <p className="mt-6 whitespace-pre-line">

          {
            form.excerpt ||

            "Blog excerpt will appear here..."
          }


        </p>







        {
          selectedProducts.length > 0 && (


            <div className="mt-8">


              <h3 className="font-semibold text-lg mb-3">

                Related Products

              </h3>





              <div className="space-y-2">





                {
                  products

                  .filter((p)=>

                    selectedProducts.includes(
                      p.id
                    )

                  )

                  .map((p)=>(


                    <div

                      key={p.id}

                      className="
                        border
                        rounded
                        p-3
                        bg-white
                      "

                    >

                      {p.name}


                    </div>


                  ))

                }





              </div>



            </div>


          )
        }




      </div>






    </div>


  );


}