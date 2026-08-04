import React from 'react';
import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from '@tiptap/react';
import { AlignLeft, AlignCenter, AlignRight, Trash2, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

const WIDTH_PRESETS = [
  { label: '25%', value: '25%' },
  { label: '50%', value: '50%' },
  { label: '75%', value: '75%' },
  { label: '100%', value: '100%' },
];

/**
 * Renders one image node: the <img>, its caption (editable inline via a
 * plain input synced to the node's `caption` attribute), and - only while
 * the node is selected - a small floating control bar for width presets,
 * alignment, alt text, and removing the image.
 *
 * Resize here is preset-based (25/50/75/100% width) rather than a free-drag
 * corner handle. Deliberate first-pass choice: a hand-built drag-resize
 * handle is meaningfully more code and more ways to get subtly wrong, and I
 * can't test either approach in this sandbox (no Tiptap install here - see
 * the batch changelog). Presets cover the common case reliably; happy to add
 * real drag-resize as a follow-up if wanted.
 */
const ResizableImageComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, selected, deleteNode }) => {
  const { src, alt, width, align, caption } = node.attrs as {
    src: string; alt: string | null; width: string; align: 'left' | 'center' | 'right'; caption: string;
  };

  const justify = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  const handleEditAlt = () => {
    const next = window.prompt('Alt text (for accessibility and SEO)', alt || '');
    if (next !== null) updateAttributes({ alt: next });
  };

  return (
    <NodeViewWrapper className={cn('my-3 flex flex-col', justify)} data-drag-handle>
      <div className={cn('relative group inline-block', selected && 'ring-2 ring-estate-blue rounded-md')} style={{ width }}>
        <img src={src} alt={alt || ''} className="w-full h-auto rounded-md block" />

        {selected && (
          <div className="absolute -top-10 left-0 flex items-center gap-1 bg-slate-900 text-white rounded-md px-1.5 py-1 shadow-lg z-10">
            {WIDTH_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => updateAttributes({ width: preset.value })}
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded hover:bg-white/20 transition-colors',
                  width === preset.value && 'bg-white/25 font-medium'
                )}
              >
                {preset.label}
              </button>
            ))}
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            <button type="button" title="Align left" onClick={() => updateAttributes({ align: 'left' })} className={cn('p-1 rounded hover:bg-white/20', align === 'left' && 'bg-white/25')}>
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Align center" onClick={() => updateAttributes({ align: 'center' })} className={cn('p-1 rounded hover:bg-white/20', align === 'center' && 'bg-white/25')}>
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Align right" onClick={() => updateAttributes({ align: 'right' })} className={cn('p-1 rounded hover:bg-white/20', align === 'right' && 'bg-white/25')}>
              <AlignRight className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-0.5" />
            <button type="button" title="Edit alt text" onClick={handleEditAlt} className="p-1 rounded hover:bg-white/20">
              <Type className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Remove image" onClick={() => deleteNode()} className="p-1 rounded hover:bg-red-500/80">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <input
        type="text"
        value={caption}
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        placeholder="Add a caption (optional)"
        style={{ width }}
        className="mt-1.5 text-sm text-center text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-estate-blue rounded px-1 placeholder:italic"
      />
    </NodeViewWrapper>
  );
};

const ALIGN_TO_JUSTIFY: Record<string, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

export const ResizableImage = Image.extend({
  name: 'resizableImage',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: '100%' },
      align: { default: 'center' },
      caption: { default: '' },
    };
  },

  // Two parse rules: the first recovers width/align/caption when re-opening
  // content this editor previously saved (figure > img + figcaption). The
  // second is a plain fallback for a bare <img> - e.g. HTML pasted in from
  // elsewhere, or older content saved before this extension existed - so it
  // still becomes an editable image node, just with default width/align and
  // no caption.
  parseHTML() {
    return [
      {
        tag: 'figure[data-type="resizable-image"]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const img = el.querySelector('img');
          const figcaption = el.querySelector('figcaption');
          if (!img) return false;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            width: img.style.width || '100%',
            align: el.getAttribute('data-align') || 'center',
            caption: figcaption?.textContent || '',
          };
        },
      },
      {
        tag: 'img[src]',
      },
    ];
  },

  // Renders real, visible HTML - not just data attributes - so the width,
  // alignment, and caption actually show up correctly wherever this content
  // is displayed outside the editor (blog page, CMS preview, email viewer),
  // not only inside Tiptap itself.
  renderHTML({ HTMLAttributes, node }) {
    const { width, align, caption, src, alt } = node.attrs as {
      width: string; align: string; caption: string; src: string; alt: string | null;
    };

    const imgAttrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      src,
      alt: alt || '',
      style: `width:${width};height:auto;border-radius:6px;display:block;margin:0;`,
    });

    const figureChildren: Array<[string, Record<string, string>] | [string, Record<string, string>, string]> = [
      ['img', imgAttrs],
    ];
    if (caption) {
      figureChildren.push(['figcaption', { style: 'text-align:center;font-size:0.875rem;color:#6b7280;margin-top:6px;' }, caption]);
    }

    return [
      'figure',
      {
        'data-type': 'resizable-image',
        'data-align': align,
        style: `display:flex;flex-direction:column;align-items:${ALIGN_TO_JUSTIFY[align] || 'center'};margin:12px 0;`,
      },
      ...figureChildren,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;
