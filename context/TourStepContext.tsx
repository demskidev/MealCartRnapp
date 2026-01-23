import { tourStorage } from "@/utils/tourStorage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface TourStepContextType {
  shouldStartTour: boolean;
  setShouldStartTour: (value: boolean) => void;
  completeTour: () => Promise<void>;
  resetTour: () => Promise<void>;
  isLoading: boolean;
}

const TourStepContext = createContext<TourStepContextType>({
  shouldStartTour: false,
  setShouldStartTour: () => {},
  completeTour: async () => {},
  resetTour: async () => {},
  isLoading: true,
});

export const TourStepProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shouldStartTour, setShouldStartTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTourStatus();
  }, []);

  const checkTourStatus = async () => {
    // TEMPORARY: Force reset for testing - REMOVE AFTER TESTING
    await tourStorage.resetTour();
    console.log("🧪 TESTING: Tour storage reset automatically");

    const hasCompleted = await tourStorage.hasCompletedTour();
    console.log("📊 Tour completed status:", hasCompleted);
    setShouldStartTour(!hasCompleted);
    setIsLoading(false);
  };

  const completeTour = async () => {
    await tourStorage.setTourCompleted();
    setShouldStartTour(false);
  };

  const resetTour = async () => {
    await tourStorage.resetTour();
    setShouldStartTour(true);
  };

  return (
    <TourStepContext.Provider
      value={{
        shouldStartTour,
        setShouldStartTour,
        completeTour,
        resetTour,
        isLoading,
      }}
    >
      {children}
    </TourStepContext.Provider>
  );
};

export const useTourStep = () => useContext(TourStepContext);
