import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET_NAME = "blog-images";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    // ---------------------------------------------------------
    // ENVIRONMENT CHECK
    // ---------------------------------------------------------

    if (!supabaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "NEXT_PUBLIC_SUPABASE_URL is missing from environment variables.",
        },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // SUPABASE ADMIN CLIENT
    // ---------------------------------------------------------

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // ---------------------------------------------------------
    // READ FORM DATA
    // ---------------------------------------------------------

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No image file was provided.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // VALIDATE FILE TYPE
    // ---------------------------------------------------------

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only JPG, PNG, WEBP and GIF images are allowed.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // VALIDATE FILE SIZE
    // ---------------------------------------------------------

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Image size must be 10MB or smaller.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded image is empty.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // FILE EXTENSION
    // ---------------------------------------------------------

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    const extension =
      extensionMap[file.type] || "jpg";

    // ---------------------------------------------------------
    // SAFE FILE NAME
    // ---------------------------------------------------------

    const randomId = crypto.randomUUID();

    const fileName =
      `${Date.now()}-${randomId}.${extension}`;

    // Store article images inside:
    //
    // blog-images/articles/
    //
    const filePath =
      `articles/${fileName}`;

    // ---------------------------------------------------------
    // CONVERT FILE TO BUFFER
    // ---------------------------------------------------------

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    // ---------------------------------------------------------
    // UPLOAD TO SUPABASE STORAGE
    // ---------------------------------------------------------

    const { error: uploadError } =
      await supabase.storage
        .from(BUCKET_NAME)
        .upload(
          filePath,
          buffer,
          {
            contentType: file.type,
            cacheControl: "31536000",
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "SUPABASE STORAGE UPLOAD ERROR:",
        uploadError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            uploadError.message ||
            "Failed to upload image to Supabase Storage.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // GET PUBLIC URL
    // ---------------------------------------------------------

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl =
      publicUrlData?.publicUrl;

    if (!publicUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Image uploaded but public URL could not be generated.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully.",
        url: publicUrl,
        path: filePath,
        fileName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "BLOG IMAGE UPLOAD ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected image upload error.",
      },
      { status: 500 }
    );
  }
}