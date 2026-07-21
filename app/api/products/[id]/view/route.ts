import { supabase } from "@/lib/supabase";



/* ==========================
   GET SINGLE PRODUCT
========================== */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await params;


    const productId = Number(id);



    const { data, error } = await supabase

      .from("products")

      .select("*")

      .eq("id", productId)

      .single();





    if (error || !data) {


      console.log(
        "GET PRODUCT ERROR:",
        error
      );


      return Response.json(

        {
          success: false,
          message: "Product not found"
        },

        {
          status: 404
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
  req: Request,
  { params }: { params: Promise<{ id:string }> }
){


  try {


    const { id } = await params;


    const productId = Number(id);


    const body = await req.json();




    const { error } = await supabase

      .from("products")

      .update({

        name: body.name,

        category: body.category,

        categories: body.categories,

        price: body.price,

        old_price: body.old_price,

        image: body.image,

        image2: body.image2,

        image3: body.image3,

        image4: body.image4,

        image5: body.image5,

        image6: body.image6,

        affiliate_link: body.affiliate_link,

        description: body.description,

        features: body.features,

        rating: body.rating,

        stock: body.stock,

        hot_pick: body.hot_pick,


      })

      .eq(
        "id",
        productId
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

  req: Request,

  { params }: { params: Promise<{ id:string }> }

){


  try {


    const { id } = await params;


    const productId = Number(id);




    const { error } = await supabase

      .from("products")

      .delete()

      .eq(
        "id",
        productId
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