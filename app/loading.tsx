import SkeletonCard from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <main
      className="
      min-h-screen
      bg-gray-100
      p-5
      "
    >
      {/* Top Loading Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="
          h-full
          w-1/3
          bg-orange-500
          animate-pulse
          "
        />
      </div>

      {/* Page Title Skeleton */}
      <div className="mb-8 mt-4">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Product Skeleton Grid */}
      <div
        className="
        grid
        grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-5
        "
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </main>
  );
}