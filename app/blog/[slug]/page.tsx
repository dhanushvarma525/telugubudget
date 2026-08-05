
import { getBaseUrl } from "@/lib/getBaseUrl";
import { notFound } from "next/navigation";
import RelatedBlogs from "@/components/RelatedBlogs";
import { supabase } from "@/lib/supabase";



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



async function getRelatedProducts(ids: number[]) {

  if (!ids || ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) {
    console.log("RELATED PRODUCTS ERROR:", error);
    return [];
  }

  return data || [];
}



function getAdditionalImages(blog: any): string[] {

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
  if (typeof blog.additional_images === "string") {

    try {

      const parsed =
        JSON.parse(blog.additional_images);

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
      .map((image: string) => image.trim())
      .filter(Boolean);

  }

  return [];
}



export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
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

      images:
        blog.cover_image
          ? [blog.cover_image]
          : [],

    },

  };

}



export default async function BlogArticlePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {

  const { slug } = await params;

  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }



  const relatedProducts =
    await getRelatedProducts(
      blog.related_products || []
    );



  const additionalImages =
    getAdditionalImages(blog);



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


      {/* BLOG HEADER */}

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
            ? new Date(blog.created_at)
                .toISOString()
                .slice(0, 10)
            : ""}

        </div>

      </div>



      {/* COVER IMAGE */}

      {blog.cover_image && (

        <img
          src={blog.cover_image}
          alt={blog.title}
          className="
          w-full
          max-h-[500px]
          object-cover
          rounded-2xl
          mb-8
          "
        />

      )}



      {/* ADDITIONAL BLOG IMAGES */}

      {additionalImages.length > 0 && (

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

              <figure key={index}>

                <img
                  src={image}
                  alt={`${blog.title} - Image ${index + 1}`}
                  loading="lazy"
                  className="
                  w-full
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



      {/* BLOG CONTENT */}

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



      {/* RECOMMENDED PRODUCTS */}

      {relatedProducts.length > 0 && (

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
                      alt={product.name}
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

                      ₹{product.price}

                    </span>

                  </div>



                  {product.affiliate_link && (

                    <a
                      href={product.affiliate_link}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
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



      {/* RELATED BLOGS */}

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



      {/* MORE ARTICLES */}

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

