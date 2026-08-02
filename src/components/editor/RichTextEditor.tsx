import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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
import EditorToolbar from './EditorToolbar';
import { sanitizeRichText } from './richTextSanitize';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Caps content length (character count of the rendered text, same convention as the app's Textarea counter) and shows a live N/max indicator. */
  maxLength?: number;
  className?: string;
  /** Disables editing (e.g. while a form is submitting) without unmounting the editor. */
  disabled?: boolean;
  minHeightClassName?: string;
}

/**
 * Reusable rich text editor used across blog/CMS content, property
 * descriptions, email compose, and CRM notes - one component, one schema, one
 * sanitization path (src/components/editor/richTextSanitize.ts) shared by
 * every place this content is later rendered.
 *
 * NOTE: images, tables, video embeds, colors/fonts, emoji, and templates are
 * intentionally not in this first pass - see the batch changelog for the
 * phased plan. This covers: bold/italic/underline/strike/superscript/
 * subscript/clear formatting, paragraph + H1-H6, alignment, bullet/numbered/
 * checklist, blockquote, code block, links, undo/redo, and a live character
 * counter. Keyboard shortcuts (Ctrl+B/I/U/Z/Y etc.) are handled natively by
 * Tiptap's StarterKit - no extra wiring needed.
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing…',
  maxLength,
  className,
  disabled = false,
  minHeightClassName = 'min-h-[200px]',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        // Belt-and-suspenders alongside the toolbar's own URL-scheme check:
        // only allow protocols we intend to support in stored/rendered content.
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(sanitizeRichText(editor.getHTML()));
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none focus:outline-none px-4 py-3',
          minHeightClassName
        ),
      },
    },
  });

  // Keep the editor in sync if `value` changes externally (e.g. loading a
  // different record into the same mounted editor instance).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  const charCount = editor?.storage.characterCount?.characters?.() ?? 0;
  const nearLimit = typeof maxLength === 'number' && maxLength - charCount <= Math.max(10, maxLength * 0.1);

  return (
    <div className={cn('rounded-md border border-input bg-background overflow-hidden', className)}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      {typeof maxLength === 'number' && (
        <div className={cn(
          'px-4 py-1.5 text-xs text-right border-t border-border',
          nearLimit ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
