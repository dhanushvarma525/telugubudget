import { supabase } from "@/lib/supabase";


export async function POST(req: Request) {


  try {


    const body = await req.json();


    const {
      name,
      email,
      message
    } = body;




    if (!name || !email || !message) {


      return Response.json(

        {
          error:"All fields are required"
        },

        {
          status:400
        }

      );


    }





    const { error } = await supabase

      .from("contacts")

      .insert([

        {

          name,

          email,

          message

        }

      ]);





    if(error){

      throw error;

    }






    return Response.json(

      {

        success:true,

        message:"Message saved successfully"

      },

      {

        status:201

      }

    );





  }


  catch(error:any){



    console.error(

      "Contact API Error:",

      error

    );



    return Response.json(

      {

        error:error.message

      },

      {

        status:500

      }

    );


  }


}