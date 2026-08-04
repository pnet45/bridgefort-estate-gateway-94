import DOMPurify from 'dompurify';

/**
 * Single source of truth for what's allowed in rich text content produced by
 * RichTextEditor, and what's allowed when rendering it back (blog posts, CMS,
 * email viewer, CRM notes, admin previews). Keeping one shared config means a
 * tag the editor can produce never gets silently stripped somewhere it's
 * displayed, and nothing outside the editor's own schema ever gets through.
 *
 * Deliberately does NOT allow <script>, event handler attributes (onclick
 * etc.), <iframe>, <object>, <embed>, or javascript: URLs - DOMPurify blocks
 * these by default, but the explicit ALLOWED_TAGS/ALLOWED_ATTR allowlist below
 * is the real enforcement: anything not listed is stripped regardless.
 */
export const RICH_TEXT_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 's', 'sup', 'sub', 'code', 'mark',
    'ul', 'ol', 'li',
    'blockquote', 'pre',
    'a',
    'hr',
    // Task list output from @tiptap/extension-task-item
    'label', 'input',
    // Image output from the custom ResizableImage node
    'figure', 'figcaption', 'img',
    // Table output from @tiptap/extension-table
    'table', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: [
    'class', 'style',
    'href', 'target', 'rel',
    // Task list state
    'type', 'checked', 'disabled', 'data-type', 'data-checked',
    // Alignment/formatting hints Tiptap attaches to block nodes
    'data-align',
    // Images
    'src', 'alt', 'width', 'height',
    // Tables
    'colspan', 'rowspan', 'colwidth',
  ],
  ALLOW_DATA_ATTR: false,
};

/** Sanitizes rich text HTML before it's persisted or re-rendered. */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, RICH_TEXT_SANITIZE_CONFIG);
}
