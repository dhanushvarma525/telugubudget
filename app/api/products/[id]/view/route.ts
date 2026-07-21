import { supabase } from "@/lib/supabase";


export async function POST(
  req: Request,
  { params }: { params: Promise<{ id:string }> }
){

  try {

    const { id } = await params;


    console.log("VIEW PRODUCT ID:", id);



    const { data:product, error:fetchError } =
      await supabase
      .from("products")
      .select("views")
      .eq("id", Number(id))
      .single();



    console.log("CURRENT PRODUCT:", product);
    console.log("FETCH ERROR:", fetchError);



    if(fetchError){
      throw fetchError;
    }



    const newViews =
      (product.views || 0) + 1;



    const { error:updateError } =
      await supabase
      .from("products")
      .update({
        views:newViews
      })
      .eq(
        "id",
        Number(id)
      );



    console.log("UPDATE ERROR:", updateError);



    if(updateError){
      throw updateError;
    }



    return Response.json({

      success:true,

      views:newViews

    });


  } catch(error:any){

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