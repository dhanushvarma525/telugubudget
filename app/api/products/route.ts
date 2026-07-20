import db from "@/lib/db";


// GET PRODUCTS

export async function GET() {

  try {

    const [rows] = await db.query(
      "SELECT * FROM products ORDER BY id DESC"
    );


    return Response.json(rows);


  } catch(error:any) {


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





// ADD PRODUCT

export async function POST(
  req:Request
) {


  try {


    const body = await req.json();



    const {

      name,
      category,
      price,
      old_price,
      image,
      affiliate_link,
      description,
      features,
      rating,
      stock

    } = body;




    await db.query(

      `
      INSERT INTO products
      (
        name,
        category,
        price,
        old_price,
        image,
        affiliate_link,
        description,
        features,
        rating,
        stock
      )

      VALUES (?,?,?,?,?,?,?,?,?,?)

      `,


      [

        name,

        category,

        price,

        old_price,

        image,

        affiliate_link,

        description,

        features,

        rating,

        stock

      ]


    );





    return Response.json({

      success:true,

      message:"Product added successfully"

    });



  } catch(error:any) {


    console.log(
      "ADD PRODUCT ERROR:",
      error
    );



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