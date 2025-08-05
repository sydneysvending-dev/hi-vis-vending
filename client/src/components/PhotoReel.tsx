import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { PhotoReelItem } from "@shared/schema";

interface PhotoReelProps {
  items: PhotoReelItem[];
}

export default function PhotoReel({ items }: PhotoReelProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-4">
      <h3 className="text-white text-lg font-semibold mb-4">Latest Updates</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Card key={item.id} className="bg-slate-700 border-slate-600 min-w-[280px] flex-shrink-0">
            <CardContent className="p-0">
              <div className="relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLDivElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-32 bg-slate-600 rounded-t-lg items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-white font-semibold text-sm mb-2">{item.title}</h4>
                {item.description && (
                  <p className="text-slate-300 text-xs mb-3 line-clamp-2">{item.description}</p>
                )}
                {item.linkUrl && (
                  <Button 
                    size="sm" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => window.open(item.linkUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Learn More
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}