import { supabase } from "@/lib/supabase";


export async function POST(req: Request) {


  try {


    const formData = await req.formData();


    const file = formData.get("file") as File;



    if (!file) {


      return Response.json({

        success:false,

        message:"No file selected"

      });


    }



    const bytes = await file.arrayBuffer();


    const buffer = Buffer.from(bytes);



    const fileName =
      Date.now()
      +
      "-"
      +
      file.name.replace(/\s+/g, "-");




    const { data, error } = await supabase.storage

      .from("product-images")

      .upload(

        fileName,

        buffer,

        {

          contentType:file.type,

          upsert:false

        }

      );




    if(error){

      throw error;

    }





    const { data:urlData } = supabase.storage

      .from("product-images")

      .getPublicUrl(

        fileName

      );





    return Response.json({

      success:true,

      image:urlData.publicUrl

    });




  }


  catch(error:any){


    console.log(
      "UPLOAD ERROR:",
      error
    );



    return Response.json({

      success:false,

      message:error.message

    });


  }


}