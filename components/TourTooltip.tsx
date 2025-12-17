

import React from "react";
import type { IStep } from 'rn-tourguide';
import MealCartPopUp from "./MealcartPopUp";

// TooltipProps from rn-tourguide
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
        subTitle: "Lets take a quick tour of basics",
        primaryText: "Skip Tour",
        tertiaryText: "Next",
    },
    {
        title: "Add Your Recipes",
        subTitle: "Start by adding your favorite recipes here. This will be your personal cookbook.",
        primaryText: "Skip Tour",
        secondaryText: "Back",
        tertiaryText: "Next",
    },
    {
        title: "Build Weekly Plans",
        subTitle: "Next, use your saved meals to build weekly plans in this section.",
        primaryText: "Skip Tour",
        secondaryText: "Back",
        tertiaryText: "Next",
    },
    {
        title: "Profile and Settings ",
        subTitle: "Manage your personal information, and settings here.",
        secondaryText: "Back",
        tertiaryText: "Got it",
    },
];
const getTooltipPositionStyle = (stepIndex: number) => {
    switch (stepIndex) {
        case 0:
            return { position: 'absolute', };
        case 1:
            return { position: 'absolute', bottom: 150 };

        case 2:
            return { position: 'absolute', bottom: 150 };
        case 3:
            return { position: 'absolute', top: 250, };
        default:
            return { position: 'absolute', };
    }
};


const TourTooltip: React.FC<TooltipProps> = ({ currentStep, handleNext, handlePrev, handleStop }) => {
    // currentStep is IStep, use order to index tourSteps
    const stepIndex = (currentStep?.order ?? 1) - 1;
    const step = tourSteps[stepIndex];
    const positionStyle = getTooltipPositionStyle(stepIndex);
    if (!step) return null;
    return (
        <MealCartPopUp
            visible={true}
            title={step.title}
            subTitle={step.subTitle}
            primaryText={step.primaryText}
            onPrimaryPress={handleStop}
            secondaryText={step.secondaryText}
            onSecondaryPress={handlePrev}
            tertiaryText={step.tertiaryText}
            onTertiaryPress={handleNext}
            style={positionStyle}
        />
    );
};

export default TourTooltip;

