import { PhotoReelItem } from "@shared/schema";

interface PhotoReelProps {
  items: PhotoReelItem[];
}

export default function PhotoReel({ items }: PhotoReelProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="min-w-full flex-shrink-0 relative snap-start"
          >
            <div className="w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover object-center"
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
    </section>
  );
}