"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    try {
      setLoading(true);

      const res = await fetch("/api/blogs", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.log("BLOG LOAD ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBlog(slug: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Blog deleted successfully");
        loadBlogs();
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-xl font-bold">
        Loading Blogs...
      </div>
    );
  }

  const filteredBlogs = blogs.filter((blog: any) => {
    const searchText = search.toLowerCase();

    return (
      blog.title?.toLowerCase().includes(searchText) ||
      blog.category?.toLowerCase().includes(searchText) ||
      blog.slug?.toLowerCase().includes(searchText)
    );
  });

  const totalViews = blogs.reduce(
    (total, blog) => total + Number(blog.views || 0),
    0
  );

  const publishedBlogs = blogs.filter(
    (blog) => blog.published
  ).length;

  const draftBlogs = blogs.filter(
    (blog) => !blog.published
  ).length;

  return (
    <main className="max-w-7xl mx-auto p-6">

      {/* HEADER */}

      <div
        className="
        flex
        justify-between
        items-center
        mb-8
        flex-wrap
        gap-4
        "
      >
        <div>
          <h1 className="text-3xl font-bold">
            📝 Manage Blogs
          </h1>

          <p className="text-gray-500 mt-1">
            Create, edit and monitor your blog posts.
          </p>
        </div>

        <Link
          href="/admin/blogs/add"
          className="
          bg-green-600
          hover:bg-green-700
          text-white
          px-6
          py-3
          rounded-lg
          font-semibold
          "
        >
          ➕ Add Blog
        </Link>
      </div>


      {/* STATISTICS */}

      <div
        className="
        grid
        grid-cols-2
        md:grid-cols-4
        gap-4
        mb-8
        "
      >

        {/* Total Blogs */}

        <div
          className="
          bg-white
          shadow
          rounded-xl
          p-5
          "
        >
          <p className="text-gray-500 text-sm">
            Total Blogs
          </p>

          <p className="text-3xl font-bold mt-2">
            {blogs.length}
          </p>
        </div>


        {/* Published */}

        <div
          className="
          bg-white
          shadow
          rounded-xl
          p-5
          "
        >
          <p className="text-gray-500 text-sm">
            Published
          </p>

          <p className="text-3xl font-bold mt-2 text-green-600">
            {publishedBlogs}
          </p>
        </div>


        {/* Drafts */}

        <div
          className="
          bg-white
          shadow
          rounded-xl
          p-5
          "
        >
          <p className="text-gray-500 text-sm">
            Drafts
          </p>

          <p className="text-3xl font-bold mt-2 text-orange-500">
            {draftBlogs}
          </p>
        </div>


        {/* Total Views */}

        <div
          className="
          bg-white
          shadow
          rounded-xl
          p-5
          "
        >
          <p className="text-gray-500 text-sm">
            Total Views
          </p>

          <p className="text-3xl font-bold mt-2 text-blue-600">
            👁️ {totalViews}
          </p>
        </div>

      </div>


      {/* SEARCH */}

      <div className="mb-6">

        <input
          type="text"
          placeholder="🔎 Search blogs by title, category or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
          w-full
          border
          border-gray-300
          rounded-xl
          px-4
          py-3
          outline-none
          focus:ring-2
          focus:ring-green-500
          "
        />

      </div>


      {/* BLOG LIST */}

      {filteredBlogs.length === 0 ? (

        <div
          className="
          bg-white
          shadow
          rounded-xl
          p-8
          text-center
          "
        >

          {blogs.length === 0 ? (
            <>
              <p className="text-xl font-semibold">
                No blogs created yet.
              </p>

              <Link
                href="/admin/blogs/add"
                className="
                inline-block
                mt-4
                bg-green-600
                text-white
                px-5
                py-2
                rounded-lg
                "
              >
                ➕ Create Your First Blog
              </Link>
            </>
          ) : (
            <p className="text-gray-500">
              No blogs match your search.
            </p>
          )}

        </div>

      ) : (

        <div className="grid gap-6">

          {filteredBlogs.map((blog: any) => (

            <div
              key={blog.id}
              className="
              bg-white
              shadow
              rounded-xl
              p-5
              "
            >

              <div
                className="
                flex
                gap-5
                flex-col
                md:flex-row
                "
              >

                {/* COVER IMAGE */}

                {blog.cover_image ? (

                  <img
                    src={blog.cover_image}
                    alt={blog.title}
                    className="
                    w-full
                    md:w-52
                    h-36
                    object-cover
                    rounded-lg
                    "
                  />

                ) : (

                  <div
                    className="
                    w-full
                    md:w-52
                    h-36
                    bg-gray-100
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-gray-400
                    "
                  >
                    No Image
                  </div>

                )}


                {/* BLOG INFORMATION */}

                <div className="flex-1">

                  <h2 className="text-xl font-bold">
                    {blog.title}
                  </h2>

                  <p
                    className="
                    text-gray-600
                    mt-2
                    line-clamp-2
                    "
                  >
                    {blog.excerpt}
                  </p>


                  {/* INFORMATION BADGES */}

                  <div
                    className="
                    flex
                    flex-wrap
                    gap-2
                    mt-4
                    "
                  >

                    {/* CATEGORY */}

                    {blog.category && (
                      <span
                        className="
                        bg-gray-100
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        "
                      >
                        📂 {blog.category}
                      </span>
                    )}


                    {/* VIEWS */}

                    <span
                      className="
                      bg-blue-100
                      text-blue-700
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-semibold
                      "
                    >
                      👁️ {Number(blog.views || 0)} Views
                    </span>


                    {/* PUBLISHED */}

                    {blog.published ? (

                      <span
                        className="
                        bg-green-100
                        text-green-700
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        "
                      >
                        ✅ Published
                      </span>

                    ) : (

                      <span
                        className="
                        bg-red-100
                        text-red-700
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        "
                      >
                        🔒 Draft
                      </span>

                    )}


                    {/* FEATURED */}

                    {blog.featured && (

                      <span
                        className="
                        bg-yellow-100
                        text-yellow-700
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        "
                      >
                        ⭐ Featured
                      </span>

                    )}


                    {/* PRODUCTS */}

                    {blog.related_products?.length > 0 && (

                      <span
                        className="
                        bg-purple-100
                        text-purple-700
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        "
                      >
                        🛒{" "}
                        {blog.related_products.length}
                        {" "}
                        Products
                      </span>

                    )}


                    {/* ADDITIONAL IMAGES */}

                    {blog.additional_images?.length > 0 && (

                      <span
                        className="
                        bg-orange-100
                        text-orange-700
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        "
                      >
                        🖼️{" "}
                        {blog.additional_images.length}
                        {" "}
                        Images
                      </span>

                    )}

                  </div>


                  {/* CREATED DATE */}

                  {blog.created_at && (

                    <p
                      className="
                      text-xs
                      text-gray-400
                      mt-3
                      "
                    >
                      Created:{" "}
                      {new Date(
                        blog.created_at
                      ).toLocaleDateString()}
                    </p>

                  )}

                </div>

              </div>


              {/* ACTION BUTTONS */}

              <div
                className="
                mt-5
                pt-4
                border-t
                flex
                gap-3
                flex-wrap
                "
              >

                {/* VIEW */}

                <Link
                  href={`/blog/${blog.slug}`}
                  target="_blank"
                  className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  font-semibold
                  "
                >
                  👁️ View
                </Link>


                {/* EDIT */}

                <Link
                  href={`/admin/blogs/edit/${blog.slug}`}
                  className="
                  bg-yellow-500
                  hover:bg-yellow-600
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  font-semibold
                  "
                >
                  ✏️ Edit
                </Link>


                {/* DELETE */}

                <button
                  onClick={() =>
                    deleteBlog(blog.slug)
                  }
                  className="
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  font-semibold
                  "
                >
                  🗑️ Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>
  );
}