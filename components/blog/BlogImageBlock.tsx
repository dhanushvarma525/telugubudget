"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type BlogImageBlockProps = {
  url: string;
  alt: string;
  caption?: string;
  onChange: (data: {
    url: string;
    alt: string;
    caption: string;
  }) => void;
  onDelete: () => void;
};

export default function BlogImageBlock({
  url,
  alt,
  caption = "",
  onChange,
  onDelete,
}: BlogImageBlockProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file: File) {
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("folder", "articles");

      const response = await fetch(
        "/api/blog-images/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Image upload failed."
        );
      }

      onChange({
        url: data.url,
        alt,
        caption,
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    uploadImage(file);

    event.target.value = "";
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please drop an image file.");
      return;
    }

    uploadImage(file);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Article Image
          </h3>

          <p className="text-xs text-gray-500">
            Add an image between your content sections.
          </p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      {!url ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center transition hover:border-gray-400 hover:bg-gray-100"
        >
          <div className="mx-auto max-w-sm">
            <div className="mb-3 text-3xl">
              🖼️
            </div>

            <p className="text-sm font-semibold text-gray-800">
              {uploading
                ? "Uploading image..."
                : "Click to upload an image"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Or drag and drop an image here
            </p>

            <p className="mt-2 text-xs text-gray-400">
              JPG, PNG, WEBP or GIF · Max 10MB
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            <div className="relative aspect-video w-full">
              <Image
                src={url}
                alt={alt || "Article image"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="rounded-xl bg-white px-4 py-3 text-sm font-medium">
                  Uploading...
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Replace Image
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Alt Text
          </label>

          <input
            type="text"
            value={alt}
            onChange={(event) =>
              onChange({
                url,
                alt: event.target.value,
                caption,
              })
            }
            placeholder="Describe the image for accessibility and SEO"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
          />

          <p className="mt-1 text-xs text-gray-500">
            Describe what the image shows. Avoid keyword stuffing.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Caption
          </label>

          <input
            type="text"
            value={caption}
            onChange={(event) =>
              onChange({
                url,
                alt,
                caption: event.target.value,
              })
            }
            placeholder="Optional image caption"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
          />
        </div>
      </div>
    </div>
  );
}