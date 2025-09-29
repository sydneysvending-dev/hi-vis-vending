import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Coins } from "lucide-react";

interface PointsGainedAnimationProps {
  points: number;
  isVisible: boolean;
  onComplete?: () => void;
}

export default function PointsGainedAnimation({ 
  points, 
  isVisible, 
  onComplete 
}: PointsGainedAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(isVisible);

  useEffect(() => {
    setShowAnimation(isVisible);
  }, [isVisible]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {showAnimation && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: 0, 
            scale: 0.5 
          }}
          animate={{ 
            opacity: 1, 
            y: -80, 
            scale: 1.2,
            transition: {
              duration: 0.6,
              ease: "easeOut"
            }
          }}
          exit={{ 
            opacity: 0, 
            y: -120, 
            scale: 0.8,
            transition: {
              duration: 0.4,
              ease: "easeIn"
            }
          }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          onAnimationComplete={() => {
            setTimeout(() => setShowAnimation(false), 1000);
          }}
        >
          <motion.div 
            className="flex items-center gap-2 bg-hivis-orange text-white px-6 py-3 rounded-full shadow-lg"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 0.5,
              delay: 0.2,
              repeat: 2
            }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Coins className="w-6 h-6" />
            </motion.div>
            <span className="text-xl font-bold">+{points} Points!</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}