import { getBaseUrl } from "@/lib/getBaseUrl";
import { notFound } from "next/navigation";
import RelatedBlogs from "@/components/RelatedBlogs";
import { supabase } from "@/lib/supabase";



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





async function getRelatedProducts(ids:number[]) {


  if(!ids || ids.length === 0){

    return [];

  }



  const { data, error } = await supabase

    .from("products")

    .select("*")

    .in(
      "id",
      ids
    );



  if(error){

    console.log(error);

    return [];

  }



  return data || [];

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







  const relatedProducts = await getRelatedProducts(
    blog.related_products || []
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









      {
        relatedProducts.length > 0 && (


          <section className="mt-12">


            <h2 className="
            text-2xl
            font-bold
            mb-5
            ">

              🛒 Recommended Products


            </h2>





            <div className="
            grid
            md:grid-cols-3
            gap-5
            ">


              {
                relatedProducts.map((product:any)=>(


                  <div

                    key={product.id}

                    className="
                    border
                    rounded-xl
                    p-4
                    bg-white
                    shadow-sm
                    "


                  >





                    {
                      product.image && (


                        <img

                          src={product.image}

                          alt={product.name}

                          className="
                          w-full
                          h-40
                          object-cover
                          rounded-lg
                          "

                        />


                      )
                    }






                    <h3 className="
                    font-semibold
                    mt-3
                    ">

                      {product.name}


                    </h3>






                    <div className="mt-2">


                      <span className="
                      font-bold
                      text-lg
                      ">

                        ₹{product.price}


                      </span>


                    </div>







                    {
                      product.affiliate_link && (


                        <a

                          href={product.affiliate_link}

                          target="_blank"

                          rel="nofollow sponsored"

                          className="
                          block
                          text-center
                          mt-4
                          bg-black
                          text-white
                          py-2
                          rounded-lg
                          "

                        >

                          View Deal


                        </a>


                      )
                    }




                  </div>


                ))

              }


            </div>



          </section>


        )

      }









      <RelatedBlogs

        category={blog.category}

        slug={blog.slug}

      />







    </article>

  );

}