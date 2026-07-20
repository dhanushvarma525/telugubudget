import db from "@/lib/db";
import { cookies } from "next/headers";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const [rows]: any = await db.query(
      `
      SELECT *
      FROM admins
      WHERE username = ? AND password = ?
      `,
      [username, password]
    );

    if (rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

    const token = createToken({
      id: rows[0].id,
      username: rows[0].username,
    });

    console.log("TOKEN CREATED:", token);

const cookieStore = await cookies();

cookieStore.set({
  name: "admin_token",
  value: token,
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24,
});

console.log("COOKIE SAVED");

    return Response.json({
      success: true,
      message: "Login successful",
    });

  } catch (error: any) {

    console.log(error);

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