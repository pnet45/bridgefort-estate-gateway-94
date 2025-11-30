import React, { useCallback, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Users, Clock, Download, Share2 } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';

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
  const [downloading, setDownloading] = useState(false);
  const eventCardRef = useRef<HTMLDivElement>(null);

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

  const downloadAsPDF = async () => {
    if (!eventCardRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(eventCardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${events[selectedIndex].title.replace(/\s+/g, '_')}_Event.pdf`);
      
      toast({
        title: "Success",
        description: "Event details downloaded as PDF"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const downloadAsImage = async () => {
    if (!eventCardRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(eventCardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${events[selectedIndex].title.replace(/\s+/g, '_')}_Event.png`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Event details downloaded as image"
        });
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to download image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const shareEvent = async () => {
    const event = events[selectedIndex];
    const shareData = {
      title: event.title,
      text: `Join us for ${event.title} on ${event.date} at ${event.time}. Location: ${event.location}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Success",
          description: "Event details shared successfully"
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.title}\n${shareData.text}`;
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Event details copied. You can paste and share it now."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[90vw] w-[90vw] h-[90vh] p-0 bg-transparent border-0 shadow-none flex items-center justify-center"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <Button
            onClick={downloadAsPDF}
            disabled={downloading}
            variant="secondary"
            size="icon"
            className="bg-white/90 hover:bg-white rounded-full shadow-lg"
            aria-label="Download as PDF"
          >
            <Download className="h-5 w-5 text-gray-800" />
          </Button>
          <Button
            onClick={downloadAsImage}
            disabled={downloading}
            variant="secondary"
            size="icon"
            className="bg-white/90 hover:bg-white rounded-full shadow-lg"
            aria-label="Download as Image"
          >
            <Download className="h-5 w-5 text-blue-600" />
          </Button>
          <Button
            onClick={shareEvent}
            disabled={downloading}
            variant="secondary"
            size="icon"
            className="bg-white/90 hover:bg-white rounded-full shadow-lg"
            aria-label="Share Event"
          >
            <Share2 className="h-5 w-5 text-green-600" />
          </Button>
          <button
            onClick={onClose}
            className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-800" />
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full h-full flex items-center justify-center px-16">
          <div className="overflow-hidden w-full h-full max-w-5xl" ref={emblaRef}>
            <div className="flex h-full items-center">
              {events.map((event, idx) => (
                <div key={event.id} className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center">
                  <motion.div
                    ref={idx === selectedIndex ? eventCardRef : null}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-h-[75vh] flex flex-col md:flex-row mx-4"
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

          {/* Navigation Arrows - Always Visible */}
          {events.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                disabled={selectedIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Previous event"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>

              <button
                onClick={scrollNext}
                disabled={selectedIndex === events.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
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