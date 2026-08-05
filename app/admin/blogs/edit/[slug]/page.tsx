
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  image?: string;
  price?: number;
};

type BlogImage = {
  url: string;
  position: number;
};

const PRODUCTS_PER_PAGE = 20;

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;

  // =========================
  // LOADING
  // =========================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // =========================
  // PRODUCTS
  // =========================

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [productPage, setProductPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);

  const totalProductPages = Math.ceil(
    totalProducts / PRODUCTS_PER_PAGE
  );

  // =========================
  // BLOG FORM
  // =========================

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category: "",
    author: "AnantaGo",
    tags: "",
    published: true,
    featured: false,
  });

  // =========================
  // ADDITIONAL IMAGES
  // =========================

  const [additionalImages, setAdditionalImages] = useState<BlogImage[]>([]);

  // =========================
  // LOAD BLOG
  // =========================

  useEffect(() => {
    if (!slug) return;

    loadBlog();
  }, [slug]);

  // =========================
  // LOAD PRODUCTS
  // =========================

  useEffect(() => {
    loadProducts(productPage, search);
  }, [productPage]);

  // =========================
  // GET BLOG
  // =========================

  async function loadBlog() {
    try {
      setLoading(true);

      const res = await fetch(`/api/blogs/${slug}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load blog");
      }

      const response = await res.json();

      const data = response.blog;

      if (!data) {
        alert("Blog not found");
        router.push("/admin/blogs");
        return;
      }

      setForm({
        title: data.title || "",
        slug: data.slug || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        cover_image: data.cover_image || "",
        category: data.category || "",
        author: data.author || "AnantaGo",

        tags: Array.isArray(data.tags)
          ? data.tags.join(", ")
          : data.tags || "",

        published: data.published !== false,

        featured: data.featured === true,
      });

      // =========================
      // SELECTED PRODUCTS
      // =========================

      if (Array.isArray(data.related_products)) {
        setSelectedProducts(
          data.related_products.map((id: any) => String(id))
        );
      } else {
        setSelectedProducts([]);
      }

      // =========================
      // ADDITIONAL IMAGES
      // =========================

      if (Array.isArray(data.additional_images)) {
        const images: BlogImage[] = data.additional_images
          .map((item: any, index: number) => {
            // New format:
            // { url, position }

            if (
              item &&
              typeof item === "object" &&
              typeof item.url === "string"
            ) {
              return {
                url: item.url,
                position:
                  typeof item.position === "number"
                    ? item.position
                    : index + 1,
              };
            }

            // Old format:
            // ["url1", "url2"]

            if (typeof item === "string") {
              return {
                url: item,
                position: index + 1,
              };
            }

            return null;
          })
          .filter(Boolean) as BlogImage[];

        setAdditionalImages(images);
      } else {
        setAdditionalImages([]);
      }
    } catch (error) {
      console.log("LOAD BLOG ERROR:", error);

      alert("Failed to load blog");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD PRODUCTS
  // =========================

  async function loadProducts(
    page: number,
    searchValue: string = search
  ) {
    try {
      setLoadingProducts(true);

      const from = (page - 1) * PRODUCTS_PER_PAGE;

      const to = from + PRODUCTS_PER_PAGE - 1;

      let query = supabase
        .from("products")
        .select("id,name,image,price", {
          count: "exact",
        })
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
        console.log("PRODUCT LOAD ERROR:", error);
        return;
      }

      setProducts(data || []);
      setTotalProducts(count || 0);
    } catch (error) {
      console.log("PRODUCT LOAD ERROR:", error);
    } finally {
      setLoadingProducts(false);
    }
  }

  // =========================
  // SEARCH PRODUCTS
  // =========================

  async function handleProductSearch(value: string) {
    setSearch(value);

    setProductPage(1);

    await loadProducts(1, value);
  }

  // =========================
  // SELECT PRODUCT
  // =========================

  function toggleProduct(id: string) {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  }

  // =========================
  // IMAGE UPLOAD
  // =========================

  async function uploadImage(file: File) {
    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${file.name.replace(
        /\s+/g,
        "-"
      )}`;

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // =========================
  // COVER IMAGE
  // =========================

  async function handleCoverUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const url = await uploadImage(file);

      setForm((prev) => ({
        ...prev,
        cover_image: url,
      }));
    } catch (error: any) {
      alert(
        error.message ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  // =========================
  // ADDITIONAL IMAGE UPLOAD
  // =========================

  async function handleAdditionalImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    try {
      setUploading(true);

      const newImages: BlogImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i]);

        newImages.push({
          url,

          // Default placement:
          // after last paragraph
          position: getParagraphCount() + 1,
        });
      }

      setAdditionalImages((prev) => [
        ...prev,
        ...newImages,
      ]);
    } catch (error: any) {
      alert(
        error.message ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);

      e.target.value = "";
    }
  }

  // =========================
  // REMOVE IMAGE
  // =========================

  function removeAdditionalImage(index: number) {
    setAdditionalImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  // =========================
  // IMAGE POSITION
  // =========================

  function updateImagePosition(
    index: number,
    position: number
  ) {
    setAdditionalImages((prev) =>
      prev.map((image, i) =>
        i === index
          ? {
              ...image,
              position,
            }
          : image
      )
    );
  }

  // =========================
  // PARAGRAPH COUNT
  // =========================

  function getParagraphCount() {
    if (!form.content.trim()) {
      return 1;
    }

    return form.content
      .split(/\n\s*\n/)
      .filter(
        (paragraph) => paragraph.trim()
      ).length;
  }

  // =========================
  // FORM CHANGE
  // =========================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
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

  // =========================
  // SLUG
  // =========================

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(/\s+/g, "-");
  }

  // =========================
  // CHANGE PRODUCT PAGE
  // =========================

  function changeProductPage(page: number) {
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

  // =========================
  // UPDATE BLOG
  // =========================

  async function updateBlog() {
    if (!form.title.trim()) {
      alert("Please enter a blog title.");
      return;
    }

    if (!form.content.trim()) {
      alert("Please write blog content.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/blogs/${slug}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...form,

            slug:
              form.slug ||
              generateSlug(form.title),

            tags: form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),

            related_products:
              selectedProducts,

            additional_images:
              additionalImages,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          "Blog updated successfully!"
        );

        router.push("/admin/blogs");

        router.refresh();
      } else {
        alert(
          data.message ||
            "Failed to update blog"
        );
      }
    } catch (error) {
      console.log(
        "UPDATE BLOG ERROR:",
        error
      );

      alert(
        "Something went wrong while updating the blog."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="p-6 max-w-5xl mx-auto">
        <div
          className="
            bg-white
            border
            rounded-xl
            p-8
            text-center
            text-gray-500
          "
        >
          Loading blog...
        </div>
      </main>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <main
      className="
        p-4
        sm:p-6
        max-w-6xl
        mx-auto
      "
    >
      <div
        className="
          flex
          justify-between
          items-center
          gap-4
          flex-wrap
          mb-8
        "
      >
        <h1
          className="
            text-2xl
            sm:text-3xl
            font-bold
          "
        >
          ✏️ Edit Blog
        </h1>

        <button
          type="button"
          onClick={() =>
            router.push("/admin/blogs")
          }
          className="
            border
            px-4
            py-2
            rounded-lg
            font-semibold
            hover:bg-gray-100
          "
        >
          ← Back
        </button>
      </div>

      <div className="space-y-6">

        {/* TITLE */}

        <div>
          <label
            className="
              block
              font-semibold
              mb-2
            "
          >
            Blog Title
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="
              border
              p-3
              w-full
              rounded-lg
            "
          />
        </div>

        {/* SLUG */}

        <div>
          <label
            className="
              block
              font-semibold
              mb-2
            "
          >
            Slug
          </label>

          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="
              border
              p-3
              w-full
              rounded-lg
            "
          />
        </div>

        {/* CATEGORY */}

        <div>
          <label
            className="
              block
              font-semibold
              mb-2
            "
          >
            Category
          </label>

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="
              border
              p-3
              w-full
              rounded-lg
            "
          />
        </div>

        {/* TAGS */}

        <div>
          <label
            className="
              block
              font-semibold
              mb-2
            "
          >
            Tags
          </label>

          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="technology, gadgets, deals"
            className="
              border
              p-3
              w-full
              rounded-lg
            "
          />
        </div>

        {/* COVER IMAGE */}

        <section
          className="
            border
            rounded-xl
            p-5
          "
        >
          <h2
            className="
              text-xl
              font-bold
              mb-4
            "
          >
            🖼️ Cover Image
          </h2>

          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="
              border
              p-3
              w-full
              rounded-lg
            "
          />

          {form.cover_image && (
            <div className="mt-4">
              <img
                src={form.cover_image}
                alt="Cover"
                className="
                  w-full
                  max-w-3xl
                  mx-auto
                  rounded-xl
                  max-h-[420px]
                  object-cover
                "
              />
            </div>
          )}
        </section>

        {/* EXCERPT */}

        <div>
          <label
            className="
              block
              font-semibold
              mb-2
            "
          >
            Short Description
          </label>

          <textarea
            name="excerpt"
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
        </div>

        {/* CONTENT */}

        <div>
          <label
            className="
              block
              font-semibold
              mb-2
            "
          >
            Blog Content
          </label>

          <p
            className="
              text-sm
              text-gray-500
              mb-2
            "
          >
            Separate paragraphs with a blank
            line. Images can be placed after
            any paragraph below.
          </p>

          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="
              border
              p-3
              w-full
              rounded-lg
              h-[500px]
              leading-7
            "
          />
        </div>

        {/* ADDITIONAL IMAGES */}

        <section
          className="
            border
            rounded-xl
            p-5
            bg-white
          "
        >
          <div className="mb-5">
            <h2
              className="
                text-xl
                font-bold
              "
            >
              📸 Additional Blog Images
            </h2>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Upload multiple images and choose
              exactly where each image should appear.
            </p>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={
              handleAdditionalImageUpload
            }
            className="
              border
              p-3
              w-full
              rounded-lg
            "
          />

          {uploading && (
            <p
              className="
                mt-3
                text-sm
                text-gray-500
              "
            >
              Uploading images...
            </p>
          )}

          {additionalImages.length > 0 && (
            <div
              className="
                mt-6
                space-y-5
              "
            >
              {additionalImages.map(
                (image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="
                      border
                      rounded-xl
                      p-4
                      bg-gray-50
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        gap-4
                      "
                    >
                      <img
                        src={image.url}
                        alt={`Blog image ${
                          index + 1
                        }`}
                        className="
                          w-full
                          sm:w-48
                          h-32
                          object-cover
                          rounded-lg
                        "
                      />

                      <div className="flex-1">
                        <p
                          className="
                            font-semibold
                            mb-2
                          "
                        >
                          Image {index + 1}
                        </p>

                        <label
                          className="
                            block
                            text-sm
                            font-medium
                            mb-2
                          "
                        >
                          Place image after:
                        </label>

                        <select
                          value={
                            image.position
                          }
                          onChange={(e) =>
                            updateImagePosition(
                              index,
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="
                            border
                            p-3
                            rounded-lg
                            w-full
                            bg-white
                          "
                        >
                          {Array.from(
                            {
                              length:
                                getParagraphCount() +
                                1,
                            },
                            (_, i) => (
                              <option
                                key={i}
                                value={i + 1}
                              >
                                {i === 0
                                  ? "Before first paragraph"
                                  : `After paragraph ${i}`}
                              </option>
                            )
                          )}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            removeAdditionalImage(
                              index
                            )
                          }
                          className="
                            mt-3
                            bg-red-600
                            text-white
                            px-4
                            py-2
                            rounded-lg
                            text-sm
                            font-semibold
                          "
                        >
                          🗑️ Remove Image
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {additionalImages.length === 0 && (
            <div
              className="
                mt-5
                p-5
                border
                border-dashed
                rounded-lg
                text-center
                text-gray-500
              "
            >
              No additional images added yet.
            </div>
          )}
        </section>

        {/* PRODUCTS */}

        <section
          className="
            border
            rounded-xl
            p-5
            bg-white
          "
        >
          <div
            className="
              flex
              justify-between
              items-center
              gap-4
              flex-wrap
              mb-4
            "
          >
            <div>
              <h2
                className="
                  text-xl
                  font-bold
                "
              >
                🛒 Related Products
              </h2>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >
                Latest products appear first.
                Select products to show in the blog.
              </p>
            </div>

            <div
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
            placeholder="🔍 Search products..."
            className="
              border
              p-3
              w-full
              rounded-lg
              mb-5
            "
          />

          <div
            className="
              text-sm
              text-gray-500
              mb-4
            "
          >
            {search
              ? "Search results"
              : "Latest products"}

            {" — "}

            Page {productPage} of{" "}
            {totalProductPages || 1}
          </div>

          {/* PRODUCTS */}

          {loadingProducts ? (
            <div
              className="
                p-8
                border
                rounded-lg
                text-center
                text-gray-500
              "
            >
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div
              className="
                p-8
                border
                rounded-lg
                text-center
                text-gray-500
              "
            >
              No products found.
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-4
              "
            >
              {products.map((product) => {
                const selected =
                  selectedProducts.includes(
                    String(product.id)
                  );

                return (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() =>
                      toggleProduct(
                        String(product.id)
                      )
                    }
                    className={`
                      text-left
                      border
                      rounded-xl
                      overflow-hidden
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
                        src={product.image}
                        alt={product.name}
                        className="
                          w-full
                          h-36
                          object-contain
                          bg-gray-50
                          p-2
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-full
                          h-36
                          bg-gray-100
                          flex
                          items-center
                          justify-center
                          text-gray-400
                        "
                      >
                        No Image
                      </div>
                    )}

                    <div className="p-3">
                      <div
                        className="
                          flex
                          items-start
                          gap-2
                        "
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                        />

                        <h3
                          className="
                            font-semibold
                            text-sm
                            line-clamp-2
                          "
                        >
                          {product.name}
                        </h3>
                      </div>

                      {product.price !==
                        undefined && (
                        <p
                          className="
                            mt-2
                            font-bold
                          "
                        >
                          ₹{product.price}
                        </p>
                      )}

                      {selected && (
                        <div
                          className="
                            mt-2
                            text-xs
                            font-semibold
                            text-green-600
                          "
                        >
                          ✓ Selected
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}

          {totalProductPages > 1 && (
            <div
              className="
                mt-6
                flex
                justify-center
                items-center
                gap-3
                flex-wrap
              "
            >
              <button
                type="button"
                disabled={productPage === 1}
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

              <span
                className="
                  px-4
                  py-2
                  bg-gray-100
                  rounded-lg
                  font-semibold
                "
              >
                {productPage} /{" "}
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

          {selectedProducts.length > 0 && (
            <div
              className="
                mt-6
                bg-green-50
                border
                border-green-200
                rounded-lg
                p-4
              "
            >
              <p
                className="
                  font-semibold
                  text-green-800
                "
              >
                ✅ {selectedProducts.length} product(s)
                selected
              </p>

              <p
                className="
                  text-sm
                  text-green-700
                  mt-1
                "
              >
                You can move through product pages
                without losing your selections.
              </p>
            </div>
          )}
        </section>

        {/* FEATURED */}

        <label
          className="
            flex
            gap-2
            items-center
            font-medium
          "
        >
          <input
            type="checkbox"
            checked={form.featured}
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

        <label
          className="
            flex
            gap-2
            items-center
            font-medium
          "
        >
          <input
            type="checkbox"
            checked={form.published}
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
          onClick={updateBlog}
          disabled={saving || uploading}
          className="
            bg-black
            text-white
            px-7
            py-3
            rounded-lg
            font-semibold
            hover:bg-gray-800
            disabled:opacity-50
          "
        >
          {saving
            ? "Updating Blog..."
            : uploading
            ? "Uploading..."
            : "💾 Update Blog"}
        </button>
      </div>

      {/* =========================
          PREVIEW
      ========================== */}

      <section
        className="
          mt-10
          border
          rounded-xl
          p-6
          bg-gray-50
        "
      >
        <h2
          className="
            text-xl
            font-bold
            mb-5
          "
        >
          👀 Blog Preview
        </h2>

        <h3
          className="
            text-2xl
            font-bold
          "
        >
          {form.title || "Blog Title"}
        </h3>

        <p
          className="
            text-sm
            text-gray-500
            mt-2
          "
        >
          {form.category || "Category"} •{" "}
          {form.author}
        </p>

        {/* UPDATED COVER PREVIEW */}

        {form.cover_image && (
          <img
            src={form.cover_image}
            alt="Preview"
            className="
              w-full
              max-w-3xl
              mx-auto
              rounded-xl
              mt-4
              max-h-[420px]
              object-cover
            "
          />
        )}

        <p
          className="
            mt-6
            whitespace-pre-line
            leading-7
            text-gray-700
          "
        >
          {form.content ||
            "Blog content will appear here..."}
        </p>

        {additionalImages.length > 0 && (
          <div
            className="
              mt-8
              space-y-6
            "
          >
            <h3
              className="
                text-lg
                font-bold
              "
            >
              📸 Additional Images
            </h3>

            {additionalImages
              .slice()
              .sort(
                (a, b) =>
                  a.position -
                  b.position
              )
              .map((image, index) => (
                <div
                  key={index}
                  className="
                    border
                    rounded-xl
                    p-3
                    bg-white
                  "
                >
                  <p
                    className="
                      text-xs
                      text-gray-500
                      mb-2
                    "
                  >
                    After paragraph{" "}
                    {image.position}
                  </p>

                  {/* UPDATED ADDITIONAL IMAGE PREVIEW */}

                  <img
                    src={image.url}
                    alt={`Additional ${
                      index + 1
                    }`}
                    className="
                      w-full
                      max-w-3xl
                      mx-auto
                      max-h-[420px]
                      rounded-lg
                      object-contain
                    "
                  />
                </div>
              ))}
          </div>
        )}

        {selectedProducts.length > 0 && (
          <div className="mt-8">
            <h3
              className="
                font-semibold
                text-lg
                mb-3
              "
            >
              🛒 Related Products
            </h3>

            <p
              className="
                text-sm
                text-gray-500
              "
            >
              {selectedProducts.length} products
              linked to this blog.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

