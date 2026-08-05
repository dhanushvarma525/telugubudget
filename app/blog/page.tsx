import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";

async function getBlogs() {
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

    return data.blogs || [];
  } catch (error) {
    console.log("BLOGS ERROR:", error);
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  const publishedBlogs = blogs.filter(
    (blog: any) => blog.published
  );

  return (
    <main
      className="
      min-h-screen
      bg-gray-50
      p-4
      sm:p-6
      pb-24
      "
    >
      {/* HEADER */}

      <div
        className="
        max-w-7xl
        mx-auto
        mb-8
        "
      >
        <div
          className="
          flex
          justify-between
          items-center
          flex-wrap
          gap-4
          "
        >
          <div>
            <h1
              className="
              text-3xl
              md:text-4xl
              font-extrabold
              text-gray-900
              "
            >
              🚀 AnantaGo
              <span className="text-green-600">
                {" "}Blogs
              </span>
            </h1>

            <p
              className="
              mt-2
              text-gray-600
              text-sm
              md:text-base
              "
            >
              Smart guides, product reviews and useful ideas
              for everyday life.
            </p>
          </div>

          <div
            className="
            flex
            gap-2
            "
          >
            <span
              className="
              bg-green-100
              text-green-700
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
              "
            >
              🔥 Deals
            </span>

            <span
              className="
              bg-yellow-100
              text-yellow-700
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
              "
            >
              ⭐ Guides
            </span>
          </div>
        </div>
      </div>

      {/* NO BLOGS */}

      {publishedBlogs.length === 0 ? (
        <div
          className="
          max-w-7xl
          mx-auto
          bg-white
          rounded-xl
          shadow
          p-8
          text-center
          "
        >
          <h2 className="font-bold text-xl">
            No blogs available
          </h2>

          <p className="text-gray-500 mt-2">
            New articles coming soon.
          </p>
        </div>
      ) : (
        /* BLOG GRID */

        <div
          className="
          max-w-7xl
          mx-auto
          grid
          grid-cols-2
          gap-3
          sm:gap-5
          md:grid-cols-3
          "
        >
          {publishedBlogs.map((blog: any) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="
              group
              bg-white
              rounded-xl
              overflow-hidden
              border
              border-gray-200
              shadow-sm
              hover:shadow-xl
              transition
              duration-300
              "
            >
              {/* BLOG IMAGE */}

              {blog.cover_image && (
                <img
                  src={blog.cover_image}
                  alt={blog.title}
                  loading="lazy"
                  className="
                  w-full
                  h-32
                  sm:h-48
                  object-cover
                  group-hover:scale-105
                  transition
                  duration-500
                  "
                />
              )}

              {/* BLOG CONTENT */}

              <div
                className="
                p-3
                sm:p-5
                "
              >
                {/* CATEGORY */}

                {blog.category && (
                  <span
                    className="
                    inline-block
                    bg-green-100
                    text-green-700
                    px-2
                    sm:px-3
                    py-1
                    rounded-full
                    text-[10px]
                    sm:text-xs
                    font-semibold
                    mb-2
                    "
                  >
                    📂 {blog.category}
                  </span>
                )}

                {/* TITLE */}

                <h2
                  className="
                  text-sm
                  sm:text-lg
                  font-bold
                  text-gray-900
                  group-hover:text-green-600
                  transition
                  line-clamp-3
                  "
                >
                  {blog.title}
                </h2>

                {/* EXCERPT */}

                {blog.excerpt && (
                  <p
                    className="
                    text-xs
                    sm:text-sm
                    text-gray-600
                    mt-2
                    line-clamp-3
                    "
                  >
                    {blog.excerpt}
                  </p>
                )}

                {/* BOTTOM */}

                <div
                  className="
                  mt-4
                  flex
                  justify-between
                  items-center
                  gap-2
                  "
                >
                  <span
                    className="
                    text-green-600
                    text-xs
                    sm:text-sm
                    font-semibold
                    "
                  >
                    Read →
                  </span>

                  {blog.featured && (
                    <span
                      className="
                      bg-yellow-100
                      text-yellow-700
                      px-2
                      py-1
                      rounded-full
                      text-[9px]
                      sm:text-xs
                      whitespace-nowrap
                      "
                    >
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}