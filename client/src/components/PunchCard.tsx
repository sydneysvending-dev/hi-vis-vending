import { HardHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PunchCardProps {
  progress: number; // 0-5
}

export default function PunchCard({ progress }: PunchCardProps) {
  const totalSlots = 5;
  const completed = Math.min(progress, totalSlots);

  return (
    <Card className="bg-white border-slate-200 card-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Digital Punch Card</h3>
          <div className="safety-stripes w-8 h-4 rounded"></div>
        </div>
        
        <p className="text-slate-600 mb-4">Collect 5 punches for a free large drink!</p>
        
        {/* Punch Card Grid */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {Array.from({ length: totalSlots }, (_, index) => {
            const isCompleted = index < completed;
            
            return (
              <div
                key={index}
                className={`aspect-square rounded-lg flex items-center justify-center border-2 ${
                  isCompleted
                    ? "bg-orange-500 border-orange-500"
                    : "bg-slate-100 border-slate-300 border-dashed"
                }`}
              >
                {isCompleted && (
                  <HardHat className="text-white w-5 h-5" />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-center">
          <p className="text-orange-500 font-semibold">
            {completed}/{totalSlots} punches collected
          </p>
          <p className="text-sm text-slate-600">
            {completed === totalSlots 
              ? "🎉 Punch card complete! Free drink available!"
              : `${totalSlots - completed} more for your free drink!`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
