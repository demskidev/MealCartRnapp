import { IconDown, IconUp } from "@/assets/svg/IconUpDown";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import InputTapArea from "./InputTapArea";

interface CustomStepperProps {
  value: number | string;
  /** Arrow-mode handlers. In numeric mode `onChangeValue` replaces them. */
  onIncrement?: () => void;
  onDecrement?: () => void;
  showUp?: boolean;
  showDown?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Numeric mode: the value becomes a typeable field with big −/+ buttons on
   * either side, instead of the stacked arrows. Use it for counts (servings,
   * quantity, minutes) — the arrow-only mode stays for values that cycle
   * through a fixed list (units, categories) and can't be typed.
   */
  editable?: boolean;
  /** Required when `editable`. Receives the clamped number. */
  onChangeValue?: (value: number) => void;
  min?: number;
  max?: number;
  /** Amount the −/+ buttons move by in numeric mode. Typing ignores it. */
  step?: number;
  /** Rendered after the number, e.g. "Mins". */
  suffix?: string;
  accessibilityLabel?: string;
}

const digitsOnly = (text: string) => text.replace(/[^0-9]/g, "");

const CustomStepper: React.FC<CustomStepperProps> = ({
  value,
  onIncrement,
  onDecrement,
  showUp = true,
  showDown = true,
  containerStyle,
  editable = false,
  onChangeValue,
  min = 0,
  max = 999,
  step: stepBy = 1,
  suffix,
  accessibilityLabel,
}) => {
  // Draft lets the field go empty mid-edit; the committed value is clamped on
  // blur so a stray "0" or a cleared field can't be saved.
  const [draft, setDraft] = useState(() => digitsOnly(String(value ?? "")));
  const [isFocused, setIsFocused] = useState(false);
  // The number is narrow but its row is 42pt tall — the whole cell has to be
  // tappable, not just the digits.
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isFocused) setDraft(digitsOnly(String(value ?? "")));
  }, [value, isFocused]);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const commit = (text: string) => {
    const parsed = parseInt(text, 10);
    const next = clamp(Number.isNaN(parsed) ? min : parsed);
    setDraft(String(next));
    onChangeValue?.(next);
  };

  if (!editable) {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.valueContainer}>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          {showUp && (
            <TouchableOpacity
              onPress={onIncrement}
              style={styles.iconBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              // hitSlop only points away from the sibling arrow — overlapping
              // slop is what made these two so easy to mis-tap.
              hitSlop={{ top: 12, bottom: 0, left: 12, right: 12 }}
            >
              <IconUp width={moderateScale(18)} height={moderateScale(18)} />
            </TouchableOpacity>
          )}

          {showDown && (
            <TouchableOpacity
              onPress={onDecrement}
              style={styles.iconBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              hitSlop={{ top: 0, bottom: 12, left: 12, right: 12 }}
            >
              <IconDown width={moderateScale(18)} height={moderateScale(18)} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const numericValue = parseInt(digitsOnly(String(value ?? "")), 10);
  const current = Number.isNaN(numericValue) ? min : numericValue;

  const step = (direction: 1 | -1) => {
    if (onChangeValue) {
      const next = clamp(current + direction * stepBy);
      if (next !== current) onChangeValue(next);
      return;
    }
    (direction === 1 ? onIncrement : onDecrement)?.();
  };

  return (
    <View style={[styles.container, styles.editableContainer, containerStyle]}>
      <TouchableOpacity
        onPress={() => step(-1)}
        style={styles.sideBtn}
        activeOpacity={0.7}
        disabled={current <= min}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${accessibilityLabel || "value"}`}
      >
        <Text
          style={[styles.sideBtnText, current <= min && styles.sideBtnDisabled]}
        >
          −
        </Text>
      </TouchableOpacity>

      <InputTapArea style={styles.inputWrapper} inputRef={inputRef}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={draft}
          onChangeText={(text) => {
            const next = digitsOnly(text);
            setDraft(next);
            // Publish while typing (unclamped) so a parent that saves without
            // waiting for blur still sees what the user typed; blur clamps.
            const parsed = parseInt(next, 10);
            if (!Number.isNaN(parsed)) onChangeValue?.(Math.min(max, parsed));
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            commit(draft);
          }}
          onSubmitEditing={() => commit(draft)}
          keyboardType="number-pad"
          inputMode="numeric"
          returnKeyType="done"
          selectTextOnFocus
          maxLength={String(max).length}
          accessibilityLabel={accessibilityLabel}
          placeholder={String(min)}
          placeholderTextColor={Colors.tertiary}
        />
        {!!suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </InputTapArea>

      <TouchableOpacity
        onPress={() => step(1)}
        style={styles.sideBtn}
        activeOpacity={0.7}
        disabled={current >= max}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${accessibilityLabel || "value"}`}
      >
        <Text
          style={[styles.sideBtnText, current >= max && styles.sideBtnDisabled]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors._F6F6F6,
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    marginBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(8),
    height: moderateScale(42),
  },
  editableContainer: {
    paddingHorizontal: 0,
    justifyContent: "space-between",
  },
  valueContainer: {
    flex: 1,
  },
  buttonsContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: {
    paddingVertical: moderateScale(4),
    paddingHorizontal: moderateScale(6),
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    marginLeft: moderateScale(8),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
  sideBtn: {
    width: moderateScale(40),
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  sideBtnText: {
    fontSize: moderateScale(22),
    lineHeight: moderateScale(24),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
  },
  sideBtnDisabled: {
    opacity: 0.3,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    minWidth: moderateScale(28),
    paddingVertical: 0,
    textAlign: "center",
    fontSize: moderateScale(14),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
  },
  suffix: {
    fontSize: moderateScale(12),
    marginLeft: moderateScale(4),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
});

export default CustomStepper;
