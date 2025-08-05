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
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h4 className="text-white font-bold text-xl mb-2">{item.title}</h4>
              {item.description && (
                <p className="text-white/90 text-sm">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}