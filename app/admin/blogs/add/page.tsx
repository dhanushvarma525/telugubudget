"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  image?: string;
  price?: number;
};

type ContentBlock =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "image";
      url: string;
      alt: string;
    };

const PRODUCTS_PER_PAGE = 20;

export default function AddBlogPage() {
  const router = useRouter();

  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [productPage, setProductPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);

  const totalProductPages = Math.ceil(
    totalProducts / PRODUCTS_PER_PAGE
  );

  // =====================================================
  // BLOG FORM
  // =====================================================

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category: "",
    author: "AnantaGo",
    tags: "",
    cover_image: "",
    published: true,
    featured: false,
  });

  // =====================================================
  // CONTENT BLOCKS
  // =====================================================

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      type: "text",
      content: "",
    },
  ]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  useEffect(() => {
    loadProducts(productPage, search);
  }, [productPage]);

  async function loadProducts(
    page: number,
    searchValue: string = search
  ) {
    try {
      setLoadingProducts(true);

      const from =
        (page - 1) * PRODUCTS_PER_PAGE;

      const to =
        from + PRODUCTS_PER_PAGE - 1;

      let query = supabase
        .from("products")
        .select(
          "id,name,image,price",
          {
            count: "exact",
          }
        )
        .order("created_at", {
          ascending: false,
        })
        .range(from, to);

      if (searchValue.trim()) {
        query = query.ilike(
          "name",
          `%${searchValue.trim()}%`
        );
      }

      const {
        data,
        error,
        count,
      } = await query;

      if (error) {
        console.log(
          "PRODUCT LOAD ERROR:",
          error
        );
        return;
      }

      setProducts(data || []);
      setTotalProducts(count || 0);
    } catch (error) {
      console.log(
        "PRODUCT LOAD ERROR:",
        error
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  // =====================================================
  // SEARCH PRODUCTS
  // =====================================================

  async function handleProductSearch(
    value: string
  ) {
    setSearch(value);
    setProductPage(1);

    await loadProducts(1, value);
  }

  // =====================================================
  // SELECT PRODUCT
  // =====================================================

  function toggleProduct(id: string) {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) => item !== id
          )
        : [...prev, id]
    );
  }

  // =====================================================
  // UPLOAD IMAGE
  // =====================================================

  async function uploadImage(
    file: File
  ): Promise<string | null> {
    try {
      setUploading(true);

      const safeName = file.name
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9.-]/g, "");

      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}-${safeName}`;

      const {
        error,
      } = await supabase.storage
        .from("blog-images")
        .upload(
          fileName,
          file
        );

      if (error) {
        throw error;
      }

      const {
        data,
      } = supabase.storage
        .from("blog-images")
        .getPublicUrl(
          fileName
        );

      return data.publicUrl;
    } catch (error: any) {
      alert(
        error?.message ||
          "Image upload failed"
      );

      return null;
    } finally {
      setUploading(false);
    }
  }

  // =====================================================
  // COVER IMAGE
  // =====================================================

  async function handleCoverUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const url =
      await uploadImage(file);

    if (!url) return;

    setForm((prev) => ({
      ...prev,
      cover_image: url,
    }));
  }

  // =====================================================
  // CONTENT BLOCK IMAGE
  // =====================================================

  async function handleBlockImageUpload(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const url =
      await uploadImage(file);

    if (!url) return;

    setContentBlocks((prev) => {
      const updated = [...prev];

      const block = updated[index];

      if (
        block &&
        block.type === "image"
      ) {
        updated[index] = {
          ...block,
          url,
        };
      }

      return updated;
    });
  }

  // =====================================================
  // FORM CHANGE
  // =====================================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =====================================================
  // SLUG
  // =====================================================

  function generateSlug(
    title: string
  ) {
    return title
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      );
  }

  // =====================================================
  // CONTENT BLOCK HELPERS
  // =====================================================

  function addTextBlock(
    afterIndex?: number
  ) {
    const newBlock: ContentBlock = {
      type: "text",
      content: "",
    };

    setContentBlocks((prev) => {
      if (
        afterIndex === undefined
      ) {
        return [
          ...prev,
          newBlock,
        ];
      }

      const updated = [...prev];

      updated.splice(
        afterIndex + 1,
        0,
        newBlock
      );

      return updated;
    });
  }

  function addImageBlock(
    afterIndex?: number
  ) {
    const newBlock: ContentBlock = {
      type: "image",
      url: "",
      alt: "",
    };

    setContentBlocks((prev) => {
      if (
        afterIndex === undefined
      ) {
        return [
          ...prev,
          newBlock,
        ];
      }

      const updated = [...prev];

      updated.splice(
        afterIndex + 1,
        0,
        newBlock
      );

      return updated;
    });
  }

  function updateTextBlock(
    index: number,
    value: string
  ) {
    setContentBlocks((prev) => {
      const updated = [...prev];

      const block =
        updated[index];

      if (
        block &&
        block.type === "text"
      ) {
        updated[index] = {
          ...block,
          content: value,
        };
      }

      return updated;
    });
  }

  function updateImageAlt(
    index: number,
    value: string
  ) {
    setContentBlocks((prev) => {
      const updated = [...prev];

      const block =
        updated[index];

      if (
        block &&
        block.type === "image"
      ) {
        updated[index] = {
          ...block,
          alt: value,
        };
      }

      return updated;
    });
  }

  function deleteBlock(
    index: number
  ) {
    setContentBlocks((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }

  function moveBlockUp(
    index: number
  ) {
    if (index === 0) return;

    setContentBlocks((prev) => {
      const updated = [...prev];

      [
        updated[index - 1],
        updated[index],
      ] = [
        updated[index],
        updated[index - 1],
      ];

      return updated;
    });
  }

  function moveBlockDown(
    index: number
  ) {
    setContentBlocks((prev) => {
      if (
        index >=
        prev.length - 1
      ) {
        return prev;
      }

      const updated = [...prev];

      [
        updated[index],
        updated[index + 1],
      ] = [
        updated[index + 1],
        updated[index],
      ];

      return updated;
    });
  }

  // =====================================================
  // SAVE BLOG
  // =====================================================

  async function submitBlog() {
    if (!form.title.trim()) {
      alert(
        "Please enter a blog title."
      );
      return;
    }

    const hasText =
      contentBlocks.some(
        (block) =>
          block.type === "text" &&
          block.content.trim()
      );

    if (!hasText) {
      alert(
        "Please write some blog content."
      );
      return;
    }

    try {
      setSaving(true);

      // Convert blocks into clean data
      const cleanBlocks =
        contentBlocks.filter(
          (block) => {
            if (
              block.type === "text"
            ) {
              return block.content.trim();
            }

            if (
              block.type === "image"
            ) {
              return block.url.trim();
            }

            return false;
          }
        );

      // Keep compatibility with your
      // existing content column.
      const plainText =
        cleanBlocks
          .filter(
            (block) =>
              block.type ===
              "text"
          )
          .map(
            (block) =>
              block.content
          )
          .join("\n\n");

      // Collect article images
      const additionalImages =
        cleanBlocks
          .filter(
            (block) =>
              block.type ===
              "image"
          )
          .map(
            (block: any) =>
              block.url
          );

      const response =
        await fetch(
          "/api/blogs",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title: form.title,

              slug:
                form.slug ||
                generateSlug(
                  form.title
                ),

              excerpt:
                form.excerpt,

              content:
                plainText,

              cover_image:
                form.cover_image,

              additional_images:
                additionalImages,

              content_blocks:
                cleanBlocks,

              category:
                form.category,

              author:
                form.author,

              tags:
                form.tags
                  .split(",")
                  .map(
                    (tag) =>
                      tag.trim()
                  )
                  .filter(Boolean),

              published:
                form.published,

              featured:
                form.featured,

              related_products:
                selectedProducts,
            }),
          }
        );

      const data =
        await response.json();

      if (data.success) {
        alert(
          "Blog added successfully!"
        );

        router.push(
          "/admin/blogs"
        );

        router.refresh();
      } else {
        alert(
          data.message ||
            "Failed to add blog"
        );
      }
    } catch (error) {
      console.log(
        "SAVE BLOG ERROR:",
        error
      );

      alert(
        "Something went wrong while saving the blog."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // PRODUCT PAGINATION
  // =====================================================

  function changeProductPage(
    page: number
  ) {
    if (
      page < 1 ||
      page > totalProductPages
    ) {
      return;
    }

    setProductPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="max-w-5xl mx-auto p-6">

      <h1 className="
        text-3xl
        font-bold
        mb-8
      ">
        📝 Add New Blog
      </h1>

      <div className="space-y-6">

        {/* TITLE */}

        <input
          name="title"
          placeholder="Blog title"
          value={form.title}
          onChange={handleChange}
          className="
            border
            p-3
            w-full
            rounded-lg
          "
        />

        {/* SLUG */}

        <input
          name="slug"
          placeholder="Slug (optional)"
          value={form.slug}
          onChange={handleChange}
          className="
            border
            p-3
            w-full
            rounded-lg
          "
        />

        {/* COVER IMAGE */}

        <div className="
          border
          rounded-xl
          p-5
          bg-white
        ">

          <h2 className="
            text-lg
            font-bold
            mb-3
          ">
            🖼️ Blog Cover Image
          </h2>

          <input
            type="file"
            accept="image/*"
            onChange={
              handleCoverUpload
            }
            className="
              border
              p-3
              w-full
              rounded-lg
            "
          />

          {form.cover_image && (
            <img
              src={
                form.cover_image
              }
              alt="Cover Preview"
              className="
                mt-4
                w-full
                h-64
                object-cover
                rounded-xl
              "
            />
          )}

        </div>

        {/* CATEGORY */}

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="
            border
            p-3
            w-full
            rounded-lg
          "
        />

        {/* TAGS */}

        <input
          name="tags"
          placeholder="Tags separated by comma"
          value={form.tags}
          onChange={handleChange}
          className="
            border
            p-3
            w-full
            rounded-lg
          "
        />

        {/* EXCERPT */}

        <textarea
          name="excerpt"
          placeholder="Short description"
          value={form.excerpt}
          onChange={handleChange}
          className="
            border
            p-3
            w-full
            rounded-lg
            h-28
          "
        />

        {/* =================================================
            ARTICLE CONTENT BUILDER
        ================================================= */}

        <section className="
          border
          rounded-xl
          p-5
          bg-white
        ">

          <div className="
            flex
            justify-between
            items-center
            flex-wrap
            gap-3
            mb-5
          ">

            <div>

              <h2 className="
                text-xl
                font-bold
              ">
                ✍️ Article Content
              </h2>

              <p className="
                text-sm
                text-gray-500
                mt-1
              ">
                Add text and images in
                exactly the order you want.
              </p>

            </div>

          </div>

          <div className="space-y-5">

            {contentBlocks.map(
              (block, index) => (

                <div
                  key={index}
                  className="
                    border
                    rounded-xl
                    p-4
                    bg-gray-50
                  "
                >

                  {/* BLOCK HEADER */}

                  <div className="
                    flex
                    justify-between
                    items-center
                    gap-3
                    mb-3
                  ">

                    <span className="
                      text-sm
                      font-bold
                      text-gray-600
                    ">
                      {block.type ===
                      "text"
                        ? `📝 Text Block ${
                            index + 1
                          }`
                        : `🖼️ Image Block ${
                            index + 1
                          }`}
                    </span>

                    <div className="
                      flex
                      gap-2
                      flex-wrap
                    ">

                      <button
                        type="button"
                        onClick={() =>
                          moveBlockUp(
                            index
                          )
                        }
                        disabled={
                          index === 0
                        }
                        className="
                          px-2
                          py-1
                          border
                          rounded
                          text-xs
                          disabled:opacity-30
                        "
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveBlockDown(
                            index
                          )
                        }
                        disabled={
                          index ===
                          contentBlocks.length -
                            1
                        }
                        className="
                          px-2
                          py-1
                          border
                          rounded
                          text-xs
                          disabled:opacity-30
                        "
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteBlock(
                            index
                          )
                        }
                        className="
                          px-2
                          py-1
                          bg-red-100
                          text-red-600
                          rounded
                          text-xs
                        "
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                  {/* TEXT */}

                  {block.type ===
                    "text" && (

                    <textarea
                      value={
                        block.content
                      }
                      onChange={(e) =>
                        updateTextBlock(
                          index,
                          e.target.value
                        )
                      }
                      placeholder="
Write your paragraph here...

Example:
A power bank is one of the most useful gadgets for travel...
                      "
                      className="
                        border
                        p-4
                        w-full
                        rounded-lg
                        min-h-48
                        bg-white
                        leading-7
                      "
                    />

                  )}

                  {/* IMAGE */}

                  {block.type ===
                    "image" && (

                    <div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleBlockImageUpload(
                            index,
                            e
                          )
                        }
                        className="
                          border
                          p-3
                          w-full
                          rounded-lg
                          bg-white
                        "
                      />

                      {block.url && (

                        <img
                          src={
                            block.url
                          }
                          alt={
                            block.alt ||
                            "Article image"
                          }
                          className="
                            mt-4
                            w-full
                            max-h-[500px]
                            object-cover
                            rounded-xl
                          "
                        />

                      )}

                      <input
                        value={
                          block.alt
                        }
                        onChange={(e) =>
                          updateImageAlt(
                            index,
                            e.target.value
                          )
                        }
                        placeholder="Image alt text (SEO)"
                        className="
                          mt-3
                          border
                          p-3
                          w-full
                          rounded-lg
                          bg-white
                        "
                      />

                    </div>

                  )}

                  {/* ADD BLOCK BUTTONS */}

                  <div className="
                    mt-4
                    flex
                    gap-2
                    flex-wrap
                  ">

                    <button
                      type="button"
                      onClick={() =>
                        addTextBlock(
                          index
                        )
                      }
                      className="
                        bg-blue-100
                        text-blue-700
                        px-4
                        py-2
                        rounded-lg
                        text-sm
                        font-semibold
                      "
                    >
                      + Text Below
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addImageBlock(
                          index
                        )
                      }
                      className="
                        bg-green-100
                        text-green-700
                        px-4
                        py-2
                        rounded-lg
                        text-sm
                        font-semibold
                      "
                    >
                      + Image Below
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

          {/* ADD AT END */}

          <div className="
            mt-5
            flex
            gap-3
            flex-wrap
          ">

            <button
              type="button"
              onClick={() =>
                addTextBlock()
              }
              className="
                bg-blue-600
                text-white
                px-5
                py-2
                rounded-lg
                font-semibold
              "
            >
              + Add Text
            </button>

            <button
              type="button"
              onClick={() =>
                addImageBlock()
              }
              className="
                bg-green-600
                text-white
                px-5
                py-2
                rounded-lg
                font-semibold
              "
            >
              + Add Image
            </button>

          </div>

        </section>

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <section className="
          border
          rounded-xl
          p-5
          bg-white
        ">

          <div className="
            flex
            justify-between
            items-center
            flex-wrap
            gap-4
            mb-4
          ">

            <div>

              <h2 className="
                text-xl
                font-bold
              ">
                🛒 Related Products
              </h2>

              <p className="
                text-sm
                text-gray-500
                mt-1
              ">
                Latest products appear first.
              </p>

            </div>

            <div className="
              bg-blue-100
              text-blue-700
              px-3
              py-1
              rounded-full
              text-sm
              font-semibold
            ">
              {selectedProducts.length} selected
            </div>

          </div>

          {/* SEARCH */}

          <input
            value={search}
            onChange={(e) =>
              handleProductSearch(
                e.target.value
              )
            }
            placeholder="
🔍 Search products...
            "
            className="
              border
              p-3
              w-full
              rounded-lg
              mb-5
            "
          />

          <p className="
            text-sm
            text-gray-500
            mb-4
          ">
            {search
              ? `Search results — Page ${productPage} of ${
                  totalProductPages || 1
                }`
              : `Latest products — Page ${productPage} of ${
                  totalProductPages || 1
                }`}
          </p>

          {/* PRODUCT GRID */}

          {loadingProducts ? (

            <div className="
              border
              rounded-lg
              p-8
              text-center
              text-gray-500
            ">
              Loading products...
            </div>

          ) : products.length ===
            0 ? (

            <div className="
              border
              rounded-lg
              p-8
              text-center
              text-gray-500
            ">
              No products found.
            </div>

          ) : (

            <div className="
              grid
              grid-cols-2
              sm:grid-cols-3
              lg:grid-cols-4
              gap-4
            ">

              {products.map(
                (product) => {

                  const selected =
                    selectedProducts.includes(
                      product.id
                    );

                  return (

                    <div
                      key={product.id}
                      onClick={() =>
                        toggleProduct(
                          product.id
                        )
                      }
                      className={`
                        cursor-pointer
                        border
                        rounded-xl
                        overflow-hidden
                        bg-white
                        transition
                        ${
                          selected
                            ? "border-green-500 ring-2 ring-green-200"
                            : "border-gray-200 hover:shadow-md"
                        }
                      `}
                    >

                      {product.image ? (

                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          className="
                            w-full
                            h-32
                            object-contain
                            bg-gray-50
                            p-2
                          "
                        />

                      ) : (

                        <div className="
                          h-32
                          bg-gray-100
                          flex
                          items-center
                          justify-center
                          text-gray-400
                        ">
                          No Image
                        </div>

                      )}

                      <div className="p-3">

                        <div className="
                          flex
                          gap-2
                          items-start
                        ">

                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            readOnly
                          />

                          <h3 className="
                            text-sm
                            font-semibold
                            line-clamp-2
                          ">
                            {
                              product.name
                            }
                          </h3>

                        </div>

                        {product.price !==
                          undefined && (

                          <p className="
                            font-bold
                            mt-2
                          ">
                            ₹
                            {
                              product.price
                            }
                          </p>

                        )}

                        {selected && (

                          <p className="
                            text-xs
                            text-green-600
                            font-semibold
                            mt-2
                          ">
                            ✓ Selected
                          </p>

                        )}

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

          {/* PAGINATION */}

          {totalProductPages >
            1 && (

            <div className="
              mt-6
              flex
              justify-center
              items-center
              gap-3
              flex-wrap
            ">

              <button
                type="button"
                disabled={
                  productPage ===
                  1
                }
                onClick={() =>
                  changeProductPage(
                    productPage - 1
                  )
                }
                className="
                  px-4
                  py-2
                  border
                  rounded-lg
                  font-semibold
                  disabled:opacity-40
                "
              >
                ← Previous
              </button>

              <span className="
                px-4
                py-2
                bg-gray-100
                rounded-lg
                font-semibold
              ">
                Page {productPage} /{" "}
                {totalProductPages}
              </span>

              <button
                type="button"
                disabled={
                  productPage ===
                  totalProductPages
                }
                onClick={() =>
                  changeProductPage(
                    productPage + 1
                  )
                }
                className="
                  px-4
                  py-2
                  border
                  rounded-lg
                  font-semibold
                  disabled:opacity-40
                "
              >
                Next →
              </button>

            </div>

          )}

          {selectedProducts.length >
            0 && (

            <div className="
              mt-5
              bg-green-50
              border
              border-green-200
              rounded-lg
              p-4
            ">

              <p className="
                font-semibold
                text-green-800
              ">
                ✅{" "}
                {
                  selectedProducts.length
                }{" "}
                products selected
              </p>

              <p className="
                text-sm
                text-green-700
                mt-1
              ">
                You can move between pages
                without losing selections.
              </p>

            </div>

          )}

        </section>

        {/* FEATURED */}

        <label className="
          flex
          gap-2
          items-center
        ">

          <input
            type="checkbox"
            checked={
              form.featured
            }
            onChange={(e) =>
              setForm({
                ...form,
                featured:
                  e.target.checked,
              })
            }
          />

          ⭐ Featured Blog

        </label>

        {/* PUBLISHED */}

        <label className="
          flex
          gap-2
          items-center
        ">

          <input
            type="checkbox"
            checked={
              form.published
            }
            onChange={(e) =>
              setForm({
                ...form,
                published:
                  e.target.checked,
              })
            }
          />

          ✅ Published

        </label>

        {/* SAVE */}

        <button
          type="button"
          onClick={
            submitBlog
          }
          disabled={
            uploading ||
            saving
          }
          className="
            bg-black
            text-white
            px-6
            py-3
            rounded-lg
            font-semibold
            hover:bg-gray-800
            disabled:opacity-50
          "
        >
          {saving
            ? "Saving Blog..."
            : uploading
            ? "Uploading..."
            : "Save Blog"}
        </button>

      </div>

      {/* =================================================
          PREVIEW
      ================================================= */}

      <section className="
        mt-10
        border
        rounded-xl
        p-6
        bg-gray-50
      ">

        <h2 className="
          text-xl
          font-bold
          mb-5
        ">
          👀 Blog Preview
        </h2>

        <h3 className="
          text-2xl
          font-bold
        ">
          {form.title ||
            "Blog Title"}
        </h3>

        <p className="
          text-sm
          text-gray-500
          mt-2
        ">
          {form.category ||
            "Category"}{" "}
          • {form.author}
        </p>

        {form.cover_image && (

          <img
            src={
              form.cover_image
            }
            alt="Preview"
            className="
              w-full
              rounded-xl
              mt-4
              max-h-[500px]
              object-cover
            "
          />

        )}

        <p className="
          mt-5
          text-gray-600
        ">
          {form.excerpt ||
            "Blog excerpt will appear here..."}
        </p>

        {/* PREVIEW CONTENT */}

        <div className="
          mt-8
          space-y-6
        ">

          {contentBlocks.map(
            (block, index) => {

              if (
                block.type ===
                "text"
              ) {

                return (

                  <p
                    key={index}
                    className="
                      whitespace-pre-line
                      text-gray-800
                      leading-8
                    "
                  >
                    {block.content ||
                      "Your article text will appear here..."}
                  </p>

                );
              }

              if (
                block.type ===
                  "image" &&
                block.url
              ) {

                return (

                  <img
                    key={index}
                    src={
                      block.url
                    }
                    alt={
                      block.alt ||
                      "Article image"
                    }
                    className="
                      w-full
                      rounded-xl
                    "
                  />

                );
              }

              return null;
            }
          )}

        </div>

        {selectedProducts.length >
          0 && (

          <div className="mt-8">

            <h3 className="
              font-bold
              text-lg
            ">
              🛒 Recommended Products
            </h3>

            <p className="
              text-sm
              text-gray-500
              mt-1
            ">
              {
                selectedProducts.length
              }{" "}
              products linked
            </p>

          </div>

        )}

      </section>

    </main>
  );
}