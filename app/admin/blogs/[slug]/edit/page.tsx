"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type TextBlockType = "paragraph" | "h1" | "h2" | "h3";

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

type CalloutBlock = {
  type: "callout";
  content: string;
  title?: string;
};

type QuoteBlock = {
  type: "quote";
  content: string;
  author?: string;
};

type ListBlock = {
  type:
    | "bullet-list"
    | "bullets"
    | "unordered-list"
    | "ordered-list"
    | "numbered-list";
  items: string[];
};

type TableBlock = {
  type: "table";
  headers: string[];
  rows: string[][];
};

type UnknownBlock = {
  type: string;
  [key: string]: any;
};

type ContentBlock =
  | TextBlock
  | ImageBlock
  | CalloutBlock
  | QuoteBlock
  | ListBlock
  | TableBlock
  | UnknownBlock;

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

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

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
     STATE
  ======================================================= */

  const [blogId, setBlogId] = useState<string | number | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    introduction: "",
    category: "",
    author: "AnantaGo",
    tags: "",
    cover_image: "",
    published: true,
    featured: false,
  });

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      type: "text",
      content: "",
      headingType: "paragraph",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBlockIndex, setUploadingBlockIndex] = useState<
    number | null
  >(null);

  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    if (!slug) return;

    loadBlog();
  }, [slug]);

  /* =======================================================
     NORMALIZE BLOCK
  ======================================================= */

  function normalizeBlock(block: any): ContentBlock | null {
    if (!block || typeof block !== "object") {
      return null;
    }

    /* IMAGE */

    if (block.type === "image") {
      return {
        type: "image",
        url:
          typeof block.url === "string"
            ? block.url
            : typeof block.src === "string"
            ? block.src
            : "",
        alt: typeof block.alt === "string" ? block.alt : "",
      };
    }

    /* TEXT */

    if (
      block.type === "text" ||
      block.type === "paragraph" ||
      block.type === "p"
    ) {
      return {
        type: "text",
        content:
          typeof block.content === "string"
            ? block.content
            : typeof block.text === "string"
            ? block.text
            : "",
        headingType:
          block.headingType === "h1" ||
          block.headingType === "h2" ||
          block.headingType === "h3"
            ? block.headingType
            : "paragraph",
      };
    }

    /* HEADINGS */

    if (
      block.type === "h1" ||
      block.type === "h2" ||
      block.type === "h3"
    ) {
      return {
        type: "text",
        content:
          typeof block.content === "string"
            ? block.content
            : typeof block.text === "string"
            ? block.text
            : "",
        headingType: block.type,
      };
    }

    /* CALLOUT */

    if (block.type === "callout") {
      return {
        type: "callout",
        title: typeof block.title === "string" ? block.title : "",
        content:
          typeof block.content === "string"
            ? block.content
            : typeof block.text === "string"
            ? block.text
            : "",
      };
    }

    /* QUOTE */

    if (block.type === "quote" || block.type === "blockquote") {
      return {
        type: "quote",
        content:
          typeof block.content === "string"
            ? block.content
            : typeof block.text === "string"
            ? block.text
            : "",
        author: typeof block.author === "string" ? block.author : "",
      };
    }

    /* LIST */

    if (
      block.type === "bullet-list" ||
      block.type === "bullets" ||
      block.type === "unordered-list" ||
      block.type === "ordered-list" ||
      block.type === "numbered-list"
    ) {
      const items = Array.isArray(block.items)
        ? block.items
            .map((item: any) => {
              if (typeof item === "string") {
                return item;
              }

              if (typeof item?.text === "string") {
                return item.text;
              }

              return "";
            })
            .filter(Boolean)
        : [];

      return {
        type: block.type,
        items,
      };
    }

    /* TABLE */

    if (block.type === "table") {
      return {
        type: "table",
        headers: Array.isArray(block.headers)
          ? block.headers.map(String)
          : [],
        rows: Array.isArray(block.rows)
          ? block.rows.map((row: any) =>
              Array.isArray(row) ? row.map(String) : []
            )
          : [],
      };
    }

    /* UNKNOWN */

    return {
      ...block,
    };
  }

  /* =======================================================
     LOAD BLOG
  ======================================================= */

  async function loadBlog() {
    try {
      setLoading(true);

      const response = await fetch(`/api/blogs/${slug}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load blog");
      }

      const result = await response.json();
      const blog = result?.blog;

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
        introduction: blog.introduction || "",
        category: blog.category || "",
        author: blog.author || "AnantaGo",
        tags: Array.isArray(blog.tags)
          ? blog.tags.join(", ")
          : blog.tags || "",
        cover_image: blog.cover_image || "",
        published: blog.published !== false,
        featured: blog.featured === true,
      });

      if (
        Array.isArray(blog.content_blocks) &&
        blog.content_blocks.length > 0
      ) {
        const normalized = blog.content_blocks
          .map(normalizeBlock)
          .filter(Boolean) as ContentBlock[];

        if (normalized.length > 0) {
          setContentBlocks(normalized);
        }
      } else if (
        typeof blog.content === "string" &&
        blog.content.trim()
      ) {
        setContentBlocks([
          {
            type: "text",
            content: blog.content,
            headingType: "paragraph",
          },
        ]);
      } else {
        setContentBlocks([
          {
            type: "text",
            content: "",
            headingType: "paragraph",
          },
        ]);
      }
    } catch (error) {
      console.error("LOAD BLOG ERROR:", error);
      alert("Failed to load blog.");
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  async function uploadImage(file: File): Promise<string | null> {
    try {
      if (!file) return null;

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        alert("Only JPG, PNG, WEBP and GIF images are allowed.");
        return null;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        alert("Image must be 10MB or smaller.");
        return null;
      }

      const formData = new FormData();

      formData.append("file", file);
      formData.append("folder", "articles");

      const response = await fetch(
        "/api/blogs/blog-images/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Image upload failed."
        );
      }

      if (!result.success || !result.url) {
        throw new Error("Image URL was not returned.");
      }

      return result.url;
    } catch (error: any) {
      console.error("IMAGE UPLOAD ERROR:", error);

      alert(error?.message || "Image upload failed.");

      return null;
    }
  }

  /* =======================================================
     COVER UPLOAD
  ======================================================= */

  async function handleCoverUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingCover(true);

      const url = await uploadImage(file);

      if (url) {
        setForm((prev) => ({
          ...prev,
          cover_image: url,
        }));
      }
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  }

  function removeCoverImage() {
    setForm((prev) => ({
      ...prev,
      cover_image: "",
    }));
  }

  /* =======================================================
     BLOCK IMAGE UPLOAD
  ======================================================= */

  async function handleBlockImageUpload(
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingBlockIndex(index);

      const url = await uploadImage(file);

      if (url) {
        setContentBlocks((prev) => {
          const updated = [...prev];
          const block = updated[index];

          if (block?.type === "image") {
            updated[index] = {
              ...block,
              url,
            };
          }

          return updated;
        });
      }
    } finally {
      setUploadingBlockIndex(null);
      e.target.value = "";
    }
  }

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* =======================================================
     SLUG
  ======================================================= */

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  /* =======================================================
     ADD TEXT
  ======================================================= */

  function addTextBlock(afterIndex?: number) {
    const block: TextBlock = {
      type: "text",
      content: "",
      headingType: "paragraph",
    };

    setContentBlocks((prev) => {
      if (afterIndex === undefined) {
        return [...prev, block];
      }

      const updated = [...prev];

      updated.splice(afterIndex + 1, 0, block);

      return updated;
    });
  }

  /* =======================================================
     ADD IMAGE
  ======================================================= */

  function addImageBlock(afterIndex?: number) {
    const block: ImageBlock = {
      type: "image",
      url: "",
      alt: "",
    };

    setContentBlocks((prev) => {
      if (afterIndex === undefined) {
        return [...prev, block];
      }

      const updated = [...prev];

      updated.splice(afterIndex + 1, 0, block);

      return updated;
    });
  }

  /* =======================================================
     ADD TABLE
  ======================================================= */

  function addTableBlock() {
    const block: TableBlock = {
      type: "table",
      headers: ["Feature", "Details"],
      rows: [["", ""]],
    };

    setContentBlocks((prev) => [...prev, block]);
  }

  /* =======================================================
     UPDATE TEXT
  ======================================================= */

  function updateTextBlock(
    index: number,
    value: string
  ) {
    setContentBlocks((prev) => {
      const updated = [...prev];
      const block = updated[index];

      if (block?.type === "text") {
        updated[index] = {
          ...block,
          content: value,
        };
      }

      return updated;
    });
  }

  function updateTextBlockType(
    index: number,
    headingType: TextBlockType
  ) {
    setContentBlocks((prev) => {
      const updated = [...prev];
      const block = updated[index];

      if (block?.type === "text") {
        updated[index] = {
          ...block,
          headingType,
        };
      }

      return updated;
    });
  }

  /* =======================================================
     IMAGE ALT
  ======================================================= */

  function updateImageAlt(
    index: number,
    value: string
  ) {
    setContentBlocks((prev) => {
      const updated = [...prev];
      const block = updated[index];

      if (block?.type === "image") {
        updated[index] = {
          ...block,
          alt: value,
        };
      }

      return updated;
    });
  }

  /* =======================================================
     DELETE BLOCK
  ======================================================= */

  function deleteBlock(index: number) {
    setContentBlocks((prev) => {
      const updated = prev.filter(
        (_, i) => i !== index
      );

      if (updated.length === 0) {
        return [
          {
            type: "text",
            content: "",
            headingType: "paragraph",
          },
        ];
      }

      return updated;
    });
  }

  /* =======================================================
     MOVE BLOCK
  ======================================================= */

  function moveBlockUp(index: number) {
    if (index === 0) return;

    setContentBlocks((prev) => {
      const updated = [...prev];

      [updated[index - 1], updated[index]] = [
        updated[index],
        updated[index - 1],
      ];

      return updated;
    });
  }

  function moveBlockDown(index: number) {
    setContentBlocks((prev) => {
      if (index >= prev.length - 1) {
        return prev;
      }

      const updated = [...prev];

      [updated[index], updated[index + 1]] = [
        updated[index + 1],
        updated[index],
      ];

      return updated;
    });
  }

  /* =======================================================
     TABLE HELPERS
  ======================================================= */

  function updateTableHeader(
    blockIndex: number,
    headerIndex: number,
    value: string
  ) {
    setContentBlocks((prev) => {
      const updated = [...prev];
      const block = updated[blockIndex];

      if (block?.type !== "table") {
        return prev;
      }

      const headers = [...block.headers];

      headers[headerIndex] = value;

      updated[blockIndex] = {
        ...block,
        headers,
      };

      return updated;
    });
  }

  function updateTableCell(
    blockIndex: number,
    rowIndex: number,
    cellIndex: number,
    value: string
  ) {
    setContentBlocks((prev) => {
      const updated = [...prev];
      const block = updated[blockIndex];

      if (block?.type !== "table") {
        return prev;
      }

      const rows = block.rows.map((row) => [...row]);

      if (!rows[rowIndex]) {
        return prev;
      }

      rows[rowIndex][cellIndex] = value;

      updated[blockIndex] = {
        ...block,
        rows,
      };

      return updated;
    });
  }

  function addTableColumn(blockIndex: number) {
    setContentBlocks((prev) => {
      const updated = [...prev];
      const block = updated[blockIndex];

      if (block?.type !== "table") {
        return prev;
      }

      updated[blockIndex] = {
        ...block,
        headers: [...block.headers, "New Column"],
        rows: block.rows.map((row) => [...row, ""]),
      };

      return updated;
    });
  }

  function addTableRow(blockIndex: number) {
    setContentBlocks((prev) => {
      const updated = [...prev];
      const block = updated[blockIndex];

      if (block?.type !== "table") {
        return prev;
      }

      updated[blockIndex] = {
        ...block,
        rows: [
          ...block.rows,
          block.headers.map(() => ""),
        ],
      };

      return updated;
    });
  }

  function deleteTableRow(
    blockIndex: number,
    rowIndex: number
  ) {
    setContentBlocks((prev) => {
      const updated = [...prev];
      const block = updated[blockIndex];

      if (block?.type !== "table") {
        return prev;
      }

      updated[blockIndex] = {
        ...block,
        rows: block.rows.filter(
          (_, index) => index !== rowIndex
        ),
      };

      return updated;
    });
  }

  /* =======================================================
     CLEAN BLOCKS
  ======================================================= */

  function getCleanBlocks() {
    return contentBlocks.filter((block) => {
      if (block.type === "text") {
        return Boolean(block.content?.trim());
      }

      if (block.type === "image") {
        return Boolean(block.url?.trim());
      }

      if (
        block.type === "callout" ||
        block.type === "quote"
      ) {
        return Boolean(block.content?.trim());
      }

      if (
        block.type === "bullet-list" ||
        block.type === "bullets" ||
        block.type === "unordered-list" ||
        block.type === "ordered-list" ||
        block.type === "numbered-list"
      ) {
        return (
          Array.isArray(block.items) &&
          block.items.some((item) => item.trim())
        );
      }

      if (block.type === "table") {
        return (
          block.headers.length > 0 &&
          block.rows.length > 0
        );
      }

      return true;
    });
  }

  /* =======================================================
     PLAIN TEXT
  ======================================================= */

  function getPlainText(
    blocks: ContentBlock[]
  ) {
    return blocks
      .map((block) => {
        if (block.type === "text") {
          return block.content;
        }

        if (
          block.type === "callout" ||
          block.type === "quote"
        ) {
          return block.content || "";
        }

        if (
          block.type === "bullet-list" ||
          block.type === "bullets" ||
          block.type === "unordered-list" ||
          block.type === "ordered-list" ||
          block.type === "numbered-list"
        ) {
          return Array.isArray(block.items)
            ? block.items.join("\n")
            : "";
        }

        if (block.type === "table") {
          return [
            block.headers.join(" | "),
            ...block.rows.map((row) =>
              row.join(" | ")
            ),
          ].join("\n");
        }

        return "";
      })
      .filter(Boolean)
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
        (block): block is ImageBlock =>
          block.type === "image" &&
          Boolean(block.url)
      )
      .map((block, index) => ({
        url: block.url,
        position: index + 1,
      }));
  }

  /* =======================================================
     UPDATE BLOG
  ======================================================= */

  async function updateBlog() {
    if (!blogId) {
      alert("Blog ID is missing.");
      return;
    }

    if (!form.title.trim()) {
      alert("Please enter a blog title.");
      return;
    }

    const cleanBlocks = getCleanBlocks();

    const hasText =
      Boolean(form.introduction.trim()) ||
      cleanBlocks.some(
        (block) =>
          block.type === "text" &&
          Boolean(block.content?.trim())
      );

    if (!hasText) {
      alert("Please write some blog content.");
      return;
    }

    try {
      setSaving(true);

      const plainText = getPlainText(cleanBlocks);

      const additionalImages =
        getAdditionalImages(cleanBlocks);

      const finalSlug =
        form.slug.trim() ||
        generateSlug(form.title);

      const payload = {
        id: blogId,

        title: form.title.trim(),

        slug: finalSlug,

        excerpt: form.excerpt.trim(),

        introduction:
          form.introduction.trim(),

        content: plainText,

        cover_image: form.cover_image,

        content_blocks: cleanBlocks,

        additional_images:
          additionalImages,

        category:
          form.category.trim(),

        author:
          form.author.trim(),

        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        published: form.published,

        featured: form.featured,
      };

      const response = await fetch(
        `/api/blogs/${slug}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to update blog"
        );
      }

      alert("Blog updated successfully!");

      router.push("/admin/blogs");
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
     DELETE
  ======================================================= */

  async function deleteBlog() {
    if (!blogId || !slug) {
      alert("Blog information is missing.");
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/blogs/${slug}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to delete blog"
        );
      }

      alert("Blog deleted successfully.");

      router.push("/admin/blogs");
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
    /* IMAGE */

    if (block.type === "image") {
      if (!block.url) return null;

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
            className="w-full rounded-2xl object-cover shadow-sm"
          />

          {block.alt && (
            <figcaption className="mt-2 text-center text-sm text-gray-500">
              {block.alt}
            </figcaption>
          )}
        </figure>
      );
    }

    /* TEXT */

    if (block.type === "text") {
      if (block.headingType === "h1") {
        return (
          <h1
            key={index}
            className="mb-5 mt-10 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            {block.content}
          </h1>
        );
      }

      if (block.headingType === "h2") {
        return (
          <h2
            key={index}
            className="mb-4 mt-10 text-2xl font-bold text-gray-900 sm:text-3xl"
          >
            {block.content}
          </h2>
        );
      }

      if (block.headingType === "h3") {
        return (
          <h3
            key={index}
            className="mb-3 mt-8 text-xl font-semibold text-gray-900 sm:text-2xl"
          >
            {block.content}
          </h3>
        );
      }

      return (
        <p
          key={index}
          className="mb-5 whitespace-pre-line text-base leading-8 text-gray-700 sm:text-lg"
        >
          {block.content}
        </p>
      );
    }

    /* CALLOUT */

    if (block.type === "callout") {
      return (
        <div
          key={index}
          className="my-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6"
        >
          {block.title && (
            <h3 className="mb-2 font-bold text-zinc-950">
              {block.title}
            </h3>
          )}

          <p className="whitespace-pre-line leading-7 text-zinc-700">
            {block.content}
          </p>
        </div>
      );
    }

    /* QUOTE */

    if (block.type === "quote") {
      return (
        <blockquote
          key={index}
          className="my-8 border-l-4 border-zinc-900 pl-5 text-xl font-medium italic leading-8 text-zinc-700"
        >
          “{block.content}”

          {block.author && (
            <footer className="mt-3 text-sm font-semibold not-italic text-zinc-500">
              — {block.author}
            </footer>
          )}
        </blockquote>
      );
    }

    /* LIST */

    if (
      block.type === "bullet-list" ||
      block.type === "bullets" ||
      block.type === "unordered-list"
    ) {
      return (
        <ul
          key={index}
          className="my-6 list-disc space-y-2 pl-7 text-lg leading-8 text-zinc-700"
        >
          {block.items.map(
            (item, itemIndex) => (
              <li key={itemIndex}>
                {item}
              </li>
            )
          )}
        </ul>
      );
    }

    if (
      block.type === "ordered-list" ||
      block.type === "numbered-list"
    ) {
      return (
        <ol
          key={index}
          className="my-6 list-decimal space-y-2 pl-7 text-lg leading-8 text-zinc-700"
        >
          {block.items.map(
            (item, itemIndex) => (
              <li key={itemIndex}>
                {item}
              </li>
            )
          )}
        </ol>
      );
    }

    /* TABLE */

    if (block.type === "table") {
      return (
        <div
          key={index}
          className="my-8 overflow-x-auto rounded-xl border"
        >
          <table className="w-full border-collapse text-sm">
            {block.headers.length > 0 && (
              <thead>
                <tr>
                  {block.headers.map(
                    (header, headerIndex) => (
                      <th
                        key={headerIndex}
                        className="border-b bg-zinc-100 px-4 py-3 text-left font-bold"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
            )}

            <tbody>
              {block.rows.map(
                (row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map(
                      (cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border-b px-4 py-3"
                        >
                          {cell}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
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
      <main className="mx-auto max-w-7xl p-4 pb-32 sm:p-6">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              ✏️ Edit Blog
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update your article, preview it,
              publish it or delete it.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                router.push("/admin/blogs")
              }
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() =>
                setShowPreview(true)
              }
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50"
            >
              👁 Preview
            </button>

            <button
              type="button"
              onClick={updateBlog}
              disabled={
                saving ||
                deleting
              }
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        </div>

        <div className="space-y-6">

          {/* ARTICLE DETAILS */}

          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7">

            <h2 className="mb-5 text-xl font-bold">
              Article Details
            </h2>

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-xl border p-3.5 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Slug
                </label>

                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="w-full rounded-xl border p-3.5 outline-none focus:ring-2 focus:ring-black"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Changing the slug changes the article URL.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Short Description
                </label>

                <textarea
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  rows={4}
                  className="w-full resize-y rounded-xl border p-3.5 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Introduction
                </label>

                <p className="mb-3 text-xs leading-5 text-gray-500">
                  This is the 7–8 line introduction shown immediately
                  after the article cover image.
                </p>

                <textarea
                  name="introduction"
                  value={form.introduction}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Write the introduction of your article..."
                  className="w-full resize-y rounded-xl border p-4 leading-7 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Category
                  </label>

                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="AI, Tech, How-To..."
                    className="w-full rounded-xl border p-3.5 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Author
                  </label>

                  <input
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    className="w-full rounded-xl border p-3.5 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tags
                </label>

                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="AI, Gemini, Google, Technology"
                  className="w-full rounded-xl border p-3.5 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-2">

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        published:
                          e.target.checked,
                      }))
                    }
                  />

                  <span className="text-sm font-medium">
                    Published
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        featured:
                          e.target.checked,
                      }))
                    }
                  />

                  <span className="text-sm font-medium">
                    Featured
                  </span>
                </label>

              </div>

            </div>
          </section>

          {/* COVER IMAGE */}

          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7">

            <h2 className="text-xl font-bold">
              Cover Image
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Main image displayed at the beginning of the article.
            </p>

            {form.cover_image && (
              <div className="mt-5">

                <div className="overflow-hidden rounded-2xl border bg-gray-50">
                  <img
                    src={form.cover_image}
                    alt={form.title || "Cover image"}
                    className="max-h-[420px] w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="mt-3 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove Cover Image
                </button>

              </div>
            )}

            <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800">

              {uploadingCover
                ? "Uploading..."
                : form.cover_image
                ? "📷 Change Cover Image"
                : "📷 Select Cover Image"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
                className="hidden"
              />

            </label>

          </section>

          {/* ARTICLE CONTENT */}

          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7">

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Article Content
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Edit your article section by section.
                  Images can be placed between sections.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    addTextBlock()
                  }
                  className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white"
                >
                  + Text
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addImageBlock()
                  }
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-900"
                >
                  + Image
                </button>

                <button
                  type="button"
                  onClick={addTableBlock}
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-900"
                >
                  + Table
                </button>

              </div>

            </div>

            <div className="space-y-5">

              {contentBlocks.map(
                (block, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border bg-gray-50 p-4 sm:p-5"
                  >

                    {/* BLOCK HEADER */}

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                      <div className="flex items-center gap-2">

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white text-sm font-bold">
                          {index + 1}
                        </span>

                        <span className="text-sm font-semibold text-gray-700">
                          {block.type === "image"
                            ? "Image"
                            : block.type === "callout"
                            ? "Callout"
                            : block.type === "quote"
                            ? "Quote"
                            : block.type === "table"
                            ? "Table"
                            : "Article Text"}
                        </span>

                      </div>

                      <div className="flex items-center gap-1">

                        <button
                          type="button"
                          onClick={() =>
                            moveBlockUp(index)
                          }
                          disabled={index === 0}
                          className="rounded-lg border bg-white px-2.5 py-1.5 disabled:opacity-30"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveBlockDown(index)
                          }
                          disabled={
                            index ===
                            contentBlocks.length - 1
                          }
                          className="rounded-lg border bg-white px-2.5 py-1.5 disabled:opacity-30"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteBlock(index)
                          }
                          className="rounded-lg border bg-white px-2.5 py-1.5 text-red-600"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                    {/* TEXT BLOCK */}

                    {block.type === "text" && (
                      <div className="space-y-3">

                        <select
                          value={block.headingType}
                          onChange={(e) =>
                            updateTextBlockType(
                              index,
                              e.target
                                .value as TextBlockType
                            )
                          }
                          className="rounded-xl border bg-white px-3 py-2.5 text-sm font-medium"
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
                          value={block.content}
                          onChange={(e) =>
                            updateTextBlock(
                              index,
                              e.target.value
                            )
                          }
                          rows={
                            block.headingType ===
                            "paragraph"
                              ? 10
                              : 3
                          }
                          placeholder="Write your article section here..."
                          className="w-full resize-y rounded-xl border bg-white p-4 leading-7 outline-none focus:ring-2 focus:ring-black"
                        />

                      </div>
                    )}

                    {/* IMAGE BLOCK */}

                    {block.type === "image" && (
                      <div className="space-y-4">

                        {block.url && (
                          <div className="overflow-hidden rounded-xl border bg-white">
                            <img
                              src={block.url}
                              alt={
                                block.alt ||
                                form.title
                              }
                              className="max-h-[420px] w-full object-cover"
                            />
                          </div>
                        )}

                        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">

                          {uploadingBlockIndex === index
                            ? "Uploading..."
                            : block.url
                            ? "📷 Change Image"
                            : "📷 Select Image"}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(e) =>
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
                          value={block.alt}
                          onChange={(e) =>
                            updateImageAlt(
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Image alt text"
                          className="w-full rounded-xl border bg-white p-3 text-sm"
                        />

                      </div>
                    )}

                    {/* CALLOUT */}

                    {block.type === "callout" && (
                      <div className="rounded-xl border bg-white p-4">

                        <input
                          value={
                            block.title || ""
                          }
                          onChange={(e) => {
                            setContentBlocks(
                              (prev) => {
                                const updated = [
                                  ...prev,
                                ];

                                const current =
                                  updated[index];

                                if (
                                  current?.type ===
                                  "callout"
                                ) {
                                  updated[index] = {
                                    ...current,
                                    title:
                                      e.target.value,
                                  };
                                }

                                return updated;
                              }
                            );
                          }}
                          placeholder="Callout title"
                          className="mb-3 w-full rounded-xl border p-3 font-semibold"
                        />

                        <textarea
                          value={block.content}
                          onChange={(e) => {
                            setContentBlocks(
                              (prev) => {
                                const updated = [
                                  ...prev,
                                ];

                                const current =
                                  updated[index];

                                if (
                                  current?.type ===
                                  "callout"
                                ) {
                                  updated[index] = {
                                    ...current,
                                    content:
                                      e.target.value,
                                  };
                                }

                                return updated;
                              }
                            );
                          }}
                          rows={6}
                          className="w-full rounded-xl border p-4"
                        />

                      </div>
                    )}

                    {/* QUOTE */}

                    {block.type === "quote" && (
                      <div className="rounded-xl border bg-white p-4">

                        <textarea
                          value={block.content}
                          onChange={(e) => {
                            setContentBlocks(
                              (prev) => {
                                const updated = [
                                  ...prev,
                                ];

                                const current =
                                  updated[index];

                                if (
                                  current?.type ===
                                  "quote"
                                ) {
                                  updated[index] = {
                                    ...current,
                                    content:
                                      e.target.value,
                                  };
                                }

                                return updated;
                              }
                            );
                          }}
                          rows={5}
                          className="w-full rounded-xl border p-4"
                        />

                        <input
                          value={
                            block.author || ""
                          }
                          onChange={(e) => {
                            setContentBlocks(
                              (prev) => {
                                const updated = [
                                  ...prev,
                                ];

                                const current =
                                  updated[index];

                                if (
                                  current?.type ===
                                  "quote"
                                ) {
                                  updated[index] = {
                                    ...current,
                                    author:
                                      e.target.value,
                                  };
                                }

                                return updated;
                              }
                            );
                          }}
                          placeholder="Author (optional)"
                          className="mt-3 w-full rounded-xl border p-3"
                        />

                      </div>
                    )}

                    {/* LIST */}

                    {(
                      block.type === "bullet-list" ||
                      block.type === "bullets" ||
                      block.type === "unordered-list" ||
                      block.type === "ordered-list" ||
                      block.type === "numbered-list"
                    ) && (
                      <div className="space-y-3 rounded-xl border bg-white p-4">

                        {block.items.map(
                          (item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex gap-2"
                            >

                              <input
                                value={item}
                                onChange={(e) => {
                                  setContentBlocks(
                                    (prev) => {
                                      const updated =
                                        [...prev];

                                      const current =
                                        updated[index];

                                      if (
                                        current &&
                                        "items" in
                                          current
                                      ) {
                                        const items =
                                          [
                                            ...current.items,
                                          ];

                                        items[
                                          itemIndex
                                        ] =
                                          e.target.value;

                                        updated[
                                          index
                                        ] = {
                                          ...current,
                                          items,
                                        };
                                      }

                                      return updated;
                                    }
                                  );
                                }}
                                className="w-full rounded-xl border p-3"
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  setContentBlocks(
                                    (prev) => {
                                      const updated =
                                        [...prev];

                                      const current =
                                        updated[index];

                                      if (
                                        current &&
                                        "items" in
                                          current
                                      ) {
                                        updated[
                                          index
                                        ] = {
                                          ...current,
                                          items:
                                            current.items.filter(
                                              (_, i) =>
                                                i !==
                                                itemIndex
                                            ),
                                        };
                                      }

                                      return updated;
                                    }
                                  );
                                }}
                                className="rounded-xl border px-3 text-red-600"
                              >
                                ×
                              </button>

                            </div>
                          )
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setContentBlocks(
                              (prev) => {
                                const updated = [
                                  ...prev,
                                ];

                                const current =
                                  updated[index];

                                if (
                                  current &&
                                  "items" in
                                    current
                                ) {
                                  updated[index] = {
                                    ...current,
                                    items: [
                                      ...current.items,
                                      "",
                                    ],
                                  };
                                }

                                return updated;
                              }
                            );
                          }}
                          className="rounded-lg border px-3 py-2 text-sm font-semibold"
                        >
                          + Add Item
                        </button>

                      </div>
                    )}

                    {/* TABLE */}

                    {block.type === "table" && (
                      <div className="space-y-4 rounded-xl border bg-white p-4">

                        <div className="overflow-x-auto">

                          <table className="w-full border-collapse">

                            <thead>
                              <tr>
                                {block.headers.map(
                                  (
                                    header,
                                    headerIndex
                                  ) => (
                                    <th
                                      key={
                                        headerIndex
                                      }
                                      className="border bg-gray-100 p-2"
                                    >
                                      <input
                                        value={
                                          header
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          updateTableHeader(
                                            index,
                                            headerIndex,
                                            e
                                              .target
                                              .value
                                          )
                                        }
                                        className="w-full rounded-lg border bg-white p-2 text-sm font-semibold"
                                      />
                                    </th>
                                  )
                                )}

                                <th className="w-20 border bg-gray-100 p-2">
                                  Actions
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {block.rows.map(
                                (
                                  row,
                                  rowIndex
                                ) => (
                                  <tr
                                    key={
                                      rowIndex
                                    }
                                  >
                                    {row.map(
                                      (
                                        cell,
                                        cellIndex
                                      ) => (
                                        <td
                                          key={
                                            cellIndex
                                          }
                                          className="border p-2"
                                        >
                                          <input
                                            value={
                                              cell
                                            }
                                            onChange={(
                                              e
                                            ) =>
                                              updateTableCell(
                                                index,
                                                rowIndex,
                                                cellIndex,
                                                e
                                                  .target
                                                  .value
                                              )
                                            }
                                            className="w-full rounded-lg border p-2 text-sm"
                                          />
                                        </td>
                                      )
                                    )}

                                    <td className="border p-2 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteTableRow(
                                            index,
                                            rowIndex
                                          )
                                        }
                                        className="rounded-lg border px-3 py-2 text-sm text-red-600"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>

                          </table>

                        </div>

                        <div className="flex flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              addTableRow(index)
                            }
                            className="rounded-lg border px-3 py-2 text-sm font-semibold"
                          >
                            + Add Row
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              addTableColumn(index)
                            }
                            className="rounded-lg border px-3 py-2 text-sm font-semibold"
                          >
                            + Add Column
                          </button>

                        </div>

                      </div>
                    )}

                    {/* UNKNOWN */}

                    {![
                      "text",
                      "image",
                      "callout",
                      "quote",
                      "bullet-list",
                      "bullets",
                      "unordered-list",
                      "ordered-list",
                      "numbered-list",
                      "table",
                    ].includes(block.type) && (
                      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                        <p className="text-sm font-semibold text-yellow-800">
                          Unsupported block:{" "}
                          {block.type}
                        </p>

                        <p className="mt-1 text-xs text-yellow-700">
                          This content is being preserved
                          so it is not deleted when you save.
                        </p>

                      </div>
                    )}

                    {/* INSERT */}

                    <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">

                      <button
                        type="button"
                        onClick={() =>
                          addTextBlock(index)
                        }
                        className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold"
                      >
                        + Text After
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          addImageBlock(index)
                        }
                        className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold"
                      >
                        + Image After
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>

          {/* DANGER ZONE */}

          <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-7">

            <h2 className="text-xl font-bold text-red-600">
              Danger Zone
            </h2>

            <p className="mb-5 mt-1 text-sm text-gray-500">
              Deleting this article permanently removes it
              from your blog database.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowDeleteConfirm(true)
              }
              disabled={deleting}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              🗑 Delete This Blog
            </button>

          </section>

          {/* BOTTOM */}

          <div className="flex flex-col justify-end gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() =>
                router.push("/admin/blogs")
              }
              className="rounded-xl border bg-white px-6 py-3 font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                setShowPreview(true)
              }
              className="rounded-xl border bg-white px-6 py-3 font-semibold"
            >
              👁 Preview
            </button>

            <button
              type="button"
              onClick={updateBlog}
              disabled={
                saving ||
                deleting
              }
              className="rounded-xl bg-black px-7 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>
      </main>

      {/* =====================================================
          PREVIEW
      ===================================================== */}

      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6">

          <div className="mx-auto min-h-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white px-5 py-4">

              <div>

                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Article Preview
                </div>

                <div className="font-bold text-gray-900">
                  {form.title ||
                    "Untitled Blog"}
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPreview(false)
                }
                className="h-10 w-10 rounded-full bg-gray-100 text-lg font-bold hover:bg-gray-200"
              >
                ×
              </button>

            </div>

            <article className="px-5 py-8 sm:px-10">

              {form.category && (
                <div className="mb-3 text-sm font-bold text-gray-500">
                  {form.category}
                </div>
              )}

              <h1 className="mb-5 text-3xl font-bold leading-tight text-gray-900 sm:text-5xl">
                {form.title ||
                  "Untitled Blog"}
              </h1>

              {form.excerpt && (
                <p className="mb-7 text-lg leading-8 text-gray-600 sm:text-xl">
                  {form.excerpt}
                </p>
              )}

              {form.cover_image && (
                <img
                  src={form.cover_image}
                  alt={form.title}
                  className="mb-8 max-h-[520px] w-full rounded-2xl object-cover"
                />
              )}

              {form.introduction && (
                <div className="mb-10">

                  <p className="whitespace-pre-line text-lg leading-8 text-gray-700 sm:text-xl">
                    {form.introduction}
                  </p>

                </div>
              )}

              <div>
                {contentBlocks.map(
                  renderPreviewBlock
                )}
              </div>

              {form.author && (
                <div className="mt-12 border-t pt-6 text-sm text-gray-500">
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
          DELETE MODAL
      ===================================================== */}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
              🗑
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Delete this blog?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              You are about to permanently delete:
            </p>

            <div className="mt-3 rounded-xl border bg-gray-50 p-3 font-semibold text-gray-900">
              {form.title}
            </div>

            <p className="mt-4 text-sm font-medium text-red-600">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                disabled={deleting}
                className="rounded-xl border bg-white px-5 py-3 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteBlog}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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