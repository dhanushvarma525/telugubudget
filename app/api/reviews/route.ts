import { supabase } from "@/lib/supabase";



// GET REVIEWS FOR PRODUCT

export async function GET(
  req: Request
) {


  try {


    const { searchParams } =
      new URL(req.url);



    const product_id =
      searchParams.get("product_id");





    const { data, error } = await supabase

      .from("reviews")

      .select("*")

      .eq(
        "product_id",
        product_id
      )

      .order(
        "id",
        {
          ascending:false
        }
      );





    if(error){

      throw error;

    }





    return Response.json(data);





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









// ADD REVIEW

export async function POST(
  req:Request
) {


  try {


    const body =
      await req.json();





    const {

      product_id,

      name,

      rating,

      comment


    } = body;







    const { error } = await supabase

      .from("reviews")

      .insert([

        {

          product_id,

          name,

          rating,

          comment

        }

      ]);






    if(error){

      throw error;

    }







    return Response.json({

      success:true,

      message:"Review added successfully"

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