import React from "react";
import { Platform } from "react-native";
import {
  KeyboardAwareScrollView as BaseKeyboardAwareScrollView,
  KeyboardAwareScrollViewProps as BaseKeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

export interface KeyboardAwareScrollViewProps extends BaseKeyboardAwareScrollViewProps {}

export const KeyboardAwareScrollView = React.forwardRef<
  any,
  KeyboardAwareScrollViewProps
>(({ children, ...props }, ref) => {
  const platformDefaults = Platform.select({
    ios: {
      bottomOffset: props.bottomOffset ?? 80,
      extraKeyboardSpace: props.extraKeyboardSpace ?? 60,
      disableScrollOnKeyboardHide: props.disableScrollOnKeyboardHide ?? false,
    },
    android: {
      bottomOffset: props.bottomOffset ?? 40,
      extraKeyboardSpace: props.extraKeyboardSpace ?? 80,
      disableScrollOnKeyboardHide: props.disableScrollOnKeyboardHide ?? false,
    },
    default: {
      bottomOffset: props.bottomOffset ?? 40,
      extraKeyboardSpace: props.extraKeyboardSpace ?? 60,
      disableScrollOnKeyboardHide: props.disableScrollOnKeyboardHide ?? false,
    },
  });

  return (
    <BaseKeyboardAwareScrollView
      ref={ref}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...platformDefaults}
      {...props}
    >
      {children}
    </BaseKeyboardAwareScrollView>
  );
});

KeyboardAwareScrollView.displayName = "KeyboardAwareScrollView";
