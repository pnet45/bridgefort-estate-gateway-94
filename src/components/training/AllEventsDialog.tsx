import React, { useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string | null;
  capacity: string;
  category: string;
  description?: string | null;
  featured?: boolean;
}

interface AllEventsDialogProps {
  open: boolean;
  onClose: () => void;
  events: Event[];
  onRegister: (event: { id: string; title: string; date: string }) => void;
}

const AllEventsDialog = ({ open, onClose, events, onRegister }: AllEventsDialogProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-transparent border-0 shadow-none"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-gray-800" />
        </button>

        {/* Carousel Container */}
        <div className="relative h-full flex items-center justify-center">
          <div className="overflow-hidden w-full h-full" ref={emblaRef}>
            <div className="flex h-full">
              {events.map((event) => (
                <div key={event.id} className="flex-[0_0_100%] min-w-0 px-4 h-full flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[85vh] flex flex-col md:flex-row"
                  >
                    {/* Image Section */}
                    <div className="md:w-2/5 relative">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-estate-blue text-white text-xs uppercase font-bold py-1 px-3 rounded-full">
                          {event.category}
                        </span>
                        {event.featured && (
                          <span className="bg-estate-red text-white text-xs uppercase font-bold py-1 px-3 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="md:w-3/5 p-8 flex flex-col overflow-y-auto">
                      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                        {event.title}
                      </h2>

                      <div className="space-y-4 mb-6 flex-grow">
                        <div className="flex items-start text-gray-700">
                          <Calendar size={20} className="mr-3 text-estate-blue flex-shrink-0 mt-1" />
                          <span className="text-sm md:text-base">{event.date}</span>
                        </div>

                        <div className="flex items-start text-gray-700">
                          <Clock size={20} className="mr-3 text-estate-blue flex-shrink-0 mt-1" />
                          <span className="text-sm md:text-base">{event.time}</span>
                        </div>

                        <div className="flex items-start text-gray-700">
                          <MapPin size={20} className="mr-3 text-estate-blue flex-shrink-0 mt-1" />
                          <span className="text-sm md:text-base">{event.location}</span>
                        </div>

                        <div className="flex items-start text-gray-700">
                          <Users size={20} className="mr-3 text-estate-blue flex-shrink-0 mt-1" />
                          <span className="text-sm md:text-base">{event.capacity}</span>
                        </div>

                        {event.description && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Register/View Events Button */}
                      {new Date(event.date) < new Date() ? (
                        <button
                          onClick={onClose}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 shadow-lg"
                        >
                          Past Event
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onRegister({
                              id: event.id,
                              title: event.title,
                              date: event.date
                            });
                            onClose();
                          }}
                          className="w-full bg-estate-red hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 shadow-lg"
                        >
                          Register Now
                        </button>
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {events.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                disabled={selectedIndex === 0}
                className="absolute left-2 md:left-8 z-40 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Previous event"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>

              <button
                onClick={scrollNext}
                disabled={selectedIndex === events.length - 1}
                className="absolute right-2 md:right-8 z-40 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Next event"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {events.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-40">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === selectedIndex 
                      ? 'w-8 bg-estate-red' 
                      : 'w-2 bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to event ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllEventsDialog;
