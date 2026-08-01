import React from "react";
import { Pressable, StyleProp, TextInput, ViewStyle } from "react-native";

/**
 * InputTapArea
 *
 * Drop-in replacement for the `View` that draws a field's box (its border,
 * background and padding), making the *whole* box a touch target for the
 * `TextInput` inside it.
 *
 * Why this is needed: a `TextInput` only owns its own text-sized frame. Taps on
 * the surrounding container — the padding, the leftover space in a fixed row
 * height, the gap next to a search icon — land on a plain `View`, which is not a
 * touch responder. They fall through to the enclosing scroll view, and because
 * those all use `keyboardShouldPersistTaps="handled"`, an unhandled tap dismisses
 * the keyboard. To the user it looks like only the text itself is tappable.
 *
 * A `Pressable` both handles the tap (so the keyboard stays) and moves focus into
 * the input. Nested touchables — a search button, a tag's "✕", the password eye —
 * keep working, because the deepest responder wins.
 *
 * Usage: keep the style you had on the container and pass the input's ref.
 *
 *   const searchInputRef = useRef<TextInput>(null);
 *
 *   <InputTapArea style={styles.searchBox} inputRef={searchInputRef}>
 *     <SearchIcon />
 *     <TextInput ref={searchInputRef} style={styles.searchInput} ... />
 *   </InputTapArea>
 */
interface InputTapAreaProps {
  /** Ref of the `TextInput` this box belongs to. */
  inputRef: React.RefObject<TextInput | null>;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const InputTapArea: React.FC<InputTapAreaProps> = ({
  inputRef,
  style,
  children,
}) => (
  <Pressable
    style={style}
    onPress={() => {
      const input = inputRef.current;
      // Re-focusing the active field resets its selection on Android, so only
      // focus when it isn't already focused.
      if (input && !input.isFocused()) {
        input.focus();
      }
    }}
  >
    {children}
  </Pressable>
);

export default InputTapArea;
