import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

/**
 * Shared attribute set for both table cells and header cells: background
 * color, border color, and vertical alignment. Rendered as real inline CSS
 * (backgroundColor/borderColor/verticalAlign) merged into the cell's style
 * attribute, so - like ResizableImage's caption - these actually show up
 * wherever the saved HTML is later displayed, not just live in the editor.
 */
function cellAttributes() {
  return {
    backgroundColor: {
      default: null,
      parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
      renderHTML: (attrs: { backgroundColor?: string | null }) =>
        attrs.backgroundColor ? { style: `background-color:${attrs.backgroundColor}` } : {},
    },
    borderColor: {
      default: null,
      parseHTML: (element: HTMLElement) => element.style.borderColor || null,
      renderHTML: (attrs: { borderColor?: string | null }) =>
        attrs.borderColor ? { style: `border-color:${attrs.borderColor}` } : {},
    },
    verticalAlign: {
      default: 'top',
      parseHTML: (element: HTMLElement) => element.style.verticalAlign || 'top',
      renderHTML: (attrs: { verticalAlign?: string }) =>
        attrs.verticalAlign && attrs.verticalAlign !== 'top' ? { style: `vertical-align:${attrs.verticalAlign}` } : {},
    },
  };
}

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...cellAttributes(),
    };
  },
});

export const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...cellAttributes(),
    };
  },
});
