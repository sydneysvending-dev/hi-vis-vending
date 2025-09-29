interface LoyaltyProgressProps {
  tier: string;
  points: number;
}

export default function LoyaltyProgress({ tier, points }: LoyaltyProgressProps) {
  const getTierInfo = (currentTier: string, currentPoints: number) => {
    switch (currentTier) {
      case "apprentice":
        return {
          current: "Apprentice",
          next: "Tradie",
          pointsNeeded: 500 - currentPoints,
          progress: (currentPoints / 500) * 100,
          maxed: false
        };
      case "tradie":
        return {
          current: "Tradie",
          next: "Foreman",
          pointsNeeded: 1000 - currentPoints,
          progress: ((currentPoints - 500) / 500) * 100,
          maxed: false
        };
      case "foreman":
        return {
          current: "Foreman",
          next: "Max Level",
          pointsNeeded: 0,
          progress: 100,
          maxed: true
        };
      default:
        return {
          current: "Apprentice",
          next: "Tradie",
          pointsNeeded: 500 - currentPoints,
          progress: (currentPoints / 500) * 100,
          maxed: false
        };
    }
  };

  const tierInfo = getTierInfo(tier, points);

  return (
    <div className="bg-white/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">{tierInfo.current} Level</span>
        {!tierInfo.maxed && (
          <span className="text-sm">
            {tierInfo.pointsNeeded} points to {tierInfo.next}
          </span>
        )}
      </div>
      
      <div className="w-full bg-white/30 rounded-full h-3 mb-2">
        <div 
          className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(tierInfo.progress, 100)}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs">
        <span>Apprentice</span>
        <span className={tier === "tradie" ? "font-bold" : ""}>Tradie</span>
        <span className={tier === "foreman" ? "font-bold" : ""}>Foreman</span>
      </div>
    </div>
  );
}
