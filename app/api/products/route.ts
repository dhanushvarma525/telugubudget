import { supabase } from "@/lib/supabase";

console.log("🔥 SUPABASE PRODUCTS ROUTE RUNNING");
// GET PRODUCTS

export async function GET() {

  try {

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", {
        ascending: false
      });


    if (error) {
      throw error;
    }


    return Response.json(data);


  } catch (error:any) {


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




// ADD PRODUCT

export async function POST(
  req: Request
) {


  try {


    const body = await req.json();



    const {

      name,
      category,
      price,
      old_price,

      image,
      image2,
      image3,
      image4,
      image5,
      image6,

      affiliate_link,

      description,

      features,

      rating,

      stock

    } = body;



    const { data, error } = await supabase

      .from("products")

      .insert([

        {

          name,

          category,

          price,

          old_price,


          image,

          image2,

          image3,

          image4,

          image5,

          image6,


          affiliate_link,


          description,


          features,


          rating,


          stock,


          views:0,

          clicks:0

        }

      ])

      .select();




    if(error){

      throw error;

    }




    return Response.json({

      success:true,

      message:"Product added successfully",

      product:data

    });




  }
  catch(error:any){



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