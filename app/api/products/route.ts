import { supabase } from "@/lib/supabase";

console.log("🔥 PRODUCTS API ROUTE RUNNING");


// ===========================
// GET ALL PRODUCTS
// ===========================

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);


    const page = Number(
      searchParams.get("page") || "1"
    );


    const limit = Number(
      searchParams.get("limit") || "30"
    );


    const hotPick = searchParams.get("hotPick");


    const from = (page - 1) * limit;

    const to = from + limit - 1;



    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("id", {
        ascending: false,
      });



    // 🔥 HOT PICKS FILTER

    if (hotPick === "true") {

      query = query.eq(
        "hot_pick",
        true
      );

    }



    const {
      data,
      error,
      count

    } = await query.range(
      from,
      to
    );



    if (error) {

      throw error;

    }



    return Response.json({

      success: true,

      products: data || [],

      total: count || 0,

      page,

      limit,

      totalPages: Math.ceil(
        (count || 0) / limit
      ),

    });



  }

  catch(error:any) {


    console.log(
      "PRODUCT API ERROR:",
      error
    );


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





// ===========================
// ADD PRODUCT
// ===========================

export async function POST(
  req: Request
) {


  try {


    const body = await req.json();



    const {

      name,

      category,

      categories,

      price,

      old_price,

      image,

      image2,

      image3,

      image4,

      image5,

      image6,

      affiliate_link,

      description,

      features,

      rating,

      stock,

      hot_pick,


    } = body;





    const { data, error } = await supabase

      .from("products")

      .insert([

        {

          name,

          category,

          categories,

          price,

          old_price,

          image,

          image2,

          image3,

          image4,

          image5,

          image6,

          affiliate_link,

          description,

          features,

          rating,

          stock,


          views:0,

          clicks:0,


          hot_pick:
            hot_pick || false,


        }

      ])

      .select();





    if(error){

      throw error;

    }





    return Response.json({

      success:true,

      message:
        "Product added successfully",

      product:data,


    });





  }


  catch(error:any){


    console.log(
      "ADD PRODUCT ERROR:",
      error
    );



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