import { supabase } from "@/lib/supabase";

// ==========================
// GET ALL BLOGS
// ==========================

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json({
      success: true,
      blogs: data,
    });
  } catch (error: any) {
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

// ==========================
// ADD BLOG
// ==========================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("blogs")
      .insert([body])
      .select();

    if (error) throw error;

    return Response.json({
      success: true,
      blog: data,
    });
  } catch (error: any) {
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