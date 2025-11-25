import BaseButton from "@/components/BaseButton";
import Header from "@/components/Header";
import {
  horizontalScale,
  moderateScale,
  screenHeight,
  screenWidth,
  verticalScale,
} from "@/constants/constants";
import { Strings } from "@/constants/strings";
import { Colors } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

// Sample images for scroll view (replace with your images)
const images = [
  require("@/assets/images/userDummy.png"),
  require("@/assets/images/userDummy.png"),
  require("@/assets/images/userDummy.png"),
];

const IntroScreen = () => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(currentPage > 0 ? 1 : 0)).current;
  const onScroll = (event: any) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentPage(page);
  };

  // Animate Back button visibility
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: currentPage > 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentPage]);

  return (
    <SafeAreaView style={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.background} stopOpacity="1" />
            <Stop offset="1" stopColor={Colors.divider} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      <Header
        title="Welcome to MealCart"
        description="All your meal planning, simplified in one place."
      />

      {/* Horizontal ScrollView with paging */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16} // ensures smooth updates
        ref={scrollRef}
        style={styles.scrollView}
      >
        {images.map((img, index) => (
          <Image
            key={index}
            source={img}
            style={styles.image}
            resizeMode="contain"
          />
        ))}
      </ScrollView>

      {/* Page control dots */}
      <View style={styles.pageControl}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index ? styles.activeDot : null,
            ]}
          />
        ))}
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomContainer}>
        {currentPage > 0 && currentPage < images.length - 1 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <BaseButton
              title={Strings.back}
              width={80}
              onPress={() => setCurrentPage((prev) => prev - 1)}
            />
          </Animated.View>
        )}

        <View style={styles.nextButtonWrapper}>
          <BaseButton
            title={
              currentPage === images.length - 1
                ? Strings.getStarted
                : Strings.next
            }
            width="100%"
            gradientButton={true}
            textColor={Colors.white}
            onPress={() =>
              setCurrentPage((prev) =>
                prev < images.length - 1 ? prev + 1 : prev
              )
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: horizontalScale(20),
  },

  scrollView: {
    // marginVertical: 20,
  },

  image: {
    width: screenWidth, // account for SafeArea padding
    marginHorizontal: 10,
    borderRadius: 12,
  },

  pageControl: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: verticalScale(10),
    gap: horizontalScale(8),
  },

  dot: {
    width: horizontalScale(8),
    height: verticalScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: Colors.white,
  },

  activeDot: {
    backgroundColor: Colors.olive,
  },

  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(10),
    width: "100%",
    marginTop: verticalScale(20),
  },

  nextButtonWrapper: {
    flex: 1,
  },
});

export default IntroScreen;
