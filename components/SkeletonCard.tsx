export default function SkeletonCard() {
  return (
    <div
      className="
      bg-white
      rounded-2xl
      shadow-md
      overflow-hidden
      animate-pulse
      "
    >
      {/* Image */}
      <div className="w-full h-56 bg-gray-200" />

      <div className="p-4">

        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-5/6 mb-3" />

        {/* Price */}
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />

        {/* Rating */}
        <div className="flex gap-2 mb-5">
          <div className="h-4 w-4 rounded-full bg-gray-200" />
          <div className="h-4 w-4 rounded-full bg-gray-200" />
          <div className="h-4 w-4 rounded-full bg-gray-200" />
          <div className="h-4 w-4 rounded-full bg-gray-200" />
          <div className="h-4 w-4 rounded-full bg-gray-200" />
        </div>

        {/* Button */}
        <div className="h-10 rounded-full bg-gray-200" />

      </div>
    </div>
  );
}