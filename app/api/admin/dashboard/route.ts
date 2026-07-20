import { supabase } from "@/lib/supabase";


export async function GET() {


  try {


    // Total Products

    const { count: totalProducts, error: productError } =
      await supabase

      .from("products")

      .select("*", {
        count: "exact",
        head: true
      });



    if(productError){

      throw productError;

    }




    // Get all products for calculations

    const { data: products, error } =
      await supabase

      .from("products")

      .select(
        "category, clicks, name"
      );



    if(error){

      throw error;

    }





    // Total Clicks

    const totalClicks =
      products?.reduce(

        (sum:any, product:any) =>
          sum + (product.clicks || 0),

        0

      ) || 0;







    // Total Categories

    const categories = new Set(

      products?.map(

        (product:any)=>
          product.category

      )

    );





    const totalCategories =
      categories.size;







    // Most Clicked Product

    const topProduct =

      products && products.length > 0

      ?

      products.sort(

        (a:any,b:any)=>
          b.clicks - a.clicks

      )[0]

      :

      null;







    return Response.json({

      success:true,

      totalProducts:

        totalProducts || 0,


      totalClicks,


      totalCategories,



      topProduct:

        topProduct

        ?

        {

          name:topProduct.name,

          clicks:topProduct.clicks

        }

        :

        {

          name:"No Products",

          clicks:0

        }


    });





  }

  catch(error:any){



    console.error(error);



    return Response.json(

      {

        success:false,

        message:error.message

      },

      {

        status:500

      }

    );


  }


}