import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Table as TableIcon, Rows3, Columns3, Combine, SplitSquareHorizontal, Trash2,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, PaintBucket, Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const GRID_MAX = 8;

const COLOR_SWATCHES = [
  { label: 'None', value: null },
  { label: 'Light blue', value: '#dbeafe' },
  { label: 'Light green', value: '#dcfce7' },
  { label: 'Light yellow', value: '#fef9c3' },
  { label: 'Light red', value: '#fee2e2' },
  { label: 'Light purple', value: '#f3e8ff' },
  { label: 'Light gray', value: '#f1f5f9' },
];

interface TableControlsProps {
  editor: Editor;
}

const TableControls: React.FC<TableControlsProps> = ({ editor }) => {
  const [gridHover, setGridHover] = useState({ rows: 0, cols: 0 });
  const [insertOpen, setInsertOpen] = useState(false);
  const inTable = editor.isActive('table');

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setInsertOpen(false);
  };

  const applyCellStyle = (key: 'backgroundColor' | 'borderColor' | 'verticalAlign', value: string | null) => {
    editor.chain().focus().setCellAttribute(key, value).run();
  };

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {/* Insert table via hover grid picker */}
      <Popover open={insertOpen} onOpenChange={setInsertOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Insert table" aria-label="Insert table">
            <TableIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <p className="text-xs text-muted-foreground mb-2">
            {gridHover.rows > 0 ? `${gridHover.rows} x ${gridHover.cols}` : 'Choose table size'}
          </p>
          <div className="grid grid-cols-8 gap-1" onMouseLeave={() => setGridHover({ rows: 0, cols: 0 })}>
            {Array.from({ length: GRID_MAX * GRID_MAX }).map((_, i) => {
              const row = Math.floor(i / GRID_MAX) + 1;
              const col = (i % GRID_MAX) + 1;
              const active = row <= gridHover.rows && col <= gridHover.cols;
              return (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setGridHover({ rows: row, cols: col })}
                  onClick={() => insertTable(row, col)}
                  className={cn('h-4 w-4 rounded-sm border border-border', active && 'bg-estate-blue border-estate-blue')}
                  aria-label={`${row} by ${col} table`}
                />
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Only shown while the cursor is inside a table */}
      {inTable && (
        <>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add row after" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <Rows3 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <Columns3 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Rows3 className="h-4 w-4 opacity-60" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Columns3 className="h-4 w-4 opacity-60" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Merge cells"
            disabled={!editor.can().mergeCells()}
            onClick={() => editor.chain().focus().mergeCells().run()}
          >
            <Combine className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Split cell"
            disabled={!editor.can().splitCell()}
            onClick={() => editor.chain().focus().splitCell().run()}
          >
            <SplitSquareHorizontal className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Toggle header row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
            <span className="text-xs font-semibold">H</span>
          </Button>

          {/* Vertical alignment within the current cell */}
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Align top" onClick={() => applyCellStyle('verticalAlign', 'top')}>
            <AlignVerticalJustifyStart className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Align middle" onClick={() => applyCellStyle('verticalAlign', 'middle')}>
            <AlignVerticalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Align bottom" onClick={() => applyCellStyle('verticalAlign', 'bottom')}>
            <AlignVerticalJustifyEnd className="h-4 w-4" />
          </Button>

          {/* Cell background color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Cell background color">
                <PaintBucket className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex gap-1.5">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.label}
                    type="button"
                    title={swatch.label}
                    onClick={() => applyCellStyle('backgroundColor', swatch.value)}
                    className="h-6 w-6 rounded-full border border-border"
                    style={{ backgroundColor: swatch.value || 'transparent' }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Cell border color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Cell border color">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex gap-1.5">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.label}
                    type="button"
                    title={swatch.label}
                    onClick={() => applyCellStyle('borderColor', swatch.value)}
                    className="h-6 w-6 rounded-full border-2"
                    style={{ borderColor: swatch.value || '#cbd5e1' }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default TableControls;
