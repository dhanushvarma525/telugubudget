"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type TextBlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3";

type TextBlock = {
  type: "text";
  content: string;
  headingType: TextBlockType;
};

type ImageBlock = {
  type: "image";
  url: string;
  alt: string;
};

type ContentBlock =
  | TextBlock
  | ImageBlock;

type BlogImage = {
  url: string;
  position: number;
};

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

/* =========================================================
   PAGE
========================================================= */

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();

  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : String(params?.slug || "");

  /* =======================================================
     BLOG
  ======================================================= */

  const [blogId, setBlogId] = useState<
    string | number | null
  >(null);

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

  const [contentBlocks, setContentBlocks] =
    useState<ContentBlock[]>([
      {
        type: "text",
        content: "",
        headingType: "paragraph",
      },
    ]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [uploadingCover, setUploadingCover] =
    useState(false);

  const [uploadingBlockIndex, setUploadingBlockIndex] =
    useState<number | null>(null);

  const [showPreview, setShowPreview] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  /* =======================================================
     LOAD BLOG
  ======================================================= */

  useEffect(() => {
    if (!slug) return;

    loadBlog();
  }, [slug]);

  /* =======================================================
     GET BLOG
  ======================================================= */

  async function loadBlog() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/blogs/${slug}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load blog"
        );
      }

      const result =
        await response.json();

      const blog = result.blog;

      if (!blog) {
        alert("Blog not found");
        router.push("/admin/blogs");
        return;
      }

      setBlogId(blog.id);

      setForm({
        title: blog.title || "",
        slug: blog.slug || "",
        excerpt: blog.excerpt || "",
        category: blog.category || "",
        author: blog.author || "AnantaGo",

        tags: Array.isArray(blog.tags)
          ? blog.tags.join(", ")
          : blog.tags || "",

        cover_image:
          blog.cover_image || "",

        published:
          blog.published !== false,

        featured:
          blog.featured === true,
      });

      /* =====================================================
         CONTENT BLOCKS
      ===================================================== */

      if (
        Array.isArray(
          blog.content_blocks
        ) &&
        blog.content_blocks.length > 0
      ) {
        const normalizedBlocks =
          blog.content_blocks
            .map(
              (
                block: any
              ): ContentBlock | null => {
                if (!block) {
                  return null;
                }

                /* IMAGE */

                if (
                  block.type ===
                  "image"
                ) {
                  if (
                    typeof block.url !==
                      "string" ||
                    !block.url.trim()
                  ) {
                    return null;
                  }

                  return {
                    type: "image",
                    url: block.url,
                    alt:
                      typeof block.alt ===
                      "string"
                        ? block.alt
                        : "",
                  };
                }

                /* TEXT */

                if (
                  block.type ===
                  "text"
                ) {
                  return {
                    type: "text",

                    content:
                      typeof block.content ===
                      "string"
                        ? block.content
                        : "",

                    headingType:
                      block.headingType ===
                        "h1" ||
                      block.headingType ===
                        "h2" ||
                      block.headingType ===
                        "h3" ||
                      block.headingType ===
                        "paragraph"
                        ? block.headingType
                        : "paragraph",
                  };
                }

                return null;
              }
            )
            .filter(
              Boolean
            ) as ContentBlock[];

        if (
          normalizedBlocks.length >
          0
        ) {
          setContentBlocks(
            normalizedBlocks
          );
        }
      } else {
        /* ===================================================
           OLD BLOG COMPATIBILITY
        =================================================== */

        if (
          typeof blog.content ===
            "string" &&
          blog.content.trim()
        ) {
          setContentBlocks([
            {
              type: "text",
              content:
                blog.content,
              headingType:
                "paragraph",
            },
          ]);
        } else {
          setContentBlocks([
            {
              type: "text",
              content: "",
              headingType:
                "paragraph",
            },
          ]);
        }
      }
    } catch (error) {
      console.error(
        "LOAD BLOG ERROR:",
        error
      );

      alert(
        "Failed to load blog"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  async function uploadImage(
    file: File
  ): Promise<string | null> {
    try {
      if (!file) {
        return null;
      }

      /* TYPE */

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        alert(
          "Only JPG, PNG, WEBP and GIF images are allowed."
        );

        return null;
      }

      /* SIZE */

      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {
        alert(
          "Image must be 10MB or smaller."
        );

        return null;
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "folder",
        "articles"
      );

      const response =
        await fetch(
          "/api/blogs/blog-images/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Image upload failed."
        );
      }

      if (
        !result.success ||
        !result.url
      ) {
        throw new Error(
          "Image URL was not returned."
        );
      }

      return result.url;
    } catch (error: any) {
      console.error(
        "IMAGE UPLOAD ERROR:",
        error
      );

      alert(
        error?.message ||
          "Image upload failed."
      );

      return null;
    }
  }

  /* =======================================================
     COVER IMAGE
  ======================================================= */

  async function handleCoverUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingCover(true);

      const url =
        await uploadImage(file);

      if (url) {
        setForm(
          (prev) => ({
            ...prev,
            cover_image:
              url,
          })
        );
      }
    } finally {
      setUploadingCover(false);

      e.target.value = "";
    }
  }

  function removeCoverImage() {
    setForm(
      (prev) => ({
        ...prev,
        cover_image: "",
      })
    );
  }

  /* =======================================================
     CONTENT IMAGE
  ======================================================= */

  async function handleBlockImageUpload(
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingBlockIndex(
        index
      );

      const url =
        await uploadImage(file);

      if (url) {
        setContentBlocks(
          (prev) => {
            const updated = [
              ...prev,
            ];

            const block =
              updated[index];

            if (
              block &&
              block.type ===
                "image"
            ) {
              updated[index] =
                {
                  ...block,
                  url,
                };
            }

            return updated;
          }
        );
      }
    } finally {
      setUploadingBlockIndex(
        null
      );

      e.target.value = "";
    }
  }

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) {
    const {
      name,
      value,
    } = e.target;

    setForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  }

  /* =======================================================
     SLUG
  ======================================================= */

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
      )
      .replace(
        /-+/g,
        "-"
      );
  }

  /* =======================================================
     ADD TEXT
  ======================================================= */

  function addTextBlock(
    afterIndex?: number
  ) {
    const newBlock: TextBlock =
      {
        type: "text",
        content: "",
        headingType:
          "paragraph",
      };

    setContentBlocks(
      (prev) => {
        if (
          afterIndex ===
          undefined
        ) {
          return [
            ...prev,
            newBlock,
          ];
        }

        const updated = [
          ...prev,
        ];

        updated.splice(
          afterIndex + 1,
          0,
          newBlock
        );

        return updated;
      }
    );
  }

  /* =======================================================
     ADD IMAGE
  ======================================================= */

  function addImageBlock(
    afterIndex?: number
  ) {
    const newBlock: ImageBlock =
      {
        type: "image",
        url: "",
        alt: "",
      };

    setContentBlocks(
      (prev) => {
        if (
          afterIndex ===
          undefined
        ) {
          return [
            ...prev,
            newBlock,
          ];
        }

        const updated = [
          ...prev,
        ];

        updated.splice(
          afterIndex + 1,
          0,
          newBlock
        );

        return updated;
      }
    );
  }

  /* =======================================================
     UPDATE TEXT
  ======================================================= */

  function updateTextBlock(
    index: number,
    value: string
  ) {
    setContentBlocks(
      (prev) => {
        const updated = [
          ...prev,
        ];

        const block =
          updated[index];

        if (
          block &&
          block.type ===
            "text"
        ) {
          updated[index] =
            {
              ...block,
              content:
                value,
            };
        }

        return updated;
      }
    );
  }

  /* =======================================================
     UPDATE TEXT TYPE
  ======================================================= */

  function updateTextBlockType(
    index: number,
    headingType: TextBlockType
  ) {
    setContentBlocks(
      (prev) => {
        const updated = [
          ...prev,
        ];

        const block =
          updated[index];

        if (
          block &&
          block.type ===
            "text"
        ) {
          updated[index] =
            {
              ...block,
              headingType,
            };
        }

        return updated;
      }
    );
  }

  /* =======================================================
     UPDATE ALT
  ======================================================= */

  function updateImageAlt(
    index: number,
    value: string
  ) {
    setContentBlocks(
      (prev) => {
        const updated = [
          ...prev,
        ];

        const block =
          updated[index];

        if (
          block &&
          block.type ===
            "image"
        ) {
          updated[index] =
            {
              ...block,
              alt: value,
            };
        }

        return updated;
      }
    );
  }

  /* =======================================================
     DELETE BLOCK
  ======================================================= */

  function deleteBlock(
    index: number
  ) {
    setContentBlocks(
      (prev) => {
        const updated =
          prev.filter(
            (_, i) =>
              i !== index
          );

        if (
          updated.length ===
          0
        ) {
          return [
            {
              type: "text",
              content: "",
              headingType:
                "paragraph",
            },
          ];
        }

        return updated;
      }
    );
  }

  /* =======================================================
     MOVE UP
  ======================================================= */

  function moveBlockUp(
    index: number
  ) {
    if (
      index === 0
    ) {
      return;
    }

    setContentBlocks(
      (prev) => {
        const updated = [
          ...prev,
        ];

        [
          updated[
            index - 1
          ],
          updated[index],
        ] = [
          updated[index],
          updated[
            index - 1
          ],
        ];

        return updated;
      }
    );
  }

  /* =======================================================
     MOVE DOWN
  ======================================================= */

  function moveBlockDown(
    index: number
  ) {
    setContentBlocks(
      (prev) => {
        if (
          index >=
          prev.length - 1
        ) {
          return prev;
        }

        const updated = [
          ...prev,
        ];

        [
          updated[index],
          updated[
            index + 1
          ],
        ] = [
          updated[
            index + 1
          ],
          updated[index],
        ];

        return updated;
      }
    );
  }

  /* =======================================================
     CLEAN BLOCKS
  ======================================================= */

  function getCleanBlocks() {
    return contentBlocks.filter(
      (block) => {
        if (
          block.type ===
          "text"
        ) {
          return Boolean(
            block.content.trim()
          );
        }

        if (
          block.type ===
          "image"
        ) {
          return Boolean(
            block.url.trim()
          );
        }

        return false;
      }
    );
  }

  /* =======================================================
     PLAIN TEXT
  ======================================================= */

  function getPlainText(
    blocks: ContentBlock[]
  ) {
    return blocks
      .filter(
        (
          block
        ) =>
          block.type ===
          "text"
      )
      .map(
        (
          block
        ) =>
          block.content
      )
      .join("\n\n");
  }

  /* =======================================================
     ADDITIONAL IMAGES
  ======================================================= */

  function getAdditionalImages(
    blocks: ContentBlock[]
  ): BlogImage[] {
    return blocks
      .filter(
        (
          block
        ): block is ImageBlock =>
          block.type ===
          "image"
      )
      .map(
        (
          block,
          index
        ) => ({
          url: block.url,
          position:
            index + 1,
        })
      );
  }

  /* =======================================================
     UPDATE BLOG
  ======================================================= */

  async function updateBlog() {
    if (!blogId) {
      alert(
        "Blog ID is missing."
      );
      return;
    }

    if (
      !form.title.trim()
    ) {
      alert(
        "Please enter a blog title."
      );
      return;
    }

    const cleanBlocks =
      getCleanBlocks();

    const hasText =
      cleanBlocks.some(
        (block) =>
          block.type ===
            "text" &&
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

      const plainText =
        getPlainText(
          cleanBlocks
        );

      const additionalImages =
        getAdditionalImages(
          cleanBlocks
        );

      const finalSlug =
        form.slug.trim() ||
        generateSlug(
          form.title
        );

      const payload = {
        id: blogId,

        title:
          form.title.trim(),

        slug: finalSlug,

        excerpt:
          form.excerpt.trim(),

        content:
          plainText,

        cover_image:
          form.cover_image,

        content_blocks:
          cleanBlocks,

        additional_images:
          additionalImages,

        category:
          form.category.trim(),

        author:
          form.author.trim(),

        tags:
          form.tags
            .split(",")
            .map(
              (tag) =>
                tag.trim()
            )
            .filter(
              Boolean
            ),

        published:
          form.published,

        featured:
          form.featured,
      };

      console.log(
        "UPDATING BLOG:",
        payload
      );

      const response =
        await fetch(
          `/api/blogs/${slug}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to update blog"
        );
      }

      alert(
        "Blog updated successfully!"
      );

      router.push(
        "/admin/blogs"
      );

      router.refresh();
    } catch (error: any) {
      console.error(
        "UPDATE BLOG ERROR:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong while updating the blog."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE BLOG
  ======================================================= */

  async function deleteBlog() {
    if (!blogId || !slug) {
      alert(
        "Blog information is missing."
      );
      return;
    }

    try {
      setDeleting(true);

      const response =
        await fetch(
          `/api/blogs/${slug}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to delete blog"
        );
      }

      alert(
        "Blog deleted successfully."
      );

      router.push(
        "/admin/blogs"
      );

      router.refresh();
    } catch (error: any) {
      console.error(
        "DELETE BLOG ERROR:",
        error
      );

      alert(
        error?.message ||
          "Failed to delete blog."
      );
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  /* =======================================================
     PREVIEW BLOCK
  ======================================================= */

  function renderPreviewBlock(
    block: ContentBlock,
    index: number
  ) {
    if (
      block.type ===
      "image"
    ) {
      if (!block.url) {
        return null;
      }

      return (
        <figure
          key={index}
          className="my-8"
        >
          <img
            src={block.url}
            alt={
              block.alt ||
              form.title
            }
            className="
              w-full
              rounded-2xl
              object-cover
              shadow-sm
            "
          />

          {block.alt && (
            <figcaption
              className="
                text-center
                text-sm
                text-gray-500
                mt-2
              "
            >
              {block.alt}
            </figcaption>
          )}
        </figure>
      );
    }

    if (
      block.headingType ===
      "h1"
    ) {
      return (
        <h1
          key={index}
          className="
            text-3xl
            sm:text-4xl
            font-bold
            text-gray-900
            mt-10
            mb-5
          "
        >
          {block.content}
        </h1>
      );
    }

    if (
      block.headingType ===
      "h2"
    ) {
      return (
        <h2
          key={index}
          className="
            text-2xl
            sm:text-3xl
            font-bold
            text-gray-900
            mt-10
            mb-4
          "
        >
          {block.content}
        </h2>
      );
    }

    if (
      block.headingType ===
      "h3"
    ) {
      return (
        <h3
          key={index}
          className="
            text-xl
            sm:text-2xl
            font-semibold
            text-gray-900
            mt-8
            mb-3
          "
        >
          {block.content}
        </h3>
      );
    }

    return (
      <p
        key={index}
        className="
          text-base
          sm:text-lg
          leading-8
          text-gray-700
          whitespace-pre-line
          mb-5
        "
      >
        {block.content}
      </p>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <div
          className="
            bg-white
            border
            rounded-2xl
            p-10
            text-center
            text-gray-500
          "
        >
          Loading blog...
        </div>
      </main>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <main
        className="
          max-w-7xl
          mx-auto
          p-4
          sm:p-6
          pb-32
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-4
            mb-8
          "
        >
          <div>
            <h1
              className="
                text-2xl
                sm:text-3xl
                font-bold
                text-gray-900
              "
            >
              ✏️ Edit Blog
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Update your article,
              preview it, publish it
              or delete it.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/blogs"
                )
              }
              className="
                px-5
                py-3
                rounded-xl
                border
                border-gray-300
                bg-white
                text-gray-900
                font-semibold
                hover:bg-gray-50
              "
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() =>
                setShowPreview(
                  true
                )
              }
              className="
                px-5
                py-3
                rounded-xl
                border
                border-gray-300
                bg-white
                text-gray-900
                font-semibold
                hover:bg-gray-50
              "
            >
              👁 Preview
            </button>

            <button
              type="button"
              onClick={
                updateBlog
              }
              disabled={
                saving ||
                deleting
              }
              className="
                px-6
                py-3
                rounded-xl
                bg-black
                text-white
                font-semibold
                hover:bg-gray-800
                disabled:opacity-50
              "
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* =================================================
              ARTICLE DETAILS
          ================================================= */}

          <section
            className="
              bg-white
              border
              rounded-2xl
              p-5
              sm:p-7
              shadow-sm
            "
          >
            <h2
              className="
                text-xl
                font-bold
                mb-5
              "
            >
              Article Details
            </h2>

            <div className="space-y-5">

              {/* TITLE */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-2
                  "
                >
                  Title
                </label>

                <input
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter blog title"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-3.5
                    outline-none
                    focus:ring-2
                    focus:ring-black
                  "
                />
              </div>

              {/* SLUG */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-2
                  "
                >
                  Slug
                </label>

                <input
                  name="slug"
                  value={
                    form.slug
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="blog-slug"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-3.5
                    outline-none
                    focus:ring-2
                    focus:ring-black
                  "
                />

                <p
                  className="
                    text-xs
                    text-gray-500
                    mt-2
                  "
                >
                  Changing the slug
                  changes the article
                  URL.
                </p>
              </div>

              {/* EXCERPT */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-2
                  "
                >
                  Short Description
                </label>

                <textarea
                  name="excerpt"
                  value={
                    form.excerpt
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Short description of the article..."
                  className="
                    w-full
                    border
                    rounded-xl
                    p-3.5
                    resize-y
                    outline-none
                    focus:ring-2
                    focus:ring-black
                  "
                />
              </div>

              {/* CATEGORY / AUTHOR */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-5
                "
              >
                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      mb-2
                    "
                  >
                    Category
                  </label>

                  <input
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="AI, Tech, How-To..."
                    className="
                      w-full
                      border
                      rounded-xl
                      p-3.5
                      outline-none
                      focus:ring-2
                      focus:ring-black
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-semibold
                      mb-2
                    "
                  >
                    Author
                  </label>

                  <input
                    name="author"
                    value={
                      form.author
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      w-full
                      border
                      rounded-xl
                      p-3.5
                      outline-none
                      focus:ring-2
                      focus:ring-black
                    "
                  />
                </div>
              </div>

              {/* TAGS */}

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-2
                  "
                >
                  Tags
                </label>

                <input
                  name="tags"
                  value={
                    form.tags
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="AI, Gemini, Google, Technology"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-3.5
                    outline-none
                    focus:ring-2
                    focus:ring-black
                  "
                />
              </div>

              {/* OPTIONS */}

              <div
                className="
                  flex
                  flex-wrap
                  gap-6
                  pt-2
                "
              >
                <label
                  className="
                    flex
                    items-center
                    gap-2
                    cursor-pointer
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      form.published
                    }
                    onChange={(
                      e
                    ) =>
                      setForm(
                        (
                          prev
                        ) => ({
                          ...prev,
                          published:
                            e
                              .target
                              .checked,
                        })
                      )
                    }
                  />

                  <span className="text-sm font-medium">
                    Published
                  </span>
                </label>

                <label
                  className="
                    flex
                    items-center
                    gap-2
                    cursor-pointer
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      form.featured
                    }
                    onChange={(
                      e
                    ) =>
                      setForm(
                        (
                          prev
                        ) => ({
                          ...prev,
                          featured:
                            e
                              .target
                              .checked,
                        })
                      )
                    }
                  />

                  <span className="text-sm font-medium">
                    Featured
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* =================================================
              COVER IMAGE
          ================================================= */}

          <section
            className="
              bg-white
              border
              rounded-2xl
              p-5
              sm:p-7
              shadow-sm
            "
          >
            <div className="mb-5">
              <h2
                className="
                  text-xl
                  font-bold
                "
              >
                Cover Image
              </h2>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >
                Main image displayed
                at the beginning of
                the article.
              </p>
            </div>

            {form.cover_image && (
              <div className="mb-5">
                <div
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    bg-gray-50
                  "
                >
                  <img
                    src={
                      form.cover_image
                    }
                    alt={
                      form.title ||
                      "Cover image"
                    }
                    className="
                      w-full
                      max-h-[420px]
                      object-cover
                    "
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    removeCoverImage
                  }
                  className="
                    mt-3
                    px-4
                    py-2
                    rounded-xl
                    border
                    border-red-200
                    text-red-600
                    text-sm
                    font-semibold
                    hover:bg-red-50
                  "
                >
                  Remove Cover
                  Image
                </button>
              </div>
            )}

            <label
              className="
                inline-flex
                items-center
                justify-center
                px-5
                py-3
                rounded-xl
                bg-black
                text-white
                hover:bg-gray-800
                cursor-pointer
                font-semibold
                transition
              "
            >
              {uploadingCover
                ? "Uploading..."
                : form.cover_image
                ? "📷 Change Cover Image"
                : "📷 Select Cover Image"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={
                  handleCoverUpload
                }
                disabled={
                  uploadingCover
                }
                className="hidden"
              />
            </label>

            <p
              className="
                text-xs
                text-gray-500
                mt-3
              "
            >
              Select an image
              directly from your
              computer. JPG, PNG,
              WEBP or GIF up to
              10MB.
            </p>
          </section>

          {/* =================================================
              ARTICLE CONTENT
          ================================================= */}

          <section
            className="
              bg-white
              border
              rounded-2xl
              p-5
              sm:p-7
              shadow-sm
            "
          >
            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-4
                mb-6
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                  "
                >
                  Article Content
                </h2>

                <p
                  className="
                    text-sm
                    text-gray-500
                    mt-1
                  "
                >
                  Edit your article
                  section by section
                  and place images
                  between paragraphs.
                </p>
              </div>

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    addTextBlock()
                  }
                  className="
                    px-4
                    py-2.5
                    rounded-xl
                    bg-black
                    text-white
                    text-sm
                    font-semibold
                  "
                >
                  + Text
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addImageBlock()
                  }
                  className="
                    px-4
                    py-2.5
                    rounded-xl
                    bg-gray-100
                    text-gray-900
                    text-sm
                    font-semibold
                  "
                >
                  + Image
                </button>
              </div>
            </div>

            <div className="space-y-5">

              {contentBlocks.map(
                (
                  block,
                  index
                ) => (
                  <div
                    key={index}
                    className="
                      border
                      rounded-2xl
                      p-4
                      sm:p-5
                      bg-gray-50
                    "
                  >

                    {/* HEADER */}

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                        mb-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <span
                          className="
                            w-8
                            h-8
                            rounded-lg
                            bg-white
                            border
                            flex
                            items-center
                            justify-center
                            text-sm
                            font-bold
                          "
                        >
                          {index + 1}
                        </span>

                        <span
                          className="
                            text-sm
                            font-semibold
                            text-gray-700
                          "
                        >
                          {block.type ===
                          "image"
                            ? "Image"
                            : "Article Text"}
                        </span>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-1
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            moveBlockUp(
                              index
                            )
                          }
                          disabled={
                            index ===
                            0
                          }
                          className="
                            px-2.5
                            py-1.5
                            rounded-lg
                            border
                            bg-white
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
                            px-2.5
                            py-1.5
                            rounded-lg
                            border
                            bg-white
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
                            px-2.5
                            py-1.5
                            rounded-lg
                            border
                            bg-white
                            text-red-600
                          "
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* TEXT BLOCK */}

                    {block.type ===
                      "text" && (
                      <div className="space-y-3">

                        <select
                          value={
                            block.headingType
                          }
                          onChange={(
                            e
                          ) =>
                            updateTextBlockType(
                              index,
                              e.target
                                .value as TextBlockType
                            )
                          }
                          className="
                            border
                            rounded-xl
                            px-3
                            py-2.5
                            bg-white
                            text-sm
                            font-medium
                          "
                        >
                          <option value="paragraph">
                            Paragraph
                          </option>

                          <option value="h1">
                            H1 Heading
                          </option>

                          <option value="h2">
                            H2 Heading
                          </option>

                          <option value="h3">
                            H3 Heading
                          </option>
                        </select>

                        <textarea
                          value={
                            block.content
                          }
                          onChange={(
                            e
                          ) =>
                            updateTextBlock(
                              index,
                              e.target
                                .value
                            )
                          }
                          rows={
                            block.headingType ===
                            "paragraph"
                              ? 10
                              : 3
                          }
                          placeholder={
                            block.headingType ===
                            "paragraph"
                              ? "Write your article section here..."
                              : "Enter heading..."
                          }
                          className="
                            w-full
                            border
                            rounded-xl
                            p-4
                            bg-white
                            resize-y
                            outline-none
                            focus:ring-2
                            focus:ring-black
                          "
                        />
                      </div>
                    )}

                    {/* IMAGE BLOCK */}

                    {block.type ===
                      "image" && (
                      <div className="space-y-4">

                        {block.url && (
                          <div
                            className="
                              overflow-hidden
                              rounded-xl
                              border
                              bg-white
                            "
                          >
                            <img
                              src={
                                block.url
                              }
                              alt={
                                block.alt ||
                                form.title
                              }
                              className="
                                w-full
                                max-h-[420px]
                                object-cover
                              "
                            />
                          </div>
                        )}

                        <label
                          className="
                            inline-flex
                            items-center
                            justify-center
                            px-4
                            py-2.5
                            rounded-xl
                            bg-black
                            text-white
                            cursor-pointer
                            text-sm
                            font-semibold
                          "
                        >
                          {uploadingBlockIndex ===
                          index
                            ? "Uploading..."
                            : block.url
                            ? "📷 Change Image"
                            : "📷 Select Image From Computer"}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(
                              e
                            ) =>
                              handleBlockImageUpload(
                                index,
                                e
                              )
                            }
                            disabled={
                              uploadingBlockIndex ===
                              index
                            }
                            className="hidden"
                          />
                        </label>

                        <input
                          value={
                            block.alt
                          }
                          onChange={(
                            e
                          ) =>
                            updateImageAlt(
                              index,
                              e.target
                                .value
                            )
                          }
                          placeholder="Image alt text"
                          className="
                            w-full
                            border
                            rounded-xl
                            p-3
                            bg-white
                            text-sm
                          "
                        />
                      </div>
                    )}

                    {/* INSERT */}

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                        mt-5
                        pt-4
                        border-t
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          addTextBlock(
                            index
                          )
                        }
                        className="
                          px-3
                          py-2
                          rounded-lg
                          bg-white
                          border
                          text-xs
                          font-semibold
                        "
                      >
                        + Text After
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          addImageBlock(
                            index
                          )
                        }
                        className="
                          px-3
                          py-2
                          rounded-lg
                          bg-white
                          border
                          text-xs
                          font-semibold
                        "
                      >
                        + Image After
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* =================================================
              DANGER ZONE
          ================================================= */}

          <section
            className="
              bg-white
              border
              border-red-200
              rounded-2xl
              p-5
              sm:p-7
              shadow-sm
            "
          >
            <h2
              className="
                text-xl
                font-bold
                text-red-600
              "
            >
              Danger Zone
            </h2>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
                mb-5
              "
            >
              Deleting this article
              permanently removes it
              from your blog database.
              This action cannot be
              undone.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowDeleteConfirm(
                  true
                )
              }
              disabled={deleting}
              className="
                px-5
                py-3
                rounded-xl
                bg-red-600
                text-white
                font-semibold
                hover:bg-red-700
                disabled:opacity-50
              "
            >
              🗑 Delete This Blog
            </button>
          </section>

          {/* =================================================
              BOTTOM BUTTONS
          ================================================= */}

          <div
            className="
              flex
              flex-col
              sm:flex-row
              justify-end
              gap-3
            "
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/blogs"
                )
              }
              className="
                px-6
                py-3
                rounded-xl
                border
                bg-white
                font-semibold
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                setShowPreview(
                  true
                )
              }
              className="
                px-6
                py-3
                rounded-xl
                border
                font-semibold
                bg-white
              "
            >
              👁 Preview
            </button>

            <button
              type="button"
              onClick={
                updateBlog
              }
              disabled={
                saving ||
                deleting
              }
              className="
                px-7
                py-3
                rounded-xl
                bg-black
                text-white
                font-semibold
                disabled:opacity-50
              "
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </main>

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {showPreview && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/60
            p-3
            sm:p-6
            overflow-y-auto
          "
        >
          <div
            className="
              max-w-4xl
              mx-auto
              bg-white
              rounded-2xl
              min-h-full
              shadow-2xl
              overflow-hidden
            "
          >

            {/* PREVIEW HEADER */}

            <div
              className="
                sticky
                top-0
                z-10
                bg-white
                border-b
                px-5
                py-4
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <div
                  className="
                    text-xs
                    font-semibold
                    text-gray-500
                    uppercase
                    tracking-wide
                  "
                >
                  Article Preview
                </div>

                <div
                  className="
                    font-bold
                    text-gray-900
                  "
                >
                  {form.title ||
                    "Untitled Blog"}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPreview(
                    false
                  )
                }
                className="
                  w-10
                  h-10
                  rounded-full
                  bg-gray-100
                  hover:bg-gray-200
                  font-bold
                  text-lg
                "
              >
                ×
              </button>
            </div>

            {/* ARTICLE */}

            <article
              className="
                px-5
                sm:px-10
                py-8
              "
            >
              {form.category && (
                <div
                  className="
                    text-sm
                    font-bold
                    text-gray-500
                    mb-3
                  "
                >
                  {form.category}
                </div>
              )}

              <h1
                className="
                  text-3xl
                  sm:text-5xl
                  font-bold
                  leading-tight
                  text-gray-900
                  mb-5
                "
              >
                {form.title ||
                  "Untitled Blog"}
              </h1>

              {form.excerpt && (
                <p
                  className="
                    text-lg
                    sm:text-xl
                    leading-8
                    text-gray-600
                    mb-7
                  "
                >
                  {form.excerpt}
                </p>
              )}

              {form.cover_image && (
                <img
                  src={
                    form.cover_image
                  }
                  alt={
                    form.title
                  }
                  className="
                    w-full
                    max-h-[520px]
                    object-cover
                    rounded-2xl
                    mb-10
                  "
                />
              )}

              <div>
                {contentBlocks.map(
                  renderPreviewBlock
                )}
              </div>

              {form.author && (
                <div
                  className="
                    mt-12
                    pt-6
                    border-t
                    text-sm
                    text-gray-500
                  "
                >
                  Written by{" "}
                  <strong>
                    {form.author}
                  </strong>
                </div>
              )}
            </article>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {showDeleteConfirm && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            bg-black/60
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-md
              bg-white
              rounded-2xl
              shadow-2xl
              p-6
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-full
                bg-red-100
                flex
                items-center
                justify-center
                text-xl
                mb-4
              "
            >
              🗑
            </div>

            <h2
              className="
                text-xl
                font-bold
                text-gray-900
              "
            >
              Delete this blog?
            </h2>

            <p
              className="
                text-sm
                text-gray-600
                mt-2
                leading-6
              "
            >
              You are about to
              permanently delete:
            </p>

            <div
              className="
                mt-3
                p-3
                rounded-xl
                bg-gray-50
                border
                font-semibold
                text-gray-900
              "
            >
              {form.title}
            </div>

            <p
              className="
                text-sm
                text-red-600
                mt-4
                font-medium
              "
            >
              This action cannot be
              undone.
            </p>

            <div
              className="
                flex
                flex-col-reverse
                sm:flex-row
                justify-end
                gap-3
                mt-6
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
                disabled={deleting}
                className="
                  px-5
                  py-3
                  rounded-xl
                  border
                  bg-white
                  font-semibold
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  deleteBlog
                }
                disabled={deleting}
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-red-600
                  text-white
                  font-semibold
                  hover:bg-red-700
                  disabled:opacity-50
                "
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete Blog"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}