import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function requireAdmin(
  request: NextRequest
) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    return {
      user: null,
      error: "Authentication required.",
    };
  }

  const token =
    authorization
      .replace(/^Bearer\s+/i, "")
      .trim();

  if (!token) {
    return {
      user: null,
      error:
        "Authentication token is missing.",
    };
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(
      token
    );

    if (error || !user) {
      console.error(
        "ADMIN AUTH ERROR:",
        error
      );

      return {
        user: null,
        error:
          "Invalid or expired authentication session.",
      };
    }

    return {
      user,
      error: null,
    };
  } catch (error) {
    console.error(
      "ADMIN AUTH UNEXPECTED ERROR:",
      error
    );

    return {
      user: null,
      error:
        "Unable to verify authentication.",
    };
  }
}