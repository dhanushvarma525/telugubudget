import SkeletonCard from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <main
      className="
      min-h-screen
      bg-gray-100
      p-4
      sm:p-8
      "
    >

      <div
        className="
        h-8
        sm:h-10
        w-60
        sm:w-72
        bg-gray-200
        rounded
        animate-pulse
        mb-6
        sm:mb-8
        "
      />


      <div
        className="
        grid
        grid-cols-2
        sm:grid-cols-3
        lg:grid-cols-4
        gap-3
        sm:gap-6
        "
      >

        {
          Array.from({ length: 12 }).map((_, i) => (

            <SkeletonCard key={i} />

          ))
        }

      </div>


    </main>
  );
}