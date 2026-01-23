import { moderateScale, verticalScale } from "@/constants/Constants";
import { Colors } from "@/constants/Theme";
import { useTourStep } from "@/context/TourStepContext";
import { FontFamily } from "@/utils/Fonts";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { type IStep } from "rn-tourguide";

export interface TooltipProps {
  isFirstStep?: boolean;
  isLastStep?: boolean;
  currentStep: IStep;
  labels?: {
    skip?: string;
    previous?: string;
    next?: string;
    finish?: string;
  };
  handleNext?: () => void;
  handlePrev?: () => void;
  handleStop?: () => void;
}

const tourSteps = [
  {
    title: "Welcome To Mealcart!",
    subTitle: "Let's take a quick tour of the basics",
    primaryText: "Skip Tour",
    tertiaryText: "Next",
  },

  {
    title: "Add Your Recipes",
    subTitle:
      "Start by adding your favorite recipes here. This will be your personal cookbook.",
    primaryText: "Skip Tour",
    secondaryText: "Back",
    tertiaryText: "Next",
  },
  {
    title: "Build Weekly Plans",
    subTitle:
      "Next, use your saved meals to build weekly plans in this section.",
    primaryText: "Skip Tour",
    secondaryText: "Back",
    tertiaryText: "Next",
  },
  {
    title: "Profile and Settings",
    subTitle: "Manage your personal information and settings here.",
    secondaryText: "Back",
    tertiaryText: "Got it!",
  },
];

const getTooltipPositionStyle = (stepIndex: number) => {
  switch (stepIndex) {
    case 0: // Welcome - Logo
      return {
        position: "absolute" as const,
        top: 180,
        left: 20,
        right: 20,
      };
    case 1: // Add New Meal button
      return {
        position: "absolute" as const,
        bottom: 200,
        left: 20,
        right: 20,
      };
    case 2: // Plans tab - bottom navigation
      return {
        position: "absolute" as const,
        bottom: 120, // Position above the tab bar
        left: 20,
        right: 20,
      };
    default:
      return {
        position: "absolute" as const,
        top: 200,
        left: 20,
        right: 20,
      };
  }
};

const TourTooltip: React.FC<TooltipProps> = ({
  currentStep,
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
}) => {
  const { completeTour } = useTourStep();
  const stepIndex = (currentStep?.order ?? 1) - 1;
  console.log(
    "🎯 Tooltip - Step:",
    stepIndex,
    "Name:",
    currentStep?.name,
    "Order:",
    currentStep?.order,
  );
  console.log("Current step properties:", {
    name: currentStep?.name,
    order: currentStep?.order,
    text: currentStep?.text,
    visible: currentStep?.visible,
  });
  const step = tourSteps[stepIndex];

  if (!step) {
    console.log("❌ No step found for index:", stepIndex);
    return null;
  }

  console.log("✅ Rendering tooltip for step:", step.title);

  const onSkip = async () => {
    await completeTour();
    handleStop?.();
  };

  const onFinish = async () => {
    await completeTour();
    handleStop?.();
  };

  return (
    <View style={styles.tooltipContainer}>
      <View style={styles.content}>
        {step.title && <Text style={styles.title}>{step.title}</Text>}
        {step.subTitle && <Text style={styles.subTitle}>{step.subTitle}</Text>}
      </View>

      <View style={styles.buttonRow}>
        {step.primaryText && (
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>{step.primaryText}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.navigationButtons}>
          {step.secondaryText && (
            <TouchableOpacity style={styles.backButton} onPress={handlePrev}>
              <Text style={styles.backText}>{step.secondaryText}</Text>
            </TouchableOpacity>
          )}

          {step.tertiaryText && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={isLastStep ? onFinish : handleNext}
            >
              <LinearGradient
                colors={[Colors._667D4C, Colors._9DAF89]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextText}>{step.tertiaryText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    width: Dimensions.get("window").width * 0.85,
    padding: verticalScale(15),
    backgroundColor: Colors.white,
    borderRadius: verticalScale(16),
    minHeight: verticalScale(140),
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    minHeight: verticalScale(60),
    justifyContent: "center",
  },
  title: {
    fontSize: moderateScale(21),
    fontWeight: "600",
    color: Colors.text,
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
  },
  subTitle: {
    marginTop: 8,
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamily.ROBOTO_REGULAR,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  skipButton: {
    padding: moderateScale(8),
  },
  skipText: {
    color: Colors.tertiary,
    fontWeight: "500",
    fontSize: moderateScale(14),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
  },
  navigationButtons: {
    flexDirection: "row",
    gap: moderateScale(12),
  },
  backButton: {
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.white,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
  },
  backText: {
    color: Colors.primary,
    fontWeight: "500",
    fontFamily: FontFamily.ROBOTO_MEDIUM,
  },
  nextButton: {
    borderRadius: moderateScale(8),
  },
  nextButtonGradient: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(8),
    alignItems: "center",
  },
  nextText: {
    color: Colors.white,
    fontWeight: "500",
    fontSize: moderateScale(16),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
  },
});

export default TourTooltip;
