import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import type { GalleryMediaItem } from '@/types/gallery';

interface GalleryLightboxProps {
  item: GalleryMediaItem | null;
  onClose: () => void;
}

const GalleryLightbox = ({ item, onClose }: GalleryLightboxProps) => {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="max-w-none w-screen h-screen p-0 border-0 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {item && (
          <div
            className="flex max-h-[90vh] max-w-[92vw] flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {item.media_type === 'video' ? (
              <video
                src={item.media_url}
                poster={item.poster_url || undefined}
                autoPlay
                controls
                className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
              />
            ) : (
              <img
                src={item.media_url}
                alt={item.caption || 'Gallery item'}
                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
              />
            )}
            {(item.caption || item.event_description) && (
              <div className="text-center text-white">
                {item.caption && <p className="text-lg font-semibold">{item.caption}</p>}
                {item.event_description && (
                  <p className="mt-1 max-w-xl text-sm text-white/70">{item.event_description}</p>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
