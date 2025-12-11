import { moderateScale, verticalScale } from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import { Text, View } from "react-native";

const ToastContent = ({ props, bgColor, borderColor }: any) => (
  <View
    style={{
      backgroundColor: bgColor,
      marginHorizontal: moderateScale(40),
      paddingHorizontal: moderateScale(16),
      paddingVertical: verticalScale(12),
      borderRadius: moderateScale(12),
      borderLeftWidth: 5,
      borderLeftColor: borderColor,
      flexDirection: "row",
      alignItems: "center",
      gap: moderateScale(12),
    }}
  >
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
          fontSize: fontSize(14),
          color: Colors.white,
          fontWeight: "600",
        }}
      >
        {props.text1}
      </Text>
      {props.text2 && (
        <Text
          style={{
            fontFamily: FontFamilies.ROBOTO_REGULAR,
            fontSize: fontSize(12),
            color: Colors.white,
            fontWeight: "400",
            marginTop: 4,
          }}
        >
          {props.text2}
        </Text>
      )}
    </View>
  </View>
);

export const toastConfig: any = {
  success: (props: any) => (
    <ToastContent props={props} bgColor={Colors.olive} borderColor={Colors.tertiary} />
  ),
  error: (props: any) => (
    <ToastContent props={props} bgColor={Colors.error} borderColor={Colors.white} />
  ),
  info: (props: any) => (
    <ToastContent props={props} bgColor={Colors.olive} borderColor={Colors._586E3F} />
  ),
  warning: (props: any) => (
    <ToastContent props={props} bgColor={Colors.olive} borderColor="#F57C00" />
  ),
};
