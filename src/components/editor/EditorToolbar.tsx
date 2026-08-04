import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon, Eraser, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks, Quote, Code, Link2, Link2Off, Undo2, Redo2, ImagePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TableControls from './TableControls';
import { cn } from '@/lib/utils';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, active, disabled, label, children }) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={active}
    title={label}
    className={cn(
      'h-8 w-8 p-0 shrink-0',
      active && 'bg-estate-blue/15 text-estate-blue hover:bg-estate-blue/20'
    )}
  >
    {children}
  </Button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-border shrink-0 mx-0.5" />;

const HEADING_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: '1', label: 'Heading 1' },
  { value: '2', label: 'Heading 2' },
  { value: '3', label: 'Heading 3' },
  { value: '4', label: 'Heading 4' },
  { value: '5', label: 'Heading 5' },
  { value: '6', label: 'Heading 6' },
];

interface EditorToolbarProps {
  editor: Editor | null;
  /** Called with the chosen file when the user picks one via the Image toolbar button. */
  onInsertImage?: (file: File) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onInsertImage }) => {
  const [linkPromptOpen, setLinkPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const currentHeading = editor.isActive('heading', { level: 1 }) ? '1'
    : editor.isActive('heading', { level: 2 }) ? '2'
    : editor.isActive('heading', { level: 3 }) ? '3'
    : editor.isActive('heading', { level: 4 }) ? '4'
    : editor.isActive('heading', { level: 5 }) ? '5'
    : editor.isActive('heading', { level: 6 }) ? '6'
    : 'paragraph';

  const setHeading = (value: string) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: Number(value) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
  };

  const openLinkPrompt = () => {
    const existing = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(existing || '');
    setLinkPromptOpen(true);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      // Safe by construction: only http(s) and mailto are ever written into
      // the href, so a javascript: URL typed into the prompt can't get through.
      const safeUrl = /^https?:\/\/|^mailto:/i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: safeUrl, target: '_blank', rel: 'noopener noreferrer' }).run();
    }
    setLinkPromptOpen(false);
  };

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="flex items-center gap-0.5 p-1.5 overflow-x-auto scrollbar-thin">
        {/* Text formatting */}
        <ToolbarButton label="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Superscript" active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
          <SuperscriptIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Subscript" active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()}>
          <SubscriptIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Paragraph / headings */}
        <Select value={currentHeading} onValueChange={setHeading}>
          <SelectTrigger className="h-8 w-[130px] text-xs shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEADING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton label="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Checklist" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <ListChecks className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Blocks */}
        <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Tables */}
        <TableControls editor={editor} />

        <ToolbarDivider />

        {/* Image */}
        {onInsertImage && (
          <>
            <ToolbarButton label="Insert image" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
            </ToolbarButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onInsertImage(file);
                e.target.value = ''; // allow picking the same file again later
              }}
            />
          </>
        )}

        <ToolbarDivider />

        {/* Links */}
        <ToolbarButton label="Insert/edit link (Ctrl+K)" active={editor.isActive('link')} onClick={openLinkPrompt}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Link2Off className="h-4 w-4" />
          </ToolbarButton>
        )}

        <ToolbarDivider />

        {/* History */}
        <ToolbarButton label="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo (Ctrl+Y)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {linkPromptOpen && (
        <div className="flex items-center gap-2 p-2 border-t border-border bg-background">
          <input
            type="url"
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
              if (e.key === 'Escape') setLinkPromptOpen(false);
            }}
            placeholder="https://example.com"
            className="flex-1 h-8 px-2 text-sm rounded-md border border-input bg-background"
          />
          <Button type="button" size="sm" onClick={applyLink}>Apply</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setLinkPromptOpen(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
};

export default EditorToolbar;
