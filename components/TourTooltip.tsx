

import { APP_ROUTES } from "@/constants/AppRoutes";
import { useTourStep } from "@/context/TourStepContext";
import { useRouter } from "expo-router";
import React from "react";
import { type IStep } from 'rn-tourguide';
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
    {
        title: "Plan Your Week ",
        subTitle: "Ready to plan your week? Tap here to create your first meal plan.",
        primaryText: "Skip Tour",
        tertiaryText: "Next",

    },
    {
        title: "Daily Planner ",
        subTitle: "You can select at what day - at what time you like to plan your next meal.",
        primaryText: "Skip Tour",
        tertiaryText: "Next",

    },
    {
        title: "Select Your Meal ",
        subTitle: "A pop-up will appear which will let you choose the meal for that slot from your created meals.",
        primaryText: "Skip Tour",
        tertiaryText: "Next",

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
            case 6:

            return { position: 'absolute', bottom: 10, };
        default:
            return { position: 'absolute',};
    }
};


const TourTooltip: React.FC<TooltipProps> = ({ currentStep, handleNext, handlePrev, handleStop }) => {
  
    const router = useRouter();
   
    const {
        currentStepIndex,
        setCurrentStepIndex,
        setOpenMealModal
    } = useTourStep();

    console.log("TourTooltip render - currentStepIndex:", currentStepIndex, "currentStep.order:", currentStep?.order);

    const stepIndex = currentStepIndex; // use global index
    const step = tourSteps[stepIndex];
    const positionStyle = getTooltipPositionStyle(stepIndex);



    const onNext = () => {
        console.log('currentStepIndex', currentStepIndex);
        if (currentStepIndex === 3) {
            // router.push("/2_Plans");
            router.push(APP_ROUTES.PLANS);
            setCurrentStepIndex(currentStepIndex + 1);
            handleNext?.();
            return;

        }
        if (currentStepIndex === 4) {
            router.push(APP_ROUTES.CreateMealPlan); // 🔥 navigate
            setCurrentStepIndex(currentStepIndex + 1);

            handleNext?.();

            return;

        }
        if (currentStepIndex === 6) {
            console.log("Setting openMealModal to true at step 6");
            setOpenMealModal(true);
            setCurrentStepIndex(currentStepIndex + 1); // This sets it to 7 in the context
            handleNext?.()
            // DON'T call handleNext() - let the modal control zone 7
            return;

        }
        setCurrentStepIndex(currentStepIndex + 1);
        handleNext?.();
    };

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
            onTertiaryPress={onNext}
            style={positionStyle}
        />
    );
};

export default TourTooltip;








// import { usePathname, useRouter } from "expo-router";
// import React from "react";
// import { type IStep } from 'rn-tourguide';
// import MealCartPopUp from "./MealcartPopUp";


// // TooltipProps from rn-tourguide
// export interface TooltipProps {
//     isFirstStep?: boolean;
//     isLastStep?: boolean;
//     currentStep: IStep;
//     labels?: {
//         skip?: string;
//         previous?: string;
//         next?: string;
//         finish?: string;
//     };
//     handleNext?: () => void;
//     handlePrev?: () => void;
//     handleStop?: () => void;
// }

// const tourSteps = [
//     {
//         title: "Welcome To Mealcart!",
//         subTitle: "Lets take a quick tour of basics",
//         primaryText: "Skip Tour",
//         tertiaryText: "Next",
//     },
//     {
//         title: "Add Your Recipes",
//         subTitle: "Start by adding your favorite recipes here. This will be your personal cookbook.",
//         primaryText: "Skip Tour",
//         secondaryText: "Back",
//         tertiaryText: "Next",
//     },
//     {
//         title: "Build Weekly Plans",
//         subTitle: "Next, use your saved meals to build weekly plans in this section.",
//         primaryText: "Skip Tour",
//         secondaryText: "Back",
//         tertiaryText: "Next",
//     },
//     {
//         title: "Profile and Settings ",
//         subTitle: "Manage your personal information, and settings here.",
//         secondaryText: "Back",
//         tertiaryText: "Got it",
//     },
//     {
//         title: "Plan Your Week ",
//         subTitle: "Ready to plan your week? Tap here to create your first meal plan.",
//         primaryText: "Skip Tour",
//         tertiaryText: "Next",

//     },
// ];
// const plansTourSteps = [
//     {
//         title: "Plan Your Week",
//         subTitle: "Ready to plan your week? Tap here to create your first meal plan.",
//         primaryText: "Skip Tour",
//         tertiaryText: "Next",
//     },
//     {
//         title: "Daily Planner",
//         subTitle: "You can select at what day - at what time you like to plan your next meal.",
//         primaryText: "Skip Tour",
//         tertiaryText: "Next",
//         secondaryText: "Back",
//     }
// ];
// const listsTourSteps = [
//     {
//         title: "Plan Your Week",
//         subTitle: "Ready to plan your week? Tap here to create your first meal plan.",
//         primaryText: "Skip Tour",
//         tertiaryText: "Next",
//     }
// ]
// const getTooltipPositionStyle = (stepIndex: number) => {
//     switch (stepIndex) {
//         case 0:
//             return { position: 'absolute', };
//         case 1:
//             return { position: 'absolute', bottom: 150 };

//         case 2:
//             return { position: 'absolute', bottom: 150 };
//         case 3:
//             return { position: 'absolute', top: 250, };
//         default:
//             return { position: 'absolute', };
//     }
// };


// const TourTooltip: React.FC<TooltipProps> = ({ currentStep, handleNext, handlePrev, handleStop }) => {
//     const pathname = usePathname();
//     console.log('pathnamemm', pathname)
//     const router = useRouter();
//     const stepIndex = (currentStep?.order ?? 1) - 1;

//     let steps;
//     if (pathname === "/2_Plans") {
//         steps = plansTourSteps;
//     } else if (pathname === '/ListsScreen') {
//         steps = listsTourSteps;
//     } else {
//         steps = tourSteps;
//     }

//     const step = steps[stepIndex];



//     // const { stop, next } = useTourGuideController();

//     // const step = tourSteps[stepIndex];

//     // const { currentStepIndex, setCurrentStepIndex } = useTourStep();

//     //  const stepIndex = currentStepIndex; // use global index
//     //  const step = tourSteps[stepIndex];
//     const positionStyle = getTooltipPositionStyle(stepIndex);



//     // const onNext = () => {
//     //     if (currentStepIndex === 3) {
//     //         router.push(APP_ROUTES.PLANS);
//     //     }
//     //     setCurrentStepIndex(currentStepIndex + 1);
//     //     handleNext?.();
//     // };
// //     const onNextPress = () => {

// //   if (pathname === "/2_Plans" && stepIndex === 0) {
// //     // handleStop?.(); 
// //     router.push(APP_ROUTES.CreateMealPlan); // 🔥 navigate
// //       handleNext?.();
// //     return;
// //   }

// //   // default behavior
// //   handleNext?.();
// // };

//     if (!step) return null;
//     return (
//         <MealCartPopUp
//             visible={true}
//             title={step.title}
//             subTitle={step.subTitle}
//             primaryText={step.primaryText}
//             onPrimaryPress={handleStop}
//             secondaryText={step.secondaryText}
//             onSecondaryPress={handlePrev}
//             tertiaryText={step.tertiaryText}
//             onTertiaryPress={handleNext}
//             style={positionStyle}
//         />
//     );
// };

// export default TourTooltip;



