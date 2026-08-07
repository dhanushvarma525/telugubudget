
import { getBaseUrl } from "@/lib/getBaseUrl";
import { notFound } from "next/navigation";
import RelatedBlogs from "@/components/RelatedBlogs";
import BlogViewTracker from "@/components/BlogViewTracker";
import { supabase } from "@/lib/supabase";

// =====================================================
// GET BLOG
// =====================================================

async function getBlog(slug: string) {
  const res = await fetch(
    `${getBaseUrl()}/api/blogs/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  return data.blog || null;
}

// =====================================================
// GET RELATED PRODUCTS
// =====================================================

async function getRelatedProducts(ids: string[]) {
  if (!ids || ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) {
    console.log(
      "RELATED PRODUCTS ERROR:",
      error
    );

    return [];
  }

  return data || [];
}

// =====================================================
// GET ADDITIONAL IMAGES
// =====================================================

function getAdditionalImages(
  blog: any
): string[] {
  if (!blog.additional_images) {
    return [];
  }

  // Database array
  if (Array.isArray(blog.additional_images)) {
    return blog.additional_images.filter(
      (image: any) =>
        typeof image === "string" &&
        image.trim() !== ""
    );
  }

  // JSON string or comma-separated URLs
  if (
    typeof blog.additional_images ===
    "string"
  ) {
    try {
      const parsed =
        JSON.parse(
          blog.additional_images
        );

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (image: any) =>
            typeof image === "string" &&
            image.trim() !== ""
        );
      }
    } catch {
      // Not JSON, continue
    }

    return blog.additional_images
      .split(",")
      .map(
        (image: string) =>
          image.trim()
      )
      .filter(Boolean);
  }

  return [];
}

// =====================================================
// CONTENT BLOCK TYPES
// =====================================================

type TextBlock = {
  type: "text";
  content: string;
  headingType?:
    | "paragraph"
    | "h1"
    | "h2"
    | "h3";
};

type ImageBlock = {
  type: "image";
  url: string;
  alt?: string;
};

type ContentBlock =
  | TextBlock
  | ImageBlock;

// =====================================================
// GET CONTENT BLOCKS
// =====================================================

function getContentBlocks(
  blog: any
): ContentBlock[] {
  if (!Array.isArray(blog.content_blocks)) {
    return [];
  }

  return blog.content_blocks.filter(
    (block: any) => {
      if (!block) {
        return false;
      }

      if (block.type === "text") {
        return (
          typeof block.content === "string" &&
          block.content.trim() !== ""
        );
      }

      if (block.type === "image") {
        return (
          typeof block.url === "string" &&
          block.url.trim() !== ""
        );
      }

      return false;
    }
  );
}

// =====================================================
// RENDER CONTENT BLOCK
// =====================================================

function renderContentBlock(
  block: ContentBlock,
  index: number
) {
  // ===================================================
  // IMAGE
  // ===================================================

  if (block.type === "image") {
    return (
      <figure
        key={`image-${index}`}
        className="my-8"
      >
        <img
          src={block.url}
          alt={
            block.alt ||
            "AnantaGo article image"
          }
          loading="lazy"
          className="
            w-full
            max-w-3xl
            mx-auto
            rounded-2xl
            object-cover
            shadow-sm
          "
        />
      </figure>
    );
  }

  // ===================================================
  // TEXT
  // ===================================================

  const content =
    block.content?.trim();

  if (!content) {
    return null;
  }

  const headingType =
    block.headingType ||
    "paragraph";

  // ===================================================
  // H1
  // ===================================================

  if (headingType === "h1") {
    return (
      <h1
        key={`h1-${index}`}
        className="
          text-3xl
          sm:text-4xl
          font-bold
          leading-tight
          mt-10
          mb-5
          text-gray-900
        "
      >
        {content}
      </h1>
    );
  }

  // ===================================================
  // H2
  // ===================================================

  if (headingType === "h2") {
    return (
      <h2
        key={`h2-${index}`}
        className="
          text-2xl
          sm:text-3xl
          font-bold
          leading-tight
          mt-10
          mb-4
          text-gray-900
        "
      >
        {content}
      </h2>
    );
  }

  // ===================================================
  // H3
  // ===================================================

  if (headingType === "h3") {
    return (
      <h3
        key={`h3-${index}`}
        className="
          text-xl
          sm:text-2xl
          font-bold
          leading-tight
          mt-8
          mb-3
          text-gray-900
        "
      >
        {content}
      </h3>
    );
  }

  // ===================================================
  // NORMAL PARAGRAPH
  // ===================================================

  return (
    <p
      key={`paragraph-${index}`}
      className="
        whitespace-pre-line
        text-base
        sm:text-lg
        leading-8
        text-gray-800
        mb-6
      "
    >
      {content}
    </p>
  );
}

// =====================================================
// METADATA
// =====================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Blog Not Found | AnantaGo",
    };
  }

  const description =
    blog.excerpt ||
    blog.content?.slice(0, 150) ||
    "";

  return {
    title: `${blog.title} | AnantaGo`,

    description,

    openGraph: {
      title: blog.title,

      description,

      images: blog.cover_image
        ? [blog.cover_image]
        : [],
    },
  };
}

// =====================================================
// BLOG ARTICLE PAGE
// =====================================================

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  // ===================================================
  // RELATED PRODUCTS
  // ===================================================

  const relatedProducts =
    await getRelatedProducts(
      blog.related_products || []
    );

  // ===================================================
  // OLD ADDITIONAL IMAGES
  // ===================================================

  const additionalImages =
    getAdditionalImages(blog);

  // ===================================================
  // NEW CONTENT BLOCKS
  // ===================================================

  const contentBlocks =
    getContentBlocks(blog);

  const hasContentBlocks =
    contentBlocks.length > 0;

  return (
    <article
      className="
        max-w-4xl
        mx-auto
        px-4
        py-8
        sm:px-6
      "
    >
      {/* =================================================
          BLOG VIEW TRACKER
      ================================================= */}

      <BlogViewTracker
        slug={blog.slug}
      />

      {/* =================================================
          BLOG HEADER
      ================================================= */}

      <div className="mb-6">
        {blog.category && (
          <div
            className="
              text-sm
              font-semibold
              text-orange-500
              mb-3
            "
          >
            {blog.category}
          </div>
        )}

        {/* MAIN BLOG H1 */}

        <h1
          className="
            text-3xl
            sm:text-4xl
            lg:text-5xl
            font-bold
            leading-tight
            mb-4
          "
        >
          {blog.title}
        </h1>

        <div
          className="
            text-sm
            text-gray-500
          "
        >
          {blog.author || "AnantaGo"}

          {" • "}

          {blog.created_at
            ? new Date(
                blog.created_at
              )
                .toISOString()
                .slice(0, 10)
            : ""}
        </div>
      </div>

      {/* =================================================
          COVER IMAGE
      ================================================= */}

      {blog.cover_image && (
        <img
          src={blog.cover_image}
          alt={blog.title}
          className="
            w-full
            max-h-[420px]
            object-cover
            rounded-2xl
            mb-8
          "
        />
      )}

      {/* =================================================
          ARTICLE CONTENT
      ================================================= */}

      <div>
        {hasContentBlocks ? (
          <>
            {contentBlocks.map(
              (
                block,
                index
              ) =>
                renderContentBlock(
                  block,
                  index
                )
            )}
          </>
        ) : (
          <>
            {/* =================================================
                OLD BLOG FALLBACK
            ================================================= */}

            {additionalImages.length >
              0 && (
              <div
                className="
                  space-y-8
                  mb-10
                "
              >
                {additionalImages.map(
                  (
                    image: string,
                    index: number
                  ) => (
                    <figure
                      key={index}
                      className="my-8"
                    >
                      <img
                        src={image}
                        alt={`${blog.title} - Image ${
                          index + 1
                        }`}
                        loading="lazy"
                        className="
                          w-full
                          max-w-3xl
                          mx-auto
                          rounded-2xl
                          object-cover
                          shadow-sm
                        "
                      />
                    </figure>
                  )
                )}
              </div>
            )}

            {blog.content && (
              <div
                className="
                  whitespace-pre-line
                  text-base
                  sm:text-lg
                  leading-8
                  text-gray-800
                "
              >
                {blog.content}
              </div>
            )}
          </>
        )}
      </div>

      {/* =================================================
          RECOMMENDED PRODUCTS
      ================================================= */}

      {relatedProducts.length >
        0 && (
        <section
          className="
            mt-12
            border-t
            pt-8
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              mb-5
            "
          >
            🛒 Recommended Products
          </h2>

          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-3
              gap-4
              md:gap-5
            "
          >
            {relatedProducts.map(
              (product: any) => (
                <div
                  key={product.id}
                  className="
                    border
                    rounded-xl
                    p-3
                    sm:p-4
                    bg-white
                    shadow-sm
                  "
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={
                        product.name
                      }
                      loading="lazy"
                      className="
                        w-full
                        h-32
                        sm:h-40
                        object-contain
                        rounded-lg
                      "
                    />
                  )}

                  <h3
                    className="
                      font-semibold
                      text-sm
                      sm:text-base
                      mt-3
                      line-clamp-2
                    "
                  >
                    {product.name}
                  </h3>

                  <div className="mt-2">
                    <span
                      className="
                        font-bold
                        text-lg
                      "
                    >
                      ₹
                      {product.price}
                    </span>
                  </div>

                  {product.affiliate_link && (
                    <a
                      href={
                        product.affiliate_link
                      }
                      target="_blank"
                      rel="
                        nofollow
                        sponsored
                        noopener
                        noreferrer
                      "
                      className="
                        block
                        text-center
                        mt-4
                        bg-orange-500
                        hover:bg-orange-600
                        text-white
                        py-2
                        rounded-lg
                        font-semibold
                        text-sm
                      "
                    >
                      View Deal
                    </a>
                  )}
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* =================================================
          RELATED BLOGS
      ================================================= */}

      <section
        className="
          mt-12
          border-t
          pt-8
        "
      >
        <RelatedBlogs
          category={blog.category}
          slug={blog.slug}
        />
      </section>

      {/* =================================================
          MORE ARTICLES
      ================================================= */}

      <div
        className="
          mt-10
          text-center
        "
      >
        <a
          href="/blog"
          className="
            inline-block
            bg-black
            text-white
            px-6
            py-3
            rounded-xl
            font-semibold
            hover:bg-gray-800
          "
        >
          ← More Articles
        </a>
      </div>
    </article>
  );
}

