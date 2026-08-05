
import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://anatago.com";

  // ==========================================
  // STATIC PAGES
  // ==========================================

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/affiliate-disclosure`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/deals`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/todays-deals`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/under-150`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/crush`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/mom`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/dad`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/devotional`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/electronics`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/fashion`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/men-women-wear`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/categories/hot-picks`,
      lastModified: new Date(),
    },
  ];

  // ==========================================
  // PRODUCTS FROM SUPABASE
  // ==========================================

  let productUrls: MetadataRoute.Sitemap = [];

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, updated_at, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products sitemap error:", error);
    } else {
      productUrls = (products || []).map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : product.created_at
            ? new Date(product.created_at)
            : new Date(),
      }));
    }
  } catch (error) {
    console.error("Products sitemap error:", error);
  }

  // ==========================================
  // BLOGS FROM SUPABASE
  // ==========================================

  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    const { data: blogs, error } = await supabase
      .from("blogs")
      .select("slug, published, updated_at, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Blogs sitemap error:", error);
    } else {
      blogUrls = (blogs || []).map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: blog.updated_at
          ? new Date(blog.updated_at)
          : blog.created_at
            ? new Date(blog.created_at)
            : new Date(),
      }));
    }
  } catch (error) {
    console.error("Blogs sitemap error:", error);
  }

  // ==========================================
  // FINAL SITEMAP
  // ==========================================

  return [
    ...staticPages,
    ...productUrls,
    ...blogUrls,
  ];
}

