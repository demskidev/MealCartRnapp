import BaseButton from "@/components/BaseButton";
import {
    horizontalScale,
    moderateScale,
    verticalScale
} from "@/constants/Constants";
import { Colors } from "@/constants/Theme";
import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Sample images for scroll view (replace with your images)
const images = [
    require("@/assets/images/userDummy.png"),
    require("@/assets/images/userDummy.png"),
    require("@/assets/images/userDummy.png"),
];
const { width } = Dimensions.get("window");

const slides = [
    {
        heading: "Welcome to MealCart  ",
        subheading: "All your meal planning, simplified in one place.",
        image: require("@/assets/images/userDummy.png"),
    },
    {
        heading: "Build Your Perfect week",
        subheading: "Create custom meal plans from your favorite receipes with just a few taps",
        image: require("@/assets/images/userDummy.png"),
    },
    {
        heading: "Shop Smarter,  Not Harder",
        subheading: "Automatically generate an organized shopping list from your plan. Never forget an ingredient again.",
        image: require("@/assets/images/userDummy.png"),
    },
];

const WelcomeMealCart: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const goNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }
    };

    const goBack = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
        }
    };

    const renderItem = ({ item }: { item: typeof slides[0] }) => (
        <View style={[styles.slide,]}>
            <Text style={styles.heading}>{item.heading}</Text>
            <Text style={styles.subheading}>{item.subheading}</Text>
            <View style={styles.parentImage}>
                <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

            <FlatList
                data={slides}
                horizontal
                ref={flatListRef}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false} // disable swipe
                showsHorizontalScrollIndicator={false}
                pagingEnabled
            />

            {/* Dots */}
            <View style={styles.dotsContainer}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            { backgroundColor: index === currentIndex ? "#3A4D25" : "#E6F0DF" },
                        ]}
                    />
                ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                {currentIndex > 0 && (
                    <TouchableOpacity onPress={goBack} style={styles.backButton}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                )}

                {/* <TouchableOpacity
                    onPress={goNext}
                    activeOpacity={0.8}
                    style={[
                        styles.nextButtonWrapper,
                        currentIndex === 1
                            ? { width: width * 0.7 } // No back button → 70%
                            : { width: width * 0.9 } // Back button visible → 90%
                    ]}
                >
                    <LinearGradient
                        colors={['#667D4C', '#9DAF89']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.buttonTextGradient}>
                            {currentIndex === 2 ? 'Get Started' : 'Next'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity> */}
                <BaseButton
                    title={currentIndex === 2 ? "Get Started" : "Next"}
                    gradientButton={true}
                    width={currentIndex >0 ? width * 0.7 : width * 0.9}
                    gradientStartColor="#667D4C"
                    gradientEndColor="#9DAF89"
                    gradientStart={{ x: 0, y: 0 }}
                    gradientEnd={{ x: 1, y: 0 }}
                    textColor="#fff"
                    onPress={goNext}
                />
            </View>




        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: Colors.background,
        paddingBottom: verticalScale(20),
        paddingTop: verticalScale(10),
        width: '100%'


    },






    slide: {
        alignItems: "center",
        width: width,


    },

    heading: {

        fontWeight: "900",
        marginBottom: verticalScale(10),
        color: Colors.primary,
        fontSize: moderateScale(34),



        flexWrap: "wrap",
        textAlign: 'center',

        maxWidth: width * 0.9,
    },

    subheading: {
        fontSize: moderateScale(14),
        color: Colors.tertiary,
        fontWeight: '400',
        flexWrap: "wrap",
        textAlign: 'center',

        maxWidth: width * 0.9,

    },
    parentImage: {
        maxWidth: width * 0.9,

        justifyContent: 'center',
        alignItems: 'center',
        height: verticalScale(500)
    },
    image: {
        width: horizontalScale(360),
        height: verticalScale(300),
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: verticalScale(20),

    },
    dot: {
        width: verticalScale(7),
        height: verticalScale(7),
        borderRadius: verticalScale(3.5),
        marginHorizontal: horizontalScale(5)
    },

    nextButton: {
        backgroundColor: "#000",
        padding: 15,
        borderRadius: 10
    },
    backButton: {
        backgroundColor: Colors.buttonBackground,
        padding: verticalScale(15),
        borderRadius: verticalScale(8)
    },

    gradientButton: {
        paddingVertical: 15,

        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 5000,
    },
    buttonText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonTextGradient: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    nextButtonWrapper: {
        borderRadius: 12,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: width * 0.9,
        marginBottom: verticalScale(40),
    },



});

export default WelcomeMealCart;
