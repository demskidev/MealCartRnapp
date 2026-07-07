import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import { updateUserAsync } from "@/reduxStore/slices/authSlice";
import React, { createContext, useContext, useEffect, useState } from "react";

interface TourStepContextType {
  shouldStartTour: boolean;
  setShouldStartTour: (value: boolean) => void;
  completeTour: () => Promise<void>;
  resetTour: () => Promise<void>;
  isLoading: boolean;
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
  triggerMealBoxPress: (() => void) | null;
  setTriggerMealBoxPress: (callback: (() => void) | null) => void;
  triggerSavePlan: (() => void) | null;
  setTriggerSavePlan: (callback: (() => void) | null) => void;
  cleanupTourData: (() => void) | null;
  setCleanupTourData: (callback: (() => void) | null) => void;
  triggerStartPlan: (() => void) | null;
  setTriggerStartPlan: (callback: (() => void) | null) => void;
  triggerOpenAddItemToList: (() => void) | null;
  setTriggerOpenAddItemToList: (callback: (() => void) | null) => void;
  triggerOpenCreateList: (() => void) | null;
  setTriggerOpenCreateList: (callback: (() => void) | null) => void;
  triggerAddDummyIngredients: (() => void) | null;
  setTriggerAddDummyIngredients: (callback: (() => void) | null) => void;
  triggerCloseCreateList: (() => void) | null;
  setTriggerCloseCreateList: (callback: (() => void) | null) => void;
  triggerCloseAddItemToList: (() => void) | null;
  setTriggerCloseAddItemToList: (callback: (() => void) | null) => void;
  isCreateListBottomSheetOpen: boolean;
  setIsCreateListBottomSheetOpen: (value: boolean) => void;
}

const TourStepContext = createContext<TourStepContextType>({
  shouldStartTour: false,
  setShouldStartTour: () => {},
  completeTour: async () => {},
  resetTour: async () => {},
  isLoading: true,
  isNavigating: false,
  setIsNavigating: () => {},
  triggerMealBoxPress: null,
  setTriggerMealBoxPress: () => {},
  triggerSavePlan: null,
  setTriggerSavePlan: () => {},
  cleanupTourData: null,
  setCleanupTourData: () => {},
  triggerStartPlan: null,
  setTriggerStartPlan: () => {},
  triggerOpenAddItemToList: null,
  setTriggerOpenAddItemToList: () => {},
  triggerOpenCreateList: null,
  setTriggerOpenCreateList: () => {},
  triggerAddDummyIngredients: null,
  setTriggerAddDummyIngredients: () => {},
  triggerCloseCreateList: null,
  setTriggerCloseCreateList: () => {},
  triggerCloseAddItemToList: null,
  setTriggerCloseAddItemToList: () => {},
  isCreateListBottomSheetOpen: false,
  setIsCreateListBottomSheetOpen: () => {},
});

export const TourStepProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shouldStartTour, setShouldStartTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [triggerMealBoxPress, setTriggerMealBoxPress] = useState<
    (() => void) | null
  >(null);
  const [triggerSavePlan, setTriggerSavePlan] = useState<(() => void) | null>(
    null,
  );
  const [cleanupTourData, setCleanupTourData] = useState<(() => void) | null>(
    null,
  );
  const [triggerStartPlan, setTriggerStartPlan] = useState<(() => void) | null>(
    null,
  );
  const [triggerOpenAddItemToList, setTriggerOpenAddItemToList] = useState<
    (() => void) | null
  >(null);
  const [triggerOpenCreateList, setTriggerOpenCreateList] = useState<
    (() => void) | null
  >(null);
  const [triggerAddDummyIngredients, setTriggerAddDummyIngredients] = useState<
    (() => void) | null
  >(null);
  const [triggerCloseCreateList, setTriggerCloseCreateList] = useState<
    (() => void) | null
  >(null);
  const [triggerCloseAddItemToList, setTriggerCloseAddItemToList] = useState<
    (() => void) | null
  >(null);
  const [isCreateListBottomSheetOpen, setIsCreateListBottomSheetOpen] =
    useState(false);

  useEffect(() => {
    checkTourStatus();
  }, [user]);

  const checkTourStatus = async () => {
    // Check user's hasCompletedTour field from Firebase
    if (user) {
      // If field doesn't exist or is false, show tour
      const hasCompletedTour = user.hasCompletedTour ?? false;
      setShouldStartTour(!hasCompletedTour);
    } else {
      // No user logged in, don't show tour
      setShouldStartTour(false);
    }
    setIsLoading(false);
  };

  const completeTour = async () => {
    // Clean up any tour dummy data before completing
    if (cleanupTourData) {
      cleanupTourData();
    }

    // Make sure the create-list sheet flag is cleared so it can't auto-reopen
    // and block the screen after the tour finishes.
    setIsCreateListBottomSheetOpen(false);

    // Update user in Firebase and Redux
    if (user?.id) {
      await dispatch(
        updateUserAsync({
          userId: user.id,
          userData: { hasCompletedTour: true },
        }),
      );
    }

    setShouldStartTour(false);
  };

  const resetTour = async () => {
    // Reset tour by updating user field to false
    if (user?.id) {
      await dispatch(
        updateUserAsync({
          userId: user.id,
          userData: { hasCompletedTour: false },
        }),
      );
    }
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
        isNavigating,
        setIsNavigating,
        triggerMealBoxPress,
        setTriggerMealBoxPress,
        triggerSavePlan,
        setTriggerSavePlan,
        cleanupTourData,
        setCleanupTourData,
        triggerStartPlan,
        setTriggerStartPlan,
        triggerOpenAddItemToList,
        setTriggerOpenAddItemToList,
        triggerOpenCreateList,
        setTriggerOpenCreateList,
        triggerAddDummyIngredients,
        setTriggerAddDummyIngredients,
        triggerCloseCreateList,
        setTriggerCloseCreateList,
        triggerCloseAddItemToList,
        setTriggerCloseAddItemToList,
        isCreateListBottomSheetOpen,
        setIsCreateListBottomSheetOpen,
      }}
    >
      {children}
    </TourStepContext.Provider>
  );
};

export const useTourStep = () => useContext(TourStepContext);
