import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://anatago.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* =========================================================
     STATIC PAGES
  ========================================================= */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: new Date(),
    },
  ];

  /* =========================================================
     BLOG CATEGORY PAGES
     
     Keep these only if these routes actually exist
     on your website.
  ========================================================= */

  const categoryPages = [
    "ai",
    "tech",
    "how-to",
    "apps",
    "security",
    "explained",
  ];

  const categoryUrls: MetadataRoute.Sitemap =
    categoryPages.map((category) => ({
      url: `${BASE_URL}/${category}`,
      lastModified: new Date(),
    }));

  /* =========================================================
     PUBLISHED BLOG ARTICLES
  ========================================================= */

  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    const { data: blogs, error } = await supabase
      .from("blogs")
      .select(
        "slug, published, updated_at, created_at, published_at"
      )
      .eq("published", true)
      .order("published_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Sitemap blogs error:",
        error
      );
    } else {
      blogUrls = (blogs || [])
        .filter(
          (blog) =>
            typeof blog.slug === "string" &&
            blog.slug.trim() !== ""
        )
        .map((blog) => ({
          url: `${BASE_URL}/blog/${blog.slug}`,

          lastModified: blog.updated_at
            ? new Date(blog.updated_at)
            : blog.published_at
              ? new Date(blog.published_at)
              : blog.created_at
                ? new Date(blog.created_at)
                : new Date(),
        }));
    }
  } catch (error) {
    console.error(
      "Sitemap blogs exception:",
      error
    );
  }

  /* =========================================================
     FINAL SITEMAP
  ========================================================= */

  return [
    ...staticPages,
    ...categoryUrls,
    ...blogUrls,
  ];
}