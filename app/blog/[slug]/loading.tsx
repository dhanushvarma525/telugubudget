export default function Loading() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {/* Top loading indicator */}
      <div
        className="fixed left-0 top-0 z-[9999] h-[2px] w-full overflow-hidden bg-zinc-100"
        aria-hidden="true"
      >
        <div className="loading-progress h-full w-1/3 bg-zinc-950" />
      </div>

      {/* Article header */}
      <header className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-5xl px-5 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8 lg:pt-20">
          {/* Category */}
          <div className="loading-pulse h-7 w-24 rounded-full bg-zinc-200" />

          {/* Title */}
          <div className="mt-6 space-y-3">
            <div className="loading-pulse h-10 w-full max-w-4xl rounded-lg bg-zinc-200 sm:h-14" />

            <div className="loading-pulse h-10 w-[82%] max-w-3xl rounded-lg bg-zinc-200 sm:h-14" />
          </div>

          {/* Excerpt */}
          <div className="mt-6 space-y-2">
            <div className="loading-pulse h-4 w-full max-w-2xl rounded bg-zinc-100 sm:h-5" />

            <div className="loading-pulse h-4 w-[75%] max-w-xl rounded bg-zinc-100 sm:h-5" />
          </div>

          {/* Meta */}
          <div className="mt-7 flex items-center gap-3">
            <div className="loading-pulse h-4 w-24 rounded bg-zinc-100" />

            <div className="h-1 w-1 rounded-full bg-zinc-300" />

            <div className="loading-pulse h-4 w-28 rounded bg-zinc-100" />

            <div className="h-1 w-1 rounded-full bg-zinc-300" />

            <div className="loading-pulse h-4 w-20 rounded bg-zinc-100" />
          </div>
        </div>
      </header>

      {/* Cover image */}
      <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="loading-pulse aspect-[16/8] w-full rounded-2xl bg-zinc-100 sm:rounded-3xl" />
      </section>

      {/* Article content */}
      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {/* Introduction */}
        <div className="space-y-3">
          <div className="loading-pulse h-5 w-full rounded bg-zinc-100" />

          <div className="loading-pulse h-5 w-full rounded bg-zinc-100" />

          <div className="loading-pulse h-5 w-[94%] rounded bg-zinc-100" />

          <div className="loading-pulse h-5 w-[78%] rounded bg-zinc-100" />
        </div>

        {/* Section heading */}
        <div className="mt-12">
          <div className="loading-pulse h-8 w-[65%] rounded-lg bg-zinc-200 sm:h-9" />
        </div>

        {/* Paragraphs */}
        <div className="mt-6 space-y-3">
          <div className="loading-pulse h-5 w-full rounded bg-zinc-100" />

          <div className="loading-pulse h-5 w-full rounded bg-zinc-100" />

          <div className="loading-pulse h-5 w-[96%] rounded bg-zinc-100" />

          <div className="loading-pulse h-5 w-[82%] rounded bg-zinc-100" />
        </div>

        {/* Article image */}
        <div className="mt-10">
          <div className="loading-pulse aspect-[16/9] w-full rounded-2xl bg-zinc-100" />
        </div>

        {/* Second section */}
        <div className="mt-12">
          <div className="loading-pulse h-8 w-[58%] rounded-lg bg-zinc-200 sm:h-9" />
        </div>

        {/* More paragraphs */}
        <div className="mt-6 space-y-3">
          <div className="loading-pulse h-5 w-full rounded bg-zinc-100" />

          <div className="loading-pulse h-5 w-full rounded bg-zinc-100" />

          <div className="loading-pulse h-5 w-[92%] rounded bg-zinc-100" />

          <div className="loading-pulse h-5 w-[72%] rounded bg-zinc-100" />
        </div>
      </article>

      {/* Animation */}
      <style>{`
        .loading-pulse {
          position: relative;
          overflow: hidden;
        }

        .loading-pulse::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.75) 50%,
            transparent 100%
          );
          animation: skeleton-shimmer 1.4s ease-in-out infinite;
        }

        .loading-progress {
          animation: loading-progress 1.3s ease-in-out infinite;
          transform: translateX(-100%);
        }

        @keyframes skeleton-shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes loading-progress {
          0% {
            transform: translateX(-100%);
          }

          50% {
            transform: translateX(160%);
          }

          100% {
            transform: translateX(350%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-pulse::after,
          .loading-progress {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}