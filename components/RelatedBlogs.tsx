
import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";



async function getRelatedBlogs(
  category: string,
  currentSlug: string
) {

  try {

    const res = await fetch(
      `${getBaseUrl()}/api/blogs`,
      {
        cache: "no-store",
      }
    );


    if (!res.ok) {
      return [];
    }


    const data = await res.json();


    return (data.blogs || [])
      .filter(
        (blog: any) =>
          blog.published &&
          blog.category === category &&
          blog.slug !== currentSlug
      )
      .slice(0, 3);


  } catch (error) {

    console.log(
      "RELATED BLOGS ERROR:",
      error
    );

    return [];

  }

}



export default async function RelatedBlogs({
  category,
  slug,
}: {
  category: string;
  slug: string;
}) {


  const blogs =
    await getRelatedBlogs(
      category,
      slug
    );


  if (blogs.length === 0) {
    return null;
  }



  return (

    <section
      className="
      mt-12
      border-t
      pt-8
      w-full
      "
    >


      <h2
        className="
        text-2xl
        font-bold
        mb-5
        "
      >

        📚 You May Also Like

      </h2>



      {/* MOBILE = 2 COLUMNS
          DESKTOP = 3 COLUMNS */}

      <div
        className="
        w-full
        grid
        grid-cols-2
        md:grid-cols-3
        gap-3
        sm:gap-5
        "
      >


        {blogs.map(
          (blog: any) => (

            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="
              min-w-0
              w-full
              block
              group
              bg-white
              border
              border-gray-200
              rounded-xl
              overflow-hidden
              hover:shadow-lg
              transition
              duration-300
              "
            >


              {/* IMAGE */}

              {blog.cover_image && (

                <img
                  src={blog.cover_image}
                  alt={blog.title}
                  loading="lazy"
                  className="
                  block
                  w-full
                  h-28
                  sm:h-40
                  object-cover
                  group-hover:scale-105
                  transition
                  duration-300
                  "
                />

              )}



              {/* CONTENT */}

              <div
                className="
                min-w-0
                p-3
                sm:p-4
                "
              >


                {/* CATEGORY */}

                {blog.category && (

                  <div
                    className="
                    text-[10px]
                    sm:text-xs
                    font-semibold
                    text-orange-500
                    mb-2
                    truncate
                    "
                  >

                    {blog.category}

                  </div>

                )}



                {/* TITLE */}

                <h3
                  className="
                  text-sm
                  sm:text-base
                  font-bold
                  leading-5
                  line-clamp-2
                  break-words
                  group-hover:text-orange-500
                  transition
                  "
                >

                  {blog.title}

                </h3>



                {/* EXCERPT */}

                {blog.excerpt && (

                  <p
                    className="
                    text-xs
                    sm:text-sm
                    text-gray-500
                    mt-2
                    line-clamp-2
                    break-words
                    "
                  >

                    {blog.excerpt}

                  </p>

                )}



                {/* READ */}

                <div
                  className="
                  mt-3
                  text-xs
                  sm:text-sm
                  font-semibold
                  text-orange-500
                  "
                >

                  Read →

                </div>


              </div>


            </Link>

          )
        )}


      </div>



      {/* VIEW ALL */}

      <div
        className="
        text-center
        mt-7
        "
      >

        <Link
          href="/blog"
          className="
          inline-block
          border
          border-gray-300
          px-5
          py-2
          rounded-lg
          font-semibold
          text-sm
          hover:bg-gray-100
          transition
          "
        >

          View All Blogs →

        </Link>

      </div>


    </section>

  );

}

