
"use client";

import { useEffect } from "react";

export default function BlogViewTracker({
  slug,
}: {
  slug: string;
}) {
  useEffect(() => {
    if (!slug) {
      return;
    }

    async function trackBlogView() {
      try {
        const response = await fetch(
          `/api/blogs/${encodeURIComponent(slug)}/view`,
          {
            method: "POST",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          console.error(
            "BLOG VIEW API ERROR:",
            response.status,
            response.statusText
          );

          return;
        }

        const data = await response.json();

        console.log(
          "BLOG VIEW UPDATED:",
          data
        );
      } catch (error) {
        console.error(
          "BLOG VIEW TRACKING ERROR:",
          error
        );
      }
    }

    trackBlogView();
  }, [slug]);

  return null;
}

