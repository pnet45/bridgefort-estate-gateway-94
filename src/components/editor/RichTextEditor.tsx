import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { CustomTableCell, CustomTableHeader } from './extensions/CustomTableCell';
import { ResizableImage } from './extensions/ResizableImage';
import { uploadEditorImage } from './editorImageUpload';
import EditorToolbar from './EditorToolbar';
import { sanitizeRichText } from './richTextSanitize';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const SYSTEM_FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const LineHeight = TextStyle.extend({
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        lineHeight: {
          default: null,
          parseHTML: element => element.style.lineHeight || null,
          renderHTML: attributes => attributes.lineHeight ? { style: `line-height: ${attributes.lineHeight}` } : {},
        },
      },
    }];
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
  minHeightClassName?: string;
  maxHeightClassName?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value, onChange, placeholder = 'Start typing…', maxLength, className, disabled = false,
  minHeightClassName = 'min-h-[200px]', maxHeightClassName,
}) => {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const flushChange = (currentEditor: Editor) => {
    if (debounceTimerRef.current) { clearTimeout(debounceTimerRef.current); debounceTimerRef.current = undefined; }
    onChange(sanitizeRichText(currentEditor.getHTML()));
  };
  const editor = useEditor({
    extensions: [
      StarterKit, Underline, Superscript, Subscript,
      TextStyle, Color, FontFamily, LineHeight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'], HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Placeholder.configure({ placeholder }), TaskList, TaskItem.configure({ nested: true }),
      ResizableImage.configure({ inline: false }), Table.configure({ resizable: true }), TableRow,
      CustomTableHeader, CustomTableCell, ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
    ],
    content: value, editable: !disabled,
    onCreate: ({ editor }) => {
      // New compose windows start with the system font as an actual text
      // mark, not just inherited CSS. This makes the chosen font survive
      // sanitizing and remain visible to the email recipient.
      if (!value || value === '<p></p>') {
        editor.chain().focus().setFontFamily(SYSTEM_FONT).run();
        flushChange(editor);
      }
    },
    onUpdate: ({ editor }) => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); debounceTimerRef.current = setTimeout(() => flushChange(editor), 300); },
    onBlur: ({ editor }) => flushChange(editor),
    editorProps: {
      attributes: {
        class: cn('prose prose-sm sm:prose-base max-w-none w-full min-w-0', 'focus:outline-none px-4 py-3 break-words [overflow-wrap:anywhere]', '[&_p]:break-words [&_li]:break-words [&_a]:break-all', '[&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words', '[&_code]:break-words [&_code]:[overflow-wrap:anywhere]', '[&_img]:max-w-full [&_img]:h-auto', '[&_video]:max-w-full [&_video]:h-auto', '[&_iframe]:max-w-full', '[&_table]:w-full [&_table]:max-w-full [&_table]:table-fixed', minHeightClassName),
        spellcheck: 'true',
      },
      handlePaste: (_view, event: ClipboardEvent) => { const files = Array.from(event.clipboardData?.files || []).filter((f): f is File => f.type.startsWith('image/')); if (!files.length) return false; event.preventDefault(); files.forEach(handleImageFile); return true; },
      handleDrop: (_view, event: DragEvent) => { const files = Array.from(event.dataTransfer?.files || []).filter((f): f is File => f.type.startsWith('image/')); if (!files.length) return false; event.preventDefault(); files.forEach(handleImageFile); return true; },
    },
  });
  async function handleImageFile(file: File) {
    const { url, error } = await uploadEditorImage(file);
    if (error || !url) { toast({ title: 'Image upload failed', description: error || "We couldn't upload this image. Please try again.", variant: 'destructive' }); return; }
    editor?.chain().focus().insertContent({ type: 'resizableImage', attrs: { src: url, alt: file.name.replace(/\.[^.]+$/, ''), width: '100%', align: 'center', caption: '' } }).run();
  }
  useEffect(() => { if (!editor) return; const current = editor.getHTML(); if (value !== current && value !== undefined) editor.commands.setContent(value, false); }, [value, editor]);
  useEffect(() => { if (editor) editor.setEditable(!disabled); }, [disabled, editor]);
  useEffect(() => () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); }, []);
  const charCount = editor?.storage.characterCount?.characters?.() ?? 0;
  const nearLimit = typeof maxLength === 'number' && maxLength - charCount <= Math.max(10, maxLength * 0.1);
  return <div className={cn('w-full min-w-0 max-w-full rounded-md border border-input bg-background overflow-hidden isolate', className)}>
    <div className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden"><EditorToolbar editor={editor} onInsertImage={handleImageFile} /></div>
    <div className={cn('w-full min-w-0 max-w-full overflow-x-hidden', maxHeightClassName && `${maxHeightClassName} overflow-y-auto`)}><div className="w-full min-w-0 max-w-full overflow-x-hidden"><EditorContent editor={editor} className="w-full min-w-0 max-w-full overflow-x-hidden" /></div></div>
    {typeof maxLength === 'number' && <div className={cn('px-4 py-1.5 text-xs text-right border-t border-border', nearLimit ? 'text-destructive' : 'text-muted-foreground')}>{charCount}/{maxLength}</div>}
  </div>;
};
export default RichTextEditor;
