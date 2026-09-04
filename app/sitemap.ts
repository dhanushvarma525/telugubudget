import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

/*
 * =========================================================
 * SITEMAP CONFIGURATION
 * =========================================================
 *
 * Revalidate the sitemap every 60 seconds.
 *
 * This means:
 * - Newly published blogs can appear automatically.
 * - We don't need to manually edit the sitemap.
 * - We avoid relying on a permanently cached sitemap.
 */
export const revalidate = 60;

const BASE_URL = "https://www.anatago.com";

/*
 * =========================================================
 * SITEMAP
 * =========================================================
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /*
   * =======================================================
   * STATIC PAGES
   * =======================================================
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
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
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
    {
      url: `${BASE_URL}/disclaimer`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  /*
   * =======================================================
   * CATEGORY PAGES
   * =======================================================
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
      changeFrequency: "daily",
      priority: 0.8,
    })
  );

  /*
   * =======================================================
   * PUBLISHED BLOG ARTICLES
   * =======================================================
   *
   * IMPORTANT:
   * Only blogs where published = true are included.
   *
   * Therefore:
   *
   * Admin publishes article
   *          ↓
   * published = true
   *          ↓
   * sitemap automatically includes article
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
      });

    /*
     * =====================================================
     * HANDLE SUPABASE ERROR
     * =====================================================
     */

    if (error) {
      console.error(
        "Sitemap: Failed to fetch blogs:",
        error.message
      );
    } else {
      blogUrls = (blogs ?? [])
        /*
         * Make absolutely sure slug is valid.
         */
        .filter(
          (blog) =>
            typeof blog.slug === "string" &&
            blog.slug.trim().length > 0
        )
        /*
         * Convert database records into sitemap URLs.
         */
        .map((blog) => {
          const slug = blog.slug.trim();

          /*
           * Prefer updated_at because it represents the
           * latest modification.
           *
           * Then fall back to published_at and created_at.
           */
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
   * =======================================================
   * COMBINE EVERYTHING
   * =======================================================
   *
   * NO /products/* URLs are included.
   */

  const allUrls: MetadataRoute.Sitemap = [
    ...staticPages,
    ...categoryUrls,
    ...blogUrls,
  ];

  /*
   * =======================================================
   * REMOVE DUPLICATES
   * =======================================================
   */

  const uniqueUrls = Array.from(
    new Map(
      allUrls.map((item) => [item.url, item])
    ).values()
  );

  /*
   * =======================================================
   * FINAL RESULT
   * =======================================================
   */

  return uniqueUrls;
}