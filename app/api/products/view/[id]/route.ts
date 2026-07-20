import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id:string }> }
) {


  try {


    const { id } = await params;



    // Get current views

    const { data: product, error: fetchError } = await supabase

      .from("products")

      .select("views")

      .eq("id", id)

      .single();




    if(fetchError){

      throw fetchError;

    }




    // Update views + 1

    const { error:updateError } = await supabase

      .from("products")

      .update({

        views:
          (product.views || 0) + 1

      })

      .eq(
        "id",
        id
      );





    if(updateError){

      throw updateError;

    }




    return Response.json({

      success:true

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