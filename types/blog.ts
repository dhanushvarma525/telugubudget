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
  | "Security"
  | "Explained";

export interface BlogContentBlock {
  id?: string;

  type: BlogBlockType;

  /*
   * Rich text is stored as sanitized HTML here.
   *
   * Example:
   * <p>This is <strong>important</strong>.</p>
   */
  text?: string;

  /*
   * Legacy/edit-page compatibility.
   */
  content?: string;

  level?: number;

  url?: string;
  src?: string;
  image?: string;

  alt?: string;
  caption?: string;
  title?: string;

  items?: string[];

  headers?: string[];
  rows?: string[][];

  href?: string;

  external?: boolean;

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