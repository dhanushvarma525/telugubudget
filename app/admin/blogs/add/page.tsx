"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


type Product = {
  id: string;
  name: string;
};



export default function AddBlogPage() {


  const router = useRouter();



  const [search, setSearch] = useState("");

  const [products, setProducts] = useState<Product[]>([]);

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);



  const [uploading, setUploading] = useState(false);



  const [searching, setSearching] = useState(false);





  const [form, setForm] = useState({

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







  async function searchProducts(value:string){


    setSearch(value);



    if(!value.trim()){

      setProducts([]);

      return;

    }





    try{


      setSearching(true);




      const { data, error } = await supabase

        .from("products")

        .select("id,name")

        .ilike(
          "name",
          `%${value}%`
        )

        .order(
          "created_at",
          {
            ascending:false
          }
        )

        .limit(10);






      if(!error && data){

        setProducts(data);

      }



    }

    catch(error){

      console.log(error);

    }

    finally{


      setSearching(false);


    }


  }







  function toggleProduct(id:string){


    setSelectedProducts((prev)=>


      prev.includes(id)

      ?

      prev.filter(
        (item)=>item!==id
      )

      :

      [
        ...prev,
        id
      ]


    );


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






      setForm((prev)=>({

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

      HTMLInputElement |

      HTMLTextAreaElement

    >

  ){



    const {name,value}=e.target;



    setForm((prev)=>({

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








  async function submitBlog(){



    const response = await fetch(

      "/api/blogs",

      {


        method:"POST",



        headers:{


          "Content-Type":

          "application/json"


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
            (tag)=>tag.trim()
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

    <div className="p-6 max-w-4xl">


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








        {/* COVER IMAGE */}


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
            SEARCHABLE RELATED PRODUCTS
        ========================== */}



        <div className="border rounded-lg p-4">



          <h2 className="text-lg font-semibold mb-3">

            Related Products (Optional)

          </h2>




          <p className="text-sm text-gray-500 mb-3">

            Search and select products to show inside blog.

          </p>






          <input


            value={search}


            onChange={(e)=>

              searchProducts(
                e.target.value
              )

            }


            placeholder="🔍 Search products..."


            className="
              border
              p-3
              w-full
              rounded
            "


          />





          {
            searching && (

              <p className="text-sm text-gray-500 mt-2">

                Searching...

              </p>

            )
          }






          {
            products.length > 0 && (


              <div className="
                mt-3
                border
                rounded
                max-h-60
                overflow-y-auto
              ">


                {
                  products.map((product)=>(


                    <label

                      key={product.id}

                      className="
                        flex
                        items-center
                        gap-3
                        p-3
                        cursor-pointer
                        hover:bg-gray-50
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


            )
          }







          {
            selectedProducts.length > 0 && (


              <div className="mt-4">


                <p className="font-semibold mb-2">

                  Selected Products:

                </p>




                <p className="text-sm text-gray-600">

                  {selectedProducts.length} products selected

                </p>



              </div>


            )
          }




        </div>        {/* FEATURED BLOG */}


        <label className="flex gap-2 items-center">


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









        {/* PUBLISHED BLOG */}


        <label className="flex gap-2 items-center">


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












        {/* SAVE BUTTON */}



        <button


          onClick={submitBlog}


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

            "Save Blog"

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






              <p className="text-sm text-gray-500">


                {selectedProducts.length} products linked


              </p>





            </div>



          )
        }






      </div>







    </div>

  );


}