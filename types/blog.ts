export type BlogBlockType =
  | "heading"
  | "text"
  | "paragraph"
  | "image"
  | "bullet-list"
  | "bullets"
  | "unordered-list"
  | "numbered-list"
  | "ordered-list"
  | "table"
  | "link"
  | "quote"
  | "callout";

export type BlogCategory =
  | "AI"
  | "Tech"
  | "How-To"
  | "Apps"
  | "Security";

export interface BlogContentBlock {
  id?: string;

  type: BlogBlockType;

  /* =========================
     TEXT
  ========================= */

  text?: string;
  content?: string;

  /* =========================
     HEADING
  ========================= */

  level?: number;

  /* =========================
     IMAGE
  ========================= */

  url?: string;
  src?: string;
  image?: string;

  alt?: string;
  caption?: string;
  title?: string;

  /* =========================
     LIST
  ========================= */

  items?: string[];

  /* =========================
     TABLE
  ========================= */

  headers?: string[];
  rows?: string[][];

  /* =========================
     LINK
  ========================= */

  href?: string;
  external?: boolean;

  /* =========================
     CALLOUT
  ========================= */

  label?: string;
}

export interface BlogFAQ {
  id?: string;
  question: string;
  answer: string;
}

export interface BlogFormData {
  id?: number;

  title: string;
  slug: string;
  excerpt: string;

  introduction?: string;

  cover_image?: string | null;

  category: string;
  author: string;

  tags: string[];

  content_blocks: BlogContentBlock[];

  faqs: BlogFAQ[];

  published: boolean;
  featured: boolean;

  views?: number;

  meta_title?: string;
  meta_description?: string;

  published_at?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
}