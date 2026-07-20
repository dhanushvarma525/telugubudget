import { supabase } from "@/lib/supabase";


export async function GET() {


  try {


    const { error } = await supabase

      .from("products")

      .select("id")

      .limit(1);




    if(error){

      throw error;

    }




    return Response.json([

      {

        message:"Supabase Connected"

      }

    ]);




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