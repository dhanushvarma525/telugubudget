export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header skeleton */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />

          <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse" />

          <div className="h-4 w-96 max-w-full bg-gray-200 rounded animate-pulse mt-3" />

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mt-6">
            <div className="h-14 flex-1 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-14 w-full sm:w-28 bg-gray-300 rounded-2xl animate-pulse" />
          </div>

        </div>
      </section>

      {/* Content skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Heading */}
        <div className="mb-6">
          <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mt-2" />
        </div>

        {/* Product skeletons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

          {Array.from({ length: 10 }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  overflow-hidden
                "
              >
                {/* Image */}
                <div
                  className="
                    aspect-square
                    bg-gray-200
                    animate-pulse
                  "
                />

                {/* Text */}
                <div className="p-4">

                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />

                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-3" />

                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-2" />

                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mt-4" />

                </div>
              </div>
            )
          )}

        </div>

      </section>
    </main>
  );
}