import { supabase } from "@/lib/supabase";


/* ==========================
   GET SINGLE PRODUCT
========================== */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id:string }> }
) {


  try {


    const { id } = await params;



    const { data, error } = await supabase

      .from("products")

      .select("*")

      .eq("id", id)

      .single();





    if(error || !data){


      return Response.json(

        {
          success:false,
          message:"Product not found"
        },

        {
          status:404
        }

      );


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





/* ==========================
   UPDATE PRODUCT
========================== */


export async function PUT(
  req:Request,
  { params }: { params:Promise<{id:string}> }
){


  try {


    const { id } = await params;


    const body = await req.json();




    const { error } = await supabase

      .from("products")

      .update({

        name: body.name,

        category: body.category,

        price: body.price,

        old_price: body.old_price,

        image: body.image,

        affiliate_link: body.affiliate_link

      })

      .eq(
        "id",
        id
      );





    if(error){

      throw error;

    }




    return Response.json({

      success:true,

      message:"Product updated successfully"

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







/* ==========================
   DELETE PRODUCT
========================== */


export async function DELETE(

  req:Request,

  { params }: { params:Promise<{id:string}> }

){


  try {


    const { id } = await params;



    const { error } = await supabase

      .from("products")

      .delete()

      .eq(
        "id",
        id
      );





    if(error){

      throw error;

    }




    return Response.json({

      success:true,

      message:"Product deleted successfully"

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