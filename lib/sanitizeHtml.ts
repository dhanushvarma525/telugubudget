
import DOMPurify from "isomorphic-dompurify";

/*
|--------------------------------------------------------------------------
| Allowed HTML tags
|--------------------------------------------------------------------------
|
| These are the formatting elements used by the blog editor.
|
*/

const ALLOWED_TAGS = [
  "p",
  "br",

  // Text formatting
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",

  // Headings
  "h2",
  "h3",
  "h4",

  // Lists
  "ul",
  "ol",
  "li",

  // Quotes
  "blockquote",

  // Links
  "a",

  // Inline formatting
  "span",
];

/*
|--------------------------------------------------------------------------
| Allowed HTML attributes
|--------------------------------------------------------------------------
|
| href        → links / internal links / external links
| target      → opening links in a new tab
| rel         → security attributes for external links
| class       → editor styling classes
| style       → text color and other inline formatting
|
*/

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "class",
  "style",
];

/*
|--------------------------------------------------------------------------
| sanitizeRichText
|--------------------------------------------------------------------------
|
| Sanitizes rich-text HTML before rendering it.
|
| This protects the public blog page from unsafe HTML while preserving
| the formatting supported by the editor.
|
*/

export function sanitizeRichText(html: string): string {
  if (!html) {
    return "";
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,

    // Do not allow arbitrary data-* attributes.
    ALLOW_DATA_ATTR: false,
  });
}

