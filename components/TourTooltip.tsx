

// import { useTourStep } from "@/context/TourStepContext";
// import { useRouter } from "expo-router";
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
// // const plansTourSteps = [
// //     {
// //         title: "Plan Your Week",
// //         subTitle: "Ready to plan your week? Tap here to create your first meal plan.",
// //         primaryText: "Skip Tour",
// //         tertiaryText: "Next",
// //     }
// // ];
// // const listsTourSteps = [
// //     {
// //         title: "Plan Your Week",
// //         subTitle: "Ready to plan your week? Tap here to create your first meal plan.",
// //         primaryText: "Skip Tour",
// //         tertiaryText: "Next",
// //     }
// // ]
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
//     // currentStep is IStep, use order to index tourSteps
//     //   const pathname = usePathname();
//     //   console.log('pathnamemm', pathname)

//     // let steps;
//     // // Fix pathname check for Plans screen (expo-router path is usually "/(tabs)/2_Plans")
//     // if (pathname === "/2_Plans") {
//     //     steps = plansTourSteps;   // steps for Plans screen
//     // } else if (pathname === '/ListsScreen') {
//     //     steps = listsTourSteps;   // steps for Lists screen
//     // } else {
//     //     steps = tourSteps;    // default/Home steps
//     // }





//     const router = useRouter();
//     // const { stop, next } = useTourGuideController();
//     // const stepIndex = (currentStep?.order ?? 1) - 1;
//     // const step = tourSteps[stepIndex];
//     // const step = steps[stepIndex];
//     const { currentStepIndex, setCurrentStepIndex } = useTourStep();

//     const stepIndex = currentStepIndex; // use global index
//     const step = tourSteps[stepIndex];
//     const positionStyle = getTooltipPositionStyle(stepIndex);



//     const onNext = () => {
//         if (currentStepIndex === 3) {
//             router.push("/2_Plans");
//         }
//         setCurrentStepIndex(currentStepIndex + 1);
//         handleNext?.();
//     };

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
//             onTertiaryPress={onNext}
//             style={positionStyle}
//         />
//     );
// };

// export default TourTooltip;





import { APP_ROUTES } from "@/constants/AppRoutes";
import { usePathname, useRouter } from "expo-router";
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
];
const plansTourSteps = [
    {
        title: "Plan Your Week",
        subTitle: "Ready to plan your week? Tap here to create your first meal plan.",
        primaryText: "Skip Tour",
        tertiaryText: "Next",
    }
];
const listsTourSteps = [
    {
        title: "Plan Your Week",
        subTitle: "Ready to plan your week? Tap here to create your first meal plan.",
        primaryText: "Skip Tour",
        tertiaryText: "Next",
    }
]
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
      const pathname = usePathname();
      console.log('pathnamemm', pathname)

    let steps;
    // Fix pathname check for Plans screen (expo-router path is usually "/(tabs)/2_Plans")
    if (pathname === "/2_Plans") {
        steps = plansTourSteps;   // steps for Plans screen
    } else if (pathname === '/ListsScreen') {
        steps = listsTourSteps;   // steps for Lists screen
    } else {
        steps = tourSteps;    // default/Home steps
    }





    const router = useRouter();
    // const { stop, next } = useTourGuideController();
     const stepIndex = (currentStep?.order ?? 1) - 1;
    // const step = tourSteps[stepIndex];
    // const step = steps[stepIndex];
    // const { currentStepIndex, setCurrentStepIndex } = useTourStep();

    // const stepIndex = currentStepIndex; // use global index
    // const step = tourSteps[stepIndex];
    const positionStyle = getTooltipPositionStyle(stepIndex);



    const onNext = () => {
        if (currentStepIndex === 3) {
            router.push(APP_ROUTES.PLANS);
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



