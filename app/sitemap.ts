
import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://www.anatago.com";

/*
  Rebuild the sitemap periodically.

  This means newly published blogs can appear in the sitemap
  automatically without manually editing this file.
*/
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /*
    =========================================================
    STATIC PAGES
    =========================================================
  */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  /*
    =========================================================
    CATEGORY PAGES
    =========================================================
  */

  const categories = [
    "ai",
    "tech",
    "how-to",
    "apps",
    "security",
    "explained",
  ];

  const categoryUrls: MetadataRoute.Sitemap = categories.map(
    (category) => ({
      url: `${BASE_URL}/${category}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })
  );

  /*
    =========================================================
    PUBLISHED BLOG POSTS
    =========================================================
  */

  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    const { data: blogs, error } = await supabase
      .from("blogs")
      .select(
        `
          slug,
          published,
          published_at,
          updated_at,
          created_at
        `
      )
      .eq("published", true)
      .not("slug", "is", null)
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .order("created_at", {
        ascending: false,
        nullsFirst: false,
      });

    if (error) {
      console.error(
        "Sitemap: Failed to fetch blogs:",
        error.message
      );
    } else {
      blogUrls = (blogs ?? [])
        .filter(
          (blog) =>
            typeof blog.slug === "string" &&
            blog.slug.trim().length > 0
        )
        .map((blog) => {
          const slug = blog.slug.trim();

          const lastModified =
            blog.updated_at ||
            blog.published_at ||
            blog.created_at;

          return {
            url: `${BASE_URL}/blog/${encodeURIComponent(slug)}`,

            ...(lastModified
              ? {
                  lastModified: new Date(lastModified),
                }
              : {}),

            changeFrequency: "weekly" as const,
            priority: 0.8,
          };
        });
    }
  } catch (error) {
    console.error(
      "Sitemap: Unexpected error while generating blog URLs:",
      error
    );
  }

  /*
    =========================================================
    AUTHOR PAGES
    =========================================================

    If the authors table exists, automatically include
    public author profile pages.

    Example:
    /author/dhanush-varma
  */

  let authorUrls: MetadataRoute.Sitemap = [];

  try {
    const { data: authors, error } = await supabase
      .from("authors")
      .select(
        `
          slug,
          updated_at,
          created_at
        `
      )
      .not("slug", "is", null);

    if (error) {
      console.error(
        "Sitemap: Failed to fetch authors:",
        error.message
      );
    } else {
      authorUrls = (authors ?? [])
        .filter(
          (author) =>
            typeof author.slug === "string" &&
            author.slug.trim().length > 0
        )
        .map((author) => {
          const slug = author.slug.trim();

          const lastModified =
            author.updated_at ||
            author.created_at;

          return {
            url: `${BASE_URL}/author/${encodeURIComponent(slug)}`,

            ...(lastModified
              ? {
                  lastModified: new Date(lastModified),
                }
              : {}),

            changeFrequency: "monthly" as const,
            priority: 0.6,
          };
        });
    }
  } catch (error) {
    /*
      If the authors table is unavailable for any reason,
      the rest of the sitemap should still work.
    */
    console.error(
      "Sitemap: Unexpected error while generating author URLs:",
      error
    );
  }

  /*
    =========================================================
    COMBINE ALL URLS
    =========================================================
  */

  const allUrls: MetadataRoute.Sitemap = [
    ...staticPages,
    ...categoryUrls,
    ...authorUrls,
    ...blogUrls,
  ];

  /*
    =========================================================
    REMOVE DUPLICATE URLS
    =========================================================
  */

  const uniqueUrls = Array.from(
    new Map(
      allUrls.map((item) => [item.url, item])
    ).values()
  );

  return uniqueUrls;
}

