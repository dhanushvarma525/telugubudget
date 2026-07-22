import { supabase } from "@/lib/supabase";


export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug:string }> }
){

  try{


    const { slug } = await params;



    const { data:blog, error } = await supabase
      .from("blogs")
      .select("views")
      .eq("slug",slug)
      .single();



    if(error)
      throw error;



    const newViews =
      (blog.views || 0) + 1;




    await supabase
      .from("blogs")
      .update({
        views:newViews
      })
      .eq(
        "slug",
        slug
      );



    return Response.json({

      success:true,
      views:newViews

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