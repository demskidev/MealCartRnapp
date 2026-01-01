// TourStepContext.tsx
import React, { createContext, useContext, useState } from "react";

const TourStepContext = createContext({
  currentStepIndex: 0,
  setCurrentStepIndex: (i: number) => {},
});

export const TourStepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  return (
    <TourStepContext.Provider value={{ currentStepIndex, setCurrentStepIndex }}>
      {children}
    </TourStepContext.Provider>
  );
};

export const useTourStep = () => useContext(TourStepContext);
