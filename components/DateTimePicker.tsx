import { horizontalScale, moderateScale, verticalScale } from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomDateTimePickerProps {
  mode?: "date" | "time" | "datetime";
  value?: Date;
  onChange: (date: Date) => void;
  visible?: boolean;
  onClose?: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  mode = "date",
  value,
  onChange,
  visible = false,
  onClose,
  minimumDate,
  maximumDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      if (mode === "datetime" && event.type === "set" && date) {
        setSelectedDate(date);
        setShowTimePicker(true);
        return;
      }
      
      if (event.type === "set" && date) {
        setSelectedDate(date);
        onChange(date);
        onClose?.();
      } else if (event.type === "dismissed") {
        onClose?.();
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleConfirm = () => {
    onChange(selectedDate);
    onClose?.();
  };

  const handleCancel = () => {
    setSelectedDate(value || new Date());
    onClose?.();
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    
    if (event.type === "set" && time) {
      const combined = new Date(selectedDate);
      combined.setHours(time.getHours());
      combined.setMinutes(time.getMinutes());
      setSelectedDate(combined);
      onChange(combined);
      onClose?.();
    } else if (event.type === "dismissed") {
      onClose?.();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      {Platform.OS === "ios" && (
        <Modal
          visible={visible}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.modalButton, styles.confirmButton]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode={mode as "date" | "time"}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
                themeVariant="light"
                textColor={Colors.primary}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && (
        <DateTimePicker
          value={selectedDate}
          mode={(mode === "datetime" ? "date" : mode) as "date" | "time"}
          display="calendar"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {Platform.OS === "android" && showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display="clock"
          onChange={handleTimeChange}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom: verticalScale(20),
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.greysoft,
    backgroundColor: Colors.white,
  },
  modalButton: {
    fontSize: moderateScale(16),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(8),
  },
  confirmButton: {
    fontWeight: "600",
    color: Colors._667D4C,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
  },
  picker: {
    alignSelf: "center",
    width: "100%",
  },
});

export default CustomDateTimePicker;
