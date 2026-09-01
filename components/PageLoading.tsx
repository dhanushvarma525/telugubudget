"use client";

import { useEffect, useState } from "react";

export default function PageLoading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const link = target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href) return;

      // Ignore external links
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // Ignore same-page anchors
      if (href.startsWith("#")) {
        return;
      }

      // Ignore new tabs / modifier clicks
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      setLoading(true);
    };

    const handlePageShow = () => {
      setLoading(false);
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  if (!loading) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999]"
      aria-label="Loading"
    >
      <div className="h-[3px] w-full overflow-hidden bg-zinc-200">
        <div className="h-full w-1/3 animate-page-loading bg-zinc-950" />
      </div>

      <div className="fixed left-1/2 top-4 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950" />

          <span className="text-xs font-semibold text-zinc-700">
            Opening article…
          </span>
        </div>
      </div>
    </div>
  );
}