import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { createToken } from "@/lib/auth";


export async function POST(req: Request) {


  try {


    const body = await req.json();


    const {
      username,
      password
    } = body;



    const { data, error } = await supabase

      .from("admins")

      .select("*")

      .eq(
        "username",
        username
      )

      .eq(
        "password",
        password
      )

      .single();





    if(error || !data){


      return Response.json(

        {
          success:false,
          message:"Invalid username or password"
        },

        {
          status:401
        }

      );


    }





    const token = createToken({

      id:data.id,

      username:data.username

    });





    const cookieStore = await cookies();



    cookieStore.set(

      "admin_token",

      token,

      {

        httpOnly:true,

        secure:
          process.env.NODE_ENV === "production",

        sameSite:"strict",

        maxAge:
          60 * 60 * 24 * 7

      }

    );






    return Response.json({

      success:true,

      message:"Login successful"

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