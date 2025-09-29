import { createContext, useContext, useState, ReactNode } from "react";

interface AnimationState {
  pointsGained: {
    points: number;
    isVisible: boolean;
  };
  tierUpgrade: {
    newTier: string;
    isVisible: boolean;
  };
}

interface AnimationContextType {
  animationState: AnimationState;
  showPointsGained: (points: number) => void;
  showTierUpgrade: (newTier: string) => void;
  hidePointsGained: () => void;
  hideTierUpgrade: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [animationState, setAnimationState] = useState<AnimationState>({
    pointsGained: {
      points: 0,
      isVisible: false,
    },
    tierUpgrade: {
      newTier: "",
      isVisible: false,
    },
  });

  const showPointsGained = (points: number) => {
    setAnimationState(prev => ({
      ...prev,
      pointsGained: {
        points,
        isVisible: true,
      },
    }));
  };

  const showTierUpgrade = (newTier: string) => {
    setAnimationState(prev => ({
      ...prev,
      tierUpgrade: {
        newTier,
        isVisible: true,
      },
    }));
  };

  const hidePointsGained = () => {
    setAnimationState(prev => ({
      ...prev,
      pointsGained: {
        ...prev.pointsGained,
        isVisible: false,
      },
    }));
  };

  const hideTierUpgrade = () => {
    setAnimationState(prev => ({
      ...prev,
      tierUpgrade: {
        ...prev.tierUpgrade,
        isVisible: false,
      },
    }));
  };

  return (
    <AnimationContext.Provider
      value={{
        animationState,
        showPointsGained,
        showTierUpgrade,
        hidePointsGained,
        hideTierUpgrade,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
}