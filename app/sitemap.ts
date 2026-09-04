import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

/*
 * Always generate the sitemap dynamically.
 * This ensures newly published blogs can appear
 * without waiting for a stale sitemap cache.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/*
 * Canonical website URL.
 *
 * Use the final canonical hostname consistently
 * throughout the sitemap.
 */
const BASE_URL = "https://www.anatago.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* =========================================================
     STATIC PAGES
  ========================================================= */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
    },
    {
      url: `${BASE_URL}/blog`,
    },
    {
      url: `${BASE_URL}/categories`,
    },
    {
      url: `${BASE_URL}/about`,
    },
    {
      url: `${BASE_URL}/contact`,
    },
    {
      url: `${BASE_URL}/privacy`,
    },
    {
      url: `${BASE_URL}/terms`,
    },
    {
      url: `${BASE_URL}/disclaimer`,
    },
  ];

  /* =========================================================
     BLOG CATEGORY PAGES
  ========================================================= */

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
    })
  );

  /* =========================================================
     PUBLISHED BLOG ARTICLES
  ========================================================= */

  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    const { data: blogs, error } = await supabase
      .from("blogs")
      .select(
        "slug, published, published_at, updated_at, created_at"
      )
      .eq("published", true)
      .not("slug", "is", null)
      .order("published_at", {
        ascending: false,
      });

    if (error) {
      console.error("Sitemap blogs error:", error);
    } else {
      blogUrls = (blogs ?? [])
        .filter(
          (blog) =>
            typeof blog.slug === "string" &&
            blog.slug.trim().length > 0
        )
        .map((blog) => {
          const lastModified =
            blog.updated_at ||
            blog.published_at ||
            blog.created_at;

          return {
            url: `${BASE_URL}/blog/${blog.slug.trim()}`,
            lastModified: lastModified
              ? new Date(lastModified)
              : undefined,
          };
        });
    }
  } catch (error) {
    console.error("Sitemap blogs exception:", error);
  }

  /* =========================================================
     COMBINE ALL CURRENT URLs
     
     IMPORTANT:
     There are intentionally NO /products/* URLs here.
  ========================================================= */

  const allUrls: MetadataRoute.Sitemap = [
    ...staticPages,
    ...categoryUrls,
    ...blogUrls,
  ];

  /* =========================================================
     REMOVE DUPLICATE URLs
  ========================================================= */

  const uniqueUrls = Array.from(
    new Map(
      allUrls.map((item) => [item.url, item])
    ).values()
  );

  /* =========================================================
     FINAL SITEMAP
  ========================================================= */

  return uniqueUrls;
}