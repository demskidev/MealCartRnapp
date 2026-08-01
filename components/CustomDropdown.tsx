import { horizontalScale, moderateScale, verticalScale } from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CustomDropdownProps {
  value: any;
  options: any[];
  onSelect: (option: any) => void;
  icon?: any;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Gap between the trigger and the options panel. */
const PANEL_GAP = verticalScale(6);
/** Tallest the option list may get before it scrolls. */
const PANEL_MAX_HEIGHT = verticalScale(220);
/** Never squash the panel below this, even in a tight space. */
const PANEL_MIN_HEIGHT = verticalScale(120);

type Anchor = { x: number; y: number; width: number; height: number };

/**
 * Options are shown in a `Modal` positioned over the trigger — NOT as a sibling
 * view in the layout flow. Rendering them inline (the previous approach) made
 * opening the dropdown grow its container, pushing every following row down and
 * shifting the screen under the user's finger. Ported from the anchored-overlay
 * dropdown in the Approved Medical Waste app.
 *
 * How the anchoring works:
 *  - `measureInWindow` on the trigger gives window coordinates, which is the
 *    coordinate space of the full-screen Modal.
 *  - The panel takes the trigger's `x`/`width`, so it lines up with the field.
 *  - It opens downward, or flips above the trigger when there is more room there
 *    (these dropdowns live part-way down a scrollable bottom sheet, so the space
 *    below can easily be too small), and the list is capped to the room available
 *    so it always scrolls on screen instead of running off the bottom.
 *
 * `options` may be objects (`{ id, title }`) or plain strings, and `value` may be
 * either shape too — comparison is by label so both work.
 */
const labelOf = (option: any): string => {
  if (option == null) return "";
  if (typeof option === "object") return option.title ?? "";
  return String(option);
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  options,
  onSelect,
  icon,
}) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = useRef<View>(null);
  const anim = useRef(new Animated.Value(0)).current;

  // A `statusBarTranslucent` Modal spans the status bar on Android, while
  // `measureInWindow` does not — reconcile the two coordinate spaces.
  const topOffset =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) - insets.top : 0;

  const selectedLabel = labelOf(value);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      anim.setValue(0);
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const runOpenAnimation = () => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 130,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setOpen(false);
    });
  };

  const handleSelect = (option: any) => {
    onSelect(option);
    closeMenu();
  };

  const spaceBelow =
    SCREEN_HEIGHT - (anchor.y + anchor.height) - PANEL_GAP - insets.bottom;
  const spaceAbove = anchor.y - PANEL_GAP - insets.top;
  const openUpward = spaceBelow < PANEL_MIN_HEIGHT && spaceAbove > spaceBelow;
  const listMaxHeight = Math.max(
    PANEL_MIN_HEIGHT,
    Math.min(PANEL_MAX_HEIGHT, openUpward ? spaceAbove : spaceBelow),
  );

  const panelPosition = openUpward
    ? // `bottom` rather than `top` so the flipped panel does not need its height
      // measured before it can be placed.
      { bottom: SCREEN_HEIGHT - anchor.y + PANEL_GAP - topOffset }
    : { top: anchor.y + anchor.height + PANEL_GAP + topOffset };

  const panelAnim = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [openUpward ? 6 : -6, 0],
        }),
      },
      {
        scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }),
      },
    ],
  };

  const chevronAnim = {
    transform: [
      {
        rotate: anim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        style={({ pressed }) => [styles.dropdown, pressed && styles.pressed]}
        onPress={openMenu}
        accessibilityRole="button"
      >
        <Text style={styles.text} numberOfLines={1}>
          {selectedLabel}
        </Text>

        {icon && (
          <Animated.View style={chevronAnim}>
            {React.createElement(icon, {
              width: moderateScale(20),
              height: moderateScale(20),
              style: styles.icon,
            })}
          </Animated.View>
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onShow={runOpenAnimation}
        onRequestClose={closeMenu}
      >
        {/* Full-screen backdrop so tapping outside closes the dropdown. */}
        <Pressable style={styles.backdrop} onPress={closeMenu} />

        <Animated.View
          style={[
            styles.panel,
            { left: anchor.x, width: anchor.width },
            panelPosition,
            panelAnim,
          ]}
        >
          <ScrollView
            style={{ maxHeight: listMaxHeight }}
            bounces={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {options.map((option, index) => {
              const label = labelOf(option);
              const isSelected = !!label && label === selectedLabel;

              return (
                <Pressable
                  key={option?.id ?? label ?? index}
                  onPress={() => handleSelect(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [
                    styles.option,
                    index === options.length - 1 && styles.optionLast,
                    (pressed || isSelected) && styles.optionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors._F6F6F6,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    marginBottom: verticalScale(8),
    justifyContent: "space-between",
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    flex: 1,
    marginRight: moderateScale(6),
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
  icon: {
    width: moderateScale(20),
    height: moderateScale(20),
    flexShrink: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    position: "absolute",
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    borderRadius: moderateScale(8),
    backgroundColor: Colors.background,
    overflow: "hidden",
    elevation: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: moderateScale(10),
  },
  option: {
    paddingVertical: moderateScale(12),
    paddingHorizontal: horizontalScale(12),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: Colors.borderColor,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionActive: {
    backgroundColor: Colors._F6F6F6,
  },
  optionText: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
  },
});

export default CustomDropdown;
