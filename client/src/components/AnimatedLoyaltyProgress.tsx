import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedLoyaltyProgressProps {
  tier: string;
  points: number;
  previousPoints?: number;
}

export default function AnimatedLoyaltyProgress({ 
  tier, 
  points, 
  previousPoints = 0 
}: AnimatedLoyaltyProgressProps) {
  const [animatedPoints, setAnimatedPoints] = useState(previousPoints);

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

  const tierInfo = getTierInfo(tier, animatedPoints);
  const targetTierInfo = getTierInfo(tier, points);

  // Animate points counting up
  useEffect(() => {
    if (points !== animatedPoints) {
      const duration = Math.min(Math.abs(points - animatedPoints) * 50, 2000); // Max 2 seconds
      const increment = (points - animatedPoints) / (duration / 50);
      
      const interval = setInterval(() => {
        setAnimatedPoints(prev => {
          const next = prev + increment;
          if ((increment > 0 && next >= points) || (increment < 0 && next <= points)) {
            clearInterval(interval);
            return points;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [points, animatedPoints]);

  return (
    <div className="bg-white/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <motion.span 
          className="font-semibold"
          animate={{ scale: points !== previousPoints ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {tierInfo.current} Level
        </motion.span>
        {!tierInfo.maxed && (
          <motion.span 
            className="text-sm"
            animate={{ 
              color: tierInfo.pointsNeeded <= 50 ? ["#ffffff", "#ffd500", "#ffffff"] : "#ffffff"
            }}
            transition={{ 
              duration: 0.5,
              repeat: tierInfo.pointsNeeded <= 50 ? Infinity : 0
            }}
          >
            {Math.round(tierInfo.pointsNeeded)} points to {tierInfo.next}
          </motion.span>
        )}
      </div>
      
      <div className="w-full bg-white/30 rounded-full h-3 mb-2 overflow-hidden">
        <motion.div 
          className="bg-gradient-to-r from-hivis-yellow to-hivis-orange h-3 rounded-full"
          initial={{ width: `${Math.min(getTierInfo(tier, previousPoints).progress, 100)}%` }}
          animate={{ 
            width: `${Math.min(targetTierInfo.progress, 100)}%`,
            boxShadow: tierInfo.progress > 90 ? [
              "0 0 0px rgba(255, 213, 0, 0.5)",
              "0 0 20px rgba(255, 213, 0, 0.8)",
              "0 0 0px rgba(255, 213, 0, 0.5)"
            ] : "0 0 0px rgba(255, 213, 0, 0.5)"
          }}
          transition={{ 
            duration: 1.5,
            ease: "easeOut",
            boxShadow: {
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
      </div>
      
      <div className="flex justify-between text-xs">
        <motion.span
          animate={{ 
            color: tier === "apprentice" ? "#ffd500" : "#ffffff",
            fontWeight: tier === "apprentice" ? "bold" : "normal"
          }}
        >
          Apprentice
        </motion.span>
        <motion.span 
          animate={{ 
            color: tier === "tradie" ? "#ffd500" : "#ffffff",
            fontWeight: tier === "tradie" ? "bold" : "normal"
          }}
        >
          Tradie
        </motion.span>
        <motion.span 
          animate={{ 
            color: tier === "foreman" ? "#ffd500" : "#ffffff",
            fontWeight: tier === "foreman" ? "bold" : "normal"
          }}
        >
          Foreman
        </motion.span>
      </div>
    </div>
  );
}