import { supabase } from "@/lib/supabase";

// =====================================================
// TYPES
// =====================================================

type TextBlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3";

type ContentBlock =
  | {
      type: "text";
      content: string;
      headingType: TextBlockType;
    }
  | {
      type: "image";
      url: string;
      alt: string;
    };

// =====================================================
// HELPERS
// =====================================================

function cleanContentBlocks(
  blocks: unknown
): ContentBlock[] {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks
    .filter((block) => {
      if (!block || typeof block !== "object") {
        return false;
      }

      const item = block as Record<string, unknown>;

      // -------------------------------
      // TEXT BLOCK
      // -------------------------------

      if (item.type === "text") {
        return (
          typeof item.content === "string" &&
          item.content.trim().length > 0
        );
      }

      // -------------------------------
      // IMAGE BLOCK
      // -------------------------------

      if (item.type === "image") {
        return (
          typeof item.url === "string" &&
          item.url.trim().length > 0
        );
      }

      return false;
    })
    .map((block) => {
      const item =
        block as Record<string, unknown>;

      // -------------------------------
      // TEXT
      // -------------------------------

      if (item.type === "text") {
        const headingType =
          item.headingType === "h1" ||
          item.headingType === "h2" ||
          item.headingType === "h3"
            ? item.headingType
            : "paragraph";

        return {
          type: "text",
          content:
            typeof item.content === "string"
              ? item.content
              : "",
          headingType,
        };
      }

      // -------------------------------
      // IMAGE
      // -------------------------------

      return {
        type: "image",
        url:
          typeof item.url === "string"
            ? item.url
            : "",
        alt:
          typeof item.alt === "string"
            ? item.alt
            : "",
      };
    });
}

// =====================================================
// GET ALL BLOGS
// =====================================================

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return Response.json({
      success: true,
      blogs: data || [],
    });
  } catch (error: any) {
    console.error(
      "GET BLOGS ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to load blogs",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// ADD BLOG
// =====================================================

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    // =================================================
    // CONTENT BLOCKS
    // =================================================

    const contentBlocks =
      cleanContentBlocks(
        body.content_blocks
      );

    // =================================================
    // TAGS
    // =================================================

    const tags =
      Array.isArray(body.tags)
        ? body.tags
            .filter(
              (tag: unknown) =>
                typeof tag === "string"
            )
            .map(
              (tag: string) =>
                tag.trim()
            )
            .filter(Boolean)
        : [];

    // =================================================
    // RELATED PRODUCTS
    // =================================================

    const relatedProducts =
      Array.isArray(
        body.related_products
      )
        ? body.related_products
            .filter(
              (id: unknown) =>
                typeof id === "string"
            )
        : [];

    // =================================================
    // ADDITIONAL IMAGES
    // =================================================

    const additionalImages =
      Array.isArray(
        body.additional_images
      )
        ? body.additional_images
            .filter(
              (url: unknown) =>
                typeof url === "string"
            )
            .map(
              (url: string) =>
                url.trim()
            )
            .filter(Boolean)
        : [];

    // =================================================
    // BLOG DATA
    // =================================================

    const blogData = {
      title:
        typeof body.title === "string"
          ? body.title.trim()
          : "",

      slug:
        typeof body.slug === "string"
          ? body.slug.trim()
          : "",

      excerpt:
        typeof body.excerpt === "string"
          ? body.excerpt.trim()
          : "",

      // Keep existing plain-text content
      // for compatibility.
      content:
        typeof body.content === "string"
          ? body.content
          : "",

      cover_image:
        typeof body.cover_image === "string"
          ? body.cover_image
          : "",

      additional_images:
        additionalImages,

      // New heading-aware content blocks
      content_blocks:
        contentBlocks,

      category:
        typeof body.category === "string"
          ? body.category.trim()
          : "",

      author:
        typeof body.author === "string" &&
        body.author.trim()
          ? body.author.trim()
          : "AnantaGo",

      tags,

      published:
        typeof body.published === "boolean"
          ? body.published
          : true,

      featured:
        typeof body.featured === "boolean"
          ? body.featured
          : false,

      related_products:
        relatedProducts,
    };

    // =================================================
    // INSERT
    // =================================================

    const { data, error } =
      await supabase
        .from("blogs")
        .insert([blogData])
        .select()
        .single();

    if (error) {
      throw error;
    }

    // =================================================
    // SUCCESS
    // =================================================

    return Response.json({
      success: true,
      blog: data,
    });
  } catch (error: any) {
    console.error(
      "ADD BLOG ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to create blog",
      },
      {
        status: 500,
      }
    );
  }
}