import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Supabase environment variables are missing"
  );
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const BUCKET_NAME = "blog-images";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(
  request: NextRequest
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No image file provided.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate type
    if (
      !ALLOWED_TYPES.includes(
        file.type
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG, WEBP and GIF images are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate size
    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image size must be 10MB or smaller.",
        },
        {
          status: 400,
        }
      );
    }

    // Get extension
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    // Generate unique name
    const randomId =
      crypto.randomUUID();

    const fileName =
      `blog-${Date.now()}-${randomId}.${extension}`;

    // Storage path
    const filePath =
      `articles/${fileName}`;

    // Convert file
    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    // Upload
    const {
      error: uploadError,
    } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(
          filePath,
          buffer,
          {
            contentType:
              file.type,

            cacheControl:
              "3600",

            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "SUPABASE BLOG IMAGE UPLOAD ERROR:",
        uploadError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            uploadError.message ||
            "Failed to upload image.",
        },
        {
          status: 500,
        }
      );
    }

    // Get public URL
    const {
      data: publicUrlData,
    } =
      supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(
          filePath
        );

    const publicUrl =
      publicUrlData.publicUrl;

    if (!publicUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image uploaded but public URL could not be generated.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Image uploaded successfully.",
        url: publicUrl,
        path: filePath,
        fileName,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "BLOG IMAGE UPLOAD API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload image.",
      },
      {
        status: 500,
      }
    );
  }
}