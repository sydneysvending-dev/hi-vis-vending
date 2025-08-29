import { PhotoReelItem } from "@shared/schema";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoReelProps {
  items: PhotoReelItem[];
}

export default function PhotoReel({ items }: PhotoReelProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="w-full relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="min-w-full flex-shrink-0 relative"
            >
              <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                <h4 className="text-white font-bold text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3 drop-shadow-2xl">{item.title}</h4>
                {item.description && (
                  <p className="text-white text-sm sm:text-base md:text-lg font-semibold drop-shadow-xl">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Buttons - Only show if more than 1 item */}
      {items.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/90 hover:bg-white border-white/50 shadow-lg z-10"
            onClick={scrollPrev}
            data-testid="carousel-prev"
          >
            <ChevronLeft className="h-4 w-4 text-gray-800" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 hover:bg-white border-white/50 shadow-lg z-10"
            onClick={scrollNext}
            data-testid="carousel-next"
          >
            <ChevronRight className="h-4 w-4 text-gray-800" />
          </Button>
        </>
      )}
    </section>
  );
}