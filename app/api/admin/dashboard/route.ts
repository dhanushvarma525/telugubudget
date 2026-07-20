import db from "@/lib/db";

export async function GET() {
  try {
    // Total Products
    const [products]: any = await db.query(`
      SELECT COUNT(*) AS totalProducts
      FROM products
    `);

    // Total Clicks
    const [clicks]: any = await db.query(`
      SELECT IFNULL(SUM(clicks), 0) AS totalClicks
      FROM products
    `);

    // Total Categories
    const [categories]: any = await db.query(`
      SELECT COUNT(DISTINCT category) AS totalCategories
      FROM products
    `);

    // Most Clicked Product
    const [topProduct]: any = await db.query(`
      SELECT name, clicks
      FROM products
      ORDER BY clicks DESC
      LIMIT 1
    `);

    return Response.json({
      success: true,
      totalProducts: products[0].totalProducts,
      totalClicks: clicks[0].totalClicks,
      totalCategories: categories[0].totalCategories,
      topProduct:
        topProduct.length > 0
          ? topProduct[0]
          : {
              name: "No Products",
              clicks: 0,
            },
    });
  } catch (error: any) {
    console.error(error);

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