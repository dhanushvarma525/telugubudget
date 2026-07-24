import { supabase } from "@/lib/supabase";


// ==========================
// GET SINGLE BLOG
// ==========================

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {

  try {

    const { slug } = await params;


    const { data, error } = await supabase

      .from("blogs")

      .select("*")

      .eq("slug", slug)

      .maybeSingle();



    if (error) {

      throw error;

    }



    if (!data) {

      return Response.json(

        {
          success: false,
          message: "Blog not found",
        },

        {
          status: 404,
        }

      );

    }



    return Response.json({

      success: true,

      blog: data,

    });



  } catch (error:any) {


    return Response.json(

      {

        success:false,

        message:error.message,

      },

      {

        status:500,

      }

    );


  }

}




// ==========================
// UPDATE BLOG
// ==========================


export async function PUT(

  req: Request,

  { params }: { params: Promise<{ slug:string }> }

) {


  try {


    const { slug } = await params;


    const body = await req.json();




    const updateData = {


      title: body.title || "",


      slug: body.slug || slug,


      excerpt: body.excerpt || "",


      content: body.content || "",


      cover_image: body.cover_image || "",


      category: body.category || "",


      author: body.author || "AnantaGo",


      tags: body.tags || [],


      published: body.published ?? true,


      featured: body.featured ?? false,



      // Related products IDs

      related_products:

      body.related_products || [],



      updated_at:

      new Date().toISOString(),


    };






    const { error } = await supabase


      .from("blogs")


      .update(updateData)


      .eq("slug", slug);






    if(error){

      throw error;

    }






    return Response.json({

      success:true,

      message:"Blog updated successfully",

    });





  }

  catch(error:any){


    return Response.json(

      {

        success:false,

        message:error.message,

      },

      {

        status:500,

      }

    );


  }


}






// ==========================
// DELETE BLOG
// ==========================


export async function DELETE(

  req:Request,

  { params }: { params:Promise<{slug:string}> }

){


  try{


    const { slug } = await params;





    const { error } = await supabase


      .from("blogs")


      .delete()


      .eq("slug",slug);






    if(error){

      throw error;

    }






    return Response.json({

      success:true,

      message:"Blog deleted successfully",

    });





  }

  catch(error:any){


    return Response.json(

      {

        success:false,

        message:error.message,

      },

      {

        status:500,

      }

    );


  }


}