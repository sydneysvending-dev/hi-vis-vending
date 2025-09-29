import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Star, HardHat, Sparkles } from "lucide-react";

interface TierUpgradeAnimationProps {
  newTier: string;
  isVisible: boolean;
  onComplete?: () => void;
}

export default function TierUpgradeAnimation({ 
  newTier, 
  isVisible, 
  onComplete 
}: TierUpgradeAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(isVisible);

  useEffect(() => {
    setShowAnimation(isVisible);
  }, [isVisible]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "tradie": return <Star className="w-12 h-12" />;
      case "foreman": return <Trophy className="w-12 h-12" />;
      default: return <HardHat className="w-12 h-12" />;
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case "tradie": return "Tradie";
      case "foreman": return "Foreman";
      default: return "Apprentice";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "tradie": return "from-hivis-orange to-yellow-500";
      case "foreman": return "from-hivis-yellow to-yellow-300";
      default: return "from-slate-500 to-slate-400";
    }
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAnimation(false)}
        >
          {/* Confetti Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: 360,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  delay: Math.random() * 2,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Main celebration card */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 10
              }
            }}
            exit={{ scale: 0, rotate: 180 }}
            className={`bg-gradient-to-br ${getTierColor(newTier)} p-8 rounded-2xl text-center shadow-2xl max-w-sm mx-4`}
          >
            {/* Sparkles around the icon */}
            <div className="relative mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-white"
              >
                {getTierIcon(newTier)}
              </motion.div>
              
              {/* Sparkle effects */}
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${50 + 40 * Math.cos(i * Math.PI / 4)}%`,
                    top: `${50 + 40 * Math.sin(i * Math.PI / 4)}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white transform -translate-x-1/2 -translate-y-1/2" />
                </motion.div>
              ))}
            </div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              LEVEL UP!
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-white/90 mb-4"
            >
              You're now a {getTierName(newTier)}!
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/80"
            >
              <p>Keep earning points to unlock more rewards!</p>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={() => setShowAnimation(false)}
              className="mt-6 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-colors"
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}