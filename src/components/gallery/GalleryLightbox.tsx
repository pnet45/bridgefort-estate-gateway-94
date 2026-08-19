import { useCallback, useEffect, useRef, useState, type WheelEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Share2, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { GalleryMediaItem } from '@/types/gallery';

interface GalleryLightboxProps {
  /** Full ordered list the viewer can page through (usually the currently filtered gallery items). */
  items: GalleryMediaItem[];
  /** Index into `items` to open on, or null when the viewer should be closed. */
  initialIndex: number | null;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
const SLIDESHOW_DELAY_MS = 4000;

const GalleryLightbox = ({ items, initialIndex, onClose }: GalleryLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [playing, setPlaying] = useState(false);

  const mediaRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const slideshowTimer = useRef<number | undefined>(undefined);

  const open = initialIndex !== null && items.length > 0;
  const item = open ? items[currentIndex] : null;

  // Sync to whichever item the caller asked us to open, and reset viewer state.
  useEffect(() => {
    if (initialIndex !== null) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setPlaying(false);
    }
  }, [initialIndex]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (items.length === 0) return;
      const next = ((index % items.length) + items.length) % items.length;
      setCurrentIndex(next);
      resetView();
    },
    [items.length, resetView]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  // Keep keyboard focus anchored on the picture itself while the viewer is open.
  useEffect(() => {
    if (open) mediaRef.current?.focus({ preventScroll: true });
  }, [open, currentIndex]);

  // Keyboard shortcuts while the viewer is open (Escape-to-close is handled by the Dialog itself).
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, goNext, goPrev]);

  // Play All: advance images automatically after a delay; videos advance themselves on `onEnded`.
  useEffect(() => {
    if (!playing || !item) return;
    if (item.media_type === 'video') return;
    slideshowTimer.current = window.setTimeout(goNext, SLIDESHOW_DELAY_MS);
    return () => {
      if (slideshowTimer.current) window.clearTimeout(slideshowTimer.current);
    };
  }, [playing, item, currentIndex, goNext]);

  // Stop the slideshow once the viewer closes.
  useEffect(() => {
    if (!open) setPlaying(false);
  }, [open]);

  const handleWheelZoom = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoom(z => {
      const next = e.deltaY < 0 ? z + ZOOM_STEP : z - ZOOM_STEP;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    });
  };

  const startDrag = (x: number, y: number) => {
    if (zoom <= 1) return;
    dragState.current = { dragging: true, startX: x, startY: y, originX: pan.x, originY: pan.y };
  };
  const moveDrag = (x: number, y: number) => {
    if (!dragState.current.dragging) return;
    setPan({
      x: dragState.current.originX + (x - dragState.current.startX),
      y: dragState.current.originY + (y - dragState.current.startY)
    });
  };
  const endDrag = () => {
    dragState.current.dragging = false;
  };

  const handleDownload = async () => {
    if (!item) return;
    try {
      const response = await fetch(item.media_url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const urlExt = item.media_url.split('?')[0].split('.').pop();
      const ext = urlExt && urlExt.length <= 5 ? urlExt : item.media_type === 'video' ? 'mp4' : 'jpg';
      const base =
        (item.caption || 'bridgefort-gallery').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
        'bridgefort-gallery';
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${base}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast({
        title: 'Download failed',
        description: 'Opening it in a new tab instead.',
        variant: 'destructive'
      });
      window.open(item.media_url, '_blank');
    }
  };

  const handleShare = async () => {
    if (!item) return;
    const shareData = {
      title: item.caption || 'Bridgefort Gallery',
      text: item.event_description || undefined,
      url: item.media_url
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(item.media_url);
      toast({ title: 'Link copied', description: 'Gallery link copied to clipboard.' });
    } else {
      window.open(item.media_url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent
        hideCloseButton
        onOpenAutoFocus={e => {
          e.preventDefault();
          mediaRef.current?.focus({ preventScroll: true });
        }}
        className="max-w-[96vw] w-auto max-h-[92vh] h-auto p-0 border-0 bg-black/95 rounded-2xl overflow-hidden flex items-center justify-center"
        onClick={onClose}
      >
        {/* Action bar */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            aria-label="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => setPlaying(p => !p)}
              className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
              aria-label={playing ? 'Pause slideshow' : 'Play all pictures'}
              title={playing ? 'Pause slideshow' : 'Play all pictures'}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Prev / Next */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {item && (
          <div className="flex max-h-[84vh] max-w-[90vw] flex-col items-center gap-4 p-6" onClick={e => e.stopPropagation()}>
            <div
              ref={mediaRef}
              tabIndex={-1}
              className="outline-none"
              style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
              onWheel={handleWheelZoom}
              onMouseDown={e => startDrag(e.clientX, e.clientY)}
              onMouseMove={e => moveDrag(e.clientX, e.clientY)}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={e => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={endDrag}
            >
              {item.media_type === 'video' ? (
                <video
                  src={item.media_url}
                  poster={item.poster_url || undefined}
                  autoPlay
                  controls
                  onEnded={() => {
                    if (playing) goNext();
                  }}
                  className="max-h-[72vh] max-w-full rounded-lg shadow-2xl transition-transform"
                  style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
                />
              ) : (
                <img
                  src={item.media_url}
                  alt={item.caption || 'Gallery item'}
                  draggable={false}
                  className="max-h-[72vh] max-w-full select-none rounded-lg object-contain shadow-2xl transition-transform"
                  style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
                />
              )}
            </div>

            {(item.caption || item.event_description) && (
              <div className="text-center text-white">
                {item.caption && <p className="text-lg font-semibold">{item.caption}</p>}
                {item.event_description && (
                  <p className="mt-1 max-w-xl text-sm text-white/70">{item.event_description}</p>
                )}
              </div>
            )}

            {items.length > 1 && (
              <p className="text-xs font-medium uppercase tracking-wide text-white/50">
                {currentIndex + 1} / {items.length}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
