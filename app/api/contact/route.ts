import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, message } = body;

    if (!name || !email || !message) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    return Response.json(
      {
        success: true,
        message: "Message saved successfully",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Contact API Error:", error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}