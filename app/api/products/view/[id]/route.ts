import db from "@/lib/db";
import { NextRequest } from "next/server";


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await params;


    await db.query(
      `
      UPDATE products
      SET views = views + 1
      WHERE id = ?
      `,
      [id]
    );


    return Response.json({

      success: true

    });


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