# Batch 20 — Rich text editor performance fix (typing/drag lag)

1 file: `src/components/editor/RichTextEditor.tsx` (supersedes batch 19's copy).

## Root cause
`onUpdate` was calling `editor.getHTML()` (serializes the entire document) +
`sanitizeRichText()` (a full DOMPurify parse/sanitize pass) + the parent
form's `onChange` (triggering a React re-render of the whole form) **on every
single keystroke**. For longer admin content, that's real, repeated work on
every character typed.

The "drags" part of the report is the same root cause: dragging a table
column to resize it fires many rapid update events during the drag (one per
pixel of movement in some browsers), each one hitting that exact same
expensive path.

## The fix
Debounced the expensive part (300ms after the last keystroke/drag event)
rather than running it synchronously on every event:
- Typing/dragging now just resets a timer (cheap) instead of doing the full
  serialize+sanitize+parent-update work immediately.
- **Nothing about live editor feedback changes** - toolbar button active
  states and the character counter still update instantly on every keystroke,
  since Tiptap re-renders the component on every transaction independent of
  this debounce. Only the "tell the parent form and re-render it" part is
  delayed.
- Added `onBlur` to flush immediately regardless of the pending timer, so
  clicking Save right after typing never loses the last few characters to an
  in-flight debounce.
- Timer is cleared on unmount so a stale debounced call can never fire after
  the component (and the `onChange` closure it holds) is gone.

## Verified
`tsc --noEmit`: same 13 pre-existing baseline errors, 0 new.
`eslint`: 0 errors, 0 warnings.

This applies everywhere `RichTextEditor` is already used - blog posts, all 4
email compose surfaces - no changes needed in those files, they all get the
fix automatically since they just pass `value`/`onChange` through to this
shared component.
