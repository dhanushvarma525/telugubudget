import db from "@/lib/db";

/* ==========================
   GET SINGLE PRODUCT
========================== */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows]: any = await db.query(
      `
      SELECT *
      FROM products
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return Response.json(rows[0]);
  } catch (error: any) {
    console.log("GET ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/* ==========================
   UPDATE PRODUCT
========================== */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();

    await db.query(
      `
      UPDATE products
      SET
        name = ?,
        category = ?,
        price = ?,
        old_price = ?,
        image = ?,
        affiliate_link = ?
      WHERE id = ?
      `,
      [
        body.name,
        body.category,
        body.price,
        body.old_price,
        body.image,
        body.affiliate_link,
        id,
      ]
    );

    return Response.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    console.log("PUT ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/* ==========================
   DELETE PRODUCT
========================== */

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result]: any = await db.query(
      `
      DELETE FROM products
      WHERE id = ?
      `,
      [id]
    );

    return Response.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (error: any) {
    console.log("DELETE ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}