import db from "@/lib/db";


export async function GET() {

  const result = await db.query(
    "SELECT 'Database Connected' AS message"
  );


  return Response.json(result[0]);

}