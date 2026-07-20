import db from "@/lib/db";



// GET REVIEWS FOR PRODUCT

export async function GET(
  req:Request
) {


  try {


    const { searchParams } = new URL(req.url);


    const product_id =
      searchParams.get("product_id");



    const [rows] = await db.query(

      `
      SELECT *
      FROM reviews
      WHERE product_id = ?
      ORDER BY id DESC
      `,

      [
        product_id
      ]

    );



    return Response.json(rows);



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







// ADD REVIEW

export async function POST(
  req:Request
) {


  try {


    const body =
    await req.json();



    const {

      product_id,

      name,

      rating,

      comment


    } = body;





    await db.query(

      `
      INSERT INTO reviews

      (
        product_id,
        name,
        rating,
        comment
      )

      VALUES (?,?,?,?)

      `,

      [

        product_id,

        name,

        rating,

        comment

      ]

    );






    return Response.json({

      success:true,

      message:"Review added successfully"

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