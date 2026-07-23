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



  } catch (error: any) {


    return Response.json(

      {
        success: false,
        message: error.message,
      },

      {
        status: 500,
      }

    );


  }

}






// ==========================
// UPDATE BLOG
// ==========================

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {

  try {


    const { slug } = await params;


    const body = await req.json();



    const { error } = await supabase

      .from("blogs")

      .update({

        title: body.title,

        slug: body.slug,

        excerpt: body.excerpt,

        content: body.content,

        cover_image: body.cover_image,

        category: body.category,

        author: body.author,

        tags: body.tags,

        published: body.published,

        featured: body.featured,

        updated_at: new Date().toISOString(),

      })

      .eq("slug", slug);




    if (error) {

      throw error;

    }




    return Response.json({

      success: true,

      message: "Blog updated successfully",

    });



  } catch (error: any) {


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
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {


  try {


    const { slug } = await params;



    const { error } = await supabase

      .from("blogs")

      .delete()

      .eq("slug", slug);




    if (error) {

      throw error;

    }




    return Response.json({

      success:true,

      message:"Blog deleted successfully",

    });



  } catch(error:any) {


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