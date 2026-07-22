import SkeletonCard from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="h-10 w-72 bg-gray-200 rounded animate-pulse mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}

      </div>

    </main>
  );
}