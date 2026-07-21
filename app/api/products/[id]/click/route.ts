import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id:string }> }
){

  try {


    const { id } = await params;


    console.log("CLICK PRODUCT ID:", id);



    // Get user IP address
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";



    // Store click details
    const { error:clickError } =
      await supabase
      .from("clicks")
      .insert({

        product_id: Number(id),

        ip_address: ip,

        clicked_at: new Date()

      });



    if(clickError){

      throw clickError;

    }




    // Increase clicks count in products table

    const { data:product, error:fetchError } =
      await supabase

      .from("products")

      .select("clicks")

      .eq(
        "id",
        Number(id)
      )

      .single();



    if(fetchError){

      throw fetchError;

    }



    const newClicks =
      (product.clicks || 0) + 1;




    const { error:updateError } =
      await supabase

      .from("products")

      .update({

        clicks:newClicks

      })

      .eq(
        "id",
        Number(id)
      );



    if(updateError){

      throw updateError;

    }




    return Response.json({

      success:true,

      clicks:newClicks

    });



  }

  catch(error:any){


    console.log(
      "CLICK ERROR:",
      error
    );


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