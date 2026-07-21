"use client";

import { useMemo, useState } from "react";

type Props = {
  images: (string | null | undefined)[];
};

export default function ProductImageSlider({ images }: Props) {
  const validImages = useMemo(
    () => images.filter((img): img is string => !!img && img.trim() !== ""),
    [images]
  );

  const [current, setCurrent] = useState(0);

  if (validImages.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100 rounded-xl">
        No Image
      </div>
    );
  }

  function nextImage() {
    setCurrent((prev) => (prev + 1) % validImages.length);
  }

  function prevImage() {
    setCurrent((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  }

  return (
    <div className="w-full">

      {/* Main Image */}
      <div className="relative bg-white rounded-xl overflow-hidden border">

        <img
          src={validImages[current]}
          alt={`Product ${current + 1}`}
          className="w-full h-80 sm:h-96 object-contain"
        />

        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10 text-xl hover:bg-gray-100"
            >
              ‹
            </button>

            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10 text-xl hover:bg-gray-100"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
          {validImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`border-2 rounded-lg overflow-hidden flex-shrink-0 ${
                current === index
                  ? "border-orange-500"
                  : "border-gray-300"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-20 h-20 object-contain bg-white"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}