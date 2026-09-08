"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  BlogContentBlock,
} from "@/types/blog";

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  Unlink,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Table2,
  MessageSquare,
  Heading2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  X,
  Search,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type BlogBlockEditorProps = {
  blocks: BlogContentBlock[];
  onChange: (blocks: BlogContentBlock[]) => void;
};

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
};

type ArticleSearchResult = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
};

/* =========================================================
   COLORS
========================================================= */

const TEXT_COLORS = [
  {
    name: "Default",
    value: "#111827",
  },
  {
    name: "Muted",
    value: "#4B5563",
  },
  {
    name: "Red",
    value: "#DC2626",
  },
  {
    name: "Blue",
    value: "#2563EB",
  },
  {
    name: "Green",
    value: "#15803D",
  },
  {
    name: "Purple",
    value: "#7C3AED",
  },
];

const HIGHLIGHT_COLORS = [
  {
    name: "None",
    value: "transparent",
  },
  {
    name: "Yellow",
    value: "#FEF08A",
  },
  {
    name: "Green",
    value: "#BBF7D0",
  },
  {
    name: "Blue",
    value: "#BFDBFE",
  },
  {
    name: "Pink",
    value: "#FBCFE8",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function createBlock(
  type: BlogContentBlock["type"]
): BlogContentBlock {
  const id = createId();

  switch (type) {
    case "heading":
      return {
        id,
        type: "heading",
        text: "",
        level: 2,
      };

    case "image":
      return {
        id,
        type: "image",
        url: "",
        alt: "",
        caption: "",
      };

    case "bullet-list":
      return {
        id,
        type: "bullet-list",
        items: [""],
      };

    case "numbered-list":
      return {
        id,
        type: "numbered-list",
        items: [""],
      };

    case "quote":
      return {
        id,
        type: "quote",
        text: "",
      };

    case "callout":
      return {
        id,
        type: "callout",
        label: "Note",
        text: "",
      };

    case "link":
      return {
        id,
        type: "link",
        text: "",
        href: "",
        external: false,
      };

    case "table":
      return {
        id,
        type: "table",
        headers: [
          "Column 1",
          "Column 2",
        ],
        rows: [
          ["", ""],
        ],
      };

    case "text":
    case "paragraph":
    default:
      return {
        id,
        type: "text",
        text: "",
      };
  }
}

function getBlockText(
  block: BlogContentBlock
) {
  return (
    block.text ||
    block.content ||
    ""
  );
}

/* =========================================================
   HTML COLOR / FORMAT NORMALIZATION
========================================================= */

/*
 * Browser implementations of document.execCommand()
 * are inconsistent.
 *
 * Depending on browser/version, foreColor/hiliteColor
 * can produce markup such as:
 *
 * <font color="#2563EB">text</font>
 *
 * or:
 *
 * <span style="color: rgb(37, 99, 235);">text</span>
 *
 * The published article renderer expects safe inline
 * styles, so we normalize browser-generated <font>
 * elements into <span> elements.
 */

function normalizeEditorHtml(
  html: string
) {
  if (!html) {
    return "";
  }

  const parser =
    new DOMParser();

  const documentNode =
    parser.parseFromString(
      html,
      "text/html"
    );

  /*
   * Convert all <font> elements into
   * <span> elements.
   *
   * This handles both:
   *
   * <font color="#2563EB">
   *
   * and:
   *
   * <font color="#2563EB" style="...">
   *
   * Existing safe inline styling is preserved.
   */
  documentNode
    .querySelectorAll("font")
    .forEach((font) => {
      const span =
        documentNode.createElement(
          "span"
        );

      const existingStyle =
        font.getAttribute(
          "style"
        );

      const color =
        font.getAttribute(
          "color"
        );

      if (existingStyle) {
        span.setAttribute(
          "style",
          existingStyle
        );
      }

      if (color) {
        span.style.color =
          color.trim();
      }

      while (
        font.firstChild
      ) {
        span.appendChild(
          font.firstChild
        );
      }

      font.replaceWith(
        span
      );
    });

  /*
   * Normalize the formatting properties
   * that this editor intentionally supports.
   *
   * We do NOT touch arbitrary CSS.
   */
  documentNode
    .querySelectorAll(
      "[style]"
    )
    .forEach((element) => {
      const htmlElement =
        element as HTMLElement;

      const style =
        htmlElement.style;

      if (style.color) {
        style.color =
          style.color.trim();
      }

      if (
        style.backgroundColor
      ) {
        style.backgroundColor =
          style.backgroundColor.trim();
      }

      if (
        style.textDecoration
      ) {
        style.textDecoration =
          style.textDecoration.trim();
      }

      if (
        style.textAlign
      ) {
        style.textAlign =
          style.textAlign.trim();
      }

      /*
       * If style became empty,
       * remove the attribute.
       */
      if (
        !style.cssText.trim()
      ) {
        htmlElement.removeAttribute(
          "style"
        );
      }
    });

  return documentNode.body.innerHTML;
}

/* =========================================================
   TOOL BUTTON
========================================================= */

function ToolButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={[
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 transition",
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* =========================================================
   RICH TEXT EDITOR
========================================================= */

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = "220px",
}: RichTextEditorProps) {
  const editorRef =
    useRef<HTMLDivElement>(null);

  const savedRange =
    useRef<Range | null>(null);

  const [showLinkDialog, setShowLinkDialog] =
    useState(false);

  const [showInternalPicker, setShowInternalPicker] =
    useState(false);

  const [linkUrl, setLinkUrl] =
    useState("");

  const [linkText, setLinkText] =
    useState("");

  const [openNewTab, setOpenNewTab] =
    useState(false);

  const [internalArticles, setInternalArticles] =
    useState<ArticleSearchResult[]>([]);

  const [articleSearch, setArticleSearch] =
    useState("");

  const [loadingArticles, setLoadingArticles] =
    useState(false);

  const [textColor, setTextColor] =
    useState(
      TEXT_COLORS[0].value
    );

  const [highlightColor, setHighlightColor] =
    useState(
      HIGHLIGHT_COLORS[0].value
    );

  /* -------------------------------------------------------
     Sync value into editor
  ------------------------------------------------------- */

  useEffect(() => {
    const editor =
      editorRef.current;

    if (!editor) {
      return;
    }

    if (
      document.activeElement !==
        editor &&
      editor.innerHTML !== value
    ) {
      editor.innerHTML =
        value || "";
    }
  }, [value]);

  /* -------------------------------------------------------
     Selection
  ------------------------------------------------------- */

  function saveSelection() {
    const selection =
      window.getSelection();

    if (
      !selection ||
      selection.rangeCount === 0
    ) {
      return;
    }

    const range =
      selection.getRangeAt(0);

    if (
      editorRef.current &&
      editorRef.current.contains(
        range.commonAncestorContainer
      )
    ) {
      savedRange.current =
        range.cloneRange();
    }
  }

  function restoreSelection() {
    const selection =
      window.getSelection();

    if (
      !selection ||
      !savedRange.current
    ) {
      return;
    }

    try {
      selection.removeAllRanges();

      selection.addRange(
        savedRange.current
      );
    } catch {
      /*
       * A saved Range can become invalid
       * after DOM updates. In that case,
       * simply leave the current selection
       * untouched.
       */
    }
  }

  /* -------------------------------------------------------
     Change
  ------------------------------------------------------- */

  function emitChange(
    normalize = false
  ) {
    const editor =
      editorRef.current;

    if (!editor) {
      return;
    }

    /*
     * Normal typing should not replace
     * innerHTML because doing so can move
     * the caret.
     *
     * Formatting commands explicitly
     * request normalization.
     */
    if (normalize) {
      const normalized =
        normalizeEditorHtml(
          editor.innerHTML
        );

      if (
        editor.innerHTML !==
        normalized
      ) {
        /*
         * Save selection before changing
         * the DOM.
         */
        saveSelection();

        editor.innerHTML =
          normalized;

        /*
         * Restore the selection after
         * normalization.
         */
        restoreSelection();
      }

      onChange(
        normalized
      );

      return;
    }

    onChange(
      editor.innerHTML
    );
  }

  /* -------------------------------------------------------
     Command
  ------------------------------------------------------- */

  function exec(
    command: string,
    commandValue?: string
  ) {
    restoreSelection();

    const editor =
      editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    document.execCommand(
      command,
      false,
      commandValue
    );

    const requiresNormalization =
      command === "foreColor" ||
      command === "hiliteColor" ||
      command === "backColor";

    emitChange(
      requiresNormalization
    );

    saveSelection();
  }

  /* -------------------------------------------------------
     Format
  ------------------------------------------------------- */

  function formatBlock(
    tag:
      | "p"
      | "h2"
      | "h3"
      | "blockquote"
  ) {
    restoreSelection();

    const editor =
      editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    document.execCommand(
      "formatBlock",
      false,
      tag
    );

    emitChange();

    saveSelection();
  }

  /* -------------------------------------------------------
     Apply text color
  ------------------------------------------------------- */

  function applyTextColor(
    color: string
  ) {
    restoreSelection();

    const editor =
      editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    /*
     * Apply the browser command.
     *
     * Some browsers return <font color="">
     * and others return <span style="">.
     *
     * emitChange(true) immediately
     * normalizes both formats.
     */
    document.execCommand(
      "foreColor",
      false,
      color
    );

    emitChange(true);

    saveSelection();
  }

  /* -------------------------------------------------------
     Remove only highlight formatting
  ------------------------------------------------------- */

  function removeHighlightFromElement(
    element: HTMLElement
  ) {
    const tagName =
      element.tagName.toLowerCase();

    if (
      tagName === "mark"
    ) {
      const parent =
        element.parentNode;

      if (!parent) {
        return;
      }

      while (
        element.firstChild
      ) {
        parent.insertBefore(
          element.firstChild,
          element
        );
      }

      parent.removeChild(
        element
      );

      return;
    }

    /*
     * Only remove background-color.
     *
     * This intentionally preserves:
     *
     * color
     * font-weight
     * font-style
     * text-decoration
     * text-align
     * and other inline formatting.
     */
    element.style.backgroundColor =
      "";

    if (
      !element.getAttribute(
        "style"
      )
    ) {
      const parent =
        element.parentNode;

      if (!parent) {
        return;
      }

      while (
        element.firstChild
      ) {
        parent.insertBefore(
          element.firstChild,
          element
        );
      }

      parent.removeChild(
        element
      );
    }
  }

  /* -------------------------------------------------------
     Apply highlight
  ------------------------------------------------------- */

  function applyHighlight(
    color: string
  ) {
    restoreSelection();

    const editor =
      editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    /*
     * IMPORTANT:
     *
     * Never use removeFormat() here.
     *
     * removeFormat() can remove:
     * - bold
     * - italic
     * - underline
     * - text color
     * - links
     * - other formatting
     *
     * We only remove background color.
     */
    if (
      color ===
      "transparent"
    ) {
      const selection =
        window.getSelection();

      if (
        selection &&
        selection.rangeCount > 0
      ) {
        const range =
          selection.getRangeAt(0);

        /*
         * Collect all highlighted
         * elements inside the editor.
         */
        const highlightedElements =
          Array.from(
            editor.querySelectorAll(
              'span[style*="background-color"], mark'
            )
          );

        highlightedElements.forEach(
          (element) => {
            if (
              range.intersectsNode(
                element
              )
            ) {
              removeHighlightFromElement(
                element as HTMLElement
              );
            }
          }
        );

        /*
         * Also check ancestors of the
         * current selection.
         */
        let current =
          selection.anchorNode
            ?.parentElement || null;

        while (
          current &&
          current !== editor
        ) {
          const isHighlight =
            current.matches(
              'span[style*="background-color"], mark'
            );

          if (isHighlight) {
            removeHighlightFromElement(
              current
            );

            break;
          }

          current =
            current.parentElement;
        }
      }

      emitChange(true);

      saveSelection();

      return;
    }

    /*
     * Apply the requested highlight.
     *
     * hiliteColor is preferred.
     */
    document.execCommand(
      "hiliteColor",
      false,
      color
    );

    /*
     * backColor is used by some
     * browser implementations.
     */
    document.execCommand(
      "backColor",
      false,
      color
    );

    /*
     * Normalize any <font> output
     * and preserve the highlight.
     */
    emitChange(true);

    saveSelection();
  }

  /* -------------------------------------------------------
     Link
  ------------------------------------------------------- */

  function openLinkDialog() {
    saveSelection();

    const selection =
      window.getSelection();

    const selectedText =
      selection?.toString() || "";

    setLinkText(
      selectedText
    );

    let existingHref = "";

    if (
      selection &&
      selection.anchorNode
    ) {
      let element =
        selection.anchorNode
          .parentElement;

      while (
        element &&
        element !==
          editorRef.current
      ) {
        if (
          element.tagName ===
          "A"
        ) {
          existingHref =
            element.getAttribute(
              "href"
            ) || "";

          break;
        }

        element =
          element.parentElement;
      }
    }

    setLinkUrl(
      existingHref
    );

    setShowLinkDialog(
      true
    );
  }

  function insertLink() {
    restoreSelection();

    const selection =
      window.getSelection();

    if (
      !selection ||
      selection.rangeCount === 0
    ) {
      setShowLinkDialog(
        false
      );

      return;
    }

    const range =
      selection.getRangeAt(0);

    const selectedText =
      selection.toString();

    const finalText =
      linkText.trim() ||
      selectedText.trim() ||
      linkUrl.trim();

    if (!linkUrl.trim()) {
      setShowLinkDialog(
        false
      );

      return;
    }

    if (
      selectedText.trim()
    ) {
      document.execCommand(
        "createLink",
        false,
        linkUrl.trim()
      );
    } else {
      const anchor =
        document.createElement(
          "a"
        );

      anchor.href =
        linkUrl.trim();

      anchor.textContent =
        finalText;

      if (openNewTab) {
        anchor.target =
          "_blank";

        anchor.rel =
          "noopener noreferrer";
      }

      range.deleteContents();

      range.insertNode(
        anchor
      );

      range.setStartAfter(
        anchor
      );

      range.collapse(
        true
      );

      selection.removeAllRanges();

      selection.addRange(
        range
      );
    }

    const currentSelection =
      window.getSelection();

    const node =
      currentSelection?.anchorNode;

    let anchor:
      | HTMLAnchorElement
      | null = null;

    if (node) {
      if (
        node.nodeType ===
        Node.ELEMENT_NODE
      ) {
        const element =
          node as HTMLElement;

        anchor =
          element.closest(
            "a"
          );
      } else {
        anchor =
          node.parentElement?.closest(
            "a"
          ) || null;
      }
    }

    if (anchor) {
      anchor.target =
        openNewTab
          ? "_blank"
          : "";

      anchor.rel =
        openNewTab
          ? "noopener noreferrer"
          : "";
    }

    emitChange(true);

    setShowLinkDialog(
      false
    );

    editorRef.current?.focus();

    saveSelection();
  }

  /* -------------------------------------------------------
     Remove link
  ------------------------------------------------------- */

  function removeLink() {
    restoreSelection();

    const editor =
      editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    document.execCommand(
      "unlink"
    );

    emitChange();

    saveSelection();
  }

  /* -------------------------------------------------------
     Internal article picker
  ------------------------------------------------------- */

  async function loadInternalArticles(
    query = ""
  ) {
    try {
      setLoadingArticles(
        true
      );

      const response =
        await fetch(
          `/api/blogs?admin=true&limit=1000`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load articles"
        );
      }

      const result =
        await response.json();

      const raw =
        Array.isArray(result)
          ? result
          : Array.isArray(
              result.blogs
            )
          ? result.blogs
          : Array.isArray(
              result.data
            )
          ? result.data
          : [];

      const normalized =
        raw
          .map(
            (article: any) => ({
              id: Number(
                article.id
              ),
              title:
                article.title ||
                "",
              slug:
                article.slug ||
                "",
              excerpt:
                article.excerpt ||
                "",
            })
          )
          .filter(
            (
              article: ArticleSearchResult
            ) =>
              article.title &&
              article.slug
          );

      const search =
        query
          .trim()
          .toLowerCase();

      const filtered =
        search
          ? normalized.filter(
              (
                article: ArticleSearchResult
              ) =>
                article.title
                  .toLowerCase()
                  .includes(
                    search
                  )
            )
          : normalized;

      setInternalArticles(
        filtered.slice(
          0,
          20
        )
      );
    } catch (error) {
      console.error(
        "Internal article search failed:",
        error
      );

      setInternalArticles(
        []
      );
    } finally {
      setLoadingArticles(
        false
      );
    }
  }

  function openInternalPicker() {
    saveSelection();

    setArticleSearch(
      ""
    );

    setShowInternalPicker(
      true
    );

    void loadInternalArticles(
      ""
    );
  }

  function insertInternalArticle(
    article: ArticleSearchResult
  ) {
    restoreSelection();

    const editor =
      editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    const href =
      `/blog/${encodeURIComponent(
        article.slug
      )}`;

    const selection =
      window.getSelection();

    const selectedText =
      selection?.toString().trim();

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href =
      href;

    anchor.textContent =
      selectedText ||
      article.title;

    const range =
      selection &&
      selection.rangeCount
        ? selection.getRangeAt(
            0
          )
        : null;

    if (range) {
      range.deleteContents();

      range.insertNode(
        anchor
      );

      range.setStartAfter(
        anchor
      );

      range.collapse(
        true
      );

      selection?.removeAllRanges();

      if (selection) {
        selection.addRange(
          range
        );
      }
    } else {
      editor.appendChild(
        anchor
      );
    }

    emitChange();

    setShowInternalPicker(
      false
    );

    editor.focus();

    saveSelection();
  }

  /* -------------------------------------------------------
     Keyboard shortcuts
  ------------------------------------------------------- */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>
  ) {
    if (
      event.ctrlKey ||
      event.metaKey
    ) {
      const key =
        event.key.toLowerCase();

      if (key === "b") {
        event.preventDefault();

        exec("bold");
      }

      if (key === "i") {
        event.preventDefault();

        exec("italic");
      }

      if (key === "u") {
        event.preventDefault();

        exec("underline");
      }

      if (key === "k") {
        event.preventDefault();

        openLinkDialog();
      }

      if (key === "z") {
        event.preventDefault();

        exec(
          event.shiftKey
            ? "redo"
            : "undo"
        );
      }

      if (key === "y") {
        event.preventDefault();

        exec("redo");
      }
    }
  }

  /* -------------------------------------------------------
     Toolbar
  ------------------------------------------------------- */

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <ToolButton
            label="Bold"
            onClick={() =>
              exec("bold")
            }
          >
            <Bold size={16} />
          </ToolButton>

          <ToolButton
            label="Italic"
            onClick={() =>
              exec("italic")
            }
          >
            <Italic size={16} />
          </ToolButton>

          <ToolButton
            label="Underline"
            onClick={() =>
              exec(
                "underline"
              )
            }
          >
            <Underline size={16} />
          </ToolButton>

          <ToolButton
            label="Strikethrough"
            onClick={() =>
              exec(
                "strikeThrough"
              )
            }
          >
            <Strikethrough
              size={16}
            />
          </ToolButton>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <ToolButton
            label="Paragraph"
            onClick={() =>
              formatBlock("p")
            }
          >
            <span className="text-xs font-bold">
              P
            </span>
          </ToolButton>

          <ToolButton
            label="Heading 2"
            onClick={() =>
              formatBlock("h2")
            }
          >
            <Heading2 size={17} />
          </ToolButton>

          <ToolButton
            label="Heading 3"
            onClick={() =>
              formatBlock("h3")
            }
          >
            <span className="text-xs font-extrabold">
              H3
            </span>
          </ToolButton>

          <ToolButton
            label="Bullet list"
            onClick={() =>
              exec(
                "insertUnorderedList"
              )
            }
          >
            <List size={17} />
          </ToolButton>

          <ToolButton
            label="Numbered list"
            onClick={() =>
              exec(
                "insertOrderedList"
              )
            }
          >
            <ListOrdered
              size={17}
            />
          </ToolButton>

          <ToolButton
            label="Blockquote"
            onClick={() =>
              formatBlock(
                "blockquote"
              )
            }
          >
            <Quote size={17} />
          </ToolButton>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <ToolButton
            label="Align left"
            onClick={() =>
              exec(
                "justifyLeft"
              )
            }
          >
            <AlignLeft size={16} />
          </ToolButton>

          <ToolButton
            label="Align center"
            onClick={() =>
              exec(
                "justifyCenter"
              )
            }
          >
            <AlignCenter size={16} />
          </ToolButton>

          <ToolButton
            label="Align right"
            onClick={() =>
              exec(
                "justifyRight"
              )
            }
          >
            <AlignRight size={16} />
          </ToolButton>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          {/* TEXT COLOR */}

          <div>
            <select
              aria-label="Text color"
              value={
                textColor
              }
              onChange={(event) => {
                const color =
                  event.target.value;

                setTextColor(
                  color
                );

                applyTextColor(
                  color
                );
              }}
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700"
            >
              {TEXT_COLORS.map(
                (color) => (
                  <option
                    key={
                      color.value
                    }
                    value={
                      color.value
                    }
                  >
                    A{" "}
                    {
                      color.name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* HIGHLIGHT */}

          <div>
            <select
              aria-label="Highlight color"
              value={
                highlightColor
              }
              onChange={(event) => {
                const color =
                  event.target.value;

                setHighlightColor(
                  color
                );

                applyHighlight(
                  color
                );
              }}
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700"
            >
              {HIGHLIGHT_COLORS.map(
                (color) => (
                  <option
                    key={
                      color.value
                    }
                    value={
                      color.value
                    }
                  >
                    Highlight{" "}
                    {
                      color.name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <ToolButton
            label="Insert link"
            onClick={
              openLinkDialog
            }
          >
            <LinkIcon size={16} />
          </ToolButton>

          <ToolButton
            label="Remove link"
            onClick={
              removeLink
            }
          >
            <Unlink size={16} />
          </ToolButton>

          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();

              openInternalPicker();
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Search size={15} />

            Internal link
          </button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <ToolButton
            label="Undo"
            onClick={() =>
              exec("undo")
            }
          >
            <Undo2 size={16} />
          </ToolButton>

          <ToolButton
            label="Redo"
            onClick={() =>
              exec("redo")
            }
          >
            <Redo2 size={16} />
          </ToolButton>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() =>
          emitChange(false)
        }
        onKeyDown={handleKeyDown}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onFocus={saveSelection}
        data-placeholder={placeholder}
        className="prose prose-gray max-w-none px-5 py-5 text-[17px] leading-8 outline-none"
        style={{
          minHeight,
        }}
      />

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
        <p className="text-xs text-gray-500">
          Shortcuts:{" "}
          <span className="font-semibold">
            Ctrl/Cmd+B
          </span>{" "}
          bold ·{" "}
          <span className="font-semibold">
            Ctrl/Cmd+I
          </span>{" "}
          italic ·{" "}
          <span className="font-semibold">
            Ctrl/Cmd+U
          </span>{" "}
          underline ·{" "}
          <span className="font-semibold">
            Ctrl/Cmd+K
          </span>{" "}
          link
        </p>
      </div>

      {/* =====================================================
          LINK DIALOG
      ===================================================== */}

      {showLinkDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-950">
                  Insert link
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add an internal or external
                  destination.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowLinkDialog(
                    false
                  )
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Link text
                </label>

                <input
                  value={
                    linkText
                  }
                  onChange={(event) =>
                    setLinkText(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                  placeholder="Example: read the full guide"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  URL
                </label>

                <input
                  value={
                    linkUrl
                  }
                  onChange={(event) =>
                    setLinkUrl(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                  placeholder="/blog/example or https://example.com"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    openNewTab
                  }
                  onChange={(event) =>
                    setOpenNewTab(
                      event.target
                        .checked
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                Open external link in new tab
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowLinkDialog(
                      false
                    )
                  }
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    insertLink
                  }
                  className="rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Save link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          INTERNAL ARTICLE PICKER
      ===================================================== */}

      {showInternalPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-950">
                    Link to an article
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Choose one of your published or existing
                    articles.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowInternalPicker(
                      false
                    )
                  }
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative mt-4">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  autoFocus
                  value={
                    articleSearch
                  }
                  onChange={(event) => {
                    const value =
                      event.target
                        .value;

                    setArticleSearch(
                      value
                    );

                    void loadInternalArticles(
                      value
                    );
                  }}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-gray-900"
                  placeholder="Search article titles..."
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4">
              {loadingArticles ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  Searching articles...
                </div>
              ) : internalArticles.length ===
                0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    No articles found
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Try another title.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {internalArticles.map(
                    (article) => (
                      <button
                        key={
                          article.id
                        }
                        type="button"
                        onClick={() =>
                          insertInternalArticle(
                            article
                          )
                        }
                        className="w-full rounded-xl border border-gray-200 p-4 text-left transition hover:border-gray-400 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {
                                article.title
                              }
                            </h4>

                            <p className="mt-1 text-xs text-gray-500">
                              /blog/
                              {
                                article.slug
                              }
                            </p>
                          </div>

                          <Check
                            size={16}
                            className="shrink-0 text-gray-400"
                          />
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ADD BLOCK BUTTON
========================================================= */

function AddBlockButton({
  type,
  label,
  icon,
  onClick,
}: {
  type: BlogContentBlock["type"];
  label: string;
  icon: React.ReactNode;
  onClick: (
    type: BlogContentBlock["type"]
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onClick(type)
      }
      className="flex min-w-[110px] flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   MAIN EDITOR
========================================================= */

export default function BlogBlockEditor({
  blocks,
  onChange,
}: BlogBlockEditorProps) {
  const [
    uploadingImage,
    setUploadingImage,
  ] = useState<
    number | null
  >(null);

  const [
    uploadError,
    setUploadError,
  ] = useState<string | null>(
    null
  );

  const fileInputRefs =
    useRef<
      Record<
        number,
        HTMLInputElement | null
      >
    >({});

  /* -------------------------------------------------------
     Block updates
  ------------------------------------------------------- */

  function updateBlock(
    index: number,
    updates: Partial<BlogContentBlock>
  ) {
    const next = [
      ...blocks,
    ];

    next[index] = {
      ...next[index],
      ...updates,
    };

    onChange(next);
  }

  function addBlock(
    type: BlogContentBlock["type"]
  ) {
    onChange([
      ...blocks,
      createBlock(type),
    ]);
  }

  function addBlockAfter(
    index: number,
    type: BlogContentBlock["type"]
  ) {
    const next = [
      ...blocks,
    ];

    next.splice(
      index + 1,
      0,
      createBlock(type)
    );

    onChange(next);
  }

  function deleteBlock(
    index: number
  ) {
    if (
      !window.confirm(
        "Delete this block?"
      )
    ) {
      return;
    }

    onChange(
      blocks.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  function duplicateBlock(
    index: number
  ) {
    const original =
      blocks[index];

    const duplicate = {
      ...original,
      id: createId(),
      items:
        original.items
          ? [
              ...original.items,
            ]
          : undefined,
      headers:
        original.headers
          ? [
              ...original.headers,
            ]
          : undefined,
      rows:
        original.rows
          ? original.rows.map(
              (row) => [
                ...row,
              ]
            )
          : undefined,
    };

    const next = [
      ...blocks,
    ];

    next.splice(
      index + 1,
      0,
      duplicate
    );

    onChange(next);
  }

  function moveBlock(
    index: number,
    direction:
      | "up"
      | "down"
  ) {
    const next = [
      ...blocks,
    ];

    const target =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      target < 0 ||
      target >=
        next.length
    ) {
      return;
    }

    [
      next[index],
      next[target],
    ] = [
      next[target],
      next[index],
    ];

    onChange(next);
  }

  /* -------------------------------------------------------
     Image upload
  ------------------------------------------------------- */

  async function uploadImage(
    index: number,
    file: File
  ) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setUploadError(
        "Please upload JPG, PNG, WEBP or GIF images."
      );

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setUploadError(
        "Image must be smaller than 10MB."
      );

      return;
    }

    try {
      setUploadError(
        null
      );

      setUploadingImage(
        index
      );

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "folder",
        "articles"
      );

      const response =
        await fetch(
          "/api/blog/upload-image",
          {
            method: "POST",
            body: formData,
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Image upload failed."
        );
      }

      const url =
        result?.url ||
        result?.data?.url;

      if (!url) {
        throw new Error(
          "Upload succeeded but no image URL was returned."
        );
      }

      updateBlock(
        index,
        {
          url,
        }
      );
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Image upload failed."
      );
    } finally {
      setUploadingImage(
        null
      );
    }
  }

  /* -------------------------------------------------------
     Lists
  ------------------------------------------------------- */

  function updateListItem(
    index: number,
    itemIndex: number,
    value: string
  ) {
    const items = [
      ...(blocks[index]
        .items || []),
    ];

    items[itemIndex] =
      value;

    updateBlock(
      index,
      {
        items,
      }
    );
  }

  function addListItem(
    index: number
  ) {
    const items = [
      ...(blocks[index]
        .items || []),
      "",
    ];

    updateBlock(
      index,
      {
        items,
      }
    );
  }

  function deleteListItem(
    index: number,
    itemIndex: number
  ) {
    const items = [
      ...(blocks[index]
        .items || []),
    ];

    items.splice(
      itemIndex,
      1
    );

    updateBlock(
      index,
      {
        items:
          items.length > 0
            ? items
            : [""],
      }
    );
  }

  /* -------------------------------------------------------
     Tables
  ------------------------------------------------------- */

  function updateTableHeader(
    index: number,
    columnIndex: number,
    value: string
  ) {
    const headers = [
      ...(blocks[index]
        .headers || []),
    ];

    headers[columnIndex] =
      value;

    updateBlock(
      index,
      {
        headers,
      }
    );
  }

  function updateTableCell(
    index: number,
    rowIndex: number,
    columnIndex: number,
    value: string
  ) {
    const rows =
      blocks[index].rows?.map(
        (row) => [
          ...row,
        ]
      ) || [];

    if (!rows[rowIndex]) {
      return;
    }

    rows[rowIndex][
      columnIndex
    ] = value;

    updateBlock(
      index,
      {
        rows,
      }
    );
  }

  function addTableColumn(
    index: number
  ) {
    const headers = [
      ...(blocks[index]
        .headers || []),
      `Column ${
        (blocks[index]
          .headers
          ?.length || 0) +
        1
      }`,
    ];

    const rows =
      blocks[index].rows?.map(
        (row) => [
          ...row,
          "",
        ]
      ) || [];

    updateBlock(
      index,
      {
        headers,
        rows,
      }
    );
  }

  function deleteTableColumn(
    index: number,
    columnIndex: number
  ) {
    const headers =
      blocks[index].headers
        ? blocks[index].headers.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              columnIndex
          )
        : [];

    const rows =
      blocks[index].rows?.map(
        (row) =>
          row.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              columnIndex
          )
      ) || [];

    updateBlock(
      index,
      {
        headers,
        rows,
      }
    );
  }

  function addTableRow(
    index: number
  ) {
    const columnCount =
      blocks[index].headers
        ?.length || 2;

    const rows = [
      ...(blocks[index].rows ||
        []),
      Array.from(
        {
          length:
            columnCount,
        },
        () => ""
      ),
    ];

    updateBlock(
      index,
      {
        rows,
      }
    );
  }

  function deleteTableRow(
    index: number,
    rowIndex: number
  ) {
    const rows = [
      ...(blocks[index].rows ||
        []),
    ];

    rows.splice(
      rowIndex,
      1
    );

    updateBlock(
      index,
      {
        rows,
      }
    );
  }

  /* -------------------------------------------------------
     Render block
  ------------------------------------------------------- */

  function renderBlock(
    block: BlogContentBlock,
    index: number
  ) {
    const type =
      block.type;

    return (
      <div
        key={
          block.id ||
          `block-${index}`
        }
        className="rounded-2xl border border-gray-200 bg-white"
      >
        {/* BLOCK HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {type}
            </span>

            <span className="text-xs font-medium text-gray-500">
              Block{" "}
              {index + 1}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={
                index === 0
              }
              onClick={() =>
                moveBlock(
                  index,
                  "up"
                )
              }
              className="rounded-lg p-2 text-gray-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
              title="Move up"
            >
              <ChevronUp
                size={16}
              />
            </button>

            <button
              type="button"
              disabled={
                index ===
                blocks.length - 1
              }
              onClick={() =>
                moveBlock(
                  index,
                  "down"
                )
              }
              className="rounded-lg p-2 text-gray-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
              title="Move down"
            >
              <ChevronDown
                size={16}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                duplicateBlock(
                  index
                )
              }
              className="rounded-lg p-2 text-gray-500 hover:bg-white"
              title="Duplicate"
            >
              <Copy size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                deleteBlock(
                  index
                )
              }
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              title="Delete"
            >
              <Trash2
                size={16}
              />
            </button>
          </div>
        </div>

        {/* BLOCK BODY */}

        <div className="p-4 sm:p-5">
          {/* TEXT */}

          {(
            type === "text" ||
            type === "paragraph"
          ) && (
            <RichTextEditor
              value={getBlockText(
                block
              )}
              onChange={(value) =>
                updateBlock(
                  index,
                  {
                    text: value,
                    content:
                      value,
                  }
                )
              }
              placeholder="Write your paragraph here..."
              minHeight="220px"
            />
          )}

          {/* HEADING */}

          {type ===
            "heading" && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Heading level
                </label>

                <select
                  value={
                    block.level ||
                    2
                  }
                  onChange={(event) =>
                    updateBlock(
                      index,
                      {
                        level:
                          Number(
                            event
                              .target
                              .value
                          ),
                      }
                    )
                  }
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
                >
                  <option value={2}>
                    H2
                  </option>

                  <option value={3}>
                    H3
                  </option>
                </select>
              </div>

              <RichTextEditor
                value={getBlockText(
                  block
                )}
                onChange={(value) =>
                  updateBlock(
                    index,
                    {
                      text: value,
                      content:
                        value,
                    }
                  )
                }
                placeholder="Heading..."
                minHeight="110px"
              />
            </div>
          )}

          {/* IMAGE */}

          {type ===
            "image" && (
            <div className="space-y-5">
              <input
                ref={(element) => {
                  fileInputRefs.current[
                    index
                  ] = element;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file =
                    event.target
                      .files?.[0];

                  if (file) {
                    void uploadImage(
                      index,
                      file
                    );
                  }

                  event.target.value =
                    "";
                }}
              />

              {block.url ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <img
                    src={
                      block.url
                    }
                    alt={
                      block.alt ||
                      "Article image"
                    }
                    className="max-h-[500px] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                  <div className="text-center">
                    <ImageIcon
                      size={32}
                      className="mx-auto text-gray-400"
                    />

                    <p className="mt-3 text-sm font-semibold text-gray-700">
                      No image selected
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    fileInputRefs.current[
                      index
                    ]?.click()
                  }
                  disabled={
                    uploadingImage ===
                    index
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  <ImageIcon
                    size={16}
                  />

                  {uploadingImage ===
                  index
                    ? "Uploading..."
                    : "Upload image"}
                </button>

                {block.url && (
                  <button
                    type="button"
                    onClick={() =>
                      updateBlock(
                        index,
                        {
                          url: "",
                        }
                      )
                    }
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Alt text
                </label>

                <input
                  value={
                    block.alt ||
                    ""
                  }
                  onChange={(event) =>
                    updateBlock(
                      index,
                      {
                        alt: event
                          .target
                          .value,
                      }
                    )
                  }
                  placeholder="Describe the image for accessibility and SEO"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Caption
                </label>

                <input
                  value={
                    block.caption ||
                    ""
                  }
                  onChange={(event) =>
                    updateBlock(
                      index,
                      {
                        caption:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  placeholder="Optional image caption"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>
            </div>
          )}

          {/* LIST */}

          {[
            "bullet-list",
            "bullets",
            "unordered-list",
            "numbered-list",
            "ordered-list",
          ].includes(
            type
          ) && (
            <div className="space-y-3">
              {(
                block.items || [
                  "",
                ]
              ).map(
                (
                  item,
                  itemIndex
                ) => (
                  <div
                    key={
                      itemIndex
                    }
                    className="flex gap-2"
                  >
                    <span className="flex h-11 w-8 shrink-0 items-center justify-center text-sm font-bold text-gray-400">
                      {[
                        "numbered-list",
                        "ordered-list",
                      ].includes(
                        type
                      )
                        ? `${
                            itemIndex +
                            1
                          }.`
                        : "•"}
                    </span>

                    <input
                      value={item}
                      onChange={(event) =>
                        updateListItem(
                          index,
                          itemIndex,
                          event
                            .target
                            .value
                        )
                      }
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      placeholder="List item..."
                    />

                    <button
                      type="button"
                      onClick={() =>
                        deleteListItem(
                          index,
                          itemIndex
                        )
                      }
                      className="rounded-xl p-3 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  addListItem(
                    index
                  )
                }
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                + Add item
              </button>
            </div>
          )}

          {/* QUOTE */}

          {type ===
            "quote" && (
            <RichTextEditor
              value={getBlockText(
                block
              )}
              onChange={(value) =>
                updateBlock(
                  index,
                  {
                    text: value,
                    content:
                      value,
                  }
                )
              }
              placeholder="Write the quotation..."
              minHeight="160px"
            />
          )}

          {/* CALLOUT */}

          {type ===
            "callout" && (
            <div className="space-y-4">
              <input
                value={
                  block.label ||
                  ""
                }
                onChange={(event) =>
                  updateBlock(
                    index,
                    {
                      label:
                        event
                          .target
                          .value,
                    }
                  )
                }
                placeholder="Note"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-gray-900"
              />

              <RichTextEditor
                value={getBlockText(
                  block
                )}
                onChange={(value) =>
                  updateBlock(
                    index,
                    {
                      text: value,
                      content:
                        value,
                    }
                  )
                }
                placeholder="Write the callout..."
                minHeight="150px"
              />
            </div>
          )}

          {/* LINK BLOCK */}

          {type ===
            "link" && (
            <div className="space-y-4">
              <input
                value={getBlockText(
                  block
                )}
                onChange={(event) =>
                  updateBlock(
                    index,
                    {
                      text: event
                        .target
                        .value,
                    }
                  )
                }
                placeholder="Link text"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />

              <input
                value={
                  block.href ||
                  ""
                }
                onChange={(event) =>
                  updateBlock(
                    index,
                    {
                      href: event
                        .target
                        .value,
                    }
                  )
                }
                placeholder="/blog/article-slug or https://example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(
                    block.external
                  )}
                  onChange={(event) =>
                    updateBlock(
                      index,
                      {
                        external:
                          event
                            .target
                            .checked,
                      }
                    )
                  }
                />

                External link
              </label>
            </div>
          )}

          {/* TABLE */}

          {type ===
            "table" && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      {(
                        block.headers ||
                        []
                      ).map(
                        (
                          header,
                          columnIndex
                        ) => (
                          <th
                            key={
                              columnIndex
                            }
                            className="border border-gray-200 bg-gray-50 p-2"
                          >
                            <div className="flex gap-1">
                              <input
                                value={
                                  header
                                }
                                onChange={(event) =>
                                  updateTableHeader(
                                    index,
                                    columnIndex,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="min-w-[130px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  deleteTableColumn(
                                    index,
                                    columnIndex
                                  )
                                }
                                className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                              >
                                <X
                                  size={14}
                                />
                              </button>
                            </div>
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {(
                      block.rows ||
                      []
                    ).map(
                      (
                        row,
                        rowIndex
                      ) => (
                        <tr
                          key={
                            rowIndex
                          }
                        >
                          {row.map(
                            (
                              cell,
                              columnIndex
                            ) => (
                              <td
                                key={
                                  columnIndex
                                }
                                className="border border-gray-200 p-2"
                              >
                                <input
                                  value={
                                    cell
                                  }
                                  onChange={(event) =>
                                    updateTableCell(
                                      index,
                                      rowIndex,
                                      columnIndex,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="min-w-[130px] rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                />
                              </td>
                            )
                          )}

                          <td className="border border-gray-200 p-2">
                            <button
                              type="button"
                              onClick={() =>
                                deleteTableRow(
                                  index,
                                  rowIndex
                                )
                              }
                              className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    addTableRow(
                      index
                    )
                  }
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  + Add row
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addTableColumn(
                      index
                    )
                  }
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  + Add column
                </button>
              </div>
            </div>
          )}

          {/* UNKNOWN */}

          {[
            "text",
            "paragraph",
            "heading",
            "image",
            "bullet-list",
            "bullets",
            "unordered-list",
            "numbered-list",
            "ordered-list",
            "quote",
            "callout",
            "link",
            "table",
          ].includes(type) ===
            false && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              This is an older or unsupported block type.
            </div>
          )}
        </div>

        {/* ADD AFTER */}

        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                addBlockAfter(
                  index,
                  "text"
                )
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              + Text
            </button>

            <button
              type="button"
              onClick={() =>
                addBlockAfter(
                  index,
                  "heading"
                )
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              + Heading
            </button>

            <button
              type="button"
              onClick={() =>
                addBlockAfter(
                  index,
                  "image"
                )
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              + Image
            </button>

            <button
              type="button"
              onClick={() =>
                addBlockAfter(
                  index,
                  "bullet-list"
                )
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              + Bullets
            </button>

            <button
              type="button"
              onClick={() =>
                addBlockAfter(
                  index,
                  "numbered-list"
                )
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              + Numbered
            </button>

            <button
              type="button"
              onClick={() =>
                addBlockAfter(
                  index,
                  "callout"
                )
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              + Callout
            </button>

            <button
              type="button"
              onClick={() =>
                addBlockAfter(
                  index,
                  "quote"
                )
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              + Quote
            </button>

            <button
              type="button"
              onClick={() =>
                addBlockAfter(
                  index,
                  "table"
                )
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              + Table
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Add panel
  ------------------------------------------------------- */

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-950">
            Article Content
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Build your article section by section. Use the rich
            text editor for formatting inside paragraphs.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <AddBlockButton
            type="text"
            label="Paragraph"
            icon={
              <span className="text-xs font-bold">
                P
              </span>
            }
            onClick={
              addBlock
            }
          />

          <AddBlockButton
            type="heading"
            label="Heading"
            icon={
              <Heading2 size={16} />
            }
            onClick={
              addBlock
            }
          />

          <AddBlockButton
            type="image"
            label="Image"
            icon={
              <ImageIcon size={16} />
            }
            onClick={
              addBlock
            }
          />

          <AddBlockButton
            type="bullet-list"
            label="Bullets"
            icon={
              <List size={16} />
            }
            onClick={
              addBlock
            }
          />

          <AddBlockButton
            type="numbered-list"
            label="Numbered"
            icon={
              <ListOrdered
                size={16}
              />
            }
            onClick={
              addBlock
            }
          />

          <AddBlockButton
            type="quote"
            label="Quote"
            icon={
              <Quote size={16} />
            }
            onClick={
              addBlock
            }
          />

          <AddBlockButton
            type="callout"
            label="Callout"
            icon={
              <MessageSquare
                size={16}
              />
            }
            onClick={
              addBlock
            }
          />

          <AddBlockButton
            type="table"
            label="Table"
            icon={
              <Table2 size={16} />
            }
            onClick={
              addBlock
            }
          />
        </div>
      </div>

      {uploadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {blocks.length ===
      0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-10 text-center">
          <p className="text-sm font-semibold text-gray-700">
            Your article has no content blocks yet.
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Start with a paragraph or heading above.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {blocks.map(
            (block, index) =>
              renderBlock(
                block,
                index
              )
          )}
        </div>
      )}
    </div>
  );
}