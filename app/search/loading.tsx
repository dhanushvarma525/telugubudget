import SkeletonCard from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="h-10 w-72 bg-gray-200 rounded animate-pulse mb-8" />

      <div className="flex gap-3 mb-8">
        <div className="h-12 flex-1 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-12 w-28 bg-orange-200 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

    </main>
  );
}