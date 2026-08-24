"use client";

import { useRef, useState } from "react";
import type { BlogContentBlock } from "@/types/blog";

type BlogBlockEditorProps = {
  blocks: BlogContentBlock[];
  onChange: (blocks: BlogContentBlock[]) => void;
};

/* ============================================================
   CREATE BLOCK
============================================================ */

function createBlock(
  type: BlogContentBlock["type"]
): BlogContentBlock {
  const id = crypto.randomUUID();

  switch (type) {
    case "heading":
      return {
        id,
        type: "heading",
        text: "",
        level: 2,
      };

    case "image":
      return {
        id,
        type: "image",
        url: "",
        alt: "",
        caption: "",
      };

    case "bullet-list":
      return {
        id,
        type: "bullet-list",
        items: [""],
      };

    case "numbered-list":
      return {
        id,
        type: "numbered-list",
        items: [""],
      };

    case "quote":
      return {
        id,
        type: "quote",
        text: "",
      };

    case "callout":
      return {
        id,
        type: "callout",
        label: "Note",
        text: "",
      };

    case "link":
      return {
        id,
        type: "link",
        text: "",
        href: "",
        external: false,
      };

    case "table":
      return {
        id,
        type: "table",
        headers: ["Column 1", "Column 2"],
        rows: [["", ""]],
      };

    case "text":
    default:
      return {
        id,
        type: "text",
        text: "",
      };
  }
}

/* ============================================================
   ADD BLOCK BUTTONS
============================================================ */

function AddBlockButtons({
  onAdd,
}: {
  onAdd: (type: BlogContentBlock["type"]) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-3 text-sm font-bold text-gray-700">
        Add Content Block
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAdd("heading")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Heading
        </button>

        <button
          type="button"
          onClick={() => onAdd("text")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Paragraph
        </button>

        <button
          type="button"
          onClick={() => onAdd("image")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Image
        </button>

        <button
          type="button"
          onClick={() => onAdd("bullet-list")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Bullet List
        </button>

        <button
          type="button"
          onClick={() => onAdd("numbered-list")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Numbered List
        </button>

        <button
          type="button"
          onClick={() => onAdd("quote")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Quote
        </button>

        <button
          type="button"
          onClick={() => onAdd("callout")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Callout
        </button>

        <button
          type="button"
          onClick={() => onAdd("link")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Link
        </button>

        <button
          type="button"
          onClick={() => onAdd("table")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          + Table
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   EDITOR
============================================================ */

export default function BlogBlockEditor({
  blocks,
  onChange,
}: BlogBlockEditorProps) {
  const [uploadingImage, setUploadingImage] =
    useState<number | null>(null);

  const [uploadError, setUploadError] =
    useState<string | null>(null);

  const fileInputRefs =
    useRef<Record<number, HTMLInputElement | null>>({});

  /* ============================================================
     ADD BLOCK
  ============================================================ */

  function addBlock(type: BlogContentBlock["type"]) {
    const newBlock = createBlock(type);

    onChange([...blocks, newBlock]);
  }

  /* ============================================================
     ADD BLOCK AFTER SPECIFIC BLOCK
  ============================================================ */

  function addBlockAfter(
    index: number,
    type: BlogContentBlock["type"]
  ) {
    const newBlock = createBlock(type);

    const newBlocks = [...blocks];

    newBlocks.splice(index + 1, 0, newBlock);

    onChange(newBlocks);
  }

  /* ============================================================
     UPDATE BLOCK
  ============================================================ */

  function updateBlock(
    index: number,
    updates: Partial<BlogContentBlock>
  ) {
    onChange(
      blocks.map((block, blockIndex) =>
        blockIndex === index
          ? {
              ...block,
              ...updates,
            }
          : block
      )
    );
  }

  /* ============================================================
     DELETE BLOCK
  ============================================================ */

  function deleteBlock(index: number) {
    onChange(
      blocks.filter(
        (_, blockIndex) => blockIndex !== index
      )
    );
  }

  /* ============================================================
     MOVE BLOCK
  ============================================================ */

  function moveBlock(
    index: number,
    direction: "up" | "down"
  ) {
    const newBlocks = [...blocks];

    const newIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= newBlocks.length
    ) {
      return;
    }

    const current = newBlocks[index];

    newBlocks[index] = newBlocks[newIndex];
    newBlocks[newIndex] = current;

    onChange(newBlocks);
  }

  /* ============================================================
     IMAGE UPLOAD
  ============================================================ */

  async function uploadImage(
    index: number,
    file: File
  ) {
    setUploadError(null);
    setUploadingImage(index);

    try {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Only JPG, PNG, WEBP and GIF images are allowed."
        );
      }

      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Image size must be 10MB or smaller."
        );
      }

      const formData = new FormData();

      formData.append("file", file);
      formData.append("folder", "articles");

      const response = await fetch(
        "/api/blog/upload-image",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText =
        await response.text();

      let result: {
        success?: boolean;
        message?: string;
        error?: string;
        url?: string;
        path?: string;
        fileName?: string;
      } = {};

      try {
        result = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        console.error(
          "IMAGE UPLOAD NON-JSON RESPONSE:",
          responseText
        );

        throw new Error(
          responseText ||
            `Image upload failed with status ${response.status}.`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Image upload failed with status ${response.status}.`
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Image upload failed."
        );
      }

      if (!result.url) {
        throw new Error(
          "Image uploaded, but no image URL was returned."
        );
      }

      updateBlock(index, {
        url: result.url,
      });
    } catch (error) {
      console.error(
        "IMAGE UPLOAD FAILED:",
        error
      );

      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload image."
      );
    } finally {
      setUploadingImage(null);
    }
  }

  /* ============================================================
     IMAGE SELECT
  ============================================================ */

  function handleImageSelect(
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    uploadImage(index, file);

    event.target.value = "";
  }

  /* ============================================================
     LIST FUNCTIONS
  ============================================================ */

  function updateListItem(
    blockIndex: number,
    itemIndex: number,
    value: string
  ) {
    const block = blocks[blockIndex];

    const items = [
      ...(block.items || []),
    ];

    items[itemIndex] = value;

    updateBlock(blockIndex, {
      items,
    });
  }

  function addListItem(
    blockIndex: number
  ) {
    const block = blocks[blockIndex];

    updateBlock(blockIndex, {
      items: [
        ...(block.items || []),
        "",
      ],
    });
  }

  function deleteListItem(
    blockIndex: number,
    itemIndex: number
  ) {
    const block = blocks[blockIndex];

    const items = (
      block.items || []
    ).filter(
      (_, index) =>
        index !== itemIndex
    );

    updateBlock(blockIndex, {
      items:
        items.length > 0
          ? items
          : [""],
    });
  }

  /* ============================================================
     TABLE FUNCTIONS
  ============================================================ */

  function updateTableHeader(
    blockIndex: number,
    headerIndex: number,
    value: string
  ) {
    const block = blocks[blockIndex];

    const headers = [
      ...(block.headers || []),
    ];

    headers[headerIndex] = value;

    updateBlock(blockIndex, {
      headers,
    });
  }

  function updateTableCell(
    blockIndex: number,
    rowIndex: number,
    cellIndex: number,
    value: string
  ) {
    const block = blocks[blockIndex];

    const rows = (
      block.rows || []
    ).map((row) => [...row]);

    if (!rows[rowIndex]) {
      return;
    }

    rows[rowIndex][cellIndex] =
      value;

    updateBlock(blockIndex, {
      rows,
    });
  }

  function addTableColumn(
    blockIndex: number
  ) {
    const block = blocks[blockIndex];

    const currentHeaders =
      block.headers || [];

    const headers = [
      ...currentHeaders,
      `Column ${
        currentHeaders.length + 1
      }`,
    ];

    const rows = (
      block.rows || []
    ).map((row) => [
      ...row,
      "",
    ]);

    updateBlock(blockIndex, {
      headers,
      rows,
    });
  }

  function deleteTableColumn(
    blockIndex: number,
    columnIndex: number
  ) {
    const block = blocks[blockIndex];

    const currentHeaders =
      block.headers || [];

    const headers =
      currentHeaders.filter(
        (_, index) =>
          index !== columnIndex
      );

    const rows = (
      block.rows || []
    ).map((row) =>
      row.filter(
        (_, index) =>
          index !== columnIndex
      )
    );

    updateBlock(blockIndex, {
      headers:
        headers.length > 0
          ? headers
          : ["Column 1"],
      rows,
    });
  }

  function addTableRow(
    blockIndex: number
  ) {
    const block = blocks[blockIndex];

    const columnCount =
      block.headers?.length || 1;

    updateBlock(blockIndex, {
      rows: [
        ...(block.rows || []),
        Array(columnCount).fill(""),
      ],
    });
  }

  function deleteTableRow(
    blockIndex: number,
    rowIndex: number
  ) {
    const block = blocks[blockIndex];

    updateBlock(blockIndex, {
      rows: (
        block.rows || []
      ).filter(
        (_, index) =>
          index !== rowIndex
      ),
    });
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Article Content
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Build your article section by section.
        </p>
      </div>

      {/* TOP ADD BLOCK PANEL */}

      <AddBlockButtons onAdd={addBlock} />

      {/* UPLOAD ERROR */}

      {uploadError && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{uploadError}</span>

          <button
            type="button"
            onClick={() =>
              setUploadError(null)
            }
            className="shrink-0 font-bold text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* EMPTY */}

      {blocks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-700">
            No content blocks yet.
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Add a heading, paragraph, image,
            or another block above.
          </p>
        </div>
      )}

      {/* BLOCKS */}

      <div className="space-y-5">

        {blocks.map(
          (block, index) => (
            <div
              key={
                block.id ||
                `block-${index}`
              }
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >

              {/* BLOCK HEADER */}

              <div className="flex flex-wrap items-center justify-between gap-3">

                <div className="flex items-center gap-2">

                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold uppercase text-gray-600">
                    {block.type}
                  </span>

                  <span className="text-xs text-gray-400">
                    Block {index + 1}
                  </span>

                </div>

                <div className="flex items-center gap-1">

                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      moveBlock(
                        index,
                        "up"
                      )
                    }
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    disabled={
                      index ===
                      blocks.length - 1
                    }
                    onClick={() =>
                      moveBlock(
                        index,
                        "down"
                      )
                    }
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteBlock(index)
                    }
                    className="ml-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>

              </div>

              {/* ==================================================
                  HEADING
              ================================================== */}

              {block.type === "heading" && (
                <div className="mt-5 space-y-4">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Heading
                    </label>

                    <input
                      type="text"
                      value={
                        block.text ||
                        block.content ||
                        ""
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            text:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="Enter section heading..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Heading Level
                    </label>

                    <select
                      value={
                        block.level || 2
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            level:
                              Number(
                                event.target.value
                              ),
                          }
                        )
                      }
                      className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                    >
                      <option value={2}>
                        H2
                      </option>

                      <option value={3}>
                        H3
                      </option>
                    </select>
                  </div>

                </div>
              )}

              {/* ==================================================
                  TEXT / PARAGRAPH
              ================================================== */}

              {(block.type === "text" ||
                block.type === "paragraph") && (
                <div className="mt-5">

                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Paragraph
                    </label>

                    <span className="text-xs text-gray-400">
                      Press Enter twice to start a new paragraph
                    </span>
                  </div>

                  <textarea
                    value={
                      block.text ||
                      block.content ||
                      ""
                    }
                    onChange={(event) =>
                      updateBlock(
                        index,
                        {
                          text:
                            event.target.value,
                        }
                      )
                    }
                    rows={10}
                    spellCheck
                    placeholder={`Write your paragraph here...

Use a blank line between paragraphs.

For example:

This is the first paragraph. Explain the main idea clearly and naturally.

This is the second paragraph. Continue the topic without making the article feel crowded.`}
                    className="min-h-[240px] w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-4 text-[15px] leading-7 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  />

                  <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-xs leading-5 text-gray-500">
                      <strong className="font-semibold text-gray-700">
                        Writing tip:
                      </strong>{" "}
                      Keep paragraphs short and readable. A blank line
                      between ideas will be preserved when the article
                      is displayed.
                    </p>
                  </div>

                </div>
              )}

              {/* ==================================================
                  IMAGE
              ================================================== */}

              {block.type === "image" && (
                <div className="mt-5 space-y-4">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Article Image
                    </label>

                    <input
                      ref={(element) => {
                        fileInputRefs.current[index] =
                          element;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(event) =>
                        handleImageSelect(
                          index,
                          event
                        )
                      }
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={
                        uploadingImage === index
                      }
                      onClick={() =>
                        fileInputRefs.current[
                          index
                        ]?.click()
                      }
                      className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingImage ===
                      index ? (
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            Uploading image...
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            Please wait
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            📷 Choose Image
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            Select an image from your computer
                          </div>

                          <div className="mt-2 text-xs text-gray-400">
                            JPG, PNG, WEBP or GIF • Max 10MB
                          </div>
                        </div>
                      )}
                    </button>
                  </div>

                  {(block.url ||
                    block.src ||
                    block.image) && (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img
                        src={
                          block.url ||
                          block.src ||
                          block.image ||
                          ""
                        }
                        alt={
                          block.alt ||
                          "Article image"
                        }
                        className="max-h-[450px] w-full object-contain"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Alt Text
                    </label>

                    <input
                      type="text"
                      value={
                        block.alt || ""
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            alt:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="Describe the image for SEO and accessibility..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Caption
                    </label>

                    <input
                      type="text"
                      value={
                        block.caption ||
                        ""
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            caption:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="Optional image caption..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    />
                  </div>

                </div>
              )}

              {/* ==================================================
                  LISTS
              ================================================== */}

              {(block.type === "bullet-list" ||
                block.type === "bullets" ||
                block.type === "unordered-list" ||
                block.type === "numbered-list" ||
                block.type === "ordered-list") && (

                <div className="mt-5">

                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    List Items
                  </label>

                  <div className="space-y-3">

                    {(block.items || [""]).map(
                      (
                        item,
                        itemIndex
                      ) => (
                        <div
                          key={itemIndex}
                          className="flex gap-2"
                        >

                          <input
                            type="text"
                            value={item}
                            onChange={(event) =>
                              updateListItem(
                                index,
                                itemIndex,
                                event.target.value
                              )
                            }
                            placeholder={`Item ${
                              itemIndex + 1
                            }`}
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              deleteListItem(
                                index,
                                itemIndex
                              )
                            }
                            className="rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                          >
                            ×
                          </button>

                        </div>
                      )
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      addListItem(index)
                    }
                    className="mt-3 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    + Add Item
                  </button>

                </div>
              )}

              {/* ==================================================
                  QUOTE
              ================================================== */}

              {block.type === "quote" && (
                <div className="mt-5">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Quote
                  </label>

                  <textarea
                    value={
                      block.text ||
                      block.content ||
                      ""
                    }
                    onChange={(event) =>
                      updateBlock(
                        index,
                        {
                          text:
                            event.target.value,
                        }
                      )
                    }
                    rows={5}
                    placeholder="Enter quote..."
                    className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
                  />

                </div>
              )}

              {/* ==================================================
                  CALLOUT
              ================================================== */}

              {block.type === "callout" && (
                <div className="mt-5 space-y-4">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Label
                    </label>

                    <input
                      type="text"
                      value={
                        block.label || ""
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            label:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="Important"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Content
                    </label>

                    <textarea
                      value={
                        block.text ||
                        block.content ||
                        ""
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            text:
                              event.target.value,
                          }
                        )
                      }
                      rows={5}
                      placeholder="Write callout content..."
                      className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-gray-900"
                    />
                  </div>

                </div>
              )}

              {/* ==================================================
                  LINK
              ================================================== */}

              {block.type === "link" && (
                <div className="mt-5 space-y-4">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Link Text
                    </label>

                    <input
                      type="text"
                      value={
                        block.text ||
                        block.content ||
                        ""
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            text:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="Read more"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      URL
                    </label>

                    <input
                      type="url"
                      value={
                        block.href || ""
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            href:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={
                        block.external ||
                        false
                      }
                      onChange={(event) =>
                        updateBlock(
                          index,
                          {
                            external:
                              event.target.checked,
                          }
                        )
                      }
                    />

                    Open in new tab
                  </label>

                </div>
              )}

              {/* ==================================================
                  TABLE
              ================================================== */}

              {block.type === "table" && (
                <div className="mt-5">

                  <div className="overflow-x-auto rounded-xl border border-gray-200">

                    <table className="min-w-full border-collapse">

                      <thead>
                        <tr>

                          {(block.headers || [
                            "Column 1",
                          ]).map(
                            (
                              header,
                              headerIndex
                            ) => (

                              <th
                                key={
                                  headerIndex
                                }
                                className="border-b border-gray-200 bg-gray-50 p-2"
                              >

                                <div className="flex gap-2">

                                  <input
                                    type="text"
                                    value={
                                      header
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateTableHeader(
                                        index,
                                        headerIndex,
                                        event.target.value
                                      )
                                    }
                                    className="min-w-32 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteTableColumn(
                                        index,
                                        headerIndex
                                      )
                                    }
                                    className="rounded-lg px-2 text-red-600 hover:bg-red-50"
                                  >
                                    ×
                                  </button>

                                </div>

                              </th>
                            )
                          )}

                        </tr>
                      </thead>

                      <tbody>

                        {(block.rows || []).map(
                          (
                            row,
                            rowIndex
                          ) => (

                            <tr
                              key={rowIndex}
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
                                    className="border-b border-gray-100 p-2"
                                  >

                                    <input
                                      type="text"
                                      value={
                                        cell
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateTableCell(
                                          index,
                                          rowIndex,
                                          cellIndex,
                                          event.target.value
                                        )
                                      }
                                      className="w-full min-w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                                    />

                                  </td>

                                )
                              )}

                              <td className="p-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteTableRow(
                                      index,
                                      rowIndex
                                    )
                                  }
                                  className="rounded-lg px-2 text-red-600 hover:bg-red-50"
                                >
                                  ×
                                </button>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        addTableColumn(
                          index
                        )
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      + Column
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addTableRow(index)
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      + Row
                    </button>

                  </div>

                </div>
              )}

              {/* ==================================================
                  ADD BLOCK AFTER THIS BLOCK
              ================================================== */}

              <div className="mt-6 border-t border-gray-100 pt-5">
                <AddBlockButtons
                  onAdd={(type) =>
                    addBlockAfter(
                      index,
                      type
                    )
                  }
                />
              </div>

            </div>
          )
        )}

      </div>
    </div>
  );
}